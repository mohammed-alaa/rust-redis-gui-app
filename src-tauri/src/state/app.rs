use redis::Client;

#[derive(Debug, Clone, Default)]
pub struct AppState {
    redis_client: Option<Client>,
}

impl AppState {
    pub fn new() -> Self {
        Self { redis_client: None }
    }

    pub fn set_redis_client(&mut self, client: Option<Client>) {
        self.redis_client = client;
    }

    pub fn get_redis_client(&self) -> Option<Client> {
        self.redis_client.clone()
    }
}
