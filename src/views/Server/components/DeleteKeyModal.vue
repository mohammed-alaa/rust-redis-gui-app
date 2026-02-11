<script setup lang="ts">
const emits = defineEmits<{
	"delete:confirm": [];
	"delete:cancel": [];
}>();
const isModalOpen = defineModel<boolean>({
	type: Boolean,
	required: true,
	set: (value) => {
		if (true === value) {
			emits("delete:cancel");
		}
		return value;
	},
});

defineProps<{
	targetKey: TKey["key"] | null;
}>();
</script>

<template>
	<UModal title="Delete Key" v-model:open="isModalOpen">
		<template #description>
			<p class="sr-only" />
		</template>

		<template #body>
			<p id="delete-key-modal-body">
				Are you sure you want to delete the key?
				<br />
			</p>
			<p class="font-bold break-all">{{ targetKey }}</p>
			<p class="text-error">
				<b>Warning:</b>
				<span>This action cannot be undone.</span>
			</p>
		</template>
		<template #footer="{ close }">
			<UButton variant="outline" @click="close"> Cancel </UButton>
			<UButton color="error" @click="$emit('delete:confirm')">
				Delete
			</UButton>
		</template>
	</UModal>
</template>
