<script setup lang="ts">
defineProps<{
	details?: TKey;
	content?: TKeyContent;
}>();
</script>

<template>
	<template v-if="details">
		<div class="whitespace-pre-wrap break-all overflow-y-auto key-details">
			<!-- <div>{{ details }}</div> -->
			<!-- <br /> -->
			<UTextarea :model-value="JSON.stringify(content)" />
		</div>
	</template>
	<template v-else>
		<div class="text-center text-gray-500 italic">No key selected</div>
	</template>
</template>
