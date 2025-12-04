use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AppError {
    /// Failure to interact with Redis server, e.g., connection failed, command failed
    RedisFailed = 910,
    /// Database is not ready, e.g., connection not established
    DbNotReady = 900,
    /// Generic database query failure, e.g., SELECT, UPDATE, DELETE
    DbQueryFailed = 901,
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_u16(*self as u16)
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", *self as u16)
    }
}

impl std::error::Error for AppError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_error_serialize_redis_failed() {
        let error = AppError::RedisFailed;
        let serialized = serde_json::to_value(error).unwrap();
        assert_eq!(serialized, serde_json::json!(910));
    }

    #[test]
    fn test_app_error_serialize_db_not_ready() {
        let error = AppError::DbNotReady;
        let serialized = serde_json::to_value(error).unwrap();
        assert_eq!(serialized, serde_json::json!(900));
    }

    #[test]
    fn test_app_error_serialize_db_query_failed() {
        let error = AppError::DbQueryFailed;
        let serialized = serde_json::to_value(error).unwrap();
        assert_eq!(serialized, serde_json::json!(901));
    }

    #[test]
    fn test_app_error_display_redis_failed() {
        let error = AppError::RedisFailed;
        assert_eq!(format!("{}", error), "910");
    }

    #[test]
    fn test_app_error_display_db_not_ready() {
        let error = AppError::DbNotReady;
        assert_eq!(format!("{}", error), "900");
    }

    #[test]
    fn test_app_error_display_db_query_failed() {
        let error = AppError::DbQueryFailed;
        assert_eq!(format!("{}", error), "901");
    }

    #[test]
    fn test_app_error_equality() {
        assert_eq!(AppError::RedisFailed, AppError::RedisFailed);
        assert_ne!(AppError::RedisFailed, AppError::DbNotReady);
    }

    #[test]
    fn test_app_error_clone() {
        let error = AppError::RedisFailed;
        let cloned = error.clone();
        assert_eq!(error, cloned);
    }

    #[test]
    fn test_app_error_copy() {
        let error = AppError::RedisFailed;
        let copied = error;
        assert_eq!(error, copied);
    }

    #[test]
    fn test_app_error_debug() {
        let error = AppError::RedisFailed;
        let debug_str = format!("{:?}", error);
        assert!(debug_str.contains("RedisFailed"));
    }
}
