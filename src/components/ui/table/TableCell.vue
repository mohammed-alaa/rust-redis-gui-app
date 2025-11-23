<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@utils/shadcnUtils";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		colspan?: number | "100%";
	}>(),
	{
		colspan: 1,
	},
);
</script>

<template>
	<td
		data-slot="table-cell"
		:class="
			cn(
				'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
				props.class,
			)
		"
		:colspan="props.colspan"
	>
		<slot />
	</td>
</template>
