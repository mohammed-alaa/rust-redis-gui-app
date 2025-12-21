export function useFormatKeyType() {
	function shortFormat(key_type: TKey["key_type"]) {
		switch (key_type) {
			case "string":
				return "String";
			case "list":
				return "List";
			case "set":
				return "Set";
			case "zset":
				return "S-Set";
			case "hash":
				return "Hash";
			default:
				return key_type;
		}
	}

	function longFormat(key_type: TKey["key_type"]) {
		switch (key_type) {
			case "string":
				return "String";
			case "list":
				return "List";
			case "set":
				return "Set";
			case "zset":
				return "Sorted Set";
			case "hash":
				return "Hash";
			default:
				return key_type;
		}
	}

	return {
		shortFormat,
		longFormat,
	};
}
