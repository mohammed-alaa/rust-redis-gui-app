use crate::{core::AppError, models::Server};
use redis::Client;
use std::time::Duration;

pub fn test_connection(server: &Server) -> Result<Client, AppError> {
    let client = Client::open(format!("redis://{}:{}", server.address, server.port));

    if client.is_err() {
        return Err(AppError::RedisFailed);
        // return Err(format!(
        //     "Error connecting to Redis server: {}",
        //     client.err().unwrap()
        // ));
    }

    let client = client.unwrap();
    let connection = client.get_connection_with_timeout(Duration::from_secs(5));

    if connection.is_err() {
        return Err(AppError::RedisFailed);

        // return Err(format!(
        //     "Error getting connection to Redis server: {}",
        //     connection.err().unwrap()
        // ));
    }

    Ok(client)
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use crate::tests::run_redis_container;
    use std::any::Any;

    #[tokio::test]
    async fn test_invalid_connection() {
        let (_, _, container) = run_redis_container(6379).await;

        let server = Server::from_payload("Test".to_string(), "256.256.256.256".to_string(), 6379);
        let result = test_connection(&server);
        assert!(result.is_err());
        assert_eq!(result.err().unwrap(), AppError::RedisFailed);
        drop(container);
    }

    #[tokio::test]
    async fn test_valid_connection() {
        let (host, port, container) = run_redis_container(6379).await;

        let server = Server::from_payload("Test".to_string(), host, port);
        let result = test_connection(&server);
        assert!(result.is_ok());
        assert_eq!(
            std::any::TypeId::of::<redis::Client>(),
            result.unwrap().type_id(),
            "Wrong type! Expected redis::Client"
        );

        drop(container);
    }
}
