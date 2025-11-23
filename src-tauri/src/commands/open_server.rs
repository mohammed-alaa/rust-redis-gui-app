use crate::{
    core::{AppError, AppState},
    models::{Model, Server},
    services::test_connection,
};
use tauri::State;
use tokio::sync::Mutex;
use uuid::Uuid;

async fn _open_server(state: &Mutex<AppState>, id: Uuid) -> Result<Server, AppError> {
    let server = {
        let app_state = state.lock().await;
        let db = app_state.get_db_connection().ok_or(AppError::DbNotReady)?;
        Server::find_by_id(&id.to_string(), db)?
    };

    let mut app_state = state.lock().await;
    let client = test_connection(&server).await?;
    if app_state.get_redis_client().is_some() {
        app_state.set_redis_client(None);
    }

    app_state.set_redis_client(Some(client));
    Ok(server)
}

#[tauri::command]
pub async fn open_server(state: State<'_, Mutex<AppState>>, id: Uuid) -> Result<Server, AppError> {
    _open_server(state.inner(), id).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{core::Database, tests::run_redis_container};

    #[tokio::test]
    async fn test_open_server_with_non_existing_server_id() {
        let app_state = Mutex::new(AppState::new());
        let invalid_id = Uuid::new_v4();

        let result = _open_server(&app_state, invalid_id).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), AppError::DbNotReady);
    }

    #[tokio::test]
    async fn test_open_server_success() {
        let app_state = Mutex::new({
            let mut s = AppState::new();
            s.set_db_connection(Some(Database::new_in_memory().unwrap()));
            s
        });

        let (host, port, container) = run_redis_container(6379).await;

        let new_server = {
            let new_server_payload = Server::from_payload("Test Server".to_string(), host, port);
            let state = app_state.lock().await;
            let db_connection = state.get_db_connection().unwrap();
            new_server_payload.create(db_connection).unwrap()
        };

        let result = _open_server(&app_state, new_server.id).await;

        assert!(result.is_ok());
        let opened_server = result.unwrap();
        assert_eq!(opened_server, new_server);
        drop(container);
    }

    #[tokio::test]
    async fn test_open_server_with_existing_id() {
        let app_state = Mutex::new({
            let mut s = AppState::new();
            s.set_db_connection(Some(Database::new_in_memory().unwrap()));
            s
        });

        let (host, port, container) = run_redis_container(6379).await;

        let new_server = {
            let new_server_payload = Server::from_payload("Test Server".to_string(), host, port);
            let state = app_state.lock().await;
            let db_connection = state.get_db_connection().unwrap();
            new_server_payload.create(db_connection).unwrap()
        };

        let result = _open_server(&app_state, new_server.id).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), new_server);
        drop(container);
    }

    #[tokio::test]
    async fn test_open_server_with_invalid_connection() {
        let app_state = Mutex::new({
            let mut s = AppState::new();
            s.set_db_connection(Some(Database::new_in_memory().unwrap()));
            s
        });

        let new_server = {
            let new_server_payload = Server::from_payload(
                "Invalid Server".to_string(),
                "256.256.256.256".to_string(),
                6379,
            );
            let state = app_state.lock().await;
            let db_connection = state.get_db_connection().unwrap();
            new_server_payload.create(db_connection).unwrap()
        };

        let result = _open_server(&app_state, new_server.id).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), AppError::RedisFailed);
    }
}
