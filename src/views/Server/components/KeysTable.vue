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

defineEmits<{
	"click:key": [key: TKey["key"]];
}>();
defineProps<{
	keys: TKey[];
}>();
</script>

<template>
	<div class="rounded-md border border-default overflow-y-auto keys-table">
		<Table class="table-fixed">
			<colgroup>
				<col width="10%" />
				<col width="70%" />
				<col width="20%" />
			</colgroup>
			<TableHeader sticky class="bg-muted shadow">
				<TableRow>
					<TableHead class="text-center"> Type </TableHead>
					<TableHead class="text-center"> Key </TableHead>
					<TableHead class="text-center"> TTL </TableHead>
					<!-- <TableHead class="text-center">
								Memory Usage
							</TableHead> -->
				</TableRow>
			</TableHeader>
			<TableBody>
				<template
					v-for="key in keys"
					:key="`keys-table-key-${key.key}`"
				>
					<TableRow
						class="cursor-pointer"
						data-testid="keys-table-row"
						@click="$emit('click:key', key.key)"
					>
						<TableCell class="text-center">
							<p>
								{{ key.key_type }}
							</p>
						</TableCell>
						<TableCell>
							<p
								class="break-all truncate hover:line-clamp-2"
								:title="key.key"
							>
								{{ key.key }}
							</p>
						</TableCell>
						<TableCell class="text-center">
							<p>{{ key.ttl_formatted }}</p>
						</TableCell>
						<!-- <TableCell class="text-center">
									<p>{{ key.memory_usage }}</p>
								</TableCell> -->
					</TableRow>
				</template>
				<TableEmpty colspan="100%" v-if="!keys.length">
					<p data-testid="keys-table-no-keys-message">
						No keys found.
					</p>
				</TableEmpty>
			</TableBody>
		</Table>
	</div>
</template>
