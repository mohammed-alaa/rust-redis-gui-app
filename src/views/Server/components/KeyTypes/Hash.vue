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
		{{ console.log("length", value) }}
		<Table class="table-fixed">
			<colgroup>
				<col width="50%" />
				<col width="50%" />
			</colgroup>
			<TableHeader sticky class="bg-muted shadow">
				<TableRow>
					<TableHead> Key </TableHead>
					<TableHead> Value </TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<template
					v-for="(field, key) in value"
					:key="`value-list-item-${key}`"
				>
					<TableRow class="group" data-testid="value-table-row">
						<TableCell>
							<p class="break-all truncate">
								{{ key }}
							</p>
						</TableCell>
						<TableCell>
							<p class="break-all truncate">
								{{ field }}
							</p>
						</TableCell>
					</TableRow>
				</template>

				<TableEmpty colspan="100%" v-if="!Object.keys(value).length">
					<p data-testid="value-empty">Value is empty.</p>
				</TableEmpty>
			</TableBody>
		</Table>
	</div>
</template>
