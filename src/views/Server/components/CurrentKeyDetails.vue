<script setup lang="ts">
import { computed } from "vue";
import KeyHeader from "./KeyHeader.vue";
import String from "./KeyTypes/String.vue";
import Hash from "./KeyTypes/Hash.vue";
import List from "./KeyTypes/List.vue";
import Set from "./KeyTypes/Set.vue";

const props = defineProps<{
	currentKey?: TCurrentKey;
}>();

const ValueRenderer = computed(() => {
	switch (props.currentKey?.details?.key_type) {
		case "string":
			return String;
		case "hash":
			return Hash;
		case "list":
			return List;
		case "set":
		case "zset":
			return Set;
		default:
			return null;
	}
});
</script>

<template>
	<div class="key-details">
		<template v-if="currentKey">
			<KeyHeader :details="currentKey.details" />
			<component :is="ValueRenderer" :value="currentKey.content" />
		</template>
		<template v-else>
			<div class="text-center text-gray-500 italic">No key selected</div>
		</template>
	</div>
</template>
