use crate::{
    core::{app_state::AppState, AppError},
    utils::format_ttl_to_human_readable,
};
use redis::{AsyncCommands, AsyncConnectionConfig, ScanOptions};
use std::time::Duration;
use tauri::State;
use tokio::sync::Mutex;

#[derive(serde::Serialize, Clone, Debug, Default)]
pub struct KeyInfo {
    key: String,
    key_type: String,
    ttl: i64,
    ttl_formatted: String,
    // memory_usage: usize,
}

async fn _retrieve_keys(
    state: &Mutex<AppState>,
    pattern: String,
    key_type: String,
) -> Result<Vec<KeyInfo>, AppError> {
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

    let mut scan_options = ScanOptions::default();
    if !pattern.is_empty() {
        scan_options = scan_options.with_pattern(&pattern);
    }

    if key_type != "*" {
        scan_options = scan_options.with_type(&key_type);
    }
    log::debug!(
        "Scanning keys with pattern: '{}' - type: {}",
        pattern,
        key_type
    );

    let keys: Vec<KeyInfo> = {
        let mut keys_iter = connection
            .scan_options::<String>(scan_options)
            .await
            .map_err(|e| {
                log::error!("Error scanning keys: {:?}", e);
                AppError::RedisFailed
            })?;
        let mut _keys: Vec<KeyInfo> = vec![];

        while let Some(key) = keys_iter.next_item().await {
            _keys.push(KeyInfo {
                key: key.map_err(|_| {
                    log::error!("Error retrieving key during scan");
                    AppError::RedisFailed
                })?,
                ..KeyInfo::default()
            });
        }

        _keys
    };

    if keys.is_empty() {
        return Ok(vec![]);
    }

    let mut pipe = redis::pipe();
    for key in &keys {
        pipe.key_type(key.key.clone()).ttl(key.key.clone());
        // .cmd("MEMORY")
        // .arg("USAGE")
        // .arg(key.key.clone());
    }

    // let types: Vec<(String, isize, usize)> =
    let types: Vec<(String, i64)> = pipe.query_async(&mut connection).await.map_err(|e| {
        log::error!("Failed to retrieve key types and TTLs: {}", e);
        AppError::RedisFailed
    })?;

    let keys = keys
        .clone()
        .into_iter()
        .zip(types)
        .map(|(key, key_type)| {
            let ttl = key_type.1;

            KeyInfo {
                ttl,
                key_type: key_type.0,
                ttl_formatted: format_ttl_to_human_readable(&ttl),
                // memory_usage: key_type.2,
                ..key
            }
        })
        .collect::<Vec<KeyInfo>>();

    Ok(keys)
}

// #[tauri::command]
#[tauri::command(rename_all = "snake_case")]
pub async fn retrieve_keys(
    state: State<'_, Mutex<AppState>>,
    pattern: String,
    key_type: String,
) -> Result<Vec<KeyInfo>, AppError> {
    _retrieve_keys(state.inner(), pattern, key_type).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        core::Database, models::Server, services::test_connection, tests::run_redis_container,
    };
    const PORT: u16 = 6379;

    #[tokio::test]
    async fn test_retrieve_keys() {
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

            let _: () = connection.set("key1", "value1").await.unwrap();
            let _: () = connection.set("key2", "value2").await.unwrap();
            let _: () = connection.set_ex("key3", "value3", 5000).await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let keys = _retrieve_keys(&app_state, "".to_string(), "*".to_string())
            .await
            .unwrap();
        assert_eq!(keys.len(), 3);

        let key1 = keys.iter().find(|k| k.key == "key1").unwrap();
        assert_eq!(key1.key_type, "string");
        assert_eq!(key1.ttl, -1);
        // assert!(key1.memory_usage > 0);

        let key2 = keys.iter().find(|k| k.key == "key2").unwrap();
        assert_eq!(key2.key_type, "string");
        assert_eq!(key2.ttl, -1);
        // assert!(key2.memory_usage > 0);

        let key3 = keys.iter().find(|k| k.key == "key3").unwrap();
        assert_eq!(key3.key_type, "string");
        assert!(key3.ttl > 0);
        // assert!(key3.memory_usage > 0);

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_retrieve_keys_with_pattern() {
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

            let _: () = connection.set("apple", "fruit").await.unwrap();
            let _: () = connection.set("banana", "fruit").await.unwrap();
            let _: () = connection.set("carrot", "vegetable").await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let keys = _retrieve_keys(&app_state, "a*".to_string(), "*".to_string())
            .await
            .unwrap();
        assert_eq!(keys.len(), 1);

        let key_names = keys.iter().map(|k| k.key.clone()).collect::<Vec<String>>();
        assert!(key_names.contains(&"apple".to_string()));

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_retrieve_keys_with_type() {
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

            let _: () = connection.set("apple", "fruit").await.unwrap();
            let _: () = connection.set("banana", "fruit").await.unwrap();
            let _: () = connection.set("carrot", "vegetable").await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let keys = _retrieve_keys(&app_state, "".to_string(), "string".to_string())
            .await
            .unwrap();
        assert_eq!(keys.len(), 3);

        let keys = _retrieve_keys(&app_state, "".to_string(), "hash".to_string())
            .await
            .unwrap();
        assert_eq!(keys.len(), 0);

        container.rm().await.unwrap();
    }
}
