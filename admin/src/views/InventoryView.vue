<template>
  <admin-layout>
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb pageTitle="Inventario" />
        <button
          @click="printInventory"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-theme-xs dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Imprimir
        </button>
      </div>

      <!-- ── PRINT AREA (invisible on screen, visible when printing) ── -->
      <div id="print-area" style="display:none">
        <div class="print-header">
          <span class="print-title">Inventario</span>
          <span class="print-date">{{ printDate }}</span>
        </div>
        <div class="print-columns">
          <!-- Column 1: first half -->
          <table class="print-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Existencias</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in leftColumn" :key="item.id">
                <td>{{ item.product_name }}</td>
                <td>{{ Number(item.stock).toLocaleString('es-MX', {minimumFractionDigits:0, maximumFractionDigits:2}) }} {{ item.unit }}</td>
              </tr>
            </tbody>
          </table>
          <!-- Column 2: second half -->
          <table class="print-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Existencias</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rightColumn" :key="item.id">
                <td>{{ item.product_name }}</td>
                <td>{{ Number(item.stock).toLocaleString('es-MX', {minimumFractionDigits:0, maximumFractionDigits:2}) }} {{ item.unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="loading" class="py-12 text-center text-gray-500">Cargando inventario…</div>
      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg">{{ error }}</div>
      
      <div v-else class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th class="px-6 py-4 font-medium">Producto</th>
                <th class="px-6 py-4 font-medium">Existencia (Unidad)</th>
                <th class="px-6 py-4 font-medium">Última compra</th>
                <th class="px-6 py-4 font-medium">Última edición manual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="inventory.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-400">El inventario está vacío.</td>
              </tr>
              <tr 
                v-for="(item, index) in pagedInventory" 
                :key="item.id"
                class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
              >
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ item.product_name }}
                </td>
                <td 
                  class="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  @click="startEdit(index, item.stock)"
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
                  <div v-else class="flex items-center gap-2">
                    <span class="font-bold text-gray-900 dark:text-white">{{ Number(item.stock).toLocaleString('es-MX', {minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ item.unit }}</span>
                    <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </div>
                </td>
                <td class="px-6 py-4">{{ fmtDate(item.last_purchase_date) }}</td>
                <td class="px-6 py-4">{{ fmtDateTime(item.edited_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <span class="text-xs text-gray-500">Mostrando {{ (currentPage-1)*PAGE_SIZE+1 }}–{{ Math.min(currentPage*PAGE_SIZE, inventory.length) }} de {{ inventory.length }}</span>
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

<style>
/* ── On screen: hide print area ── */
#print-area { display: none !important; }

/* ── When printing ── */
@media print {
  /* hide everything except print area */
  body > * { display: none !important; }
  #print-area { display: block !important; }

  /* also handle the Vue app root hierarchy */
  body, #app { display: block !important; background: white !important; }
  #app > * { display: none !important; }
  #print-area { display: block !important; }

  /* Page setup */
  @page { size: letter portrait; margin: 15mm 12mm; }

  /* Header row */
  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
    border-bottom: 1.5px solid #000;
    padding-bottom: 6px;
  }
  .print-title  { font-size: 16pt; font-weight: 700; font-family: sans-serif; }
  .print-date   { font-size: 10pt; font-family: sans-serif; color: #333; }

  /* Two-column layout */
  .print-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* Tables */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-family: sans-serif;
    font-size: 8.5pt;
  }
  .print-table th {
    text-align: left;
    border-bottom: 1px solid #555;
    padding: 3px 4px;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .print-table td {
    padding: 2.5px 4px;
    border-bottom: 0.5px solid #e0e0e0;
    vertical-align: top;
  }
  .print-table tr:last-child td { border-bottom: none; }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const MX_TZ = 'America/Mexico_City'

const vFocus = { mounted: (el: HTMLElement) => el.focus() }

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
const loading = ref(true)
const error = ref('')
const PAGE_SIZE = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(inventory.value.length / PAGE_SIZE)))
const pagedInventory = computed(() => inventory.value.slice((currentPage.value-1)*PAGE_SIZE, currentPage.value*PAGE_SIZE))

const fetchInventory = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/inventory`)
    if (!res.ok) throw new Error()
    inventory.value = await res.json()
  } catch {
    error.value = 'No se pudo cargar el inventario'
  } finally {
    loading.value = false
  }
}

onMounted(fetchInventory)

// ── Print logic ────────────────────────────────────────────────────────────
const printDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

const half = computed(() => Math.ceil(inventory.value.length / 2))
const leftColumn  = computed(() => inventory.value.slice(0, half.value))
const rightColumn = computed(() => inventory.value.slice(half.value))

const printInventory = () => {
  const date = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const mid = Math.ceil(inventory.value.length / 2)
  const left  = inventory.value.slice(0, mid)
  const right = inventory.value.slice(mid)

  const rows = (items: any[]) => items.map(i =>
    `<tr>
      <td>${i.product_name}</td>
      <td>${Number(i.stock).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${i.unit}</td>
    </tr>`
  ).join('')

  const table = (items: any[]) => `
    <table>
      <thead><tr><th>Producto</th><th>Existencias</th></tr></thead>
      <tbody>${rows(items)}</tbody>
    </table>`

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Inventario</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: sans-serif; font-size: 9pt; background: white; color: #000; }
    @page { size: letter portrait; margin: 15mm 12mm; }
    header {
      display: flex; justify-content: space-between; align-items: baseline;
      border-bottom: 1.5px solid #000; padding-bottom: 5px; margin-bottom: 10px;
    }
    header h1 { font-size: 15pt; font-weight: 700; }
    header span { font-size: 9pt; }
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 7.5pt; text-transform: uppercase;
      letter-spacing: 0.04em; border-bottom: 1px solid #444; padding: 2px 4px;
    }
    td { padding: 2.5px 4px; border-bottom: 0.5px solid #ddd; font-size: 8.5pt; }
    tr:last-child td { border-bottom: none; }
  </style>
</head>
<body>
  <header>
    <h1>Inventario</h1>
    <span>${date}</span>
  </header>
  <div class="columns">
    ${table(left)}
    ${table(right)}
  </div>
  <script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (win) { win.document.write(html); win.document.close() }
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

  // Use a small timeout to let the blur resolve if clicking elsewhere, avoiding UI freeze before confirm
  setTimeout(async () => {
    const isConfirmed = window.confirm(`¿Confirmar cambio manual de existencia para "${item.product_name}" de ${originalStock} a ${newStock}?`)
    if (!isConfirmed) {
      editingIndex.value = null
      return
    }

    savingEdit.value = true
    try {
      const res = await fetch(`${API}/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      })
      if (!res.ok) throw new Error('Failed to update')
      
      // Update local state without full refetch
      const updated = await res.json()
      inventory.value[index].stock = updated.stock
      inventory.value[index].edited_at = new Date().toISOString() // Local approximation until refresh
    } catch {
      alert('Error al actualizar la existencia en el servidor')
    } finally {
      savingEdit.value = false
      editingIndex.value = null
    }
  }, 10)
}
</script>
