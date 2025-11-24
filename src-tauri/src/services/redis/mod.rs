use crate::{core::AppError, models::Server};
use redis::{AsyncConnectionConfig, AsyncTypedCommands, Client};
use std::time::Duration;

pub async fn test_connection(server: &Server) -> Result<Client, AppError> {
    let client = Client::open(format!("redis://{}:{}", server.address, server.port))
        .map_err(|_| AppError::RedisFailed)?;

    let config = AsyncConnectionConfig::new().set_connection_timeout(Duration::from_secs(6));
    let mut conn = client
        .get_multiplexed_async_connection_with_config(&config)
        .await
        .map_err(|_| AppError::RedisFailed)?;

    let pong: String = conn.ping().await.map_err(|_| AppError::RedisFailed)?;

    if pong != "PONG" {
        return Err(AppError::RedisFailed);
    }

    Ok(client)
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use crate::tests::run_redis_container;

    #[tokio::test]
    async fn test_invalid_connection() {
        let (_, _, container) = run_redis_container(6379).await;

        let server = Server::from_payload("Test".to_string(), "256.256.256.256".to_string(), 6379);
        let result = test_connection(&server).await;
        assert!(result.is_err());
        assert_eq!(result.err().unwrap(), AppError::RedisFailed);
        container.rm().await.unwrap();
    }

    #[tokio::test]
    async fn test_valid_connection() {
        let (host, port, container) = run_redis_container(6379).await;

        let server = Server::from_payload("Test".to_string(), host, port);
        let result = test_connection(&server).await;
        assert!(result.is_ok());

        container.rm().await.unwrap();
    }
}
