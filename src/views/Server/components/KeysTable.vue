<script setup lang="ts">
import { computed } from "vue";
import { KEY_TYPE_FILTER_ALL } from "@constants";
import { useFormatKeyType } from "@composables";
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableHeader,
	TableCell,
	TableEmpty,
} from "@components/ui/table";

const { shortFormat } = useFormatKeyType();

defineEmits<{
	"click:key": [key: TKey["key"]];
}>();
const props = defineProps<{
	keys: TKey[];
	currentKeyType: TRetrieveFilters["key_type"];
}>();

const showKeyTypeColumn = computed(
	() => KEY_TYPE_FILTER_ALL === props.currentKeyType,
);
</script>

<template>
	<div class="keys-table">
		<Table class="table-fixed">
			<colgroup>
				<col width="15%" v-show="showKeyTypeColumn" />
				<col width="70%" />
				<col width="20%" />
			</colgroup>
			<TableHeader sticky class="bg-muted shadow">
				<TableRow>
					<TableHead class="text-center" v-show="showKeyTypeColumn">
						Type
					</TableHead>
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
						<TableCell
							class="text-center"
							v-show="showKeyTypeColumn"
						>
							<UBadge
								size="sm"
								color="info"
								class="w-full justify-center"
								:label="shortFormat(key.key_type)"
							/>
						</TableCell>
						<TableCell>
							<p class="break-all truncate" :title="key.key">
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
