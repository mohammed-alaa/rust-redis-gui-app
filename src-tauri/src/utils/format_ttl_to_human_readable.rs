pub fn format_ttl_to_human_readable(ttl_in_seconds: &i64) -> String {
    if *ttl_in_seconds == -1 {
        return "-".to_string();
    }

    let ttl_in_seconds = *ttl_in_seconds as u64;
    let units: &[(&str, u64)] = &[
        ("s", 1),
        ("min", 60),
        ("h", 60 * 60),
        ("d", 24 * 60 * 60),
        ("mon", 30 * 24 * 60 * 60),
        ("y", 12 * 30 * 24 * 60 * 60),
    ];

    let unit = units
        .iter()
        .rfind(|&(_, divisor)| ttl_in_seconds >= *divisor);

    match unit {
        Some((name, divisor)) => format!("{}{}", ttl_in_seconds / divisor, name),
        None => "-".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_ttl_to_human_readable() {
        assert_eq!(format_ttl_to_human_readable(&-1), "-");
        assert_eq!(format_ttl_to_human_readable(&30), "30s");
        assert_eq!(format_ttl_to_human_readable(&90), "1min");
        assert_eq!(format_ttl_to_human_readable(&3600), "1h");
        assert_eq!(format_ttl_to_human_readable(&86399), "23h");
        assert_eq!(format_ttl_to_human_readable(&86400), "1d");
        assert_eq!(format_ttl_to_human_readable(&2592000), "1mon");
        assert_eq!(format_ttl_to_human_readable(&31536000), "1y");
    }
}
