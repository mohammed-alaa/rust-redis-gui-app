use crate::{
    core::{app_state::AppState, AppError},
    utils::redis_to_json,
};
use redis::{AsyncCommands, AsyncConnectionConfig, Value as RedisValue};
use serde_json::{json, Value as JsonValue};
use std::time::Duration;
use tauri::State;
use tokio::sync::Mutex;

#[derive(serde::Serialize)]
pub struct RetrieveKeyResponse {
    details: KeyInfo,
    content: JsonValue,
}

#[derive(serde::Serialize, Clone, Debug, Default)]
pub struct KeyInfo {
    key: String,
    key_type: String,
    ttl: isize,
    // memory_usage: usize,
}

async fn _retrieve_key(
    state: &Mutex<AppState>,
    key: String,
) -> Result<RetrieveKeyResponse, AppError> {
    let state = state.lock().await;
    let redis_client = state.get_redis_client().ok_or_else(|| {
        log::error!("Redis client is not ready");
        AppError::RedisFailed
    })?;

    let config = AsyncConnectionConfig::new().set_connection_timeout(Some(Duration::from_secs(6)));
    let mut connection = redis_client
        .get_multiplexed_async_connection_with_config(&config)
        .await
        .map_err(|e| {
            log::error!("Failed to get Redis connection: {}", e);
            AppError::RedisFailed
        })?;

    let mut pipe = redis::pipe();

    log::debug!("Retrieving info for key: '{}'", key);

    let key_info = pipe
        .key_type(key.clone())
        .ttl(key.clone())
        // .cmd("MEMORY")
        // .arg("USAGE")
        // .arg(key.clone());
        // .query_async::<(String, isize, usize)>(&mut connection)
        .query_async::<(String, isize)>(&mut connection)
        .await
        .map_err(|e| {
            log::error!("Error retrieving key info: {:?}", e);
            AppError::RedisFailed
        })?;

    let key = KeyInfo {
        key,
        key_type: key_info.0,
        ttl: key_info.1,
        // memory_usage: key_info.2,
    };

    if !["string", "hash", "list", "set", "zset"].contains(&key.key_type.as_str()) {
        log::warn!("Cannot display value for key type: {}", key.key_type);
        return Err(AppError::RedisFailed);
    }

    let value = match key.key_type.as_str() {
        "string" => {
            let v = connection
                .get::<String, RedisValue>(key.key.to_string())
                .await
                .map_err(|e| {
                    log::error!("Error retrieving string value: {:?}", e);
                    AppError::RedisFailed
                })?;
            json!(redis_to_json(v))
        }
        "hash" => {
            let v = connection
                .hgetall::<String, Vec<(String, RedisValue)>>(key.key.clone())
                .await
                .map_err(|e| {
                    log::error!("Error retrieving hash value: {:?}", e);
                    AppError::RedisFailed
                })?
                .into_iter()
                .map(|(field, redis_val)| (field, redis_to_json(redis_val)))
                .collect::<serde_json::Map<String, JsonValue>>();

            json!(v)
        }
        "list" => {
            let v = connection
                .lrange::<String, RedisValue>(key.key.to_string(), 0, -1)
                .await
                .map_err(|e| {
                    log::error!("Error retrieving list value: {:?}", e);
                    AppError::RedisFailed
                })?;

            json!(redis_to_json(v))
        }
        "set" => {
            let v = connection
                .smembers(key.key.to_string())
                .await
                .map_err(|e| {
                    log::error!("Error retrieving set value: {:?}", e);
                    AppError::RedisFailed
                })?;
            json!(redis_to_json(v))
        }
        "zset" => {
            let v = connection
                .zrange(key.key.to_string(), 0, -1)
                // .zrange_withscores(key.key.to_string(), 0, -1)
                .await
                .map_err(|e| {
                    log::error!("Error retrieving zset value: {:?}", e);
                    AppError::RedisFailed
                })?;
            json!(redis_to_json(v))
        }
        _ => {
            json!({"type": key.key_type, "raw": "cannot display"})
        }
    };

    log::debug!("Retrieved value for key: '{}'", key.key);

    Ok(RetrieveKeyResponse {
        content: value,
        details: key,
    })
}

