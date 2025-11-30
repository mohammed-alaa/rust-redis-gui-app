use crate::{
    core::{AppError, AppState},
    models::{Model, Server},
    services::test_connection,
};
use tauri::State;
use tokio::sync::Mutex;

async fn _add_server(
    state: &Mutex<AppState>,
    name: String,
    address: String,
    port: u16,
) -> Result<Server, AppError> {
    let server = Server::from_payload(name, address, port);
    test_connection(&server).await?;

    let app_state = state.lock().await;
    let db_connection = app_state.get_db_connection().ok_or_else(|| {
        log::error!("Database connection is not ready");
        AppError::DbNotReady
    })?;
    server.create(db_connection)
}

#[tauri::command]
pub async fn add_server(
    state: State<'_, Mutex<AppState>>,
    name: String,
    address: String,
    port: u16,
) -> Result<Server, AppError> {
    _add_server(state.inner(), name, address, port).await
}

#[cfg(test)]
mod tests {

    use super::*;
    use crate::{
        core::{AppState, Database},
        models::Server,
        tests::run_redis_container,
    };

    #[tokio::test]
    async fn test_add_working_server() {
        let (host, port, container) = run_redis_container(6379).await;

        let app_state = Mutex::new({
            let mut s = AppState::new();
            s.set_db_connection(Some(Database::new_in_memory().unwrap()));
            s
        });

        let test_server = Server::from_payload("Local Redis".into(), host, port);

        let result = _add_server(
            &app_state,
            test_server.name.clone(),
            test_server.address.clone(),
            test_server.port,
        )
        .await;

        assert!(result.is_ok());
        let server = result.unwrap();
        assert_eq!(server.name, test_server.name);
        assert_eq!(server.address, test_server.address);
        assert_eq!(server.port, test_server.port);
        assert_ne!(server, test_server);

        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_add_wrong_server() {
        let app_state = Mutex::new({
            let mut s = AppState::new();
            s.set_db_connection(Some(Database::new_in_memory().unwrap()));
            s
        });

        let result = _add_server(
            &app_state,
            "Bad Server".into(),
            "256.256.256.256".into(),
            6379,
        )
        .await;

        assert!(result.is_err());
        assert_eq!(result.err().unwrap(), AppError::RedisFailed);
    }

    #[tokio::test]
    async fn test_add_server_no_db_connection() {
        let (host, port, container) = run_redis_container(6379).await;
        let app_state = Mutex::new(AppState::new());
        let server = _add_server(&app_state, "Test Server".into(), host, port).await;

        assert!(server.is_err());
        assert_eq!(server.err().unwrap(), AppError::DbNotReady);
        container.rm().await.unwrap();
    }
}
