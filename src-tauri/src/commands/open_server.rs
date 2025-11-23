use crate::{
    core::AppState,
    models::{Model, Server},
    services::test_connection,
};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn open_server(state: State<'_, Mutex<AppState>>, id: Uuid) -> Result<Server, String> {
    let mut app_state = state.lock().unwrap();
    if app_state.get_db_connection().is_none() {
        return Err("Database connection is not available".into());
    }

    if app_state.get_redis_client().is_some() {
        app_state.set_redis_client(None);
    }

    let (server, redis_client) = {
        let server = Server::find_by_id(&id.to_string(), app_state.get_db_connection().unwrap())?;
        println!("Open server with server: {}", server);
        let redis_client = test_connection(&server)?;
        (server, redis_client)
    };

    app_state.set_redis_client(Some(redis_client));

    Ok(server)
}
