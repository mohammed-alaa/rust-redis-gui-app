use crate::AppState;
use redis::Client;
use std::{sync::Mutex, time::Duration};
use tauri::State;

#[tauri::command]
pub fn connect_to_server(
    state: State<'_, Mutex<AppState>>,
    name: String,
    host: String,
    port: u16,
) -> Result<(), String> {
    println!("Name: {}, Host: {}, Port: {}", name, host, port);

    let mut state = state.lock().unwrap();
    let client = Client::open(format!("redis://{}:{}", host, port));

    if client.is_err() {
        return Err(format!(
            "Error connecting to Redis server: {}",
            client.err().unwrap()
        ));
    }

    let client = client.unwrap();
    let connection = client.get_connection_with_timeout(Duration::from_secs(5));

    if connection.is_err() {
        return Err(format!(
            "Error getting connection to Redis server: {}",
            connection.err().unwrap()
        ));
    }

    state.set_redis_client(Some(client));
    return Ok(());
}
