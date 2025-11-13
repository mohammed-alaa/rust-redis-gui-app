use crate::state::AppState;
use redis::TypedCommands;
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub fn get_keys(state: State<'_, Mutex<AppState>>, filter: String) -> Result<Vec<String>, String> {
    let state = state.lock().unwrap();
    let redis_client = state.get_redis_client();

    if redis_client.is_none() {
        return Err("Redis client not initialized".to_string());
    }

    let redis_client = redis_client.unwrap().clone();
    let connection = redis_client.get_connection();

    if connection.is_err() {
        return Err(connection.err().unwrap().to_string());
    }

    let mut connection = connection.unwrap();
    let keys = connection.keys(match filter.is_empty() {
        // Must use * if filter is empty, otherwise it won't return any keys
        true => "*".to_string(),
        false => filter,
    });

    if keys.is_err() {
        return Err(keys.err().unwrap().to_string());
    }

    Ok(keys.unwrap())
}
