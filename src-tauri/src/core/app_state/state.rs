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

    pub fn set_redis_client(&mut self, client: Option<Client>) {
        self.redis_client = client;
    }

    pub fn set_db_connection(&mut self, db_connection: Option<Database>) {
        self.db_connection = db_connection;
    }

    /// Returns a reference to the Client if present.
    pub fn get_redis_client(&self) -> Option<&Client> {
        self.redis_client.as_ref()
    }

    // Temp: temporary ignore dead code until functionalities are implemented
    #[allow(dead_code)]
    pub fn get_db_connection(&self) -> Option<&Database> {
        self.db_connection.as_ref()
    }
}
