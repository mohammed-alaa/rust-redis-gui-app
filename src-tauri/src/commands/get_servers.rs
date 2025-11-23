use crate::{
    core::{AppError, AppState},
    models::{Model, Server},
};
use std::sync::Mutex;
use tauri::State;

fn _get_servers(state: &Mutex<AppState>) -> Result<Vec<Server>, AppError> {
    let state = state.lock().unwrap();
    let db_connection = state.get_db_connection();

    if db_connection.is_none() {
        return Err(AppError::DbNotReady);
    }

    Server::get(db_connection.unwrap())
}

#[tauri::command]
pub fn get_servers(state: State<'_, Mutex<AppState>>) -> Result<Vec<Server>, AppError> {
    _get_servers(state.inner())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        core::{AppState, Database},
        models::Server,
    };
    use std::sync::Mutex;
    // use tauri::test::{assert_ipc_response, mock_builder, mock_context, noop_assets, MockRuntime};

    // fn create_app() -> tauri::App<MockRuntime> {
    //     let app_state = Mutex::new({
    //         let mut s = AppState::new();
    //         s.set_db_connection(Some(Database::new_in_memory().unwrap()));
    //         s
    //     });

    //     mock_builder()
    //         .manage(app_state)
    //         .invoke_handler(tauri::generate_handler![get_servers])
    //         .build(mock_context(noop_assets()))
    //         .expect("failed to build app")
    // }

    #[test]
    fn test_get_servers_empty_db() {
        let app_state = Mutex::new({
            let mut s = AppState::new();
            s.set_db_connection(Some(Database::new_in_memory().unwrap()));
            s
        });

        let servers = _get_servers(&app_state);

        assert!(servers.is_ok());
        assert_eq!(servers.unwrap().len(), 0);
    }

    #[test]
    fn test_get_servers_with_data() {
        let app_state = Mutex::new({
            let mut s = AppState::new();
            s.set_db_connection(Some(Database::new_in_memory().unwrap()));
            s
        });

        let server = Server::new().create(app_state.lock().unwrap().get_db_connection().unwrap());
        let result = _get_servers(&app_state);

        assert!(result.is_ok());
        let servers = result.unwrap();
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0], server.unwrap())
    }

    #[test]
    fn test_get_servers_no_db() {
        let app_state = Mutex::new(AppState::new());
        let servers = _get_servers(&app_state);

        assert!(servers.is_err());
        assert_eq!(servers.err().unwrap(), AppError::DbNotReady);
    }
}
