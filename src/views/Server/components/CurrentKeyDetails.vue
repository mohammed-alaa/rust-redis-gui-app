<script setup lang="ts">
withDefaults(
	defineProps<{
		details?: TKey | null;
		content?: TKeyContent | null;
	}>(),
	{
		details: null,
		content: null,
	},
);
</script>

<template>
	<div class="whitespace-pre-wrap break-all overflow-y-auto key-details">
		<div>{{ details }}</div>
		<br />
		<div>{{ content }}</div>
	</div>
</template>
