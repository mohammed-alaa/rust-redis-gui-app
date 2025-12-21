<script setup lang="ts">
import { useFormatKeyType } from "@composables";

const { longFormat } = useFormatKeyType();

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
			<h2 class="line-clamp-1">
				{{ details.key }}
			</h2>
		</div>
		<hr class="opacity-25" />
		<p>
			<strong>TTL: </strong>
			<span>{{ details.ttl_formatted }} ({{ details.ttl }})</span>
		</p>
	</div>
</template>
