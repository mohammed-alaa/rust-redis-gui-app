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
	{{ details }}
	<br />
	{{ content }}
</template>
