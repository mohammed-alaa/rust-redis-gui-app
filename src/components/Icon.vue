<script setup lang="ts">
import { Icon as Base, type IconProps } from "@iconify/vue";

const props =
	defineProps<Omit<IconProps, "ssr" | "id" | "title" | "mode" | "inline">>();
</script>

<template>
	<Base v-bind="props" />
</template>
