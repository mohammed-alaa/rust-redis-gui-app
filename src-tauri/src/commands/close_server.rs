use crate::core::AppState;
use tauri::State;
use tokio::sync::Mutex;

async fn _close_server(state: &Mutex<AppState>) -> Result<(), String> {
    let mut app_state = state.lock().await;

    if app_state.get_redis_client().is_some() {
        app_state.set_redis_client(None);
    }

    Ok(())
}

#[tauri::command]
pub async fn close_server(state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    _close_server(state.inner()).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_close_server() {
        let app_state = Mutex::new(AppState::new());
        let result = _close_server(&app_state).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_close_server_with_existing_client() {
        let mut app_state_instance = AppState::new();
        // Simulate an existing Redis client by setting a dummy value
        app_state_instance
            .set_redis_client(Some(redis::Client::open("redis://localhost:6379").unwrap()));

        let app_state = Mutex::new(app_state_instance);
        let result = _close_server(&app_state).await;

        assert!(result.is_ok());

        let locked_state = app_state.lock().await;
        assert!(locked_state.get_redis_client().is_none());
    }
}
