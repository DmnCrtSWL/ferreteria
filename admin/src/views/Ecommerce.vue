<template>
  <admin-layout>
    <div class="flex flex-col items-center justify-center p-12 mt-10 space-y-4 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
      <div class="flex items-center justify-center w-20 h-20 bg-brand-50 text-brand-500 rounded-full dark:bg-brand-500/10">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white/90">Sección en Desarrollo</h2>
      <p class="max-w-md text-center text-gray-500 dark:text-gray-400">
        Estamos construyendo el panel de métricas. Pronto podrás ver todas las estadísticas de tu ferretería aquí.
      </p>
    </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from '../components/layout/AdminLayout.vue'
</script>
