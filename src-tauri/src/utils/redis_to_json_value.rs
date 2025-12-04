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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_redis_nil_to_json() {
        let result = redis_to_json(RedisValue::Nil);
        assert_eq!(result, Value::Null);
    }

    #[test]
    fn test_redis_int_to_json() {
        let result = redis_to_json(RedisValue::Int(42));
        assert_eq!(result, json!(42));
    }

    #[test]
    fn test_redis_negative_int_to_json() {
        let result = redis_to_json(RedisValue::Int(-100));
        assert_eq!(result, json!(-100));
    }

    #[test]
    fn test_redis_boolean_true_to_json() {
        let result = redis_to_json(RedisValue::Boolean(true));
        assert_eq!(result, json!(true));
    }

    #[test]
    fn test_redis_boolean_false_to_json() {
        let result = redis_to_json(RedisValue::Boolean(false));
        assert_eq!(result, json!(false));
    }

    #[test]
    fn test_redis_okay_to_json() {
        let result = redis_to_json(RedisValue::Okay);
        assert_eq!(result, json!("OK"));
    }

    #[test]
    fn test_redis_simple_string_to_json() {
        let result = redis_to_json(RedisValue::SimpleString("hello".to_string()));
        assert_eq!(result, json!("hello"));
    }

    #[test]
    fn test_redis_bulk_string_plain_to_json() {
        let result = redis_to_json(RedisValue::BulkString(b"plain text".to_vec()));
        assert_eq!(result, json!("plain text"));
    }

    #[test]
    fn test_redis_bulk_string_json_to_json() {
        let json_str = r#"{"key":"value"}"#;
        let result = redis_to_json(RedisValue::BulkString(json_str.as_bytes().to_vec()));
        assert_eq!(result, json!({"key": "value"}));
    }

    #[test]
    fn test_redis_double_to_json() {
        let result = redis_to_json(RedisValue::Double(3.14));
        assert_eq!(result, json!(3.14));
    }

    #[test]
    fn test_redis_double_nan_to_json() {
        let result = redis_to_json(RedisValue::Double(f64::NAN));
        assert_eq!(result, Value::Null);
    }

    #[test]
    fn test_redis_verbatim_string_to_json() {
        let result = redis_to_json(RedisValue::VerbatimString {
            format: redis::VerbatimFormat::Text,
            text: "verbatim text".to_string(),
        });
        assert_eq!(result, json!("verbatim text"));
    }

    #[test]
    fn test_redis_array_to_json() {
        let result = redis_to_json(RedisValue::Array(vec![
            RedisValue::Int(1),
            RedisValue::Int(2),
            RedisValue::Int(3),
        ]));
        assert_eq!(result, json!([1, 2, 3]));
    }

    #[test]
    fn test_redis_nested_array_to_json() {
        let result = redis_to_json(RedisValue::Array(vec![
            RedisValue::SimpleString("a".to_string()),
            RedisValue::Array(vec![RedisValue::Int(1), RedisValue::Int(2)]),
        ]));
        assert_eq!(result, json!(["a", [1, 2]]));
    }

    #[test]
    fn test_redis_set_to_json() {
        let result = redis_to_json(RedisValue::Set(vec![
            RedisValue::SimpleString("a".to_string()),
            RedisValue::SimpleString("b".to_string()),
        ]));
        assert_eq!(result, json!(["a", "b"]));
    }

    #[test]
    fn test_redis_map_to_json() {
        let result = redis_to_json(RedisValue::Map(vec![
            (
                RedisValue::BulkString(b"field1".to_vec()),
                RedisValue::SimpleString("value1".to_string()),
            ),
            (
                RedisValue::SimpleString("field2".to_string()),
                RedisValue::Int(42),
            ),
        ]));
        assert_eq!(result, json!({"field1": "value1", "field2": 42}));
    }

    #[test]
    fn test_redis_map_with_unknown_key_to_json() {
        let result = redis_to_json(RedisValue::Map(vec![(
            RedisValue::Int(123),
            RedisValue::SimpleString("value".to_string()),
        )]));
        assert_eq!(result, json!({"unknown_key": "value"}));
    }

    #[test]
    fn test_parse_as_json_or_string_valid_json() {
        let result = parse_as_json_or_string("{\"a\": 1}");
        assert_eq!(result, json!({"a": 1}));
    }

    #[test]
    fn test_parse_as_json_or_string_plain_text() {
        let result = parse_as_json_or_string("hello world");
        assert_eq!(result, json!("hello world"));
    }
}
