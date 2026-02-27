<template>
  <div class="mb-4">
    <h2 class="text-lg font-semibold text-gray-800 dark:text-white/90">{{ pageTitle }}</h2>
  </div>
</template>

<script setup lang="ts">
defineProps<{ pageTitle: string }>()
</script>
