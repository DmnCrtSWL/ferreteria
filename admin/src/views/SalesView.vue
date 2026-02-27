<template>
  <admin-layout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb pageTitle="Ventas" />
        <router-link
          to="/ventas/nueva"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-full bg-brand-500 hover:bg-brand-600 transition-colors shadow-theme-xs whitespace-nowrap"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nueva Venta
        </router-link>
      </div>

      <!-- ── Filter bar ── -->
      <div class="flex flex-wrap items-end gap-3 p-4 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <!-- Search -->
        <div class="relative flex-1 min-w-[200px]">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por cliente o folio…"
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 transition-all"
          />
        </div>

        <!-- Date mode tabs -->
        <div class="flex rounded-full border border-gray-300 dark:border-gray-700 overflow-hidden text-sm">
          <button
            v-for="m in dateModes" :key="m.value"
            @click="dateMode = m.value"
            :class="dateMode === m.value ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'"
            class="px-4 py-2 transition-colors font-medium"
          >{{ m.label }}</button>
        </div>

        <!-- Rango de fechas -->
        <template v-if="dateMode === 'range'">
          <div class="flex items-center gap-2">
            <input v-model="rangeFrom" type="date" class="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            <span class="text-gray-400 text-sm">a</span>
            <input v-model="rangeTo" type="date" class="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
        </template>

        <!-- Mes completo -->
        <template v-if="dateMode === 'month'">
          <input v-model="selectedMonth" type="month" class="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </template>

        <!-- Limpiar -->
        <button
          v-if="searchQuery || dateMode !== 'all'"
          @click="clearFilters"
          class="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
          title="Limpiar filtros"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          Limpiar
        </button>
      </div>

      <div v-if="loading" class="py-12 text-center text-gray-500">Cargando ventas...</div>
      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg">{{ error }}</div>
      
      <div v-else class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">ID</th>
                <th scope="col" class="px-6 py-4 font-medium">Folio</th>
                <th scope="col" class="px-6 py-4 font-medium">Nombre</th>
                <th scope="col" class="px-6 py-4 font-medium">Forma de Pago</th>
                <th scope="col" class="px-6 py-4 font-medium">Fecha</th>
                <th scope="col" class="px-6 py-4 font-medium">Total</th>
                <th scope="col" class="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredSales.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-gray-400">Sin resultados para los filtros aplicados.</td>
              </tr>
              <tr 
                v-for="sale in pagedSales" 
                :key="sale.id"
                class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  #{{ sale.id }}
                </td>
                <td class="px-6 py-4">{{ sale.folio || '—' }}</td>
                <td class="px-6 py-4">{{ sale.client_name }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    {{ sale.payment_method }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ fmtDate(sale.date) }}</td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${{ Number(sale.total).toFixed(2) }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-3">
                    <button @click="openDetail(sale.id)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver detalle">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button @click="openEdit(sale)" class="text-gray-400 hover:text-blue-500 transition-colors" title="Editar cabecera">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button @click="deleteSale(sale)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar y devolver stock">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <span class="text-xs text-gray-500">Mostrando {{ (currentPage-1)*PAGE_SIZE+1 }}–{{ Math.min(currentPage*PAGE_SIZE, filteredSales.length) }} de {{ filteredSales.length }}</span>
          <div class="flex items-center gap-1">
            <button @click="currentPage--" :disabled="currentPage===1" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">‹</button>
            <button v-for="p in totalPages" :key="p" @click="currentPage=p" :class="p===currentPage ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'" class="px-2.5 py-1 text-xs rounded-lg border transition-colors">{{ p }}</button>
            <button @click="currentPage++" :disabled="currentPage===totalPages" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">›</button>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <div v-if="detailSale" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" @click.self="detailSale = null">
        <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl dark:bg-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
            <h3 class="font-semibold text-gray-900 dark:text-white">Detalle de Venta #{{ detailSale.id }}</h3>
            <button @click="detailSale = null" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div><span class="block text-xs text-gray-500">Cliente</span><span class="font-medium dark:text-white">{{ detailSale.client_name }}</span></div>
              <div><span class="block text-xs text-gray-500">Folio</span><span class="font-medium dark:text-white">{{ detailSale.folio || '—' }}</span></div>
              <div><span class="block text-xs text-gray-500">Fecha</span><span class="font-medium dark:text-white">{{ fmtDate(detailSale.date) }}</span></div>
              <div><span class="block text-xs text-gray-500">Pago</span><span class="font-medium dark:text-white">{{ detailSale.payment_method }}</span></div>
            </div>

            <h4 class="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Productos (Ticket)</h4>
            <div class="border rounded-lg dark:border-gray-700 overflow-hidden">
              <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300">
                  <tr>
                    <th class="px-4 py-2 font-medium">Cant</th>
                    <th class="px-4 py-2 font-medium">Unidad</th>
                    <th class="px-4 py-2 font-medium">Producto</th>
                    <th class="px-4 py-2 font-medium">P. Unit</th>
                    <th class="px-4 py-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                  <tr v-for="item in detailSale.items" :key="item.id" class="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">{{ item.quantity }}</td>
                    <td class="px-4 py-2">{{ item.unit }}</td>
                    <td class="px-4 py-2">{{ item.product_name }}</td>
                    <td class="px-4 py-2">${{ Number(item.price).toFixed(2) }}</td>
                    <td class="px-4 py-2 font-medium text-right text-gray-900 dark:text-white">${{ Number(item.subtotal).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-t dark:border-gray-700 text-right">
                <span class="text-gray-500 font-medium mr-4">Total:</span>
                <span class="text-lg font-bold text-brand-500">${{ Number(detailSale.total).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal (Header Only) -->
      <div v-if="editSale" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" @click.self="editSale = null">
        <div class="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
          <h3 class="mb-5 text-xl font-bold text-gray-900 dark:text-white">Editar Cabecera Venta #{{ editSale.id }}</h3>
          <div v-if="editError" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{{ editError }}</div>
          <div class="space-y-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Folio</label>
              <input v-model="editForm.folio" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
              <input v-model="editForm.client_name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Forma de Pago</label>
              <select v-model="editForm.payment_method" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Crédito">Crédito</option>
              </select>
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input v-model="editForm.date" type="date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
          </div>
          <div class="flex gap-3 pt-6 mt-2">
            <button type="button" @click="editSale = null" class="flex-1 px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancelar</button>
            <button type="button" @click="saveEdit" :disabled="editLoading" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50">
              {{ editLoading ? 'Guardando...' : 'Guardar' }}
            </button>
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

const fmtDate = (val: string) => {
  if (!val) return '—'
  const [y, m, d] = val.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

const sales = ref<any[]>([])
const loading = ref(true)
const error = ref('')

// ── Filters
const searchQuery = ref('')
const dateMode = ref<'today' | 'all' | 'range' | 'month'>('today')
const rangeFrom = ref('')
const rangeTo = ref('')
const selectedMonth = ref(new Date().toISOString().slice(0, 7))

const dateModes = [
  { value: 'today' as const, label: 'Hoy' },
  { value: 'all'   as const, label: 'Todas' },
  { value: 'range' as const, label: 'Rango' },
  { value: 'month' as const, label: 'Mes' },
]

const PAGE_SIZE = 10
const currentPage = ref(1)

const clearFilters = () => {
  searchQuery.value = ''
  dateMode.value = 'today'
  rangeFrom.value = ''
  rangeTo.value = ''
  selectedMonth.value = new Date().toISOString().slice(0, 7)
  currentPage.value = 1
}

const filteredSales = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const q = searchQuery.value.toLowerCase().trim()
  return sales.value.filter(s => {
    if (q && !`${s.client_name} ${s.folio ?? ''}`.toLowerCase().includes(q)) return false
    const sDate = s.date?.split('T')[0] ?? ''
    if (dateMode.value === 'today' && sDate !== today) return false
    if (dateMode.value === 'range') {
      if (rangeFrom.value && sDate < rangeFrom.value) return false
      if (rangeTo.value   && sDate > rangeTo.value)   return false
    }
    if (dateMode.value === 'month' && !sDate.startsWith(selectedMonth.value)) return false
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSales.value.length / PAGE_SIZE)))
const pagedSales = computed(() => filteredSales.value.slice((currentPage.value-1)*PAGE_SIZE, currentPage.value*PAGE_SIZE))

const fetchSales = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/sales`)
    if (!res.ok) throw new Error()
    sales.value = await res.json()
  } catch {
    error.value = 'No se pudieron cargar las ventas'
  } finally {
    loading.value = false
  }
}

onMounted(fetchSales)

// ── DETAIL ────────────────────────────────────────────────────────────────────
const detailSale = ref<any | null>(null)
const openDetail = async (id: number) => {
  try {
    const res = await fetch(`${API}/api/sales/${id}`)
    if (res.ok) detailSale.value = await res.json()
  } catch (err) {
    alert('Error al cargar el detalle de la venta')
  }
}

// ── EDIT (Header Only) ────────────────────────────────────────────────────────
const editSale = ref<any | null>(null)
const editForm = ref({ folio: '', client_name: '', payment_method: '', date: '' })
const editLoading = ref(false)
const editError = ref('')

const openEdit = (sale: any) => {
  editSale.value = sale
  editForm.value = { 
    folio: sale.folio || '', 
    client_name: sale.client_name, 
    payment_method: sale.payment_method, 
    date: sale.date?.split('T')[0] || ''
  }
  editError.value = ''
}

const saveEdit = async () => {
  editLoading.value = true
  editError.value = ''
  try {
    const res = await fetch(`${API}/api/sales/${editSale.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    })
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al guardar')
    }
    
    await fetchSales()
    editSale.value = null
  } catch (err: any) {
    editError.value = err.message
  } finally {
    editLoading.value = false
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
const deleteSale = async (sale: any) => {
  const confirm = window.confirm(
    `¿Estás seguro de eliminar la venta #${sale.id} de $${Number(sale.total).toFixed(2)}?\n\n¡Los productos de esta venta regresarán automáticamente al inventario!`
  )
  if (!confirm) return

  try {
    const res = await fetch(`${API}/api/sales/${sale.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al eliminar')
    }
    await fetchSales()
  } catch (err: any) {
    alert(err.message)
  }
}
</script>
