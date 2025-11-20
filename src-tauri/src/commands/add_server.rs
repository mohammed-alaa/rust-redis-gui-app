use crate::{
    core::AppState,
    models::{Model, Server},
    services::test_connection,
};
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub fn add_server(
    state: State<'_, Mutex<AppState>>,
    name: String,
    address: String,
    port: u16,
) -> Result<Server, String> {
    let state = state.lock().unwrap();
    let db_connection = state.get_db_connection();

    if db_connection.is_none() {
        return Err("Database connection is not available".into());
    }

    let server = Server::from_payload(name, address, port);
    test_connection(&server)?;

    server
        .create(db_connection.unwrap())
        .map_err(|err| format!("Failed to create server: {}", err))
}
