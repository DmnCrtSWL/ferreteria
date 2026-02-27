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
        <!-- ── Summary header cards ── -->
        <div class="grid grid-cols-3 gap-4">
          <!-- Egresos total -->
          <div class="relative overflow-hidden p-5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl text-white shadow-lg">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-rose-100">Total Egresos</p>
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <!-- Arrow down / spending icon -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                </svg>
              </div>
            </div>
            <p class="text-2xl font-bold">{{ fmt(totals.egresos) }}</p>
            <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"/>
          </div>

          <!-- Ingresos total -->
          <div class="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-emerald-100">Total Ingresos</p>
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <!-- Arrow up / income icon -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                </svg>
              </div>
            </div>
            <p class="text-2xl font-bold">{{ fmt(totals.ingresos) }}</p>
            <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"/>
          </div>

          <!-- Balance total -->
          <div class="relative overflow-hidden p-5 rounded-2xl text-white shadow-lg"
            :class="totals.balance >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium opacity-80">Balance Total</p>
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
                </svg>
              </div>
            </div>
            <p class="text-2xl font-bold">{{ fmt(totals.balance) }}</p>
            <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"/>
          </div>
        </div>

        <!-- ── 3-column breakdown ── -->
        <div class="grid grid-cols-3 gap-4">

          <!-- ── COLUMN 1: EGRESOS ── -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-rose-50 dark:bg-rose-900/20">
              <div class="w-9 h-9 bg-rose-100 dark:bg-rose-900/40 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-800 dark:text-white">Egresos</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Compras por forma de pago</p>
              </div>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="row in rows" :key="'e-'+row.method" class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="methodStyle(row.method).bg">
                    <component :is="methodStyle(row.method).iconComp" class="w-4 h-4" :class="methodStyle(row.method).icon" />
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ row.method }}</span>
                </div>
                <span class="text-sm font-semibold" :class="row.egresos > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'">
                  {{ fmt(row.egresos) }}
                </span>
              </div>
            </div>
            <!-- Subtotal -->
            <div class="flex items-center justify-between px-5 py-3 bg-rose-50 dark:bg-rose-900/20 border-t border-rose-100 dark:border-rose-900/30">
              <span class="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Total</span>
              <span class="text-sm font-bold text-rose-700 dark:text-rose-300">{{ fmt(totals.egresos) }}</span>
            </div>
          </div>

          <!-- ── COLUMN 2: INGRESOS ── -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-emerald-50 dark:bg-emerald-900/20">
              <div class="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-800 dark:text-white">Ingresos</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Ventas por forma de pago</p>
              </div>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="row in rows" :key="'i-'+row.method" class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="methodStyle(row.method).bg">
                    <component :is="methodStyle(row.method).iconComp" class="w-4 h-4" :class="methodStyle(row.method).icon" />
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ row.method }}</span>
                </div>
                <span class="text-sm font-semibold" :class="row.ingresos > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'">
                  {{ fmt(row.ingresos) }}
                </span>
              </div>
            </div>
            <!-- Subtotal -->
            <div class="flex items-center justify-between px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-900/30">
              <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Total</span>
              <span class="text-sm font-bold text-emerald-700 dark:text-emerald-300">{{ fmt(totals.ingresos) }}</span>
            </div>
          </div>

          <!-- ── COLUMN 3: BALANCE ── -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
              <div class="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-800 dark:text-white">Balance</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Ingresos − Egresos</p>
              </div>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="row in rows" :key="'b-'+row.method" class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="methodStyle(row.method).bg">
                    <component :is="methodStyle(row.method).iconComp" class="w-4 h-4" :class="methodStyle(row.method).icon" />
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ row.method }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <!-- Trend icon -->
                  <svg v-if="row.balance > 0" class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
                  </svg>
                  <svg v-else-if="row.balance < 0" class="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                  </svg>
                  <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14"/>
                  </svg>
                  <span class="text-sm font-semibold"
                    :class="row.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : row.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'">
                    {{ fmt(row.balance) }}
                  </span>
                </div>
              </div>
            </div>
            <!-- Subtotal -->
            <div class="flex items-center justify-between px-5 py-3 border-t"
              :class="totals.balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30'">
              <span class="text-xs font-semibold uppercase tracking-wide"
                :class="totals.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'">Total</span>
              <div class="flex items-center gap-1.5">
                <svg v-if="totals.balance > 0" class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
                </svg>
                <svg v-else-if="totals.balance < 0" class="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
                <span class="text-sm font-bold"
                  :class="totals.balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-rose-700 dark:text-rose-300'">
                  {{ fmt(totals.balance) }}
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- ── Detailed table (all 3 in one) ── -->
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white">Resumen por Forma de Pago</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th class="px-6 py-3 font-medium">Forma de Pago</th>
                  <th class="px-6 py-3 font-medium text-right text-rose-600 dark:text-rose-400">Egresos</th>
                  <th class="px-6 py-3 font-medium text-right text-emerald-600 dark:text-emerald-400">Ingresos</th>
                  <th class="px-6 py-3 font-medium text-right text-blue-600 dark:text-blue-400">Balance</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="row in rows" :key="'t-'+row.method" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-lg flex items-center justify-center" :class="methodStyle(row.method).bg">
                        <component :is="methodStyle(row.method).iconComp" class="w-3.5 h-3.5" :class="methodStyle(row.method).icon" />
                      </div>
                      <span class="font-medium text-gray-700 dark:text-gray-200">{{ row.method }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-3 text-right font-medium" :class="row.egresos > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'">{{ fmt(row.egresos) }}</td>
                  <td class="px-6 py-3 text-right font-medium" :class="row.ingresos > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'">{{ fmt(row.ingresos) }}</td>
                  <td class="px-6 py-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <svg v-if="row.balance > 0" class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/></svg>
                      <svg v-else-if="row.balance < 0" class="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
                      <svg v-else class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h14"/></svg>
                      <span class="font-semibold" :class="row.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : row.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'">{{ fmt(row.balance) }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-50 dark:bg-gray-800 font-bold text-sm border-t-2 border-gray-200 dark:border-gray-700">
                  <td class="px-6 py-3 text-gray-700 dark:text-gray-200">Total General</td>
                  <td class="px-6 py-3 text-right text-rose-700 dark:text-rose-300">{{ fmt(totals.egresos) }}</td>
                  <td class="px-6 py-3 text-right text-emerald-700 dark:text-emerald-300">{{ fmt(totals.ingresos) }}</td>
                  <td class="px-6 py-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <svg v-if="totals.balance > 0" class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/></svg>
                      <svg v-else-if="totals.balance < 0" class="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
                      <span :class="totals.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'">{{ fmt(totals.balance) }}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
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
  '$' + Math.abs(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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
interface ReportRow { method: string; egresos: number; ingresos: number; balance: number }

const rows = ref<ReportRow[]>([])
const totals = ref<ReportRow>({ method: 'Total', egresos: 0, ingresos: 0, balance: 0 })
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
    const data = await res.json()
    rows.value = data.rows
    totals.value = data.totals
  } catch {
    error.value = 'No se pudo cargar el reporte. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>
