<script setup lang="ts">
defineProps<{
	details?: TKey;
	content?: TKeyContent;
}>();
</script>

<template>
	<div class="whitespace-pre-wrap break-all overflow-y-auto key-details">
		<!-- <div>{{ details }}</div> -->
		<!-- <br /> -->
		<UTextarea :model-value="JSON.stringify(content)" />
	</div>
</template>
