<template>
  <admin-layout>
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb pageTitle="Inventario" />
        <div class="flex items-center gap-3">
          <input type="file" accept=".xlsx, .xls, .csv" class="hidden" ref="fileInput" @change="handleImport" />
          <button
            @click="triggerImport"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-theme-xs dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Importar
          </button>
          <router-link
            to="/inventario/nuevo"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Agregar Producto
          </router-link>
        </div>
      </div>



      <div v-if="loading" class="py-12 text-center text-gray-500">Cargando inventario...</div>
      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg">{{ error }}</div>
      
      <div v-else class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="relative max-w-sm">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500 outline-none transition-colors" 
              placeholder="Buscar por código o producto..."
            >
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th class="px-6 py-4 font-medium whitespace-nowrap">Código</th>
                <th class="px-6 py-4 font-medium whitespace-nowrap min-w-[250px]">Producto</th>
                <th class="px-6 py-4 font-medium whitespace-nowrap">Existencia</th>
                <th class="px-6 py-4 font-medium whitespace-nowrap">P. Venta</th>
                <th class="px-6 py-4 font-medium whitespace-nowrap">P. Mayoreo</th>
                <th class="px-6 py-4 font-medium whitespace-nowrap">Departamento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="inventory.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">El inventario está vacío.</td>
              </tr>
              <tr 
                v-for="(item, index) in pagedInventory" 
                :key="item.id"
                class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
              >
                <td class="px-6 py-4 text-xs font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                  {{ item.codigo || '—' }}
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.producto }}
                </td>
                <td 
                  class="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  @click="startEdit(index, item.existencia)"
                  title="Clic para editar"
                >
                  <div v-if="editingIndex === index" @click.stop class="flex items-center gap-2">
                    <input 
                      v-model.number="editValue"
                      v-focus
                      type="number"
                      step="0.01"
                      class="w-24 px-2 py-1 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      @blur="saveModifications(index)"
                      @keyup.enter="saveModifications(index)"
                      @keyup.esc="cancelEdit"
                      :disabled="savingEdit"
                    />
                    <span v-if="savingEdit" class="text-xs text-brand-500 animate-pulse">Guardando…</span>
                  </div>
                  <div v-else class="flex items-center gap-2 text-sm">
                    <span class="font-bold text-gray-900 dark:text-white">{{ Number(item.existencia).toLocaleString('es-MX', {minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</span>
                    <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  {{ item.p_venta ? '$' + Number(item.p_venta).toLocaleString('es-MX', {minimumFractionDigits: 2}) : '—' }}
                </td>
                <td class="px-6 py-4 text-sm">
                  {{ item.p_mayoreo ? '$' + Number(item.p_mayoreo).toLocaleString('es-MX', {minimumFractionDigits: 2}) : '—' }}
                </td>
                <td class="px-6 py-4 text-sm">
                  {{ item.departamento || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <span class="text-xs text-gray-500 whitespace-nowrap">Mostrando {{ (currentPage-1)*PAGE_SIZE+1 }}–{{ Math.min(currentPage*PAGE_SIZE, filteredInventory.length) }} de {{ filteredInventory.length }}</span>
          <div class="flex items-center gap-2">
            <button @click="currentPage--" :disabled="currentPage===1" class="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-900 shadow-sm flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Anterior
            </button>
            <span class="text-xs text-gray-700 dark:text-gray-300 font-medium px-2 whitespace-nowrap">Pág. {{ currentPage }} de {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage===totalPages" class="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-900 shadow-sm flex items-center gap-1">
              Siguiente
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Notification Modal -->
      <Teleport to="body">
        <div v-if="notificationModal.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all">
            <div class="flex items-center gap-3 mb-4">
              <div v-if="notificationModal.type === 'success'" class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div v-else-if="notificationModal.type === 'error'" class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ notificationModal.title }}</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line mb-6">{{ notificationModal.message }}</p>
            <button @click="notificationModal.show = false" class="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors">Aceptar</button>
          </div>
        </div>
      </Teleport>

      <!-- Confirm Modal -->
      <Teleport to="body">
        <div v-if="confirmModal.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 cursor-pointer">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ confirmModal.title }}</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line mb-6">{{ confirmModal.message }}</p>
            <div class="flex gap-3">
              <button @click="confirmModal.onCancel" class="flex-1 py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors">Cancelar</button>
              <button @click="confirmModal.onConfirm" class="flex-1 py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      </Teleport>

    </div>
  </admin-layout>
</template>



<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const MX_TZ = 'America/Mexico_City'

const vFocus = { mounted: (el: HTMLElement) => el.focus() }

// Custom Modal State
const notificationModal = ref<{ show: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ show: false, title: '', message: '', type: 'info' })
const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
  notificationModal.value = { show: true, title, message, type }
}

const confirmModal = ref<{ show: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }>({ show: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} })
const showConfirm = (title: string, message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmModal.value = {
      show: true, title, message,
      onConfirm: () => {
        confirmModal.value.show = false
        resolve(true)
      },
      onCancel: () => {
        confirmModal.value.show = false
        resolve(false)
      }
    }
  })
}

