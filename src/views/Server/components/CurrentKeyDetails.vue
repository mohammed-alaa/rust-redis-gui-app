<script setup lang="ts">
import { computed } from "vue";
import KeyHeader from "./KeyHeader.vue";
import String from "./KeyTypes/String.vue";
import Hash from "./KeyTypes/Hash.vue";
import List from "./KeyTypes/List.vue";
import Set from "./KeyTypes/Set.vue";

defineEmits<{
	fullscreen: [];
	edit: [];
	delete: [];
	copy: [];
}>();

const isViewingInFullscreen = defineModel<boolean>("fullscreen", {
	type: Boolean,
	required: false,
	default: false,
});

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
			<KeyHeader
				:details="currentKey.details"
				@fullscreen="$emit('fullscreen')"
				@edit="$emit('edit')"
				@delete="$emit('delete')"
				@copy="$emit('copy')"
			/>
			<component :is="ValueRenderer" :value="currentKey.content" />
		</template>
		<template v-else>
			<div class="text-center text-gray-500 italic">No key selected</div>
		</template>
	</div>

	<UModal fullscreen v-model:open="isViewingInFullscreen">
		<template #header>
			<KeyHeader
				class="in-modal"
				:details="currentKey!.details"
				@fullscreen="$emit('fullscreen')"
				@edit="$emit('edit')"
				@delete="$emit('delete')"
				@copy="$emit('copy')"
			/>
		</template>
		<template #body>
			<component
				class="in-modal"
				:is="ValueRenderer"
				:value="currentKey!.content"
			/>
		</template>
	</UModal>
</template>
