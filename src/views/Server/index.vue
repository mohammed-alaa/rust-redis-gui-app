<script setup lang="ts">
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import { onBeforeUnmount } from "vue";
import { useFilterForm } from "./composables/useFilterForm";
import {
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableHeader,
	TableCell,
} from "@components/ui/table";
import { useKeyStore } from "@stores/useKeyStore";

const toast = useToast();
const serverStore = useServerStore();
const keyStore = useKeyStore();
const { keys } = storeToRefs(keyStore);
const { form, onSubmit: onFiltersSubmitted } = useFilterForm();
const { activeServer, isConnected } = storeToRefs(serverStore);

onBeforeUnmount(() => {
	serverStore.closeServer().catch(() => {
		toast.add({
			title: "Failed to close server connection",
			color: "error",
		});
	});
});

async function onSubmit(event: Event) {
	try {
		const values = await onFiltersSubmitted(event);
		await keyStore.retrieveKeys(values!);
	} catch (error) {
		toast.add({
			title: `${error}`,
			color: "error",
		});
	}
}

keyStore.retrieveKeys(form.values).catch((error) =>
	toast.add({
		title: `${error}`,
		color: "error",
	}),
);
</script>

<template>
	<Teleport defer to="#header-icon">
		<RouterLink :to="{ name: 'home' }">
			<UButton aria-label="Go home" icon="tabler:arrow-left" size="sm" />
		</RouterLink>
	</Teleport>

	<UPage>
		<UContainer class="flex flex-col gap-4">
			<template v-if="isConnected">
				<Teleport defer to="#header-title">
					Server - {{ activeServer!.name }}
				</Teleport>
				<Teleport defer to="#header-title-icon">
					<UPopover
						arrow
						mode="hover"
						:content="{
							side: 'right',
						}"
					>
						<UButton
							icon="tabler:info-circle"
							color="info"
							class="rounded-full"
							size="sm"
							variant="subtle"
						/>

						<template #content>
							<div>content</div>
						</template>
					</UPopover>
				</Teleport>

				<p>
					<span>Active Server: </span>
					<strong>
						{{ activeServer!.address }}:{{ activeServer!.port }}
					</strong>
				</p>

				<form
					data-testid="filter-keys-form"
					class="flex flex-col gap-4"
					@submit.prevent="onSubmit"
				>
					<FormField bails name="pattern" v-slot="{ componentField }">
						<FormItem>
							<FormControl>
								<Input
									type="text"
									placeholder="Filter by pattern (e.g. user:*)"
									data-testid="filter-keys-form-pattern-field"
									v-bind="componentField"
								/>
							</FormControl>
							<FormMessage
								data-testid="filter-keys-form-pattern-field-error"
							/>
						</FormItem>
					</FormField>
				</form>

				<div
					class="overflow-auto rounded-md border"
					style="max-height: 400px"
				>
					<Table class="table-fixed">
						<colgroup>
							<col width="50%" />
						</colgroup>
						<TableHeader sticky class="bg-muted shadow">
							<TableRow>
								<TableHead class="text-center"> Key </TableHead>
								<TableHead class="text-center">
									Type
								</TableHead>
								<TableHead class="text-center"> TTL </TableHead>
								<!-- <TableHead class="text-center">
								Memory Usage
							</TableHead> -->
							</TableRow>
						</TableHeader>
						<TableBody>
							<template
								v-for="key in keys"
								:key="`keys-key-${key.key}`"
							>
								<TableRow>
									<TableCell>
										<p
											class="break-all truncate hover:line-clamp-2"
											:title="key.key"
										>
											{{ key.key }}
										</p>
									</TableCell>
									<TableCell class="text-center">
										<p>{{ key.key_type }}</p>
									</TableCell>
									<TableCell class="text-center">
										<p>{{ key.ttl }}</p>
									</TableCell>
									<!-- <TableCell class="text-center">
									<p>{{ key.memory_usage }}</p>
								</TableCell> -->
								</TableRow>
							</template>
						</TableBody>
					</Table>
				</div>
			</template>
			<template v-else>
				<Teleport to="#header-title"> Server </Teleport>
				<p>No active server</p>
			</template>
		</UContainer>
	</UPage>
</template>
