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

    let result = connection
        .del::<String, usize>(key.clone())
        .await
        .map_err(|e| {
            log::error!("Failed to delete key: {}", e);
            AppError::RedisFailed
        })?;

    match result {
        0 => Err(AppError::RedisFailed),
        _ => Ok(()),
    }
}

#[tauri::command]
pub async fn delete_key(state: State<'_, Mutex<AppState>>, key: String) -> Result<(), AppError> {
    _delete_key(state.inner(), key).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        core::Database, models::Server, services::test_connection, tests::run_redis_container,
    };
    const PORT: u16 = 6379;

    #[tokio::test]
    async fn test_delete_key_with_existing_key() {
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

            let _: () = connection.set("correct_key", "hello world").await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let result = _delete_key(&app_state, "correct_key".to_string()).await;
        assert!(result.is_ok());
        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_delete_key_with_nonexistent_key() {
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

            let _: () = connection.set("test_key", "hello world").await.unwrap();
        }

        let app_state = Mutex::new(app_state);
        let result = _delete_key(&app_state, "invalid_key".to_string()).await;
        assert!(result.is_err());
        container.rm().await.unwrap();
    }
}
