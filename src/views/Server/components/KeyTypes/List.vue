<script setup lang="ts">
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableHeader,
	TableCell,
	TableEmpty,
} from "@components/ui/table";

defineProps<{
	value: TCurrentKey["content"];
}>();
</script>

<template>
	<div class="key-value">
		<Table class="table-fixed">
			<colgroup>
				<col width="100%" />
			</colgroup>
			<TableHeader sticky class="bg-muted shadow">
				<TableRow>
					<TableHead class="text-center"> Items </TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<template
					v-for="item in value"
					:key="`value-list-item-${item}`"
				>
					<TableRow class="group" data-testid="value-table-row">
						<TableCell>
							<p class="break-all truncate">
								{{ item }}
							</p>
						</TableCell>
					</TableRow>
				</template>
				<TableEmpty colspan="100%" v-if="!value.length">
					<p data-testid="value-empty">Value is empty.</p>
				</TableEmpty>
			</TableBody>
		</Table>
	</div>
</template>
