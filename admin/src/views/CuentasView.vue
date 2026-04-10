<template>
  <admin-layout>
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb pageTitle="Cuentas" />
      </div>

      <div v-if="loading" class="py-12 text-center text-gray-500">Cargando cuentas...</div>
      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg">{{ error }}</div>
      
      <div v-else class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">ID</th>
                <th scope="col" class="px-6 py-4 font-medium">Cliente</th>
                <th scope="col" class="px-6 py-4 font-medium">Última Compra</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Cuenta Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cuentas.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-400">No hay cuentas registradas.</td>
              </tr>
              <tr 
                v-for="cuenta in cuentas" 
                :key="cuenta.id"
                @click="goToDetail(cuenta.id)"
                class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  #{{ cuenta.id }}
                </td>
                <td class="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">{{ cuenta.cliente }}</td>
                <td class="px-6 py-4">{{ fmtDate(cuenta.ultima_compra) }}</td>
                <td class="px-6 py-4 font-bold text-gray-900 dark:text-white text-right">${{ Number(cuenta.cuenta_total).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const router = useRouter()
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const cuentas = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const fmtDate = (val: string) => {
  if (!val) return '—'
  const date = new Date(val)
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const fetchCuentas = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/cuentas`)
    if (!res.ok) throw new Error('Error al cargar cuentas')
    cuentas.value = await res.json()
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchCuentas)

const goToDetail = (id: number) => {
  router.push(`/cuentas/${id}`)
}
</script>
