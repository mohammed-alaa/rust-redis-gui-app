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