// Helpers
const fmtDate = (val: string) => {
  if (!val) return '—'
  const [y, m, d] = val.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}
const fmtDateTime = (iso: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    timeZone: MX_TZ, day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

// State
const inventory = ref<any[]>([])
const searchQuery = ref('')
const loading = ref(true)
const error = ref('')
const PAGE_SIZE = 10
const currentPage = ref(1)

const filteredInventory = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return inventory.value
  
  return inventory.value.filter(item => {
    const codeMatch = item.codigo && String(item.codigo).toLowerCase().includes(q)
    const nameMatch = item.producto && String(item.producto).toLowerCase().includes(q)
    return codeMatch || nameMatch
  })
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredInventory.value.length / PAGE_SIZE)))
const pagedInventory = computed(() => filteredInventory.value.slice((currentPage.value-1)*PAGE_SIZE, currentPage.value*PAGE_SIZE))

const fetchInventory = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/inventario`)
    if (!res.ok) throw new Error()
    inventory.value = await res.json()
  } catch {
    error.value = 'No se pudo cargar el inventario'
  } finally {
    loading.value = false
  }
}

onMounted(fetchInventory)

// ── Import logic ────────────────────────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)

const triggerImport = () => {
  fileInput.value?.click()
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)

    loading.value = true
    error.value = ''
    
    const res = await fetch(`${API}/api/inventario/import`, {
      method: 'POST',
      body: formData
    })
    
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Error al importar')
    }
    
    const result = await res.json()
    showNotification('Importación exitosa', `${result.insertedCount} productos nuevos creados.\n${result.updatedCount} productos actualizados.`, 'success')
    
    await fetchInventory() // Refresh the local data
  } catch (err: any) {
    showNotification('Fallo en importación', err.message, 'error')
    error.value = `Fallo en importación: ${err.message}`
  } finally {
    target.value = ''
    loading.value = false
  }
}


// Edit logic
const editingIndex = ref<number | null>(null)
const editValue = ref<number>(0)
const savingEdit = ref(false)

const startEdit = (index: number, currentStock: string | number) => {
  if (savingEdit.value) return
  editingIndex.value = index
  editValue.value = Number(currentStock)
}

const cancelEdit = () => {
  editingIndex.value = null
}

const saveModifications = async (index: number) => {
  if (editingIndex.value === null || savingEdit.value) return // Already saved/cancelled
  
  const item = inventory.value[index]
  const originalStock = Number(item.stock)
  const newStock = editValue.value
  
  if (originalStock === newStock) {
    editingIndex.value = null
    return
  }

  // Using timeout wrapper because of the previous UI blur issue, though modal relies on promises now
  setTimeout(async () => {
    const isConfirmed = await showConfirm('Modificar Existencia', `¿Confirmar cambio manual de existencia para "${item.producto}" de ${originalStock} a ${newStock}?`)
    if (!isConfirmed) {
      editingIndex.value = null
      return
    }

    savingEdit.value = true
    try {
      const res = await fetch(`${API}/api/inventario/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existencia: newStock })
      })
      if (!res.ok) throw new Error('Failed to update')
      
      // Update local state without full refetch
      const updated = await res.json()
      inventory.value[index].existencia = updated.existencia
    } catch {
      showNotification('Error', 'No se pudo actualizar la existencia en el servidor', 'error')
    } finally {
      savingEdit.value = false
      editingIndex.value = null
    }
  }, 10)
}
</script>
