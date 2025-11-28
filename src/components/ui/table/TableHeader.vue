<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@utils/shadcnUtils";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		sticky?: boolean;
	}>(),
	{
		class: "",
		sticky: false,
	},
);
</script>

<template>
	<thead
		data-slot="table-header"
		:class="
			cn('[&_tr]:border-b', sticky ? 'sticky top-0 ' : '', props.class)
		"
	>
		<slot />
	</thead>
</template>
