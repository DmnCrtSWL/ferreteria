<template>
  <admin-layout>
    <div class="space-y-6">
      <PageBreadcrumb pageTitle="Reportes" />

      <!-- ── Period filter ── -->
      <div class="flex flex-wrap items-end gap-3 p-4 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">

        <!-- Period tabs -->
        <div class="flex rounded-full border border-gray-300 dark:border-gray-700 overflow-hidden text-sm">
          <button
            v-for="m in periods" :key="m.value"
            @click="setPeriod(m.value)"
            :class="period === m.value ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'"
            class="px-4 py-2 transition-colors font-medium"
          >{{ m.label }}</button>
        </div>

        <!-- Month picker -->
        <template v-if="period === 'month'">
          <input v-model="selectedMonth" type="month"
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </template>

        <!-- Date range -->
        <template v-if="period === 'range'">
          <div class="flex items-center gap-2">
            <input v-model="rangeFrom" type="date"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            <span class="text-gray-400 text-sm">a</span>
            <input v-model="rangeTo" type="date"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
        </template>

        <!-- Refresh -->
        <button @click="fetchReport"
          class="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full bg-brand-500 hover:bg-brand-600 transition-colors shadow-theme-xs">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      <!-- ── Loading / error ── -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="flex flex-col items-center gap-3">
          <svg class="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">Calculando reporte…</p>
        </div>
      </div>

      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-xl">{{ error }}</div>

      <template v-else>
        <!-- ── 2 Column Layout ── -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- ── COLUMN 1: INGRESOS ── -->
          <div class="space-y-6">
            <!-- Metric -->
            <div class="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-medium text-emerald-100">Total Ingresos (Cobranza)</p>
                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold">{{ fmt(reportData.total_ingresos) }}</p>
              <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"/>
            </div>

            <!-- Breakdown Table -->
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
               <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-emerald-50 dark:bg-emerald-900/20">
                  <div class="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-gray-800 dark:text-white">Ingresos por Método</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Pagos completados en cuentas</p>
                  </div>
               </div>
               <div class="divide-y divide-gray-100 dark:divide-gray-800">
                  <div v-for="r in reportData.ingresos" :key="r.method" class="flex items-center justify-between px-5 py-4">
                     <div class="flex items-center gap-3">
                       <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="methodStyle(r.method).bg">
                         <component :is="methodStyle(r.method).iconComp" class="w-4 h-4" :class="methodStyle(r.method).icon" />
                       </div>
                       <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ r.method }}</span>
                     </div>
                     <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ fmt(r.ingresos) }}</span>
                  </div>
                  <div v-if="!reportData.ingresos?.length" class="p-6 text-center text-sm text-gray-500">
                    No hay ingresos registrados en el periodo.
                  </div>
               </div>
            </div>
          </div>

          <!-- ── COLUMN 2: BALANCE / DEUDORES ── -->
          <div class="space-y-6">
            <!-- Metric -->
            <div class="relative overflow-hidden p-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-lg">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-medium text-amber-100">Global Acumulado por Cobrar</p>
                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                   </svg>
                </div>
              </div>
              <p class="text-3xl font-bold">{{ fmt(reportData.total_deuda) }}</p>
              <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"/>
            </div>

            <!-- Breakdown Table -->
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
               <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-amber-50 dark:bg-amber-900/20">
                  <div class="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-gray-800 dark:text-white">Top 5 Deudores</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Cuentas con mayor deuda acumulada</p>
                  </div>
               </div>
               <div class="divide-y divide-gray-100 dark:divide-gray-800">
                  <div v-for="(d, i) in reportData.top_deudores" :key="d.name" class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                     <div class="flex items-center gap-3">
                       <span class="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-center font-bold">{{ i + 1 }}</span>
                       <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ d.name }}</span>
                     </div>
                     <span class="text-sm font-bold text-amber-600 dark:text-amber-400">{{ fmt(d.deuda) }}</span>
                  </div>
                  <div v-if="!reportData.top_deudores?.length" class="p-8 text-center text-sm text-gray-500">
                    Ningún cliente tiene adeudos. 🎉
                  </div>
               </div>
            </div>
          </div>

        </div>
      </template>

    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, defineComponent } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── SVG icon components (inline, avoids external deps) ──────────────────────
const IconCash = defineComponent({
  setup() {
    return () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
        d: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' })
    ])
  }
})

const IconCard = defineComponent({
  setup() {
    return () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
        d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' })
    ])
  }
})

const IconTransfer = defineComponent({
  setup() {
    return () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
        d: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' })
    ])
  }
})

const IconCredit = defineComponent({
  setup() {
    return () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
        d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })
    ])
  }
})

const METHOD_STYLES: Record<string, { bg: string; icon: string; iconComp: any }> = {
  Efectivo: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    icon: 'text-green-600 dark:text-green-400',
    iconComp: IconCash,
  },
  Tarjeta: {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    icon: 'text-purple-600 dark:text-purple-400',
    iconComp: IconCard,
  },
  Transferencia: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    icon: 'text-blue-600 dark:text-blue-400',
    iconComp: IconTransfer,
  },
  Crédito: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    icon: 'text-amber-600 dark:text-amber-400',
    iconComp: IconCredit,
  },
}

const methodStyle = (method: string) =>
  METHOD_STYLES[method] ?? {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-500',
    iconComp: IconCash,
  }

// ── Formatter ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  '$' + (n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ── Period filter ─────────────────────────────────────────────────────────────
const periods = [
  { value: 'today', label: 'Hoy' },
  { value: 'month', label: 'Mes' },
  { value: 'range', label: 'Rango' },
  { value: 'all', label: 'Todo' },
]

const period = ref<'today' | 'month' | 'range' | 'all'>('today')
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const rangeFrom = ref('')
const rangeTo = ref('')

const setPeriod = (val: string) => {
  period.value = val as any
  fetchReport()
}

// ── Data ──────────────────────────────────────────────────────────────────────
const reportData = ref<any>({})
const loading = ref(true)
const error = ref('')

const buildQuery = () => {
  const params = new URLSearchParams({ period: period.value })
  if (period.value === 'month') params.set('month', selectedMonth.value)
  if (period.value === 'range') {
    if (rangeFrom.value) params.set('start', rangeFrom.value)
    if (rangeTo.value) params.set('end', rangeTo.value)
  }
  return params.toString()
}

const fetchReport = async () => {
  loading.value = true; error.value = ''
  try {
    const res = await fetch(`${API}/api/reports/payments?${buildQuery()}`)
    if (!res.ok) throw new Error()
    reportData.value = await res.json()
  } catch {
    error.value = 'No se pudo cargar el reporte. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>
