<script setup lang="ts">
defineProps<{
	value: TCurrentKey["content"];
}>();
</script>

<template>
	<div class="key-value">
		<p>{{ value }}</p>
	</div>
</template>
