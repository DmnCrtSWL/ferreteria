<template>
  <!-- Logo visible en mobile/header cuando el sidebar está cerrado -->
  <router-link to="/stats" class="flex items-center gap-2 lg:hidden">
    <img src="/logo.png" alt="Ferremania" class="h-9 w-9 object-contain" />
    <span class="text-sm font-bold text-gray-800 dark:text-white">Ferremania</span>
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
