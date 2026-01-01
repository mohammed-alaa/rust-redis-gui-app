use crate::core::{app_state::AppState, AppError};
use redis::{AsyncCommands, AsyncConnectionConfig};
use std::time::Duration;
use tauri::State;
use tokio::sync::Mutex;

async fn _delete_key(state: &Mutex<AppState>, key: String) -> Result<(), AppError> {
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

    connection.del(key.clone()).await.map_err(|e| {
        log::error!("Failed to delete key: {}", e);
        AppError::RedisFailed
    })
}

#[tauri::command]
pub async fn delete_key(state: State<'_, Mutex<AppState>>, key: String) -> Result<(), AppError> {
    _delete_key(state.inner(), key).await
}
