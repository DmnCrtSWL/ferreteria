<template>
  <admin-layout>
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <router-link to="/compras" class="flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800 dark:hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </router-link>
        <PageBreadcrumb pageTitle="Nueva Compra" />
      </div>

      <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <h2 class="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">Detalles de la Compra</h2>

        <div v-if="errorMsg" class="mb-4 px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">{{ errorMsg }}</div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Folio<span class="text-error-500">*</span></label>
              <input v-model="form.folio" type="text" placeholder="Ej. F-10293" class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>
            <div class="lg:col-span-2">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor<span class="text-error-500">*</span></label>
              <input v-model="form.provider" type="text" placeholder="Ej. Truper S.A. de C.V." class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Forma de Pago<span class="text-error-500">*</span></label>
              <select v-model="form.payment_method" class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white" required>
                <option value="">Seleccione…</option>
                <option>Efectivo</option>
                <option>Transferencia</option>
                <option>Tarjeta</option>
                <option>Crédito</option>
              </select>
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Fecha<span class="text-error-500">*</span></label>
              <input v-model="form.date" type="date" class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Total<span class="text-error-500">*</span></label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">$</span>
                <input v-model.number="form.total" type="number" step="0.01" placeholder="0.00" class="w-full pl-8 pr-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white" required />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <router-link to="/compras" class="px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancelar
            </router-link>
            <button type="submit" :disabled="loading" class="px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed">
              {{ loading ? 'Guardando…' : 'Guardar Compra' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const router = useRouter()

const form = ref({ folio: '', provider: '', payment_method: '', date: '', total: 0 })
const loading = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  loading.value = true; errorMsg.value = ''
  try {
    const res = await fetch(`${API}/api/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (!res.ok) { errorMsg.value = (await res.json()).error || 'Error al guardar'; return }
    router.push('/compras')
  } catch { errorMsg.value = 'No se pudo conectar con el servidor' }
  finally { loading.value = false }
}
</script>
