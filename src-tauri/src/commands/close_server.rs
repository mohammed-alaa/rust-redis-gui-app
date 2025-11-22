use crate::core::AppState;
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub fn close_server(state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();

    if app_state.get_redis_client().is_some() {
        app_state.set_redis_client(None);
    }

    Ok(())
}
