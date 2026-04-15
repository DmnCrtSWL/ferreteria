<template>
  <admin-layout>
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb pageTitle="Clientes" />
        <!-- Search bar -->
        <div class="flex items-center gap-3 ml-auto">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
            </span>
            <input
              v-model="clientSearch"
              type="text"
              placeholder="Buscar por nombre o teléfono…"
              class="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 w-64 transition-all"
            />
          </div>
          <router-link
            to="/clientes/nuevo"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-full bg-brand-500 hover:bg-brand-600 transition-colors shadow-theme-xs whitespace-nowrap"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nuevo Cliente
          </router-link>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-12 text-center text-gray-400">Cargando clientes…</div>

      <!-- Error -->
      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">{{ error }}</div>

      <div v-else class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Nombre</th>
                <th scope="col" class="px-6 py-4 font-medium">Folio</th>
                <th scope="col" class="px-6 py-4 font-medium">Teléfono</th>
                <th scope="col" class="px-6 py-4 font-medium">Fecha de Alta</th>
                <th scope="col" class="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredClients.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400">No se encontraron clientes.</td>
              </tr>
              <tr
                v-for="client in pagedClients"
                :key="client.id"
                class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4">
                  <div class="font-semibold text-gray-900 dark:text-white">{{ client.name }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">{{ client.folio }}</div>
                </td>
                <td class="px-6 py-4">{{ client.phone || '—' }}</td>
                <td class="px-6 py-4">{{ formatDate(client.created_at) }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-3">
                    <!-- Ver -->
                    <router-link :to="`/clientes/${client.id}/ver`" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver detalle">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </router-link>
                    <!-- Editar -->
                    <router-link :to="`/clientes/${client.id}/editar`" class="text-gray-400 hover:text-blue-500 transition-colors" title="Editar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </router-link>
                    <!-- Eliminar -->
                    <button @click="deleteClient(client)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <span class="text-xs text-gray-500">Mostrando {{ (currentPage-1)*PAGE_SIZE+1 }}–{{ Math.min(currentPage*PAGE_SIZE, filteredClients.length) }} de {{ filteredClients.length }}</span>
          <div class="flex items-center gap-1">
            <button @click="currentPage--" :disabled="currentPage===1" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">‹</button>
            <button v-for="p in totalPages" :key="p" @click="currentPage=p" :class="p===currentPage ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'" class="px-2.5 py-1 text-xs rounded-lg border transition-colors">{{ p }}</button>
            <button @click="currentPage++" :disabled="currentPage===totalPages" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">›</button>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── LIST ──────────────────────────────────────────────────────────────────────
const clients = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const clientSearch = ref('')
const PAGE_SIZE = 10
const currentPage = ref(1)

const filteredClients = computed(() => {
  const q = clientSearch.value.toLowerCase().trim()
  currentPage.value = 1
  if (!q) return clients.value
  return clients.value.filter(
    c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredClients.value.length / PAGE_SIZE)))
const pagedClients = computed(() => filteredClients.value.slice((currentPage.value-1)*PAGE_SIZE, currentPage.value*PAGE_SIZE))

const fetchClients = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/clientes`)
    if (!res.ok) throw new Error()
    clients.value = await res.json()
  } catch {
    error.value = 'No se pudieron cargar los clientes'
  } finally {
    loading.value = false
  }
}

onMounted(fetchClients)

const formatDate = (iso: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── DELETE ────────────────────────────────────────────────────────────────────
const deleteClient = async (client: any) => {
  if (!confirm(`¿Eliminar al cliente "${client.name}"? Esta acción no se puede deshacer.`)) return
  try {
    const res = await fetch(`${API}/api/clientes/${client.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    await fetchClients()
  } catch {
    alert('No se pudo eliminar el cliente')
  }
}
</script>
