<template>
  <admin-layout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb pageTitle="Compras" />
        <router-link
          to="/compras/nueva"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-full bg-brand-500 hover:bg-brand-600 transition-colors shadow-theme-xs whitespace-nowrap"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          Nueva Compra
        </router-link>
      </div>

      <!-- ── Filter bar ─────────────────────────────────────── -->
      <div class="flex flex-wrap items-end gap-3 p-4 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">

        <!-- Search -->
        <div class="relative flex-1 min-w-[200px]">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por folio o proveedor…"
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 transition-all"
          />
        </div>

        <!-- Date mode tabs -->
        <div class="flex rounded-full border border-gray-300 dark:border-gray-700 overflow-hidden text-sm">
          <button
            v-for="m in dateModes" :key="m.value"
            @click="dateMode = m.value"
            :class="dateMode === m.value
              ? 'bg-brand-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'"
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

        <!-- Clear filters -->
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

      <div v-if="loading" class="py-12 text-center text-gray-400">Cargando compras…</div>
      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg">{{ error }}</div>

      <div v-else class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th class="px-6 py-4 font-medium">ID</th>
                <th class="px-6 py-4 font-medium">Folio</th>
                <th class="px-6 py-4 font-medium">Proveedor</th>
                <th class="px-6 py-4 font-medium">Forma de Pago</th>
                <th class="px-6 py-4 font-medium">Fecha</th>
                <th class="px-6 py-4 font-medium">Total</th>
                <th class="px-6 py-4 font-medium">Estado</th>
                <th class="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredPurchases.length === 0">
                <td colspan="8" class="px-6 py-8 text-center text-gray-400">Sin resultados para los filtros aplicados.</td>
              </tr>
              <tr
                v-for="p in pagedPurchases" :key="p.id"
                class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">#{{ p.id }}</td>
                <td class="px-6 py-4">{{ p.folio }}</td>
                <td class="px-6 py-4">{{ p.provider }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    {{ p.payment_method }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ fmtDate(p.date) }}</td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${{ Number(p.total).toLocaleString('es-MX', {minimumFractionDigits:2}) }}</td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="p.status === 'Desglosado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'"
                  >{{ p.status }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-3">
                    <!-- Desglosar -->
                    <router-link :to="`/compras/${p.id}/desglose`" class="text-gray-400 hover:text-brand-500 transition-colors" title="Desglosar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </router-link>
                    <!-- Ver -->
                    <button @click="openDetail(p)" class="text-gray-400 hover:text-blue-500 transition-colors" title="Ver">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <!-- Editar -->
                    <button @click="openEdit(p)" class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Editar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <!-- Eliminar -->
                    <button @click="deletePurchase(p)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
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
          <span class="text-xs text-gray-500">Mostrando {{ (currentPage-1)*PAGE_SIZE+1 }}–{{ Math.min(currentPage*PAGE_SIZE, filteredPurchases.length) }} de {{ filteredPurchases.length }}</span>
          <div class="flex items-center gap-1">
            <button @click="currentPage--" :disabled="currentPage===1" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">‹</button>
            <button v-for="pg in totalPages" :key="pg" @click="currentPage=pg" :class="pg===currentPage ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'" class="px-2.5 py-1 text-xs rounded-lg border transition-colors">{{ pg }}</button>
            <button @click="currentPage++" :disabled="currentPage===totalPages" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">›</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailPurchase" class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50" @click.self="detailPurchase = null">
      <div class="w-full max-w-md p-6 bg-white rounded-2xl dark:bg-gray-900 shadow-xl">
        <h3 class="mb-4 text-lg font-bold text-gray-800 dark:text-white">Detalle de Compra</h3>
        <dl class="space-y-3 text-sm">
          <div class="flex gap-2"><dt class="w-36 font-medium text-gray-500">ID</dt><dd class="dark:text-white">#{{ detailPurchase.id }}</dd></div>
          <div class="flex gap-2"><dt class="w-36 font-medium text-gray-500">Folio</dt><dd class="dark:text-white">{{ detailPurchase.folio }}</dd></div>
          <div class="flex gap-2"><dt class="w-36 font-medium text-gray-500">Proveedor</dt><dd class="dark:text-white">{{ detailPurchase.provider }}</dd></div>
          <div class="flex gap-2"><dt class="w-36 font-medium text-gray-500">Forma de Pago</dt><dd class="dark:text-white">{{ detailPurchase.payment_method }}</dd></div>
          <div class="flex gap-2"><dt class="w-36 font-medium text-gray-500">Fecha</dt><dd class="dark:text-white">{{ fmtDate(detailPurchase.date) }}</dd></div>
          <div class="flex gap-2"><dt class="w-36 font-medium text-gray-500">Total</dt><dd class="font-bold text-brand-500">${{ Number(detailPurchase.total).toLocaleString('es-MX', {minimumFractionDigits:2}) }}</dd></div>
          <div class="flex gap-2"><dt class="w-36 font-medium text-gray-500">Estado</dt><dd class="dark:text-white">{{ detailPurchase.status }}</dd></div>
          <div class="flex gap-2"><dt class="w-36 font-medium text-gray-500">Registrado</dt><dd class="dark:text-white">{{ fmtDateTime(detailPurchase.created_at) }}</dd></div>
          <div v-if="detailPurchase.edited_at" class="flex gap-2"><dt class="w-36 font-medium text-gray-500">Editado</dt><dd class="dark:text-white">{{ fmtDateTime(detailPurchase.edited_at) }}</dd></div>
        </dl>
        <button @click="detailPurchase = null" class="mt-6 w-full px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Cerrar</button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editPurchase" class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50" @click.self="editPurchase = null">
      <div class="w-full max-w-lg p-6 bg-white rounded-2xl dark:bg-gray-900 shadow-xl">
        <h3 class="mb-4 text-lg font-bold text-gray-800 dark:text-white">Editar Compra</h3>
        <div v-if="editError" class="mb-3 px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg">{{ editError }}</div>
        <form @submit.prevent="saveEdit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Folio</label>
              <input v-model="editForm.folio" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</label>
              <input v-model="editForm.provider" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Forma de Pago</label>
              <select v-model="editForm.payment_method" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option><option>Crédito</option>
              </select>
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input v-model="editForm.date" type="date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Total</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input v-model.number="editForm.total" type="number" step="0.01" required class="w-full py-2 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="editPurchase = null" class="flex-1 px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">Cancelar</button>
            <button type="submit" :disabled="editLoading" class="flex-1 px-4 py-2 text-sm text-white rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60">{{ editLoading ? 'Guardando…' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const MX_TZ = 'America/Mexico_City'

// ── Date helpers (CDMX timezone) ──────────────────────────────────────────────
const fmtDate = (val: string) => {
  if (!val) return '—'
  // DATE columns arrive as 'YYYY-MM-DD'; parse as local noon to avoid UTC-shift
  const [y, m, d] = val.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

const fmtDateTime = (iso: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    timeZone: MX_TZ,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

// ── List ──────────────────────────────────────────────────────────────────────
const purchases = ref<any[]>([])
const loading = ref(true)
const error = ref('')

// ── Filters ───────────────────────────────────────────────────────────────────
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

const filteredPurchases = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const q = searchQuery.value.toLowerCase().trim()
  return purchases.value.filter(p => {
    if (q && !`${p.folio} ${p.provider}`.toLowerCase().includes(q)) return false
    const pDate = p.date?.split('T')[0] ?? ''
    if (dateMode.value === 'today' && pDate !== today) return false
    if (dateMode.value === 'range') {
      if (rangeFrom.value && pDate < rangeFrom.value) return false
      if (rangeTo.value   && pDate > rangeTo.value)   return false
    }
    if (dateMode.value === 'month' && !pDate.startsWith(selectedMonth.value)) return false
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPurchases.value.length / PAGE_SIZE)))
const pagedPurchases = computed(() => filteredPurchases.value.slice((currentPage.value-1)*PAGE_SIZE, currentPage.value*PAGE_SIZE))


const fetchPurchases = async () => {
  loading.value = true; error.value = ''
  try {
    const res = await fetch(`${API}/api/purchases`)
    if (!res.ok) throw new Error()
    purchases.value = await res.json()
  } catch { error.value = 'No se pudieron cargar las compras' }
  finally { loading.value = false }
}

onMounted(fetchPurchases)

// ── Detail ────────────────────────────────────────────────────────────────────
const detailPurchase = ref<any | null>(null)
const openDetail = (p: any) => { detailPurchase.value = p }

// ── Edit ──────────────────────────────────────────────────────────────────────
const editPurchase = ref<any | null>(null)
const editForm = ref({ folio: '', provider: '', payment_method: 'Efectivo', date: '', total: 0 })
const editLoading = ref(false)
const editError = ref('')

const openEdit = (p: any) => {
  editPurchase.value = p
  editForm.value = {
    folio: p.folio, provider: p.provider,
    payment_method: p.payment_method,
    date: p.date?.split('T')[0] ?? '',
    total: Number(p.total)
  }
  editError.value = ''
}

const saveEdit = async () => {
  editLoading.value = true; editError.value = ''
  try {
    const res = await fetch(`${API}/api/purchases/${editPurchase.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    })
    if (!res.ok) { editError.value = (await res.json()).error || 'Error al actualizar'; return }
    editPurchase.value = null
    await fetchPurchases()
  } catch { editError.value = 'No se pudo conectar al servidor' }
  finally { editLoading.value = false }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deletePurchase = async (p: any) => {
  if (!confirm(`¿Eliminar la compra ${p.folio}?`)) return
  try {
    await fetch(`${API}/api/purchases/${p.id}`, { method: 'DELETE' })
    await fetchPurchases()
  } catch { alert('No se pudo eliminar la compra') }
}
</script>
