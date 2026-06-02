<script setup lang="ts">
import { useFormatKeyType } from "@composables";

const { longFormat } = useFormatKeyType();

defineEmits<{
	fullscreen: [];
	edit: [];
	delete: [];
	copy: [];
}>();
defineProps<{
	details: TCurrentKey["details"];
}>();
</script>

<template>
	<div class="key-header-container">
		<div class="flex items-center gap-2 overflow-hidden">
			<UBadge
				size="sm"
				color="info"
				class="justify-center"
				:label="longFormat(details.key_type)"
			/>
			<h2 class="line-clamp-1 flex-1">
				{{ details.key }}
			</h2>
			<UButton
				size="sm"
				color="info"
				variant="subtle"
				aria-label="Copy key name"
				icon="heroicons-outline:clipboard-copy"
				@click="$emit('copy')"
			/>
		</div>
		<hr class="opacity-25" />
		<div class="flex items-center gap-2">
			<p>
				<strong>TTL: </strong>
				<span>{{ details.ttl_formatted }} ({{ details.ttl }})</span>
			</p>
			<div class="flex-1 flex justify-end items-center gap-2">
				<UButton
					color="info"
					size="sm"
					variant="subtle"
					icon="system-uicons:fullscreen"
					aria-label="View in fullscreen"
					@click="$emit('fullscreen')"
				/>
				<UButton
					color="warning"
					size="sm"
					variant="subtle"
					icon="material-symbols:edit-outline-rounded"
					aria-label="Edit"
					@click="$emit('edit')"
				/>
				<UButton
					color="error"
					size="sm"
					variant="subtle"
					icon="material-symbols:delete-outline-rounded"
					aria-label="Delete"
					@click="$emit('delete')"
				/>
			</div>
		</div>
	</div>
</template>
