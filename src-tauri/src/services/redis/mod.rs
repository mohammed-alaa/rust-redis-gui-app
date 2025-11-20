use crate::models::Server;
use redis::Client;
use std::time::Duration;

pub fn test_connection(server: &Server) -> Result<(), String> {
    let client = Client::open(format!("redis://{}:{}", server.address, server.port));

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

    Ok(())
}
