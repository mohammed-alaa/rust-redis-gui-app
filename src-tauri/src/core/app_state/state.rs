use crate::core::Database;
use redis::Client;

#[derive(Debug, Default)]
pub struct AppState {
    redis_client: Option<Client>,
    db_connection: Option<Database>,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets the current Redis Client
    pub fn set_redis_client(&mut self, client: Option<Client>) {
        self.redis_client = client;
    }

    /// Returns a reference to the Client if present.
    pub fn get_redis_client(&self) -> Option<&Client> {
        self.redis_client.as_ref()
    }

    /// Sets the Database connection.
    pub fn set_db_connection(&mut self, db_connection: Option<Database>) {
        self.db_connection = db_connection;
    }

    /// Returns a reference to the Database connection if present.
    pub fn get_db_connection(&self) -> Option<&Database> {
        self.db_connection.as_ref()
    }
}

#[cfg(test)]
mod tests {
    use crate::{models::Server, services::test_connection, tests::run_redis_container};

    use super::*;

    #[test]
    fn test_app_state_initialization() {
        let app_state = AppState::new();
        assert!(app_state.get_redis_client().is_none());
        assert!(app_state.get_db_connection().is_none());
    }

    #[tokio::test]
    async fn test_set_and_get_redis_client() {
        let (host, port, container) = run_redis_container(6379).await;

        let mut app_state = AppState::new();
        let server = Server::from_payload("Local".to_string(), host, port);

        let redis_client = test_connection(&server).await.unwrap();
        app_state.set_redis_client(Some(redis_client));

        assert!(app_state.get_redis_client().is_some());

        app_state.set_redis_client(None);
        assert!(app_state.get_redis_client().is_none());

        container.rm().await.unwrap();
    }

    #[test]
    fn test_set_and_get_db_connection() {
        let mut app_state = AppState::new();
        let db_connection = Database::new_in_memory().unwrap();
        app_state.set_db_connection(Some(db_connection));

        assert!(app_state.get_db_connection().is_some());

        app_state.set_db_connection(None);
        assert!(app_state.get_db_connection().is_none());
    }
}
