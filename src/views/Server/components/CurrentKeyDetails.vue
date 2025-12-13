<script setup lang="ts">
import { ref } from "vue";

const isEditing = ref(false);
const newKeyContent = ref<string>("");

const props = defineProps<{
	currentKey?: TCurrentKey;
}>();

function onEdit() {
	isEditing.value = true;
	newKeyContent.value = JSON.stringify(props.currentKey?.content);
}

function onCancel() {
	isEditing.value = false;
	newKeyContent.value = "";
}
</script>

<template>
	<template v-if="currentKey">
		<div class="whitespace-pre-wrap break-all overflow-y-auto key-details">
			<div>{{ currentKey.details }}</div>
			<br />

			<UTextarea
				:readonly="!isEditing"
				v-model="newKeyContent"
				@click="onEdit"
			/>
		</div>
	</template>
	<template v-else>
		<div class="text-center text-gray-500 italic">No key selected</div>
	</template>
</template>
