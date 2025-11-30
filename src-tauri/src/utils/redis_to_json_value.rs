use redis::Value as RedisValue;
use serde_json::{json, Map, Number, Value};
use std::borrow::Cow;

/// Helper: Try parse string as JSON, fallback to string literal
fn parse_as_json_or_string(text: &str) -> Value {
    serde_json::from_str::<Value>(text).unwrap_or_else(|_| Value::String(text.to_string()))
}

pub fn redis_to_json(value: RedisValue) -> Value {
    match value {
        RedisValue::Nil => Value::Null,
        RedisValue::Int(i) => json!(i),
        RedisValue::Boolean(b) => json!(b),
        RedisValue::Okay => json!("OK"),
        RedisValue::SimpleString(s) => json!(s),
        RedisValue::BulkString(bytes) => {
            let text = String::from_utf8_lossy(&bytes);
            parse_as_json_or_string(&text)
        }
        RedisValue::Double(f) => Number::from_f64(f).map_or(json!(null), Value::Number),
        RedisValue::VerbatimString { format: _, text } => {
            let text = String::from_utf8_lossy(text.as_bytes());
            parse_as_json_or_string(&text)
        }
        RedisValue::Array(items) => {
            Value::Array(items.into_iter().map(redis_to_json).collect::<Vec<Value>>())
        }
        RedisValue::Set(items) => {
            Value::Array(items.into_iter().map(redis_to_json).collect::<Vec<Value>>())
        }
        RedisValue::Map(map) => {
            let mut obj = Map::new();
            for (k, v) in map {
                let key_str = match &k {
                    RedisValue::BulkString(b) => {
                        Cow::Owned(String::from_utf8_lossy(b).into_owned())
                    }
                    RedisValue::SimpleString(s) => Cow::Owned(String::from(s)),
                    _ => Cow::Borrowed("unknown_key"),
                };
                obj.insert(key_str.into_owned(), redis_to_json(v));
            }
            Value::Object(obj)
        }
        _ => json!({ "unsupported": format!("{:?}", value) }),
    }
}
