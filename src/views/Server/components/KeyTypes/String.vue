<script setup lang="ts">
defineProps<{
	value: TCurrentKey["content"];
}>();
</script>

<template>
	<div class="key-value p-4">
		<p>{{ value }}</p>
	</div>
</template>