#[tauri::command]
pub async fn retrieve_key(
    state: State<'_, Mutex<AppState>>,
    key: String,
) -> Result<RetrieveKeyResponse, AppError> {
    _retrieve_key(state.inner(), key).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        core::Database, models::Server, services::test_connection, tests::run_redis_container,
    };
    const PORT: u16 = 6379;

    #[tokio::test]
    async fn test_retrieve_string_key() {
        let (host, port, container) = run_redis_container(PORT).await;
        let db_connection = Database::new_in_memory().unwrap();
        let mut app_state = AppState::new();
        app_state.set_db_connection(Some(db_connection));

        let server = Server::from_payload("Local Server".to_string(), host, port);
        let redis_client = test_connection(&server).await.unwrap();
        app_state.set_redis_client(Some(redis_client));

        {
            let mut connection = app_state
                .get_redis_client()
                .unwrap()
                .get_multiplexed_async_connection()
                .await
                .unwrap();

            let _: () = connection.set("test_string", "hello world").await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let result = _retrieve_key(&app_state, "test_string".to_string())
            .await
            .unwrap();

        assert_eq!(result.details.key, "test_string");
        assert_eq!(result.details.key_type, "string");
        assert_eq!(result.details.ttl, -1);
        assert_eq!(result.content, json!("hello world"));

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_retrieve_hash_key() {
        let (host, port, container) = run_redis_container(PORT).await;
        let db_connection = Database::new_in_memory().unwrap();
        let mut app_state = AppState::new();
        app_state.set_db_connection(Some(db_connection));

        let server = Server::from_payload("Local Server".to_string(), host, port);
        let redis_client = test_connection(&server).await.unwrap();
        app_state.set_redis_client(Some(redis_client));

        {
            let mut connection = app_state
                .get_redis_client()
                .unwrap()
                .get_multiplexed_async_connection()
                .await
                .unwrap();

            let _: () = connection.hset("test_hash", "field1", "value1").await.unwrap();
            let _: () = connection.hset("test_hash", "field2", "value2").await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let result = _retrieve_key(&app_state, "test_hash".to_string())
            .await
            .unwrap();

        assert_eq!(result.details.key, "test_hash");
        assert_eq!(result.details.key_type, "hash");
        assert_eq!(result.details.ttl, -1);

        let hash_value = result.content.as_object().unwrap();
        assert_eq!(hash_value.get("field1").unwrap(), "value1");
        assert_eq!(hash_value.get("field2").unwrap(), "value2");

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_retrieve_list_key() {
        let (host, port, container) = run_redis_container(PORT).await;
        let db_connection = Database::new_in_memory().unwrap();
        let mut app_state = AppState::new();
        app_state.set_db_connection(Some(db_connection));

        let server = Server::from_payload("Local Server".to_string(), host, port);
        let redis_client = test_connection(&server).await.unwrap();
        app_state.set_redis_client(Some(redis_client));

        {
            let mut connection = app_state
                .get_redis_client()
                .unwrap()
                .get_multiplexed_async_connection()
                .await
                .unwrap();

            let _: () = connection.rpush("test_list", "item1").await.unwrap();
            let _: () = connection.rpush("test_list", "item2").await.unwrap();
            let _: () = connection.rpush("test_list", "item3").await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let result = _retrieve_key(&app_state, "test_list".to_string())
            .await
            .unwrap();

        assert_eq!(result.details.key, "test_list");
        assert_eq!(result.details.key_type, "list");
        assert_eq!(result.details.ttl, -1);

        let list_value = result.content.as_array().unwrap();
        assert_eq!(list_value.len(), 3);
        assert_eq!(list_value[0], json!("item1"));
        assert_eq!(list_value[1], json!("item2"));
        assert_eq!(list_value[2], json!("item3"));

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_retrieve_set_key() {
        let (host, port, container) = run_redis_container(PORT).await;
        let db_connection = Database::new_in_memory().unwrap();
        let mut app_state = AppState::new();
        app_state.set_db_connection(Some(db_connection));

        let server = Server::from_payload("Local Server".to_string(), host, port);
        let redis_client = test_connection(&server).await.unwrap();
        app_state.set_redis_client(Some(redis_client));

        {
            let mut connection = app_state
                .get_redis_client()
                .unwrap()
                .get_multiplexed_async_connection()
                .await
                .unwrap();

            let _: () = connection.sadd("test_set", "member1").await.unwrap();
            let _: () = connection.sadd("test_set", "member2").await.unwrap();
            let _: () = connection.sadd("test_set", "member3").await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let result = _retrieve_key(&app_state, "test_set".to_string())
            .await
            .unwrap();

        assert_eq!(result.details.key, "test_set");
        assert_eq!(result.details.key_type, "set");
        assert_eq!(result.details.ttl, -1);

        let set_value = result.content.as_array().unwrap();
        assert_eq!(set_value.len(), 3);
        
        // Set members can be in any order, so we check if all members are present
        let members: Vec<String> = set_value
            .iter()
            .map(|v| v.as_str().unwrap().to_string())
            .collect();
        assert!(members.contains(&"member1".to_string()));
        assert!(members.contains(&"member2".to_string()));
        assert!(members.contains(&"member3".to_string()));

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_retrieve_zset_key() {
        let (host, port, container) = run_redis_container(PORT).await;
        let db_connection = Database::new_in_memory().unwrap();
        let mut app_state = AppState::new();
        app_state.set_db_connection(Some(db_connection));

        let server = Server::from_payload("Local Server".to_string(), host, port);
        let redis_client = test_connection(&server).await.unwrap();
        app_state.set_redis_client(Some(redis_client));

        {
            let mut connection = app_state
                .get_redis_client()
                .unwrap()
                .get_multiplexed_async_connection()
                .await
                .unwrap();

            let _: () = connection.zadd("test_zset", "member1", 1.0).await.unwrap();
            let _: () = connection.zadd("test_zset", "member2", 2.0).await.unwrap();
            let _: () = connection.zadd("test_zset", "member3", 3.0).await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let result = _retrieve_key(&app_state, "test_zset".to_string())
            .await
            .unwrap();

        assert_eq!(result.details.key, "test_zset");
        assert_eq!(result.details.key_type, "zset");
        assert_eq!(result.details.ttl, -1);

        let zset_value = result.content.as_array().unwrap();
        assert_eq!(zset_value.len(), 3);
        assert_eq!(zset_value[0], json!("member1"));
        assert_eq!(zset_value[1], json!("member2"));
        assert_eq!(zset_value[2], json!("member3"));

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_retrieve_key_with_ttl() {
        let (host, port, container) = run_redis_container(PORT).await;
        let db_connection = Database::new_in_memory().unwrap();
        let mut app_state = AppState::new();
        app_state.set_db_connection(Some(db_connection));

        let server = Server::from_payload("Local Server".to_string(), host, port);
        let redis_client = test_connection(&server).await.unwrap();
        app_state.set_redis_client(Some(redis_client));

        {
            let mut connection = app_state
                .get_redis_client()
                .unwrap()
                .get_multiplexed_async_connection()
                .await
                .unwrap();

            let _: () = connection.set_ex("test_ttl", "expiring value", 5000).await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let result = _retrieve_key(&app_state, "test_ttl".to_string())
            .await
            .unwrap();

        assert_eq!(result.details.key, "test_ttl");
        assert_eq!(result.details.key_type, "string");
        assert!(result.details.ttl > 0);
        assert!(result.details.ttl <= 5000);
        assert_eq!(result.content, json!("expiring value"));

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_retrieve_key_no_redis_client() {
        let app_state = Mutex::new(AppState::new());
        let result = _retrieve_key(&app_state, "any_key".to_string()).await;

        assert!(result.is_err());
        assert_eq!(result.err().unwrap(), AppError::RedisFailed);
    }
}
