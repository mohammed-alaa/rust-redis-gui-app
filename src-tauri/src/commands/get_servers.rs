use std::sync::Mutex;

use tauri::State;

use crate::{
    core::AppState,
    models::{Model, Server},
};

#[tauri::command]
pub fn get_servers(state: State<'_, Mutex<AppState>>) -> Result<Vec<Server>, String> {
    let state = state.lock().unwrap();
    let db_connection = state.get_db_connection();

    if db_connection.is_none() {
        return Err("Database connection is not available".into());
    }

    Server::get(db_connection.unwrap()).map_err(|err| format!("Failed to get servers: {}", err))
}
