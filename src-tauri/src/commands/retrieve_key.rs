use crate::{
    core::{app_state::AppState, AppError},
    utils::redis_to_json,
};
use redis::{AsyncCommands, AsyncConnectionConfig};
use serde_json::{json, Value};
use std::time::Duration;
use tauri::State;
use tokio::sync::Mutex;

#[derive(serde::Serialize, Clone, Debug, Default)]
pub struct KeyInfo {
    key: String,
    key_type: String,
    ttl: isize,
    memory_usage: usize,
}

async fn _retrieve_key(state: &Mutex<AppState>, key: String) -> Result<(KeyInfo, Value), AppError> {
    let state = state.lock().await;
    let redis_client = state.get_redis_client().ok_or_else(|| {
        log::error!("Redis client is not ready");
        AppError::RedisFailed
    })?;

    let config = AsyncConnectionConfig::new().set_connection_timeout(Duration::from_secs(6));
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
        .query_async::<(String, isize, usize)>(&mut connection)
        .await
        .map_err(|e| {
            log::error!("Error retrieving key info: {:?}", e);
            AppError::RedisFailed
        })?;

    let key = KeyInfo {
        key,
        key_type: key_info.0,
        ttl: key_info.1,
        memory_usage: key_info.2,
    };

    let value = match key.key_type.as_str() {
        "string" => {
            let v = connection
                .get::<String, redis::Value>(key.key.to_string())
                .await
                .map_err(|e| {
                    log::error!("Error retrieving string value: {:?}", e);
                    AppError::RedisFailed
                })?;
            json!(redis_to_json(v))
        }
        "hash" => {
            let v = connection
                .hgetall::<String, Vec<(String, redis::Value)>>(key.key.clone())
                .await
                .map_err(|e| {
                    log::error!("Error retrieving hash value: {:?}", e);
                    AppError::RedisFailed
                })?
                .into_iter()
                .map(|(field, redis_val)| (field, redis_to_json(redis_val)))
                .collect::<serde_json::Map<String, Value>>();

            json!(v)
        }
        "list" => {
            let v = connection
                .lrange::<String, redis::Value>(key.key.to_string(), 0, -1)
                .await
                .map_err(|e| {
                    println!("Error retrieving list value: {:?}", e);
                    AppError::RedisFailed
                })?;

            json!(redis_to_json(v))
        }
        "set" => {
            let v = connection
                .smembers(key.key.to_string())
                .await
                .map_err(|e| {
                    println!("Error retrieving set value: {:?}", e);
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
            log::warn!("Cannot display value for key type: {}", key.key_type);
            json!({"type": key.key_type, "raw": "cannot display"})
        }
    };

    log::debug!("Retrieved value for key: '{}'", key.key);

    Ok((key, value))
}

#[tauri::command]
pub async fn retrieve_key(
    state: State<'_, Mutex<AppState>>,
    key: String,
) -> Result<(KeyInfo, Value), AppError> {
    _retrieve_key(state.inner(), key).await
}
