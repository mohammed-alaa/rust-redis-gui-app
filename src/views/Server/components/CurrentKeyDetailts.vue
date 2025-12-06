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
	<div class="break-all overflow-y-auto key-details">
		{{ details }}
		<br />
		{{ content }}
	</div>
</template>
