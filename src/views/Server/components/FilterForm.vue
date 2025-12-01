<script setup lang="ts">
import {
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";

defineEmits<{
	"submit:filters": [event: Event];
}>();
</script>

<template>
	<form
		data-testid="filter-keys-form"
		class="flex flex-col gap-4"
		@submit.prevent="$emit('submit:filters', $event)"
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
</template>
