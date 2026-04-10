<template>
  <admin-layout>
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb :pageTitle="cliente ? `Perfil: ${cliente.name}` : 'Detalle de Cuenta'" />
        <router-link
          to="/cuentas"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-theme-xs dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver a Cuentas
        </router-link>
      </div>

      <div v-if="loading" class="py-12 text-center text-gray-500">Cargando perfil...</div>
      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg">{{ error }}</div>
      
      <div v-else class="space-y-6">
        <!-- Tarjeta de Perfil -->
        <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-16 h-16 bg-brand-100 dark:bg-brand-500/20 rounded-full text-brand-600 dark:text-brand-400">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ cliente?.name }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 flex gap-4">
                <span v-if="cliente?.phone">📞 {{ cliente.phone }}</span>
                <span v-if="cliente?.address">🏠 {{ cliente.address }}</span>
              </p>
            </div>
          </div>
          <div class="text-right flex flex-col items-end">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Balance de Cuenta</p>
            <p :class="['text-3xl font-bold mt-1', cuentaTotal < 0 ? 'text-red-500' : 'text-green-500']">
              {{ cuentaTotal < 0 ? '-' : (cuentaTotal > 0 ? '+' : '') }}${{ Math.abs(cuentaTotal).toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
            </p>
            <button 
              @click="openPaymentModal"
              class="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-green-500 hover:bg-green-600 shadow-theme-xs"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Abonar o Pagar
            </button>
          </div>
        </div>

        <!-- Tabla de Movimientos -->
        <div class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 class="font-semibold text-gray-900 dark:text-white">Movimientos (Ventas registradas)</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-white dark:bg-gray-900 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th scope="col" class="px-6 py-4 font-medium">Tick. ID</th>
                  <th scope="col" class="px-6 py-4 font-medium">Fecha</th>
                  <th scope="col" class="px-6 py-4 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="movimientos.length === 0">
                  <td colspan="3" class="px-6 py-8 text-center text-gray-400">Este cliente aún no registra movimientos.</td>
                </tr>
                <tr 
                  v-for="mov in movimientos" 
                  :key="mov.type + mov.id"
                  class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white flex flex-col">
                    <span>{{ mov.type === 'abono' ? 'Abono #' + mov.id : 'Venta #' + mov.id }}</span>
                    <span class="text-xs text-gray-400 font-normal">{{ mov.payment_method || '—' }}</span>
                  </td>
                  <td class="px-6 py-4">{{ fmtDate(mov.date) }}</td>
                  <td :class="['px-6 py-4 font-bold text-right', mov.type === 'cargo' ? 'text-red-500' : 'text-green-500']">
                    {{ mov.type === 'cargo' ? '' : '+' }}${{ Math.abs(mov.total).toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <Teleport to="body">
        <div v-if="showPaymentModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registrar Abono</h3>
            
            <div class="space-y-4 mb-6">
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <input v-model.number="paymentAmount" type="number" step="0.01" min="0.01" class="w-full py-2 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <button v-if="cuentaTotal < 0" @click="paymentAmount = Math.abs(cuentaTotal)" class="text-xs text-brand-500 mt-1 hover:underline">Pagar adeudo total (${{ Math.abs(cuentaTotal).toLocaleString('es-MX', {minimumFractionDigits: 2}) }})</button>
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Forma de Pago</label>
                <select v-model="paymentMethod" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            <div class="flex gap-3">
              <button @click="closePaymentModal" class="flex-1 py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors">Cancelar</button>
              <button @click="submitPayment" :disabled="isSubmitting" class="flex-1 py-2.5 px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">
                {{ isSubmitting ? 'Guardando...' : 'Guardar Abono' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const route = useRoute()
const clientId = route.params.id

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const cliente = ref<any>(null)
const movimientos = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const cuentaTotal = computed(() => movimientos.value.reduce((acc, curr) => acc + Number(curr.total), 0))

const fmtDate = (val: string) => {
  if (!val) return '—'
  const date = new Date(val)
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [clienteRes, movimientosRes] = await Promise.all([
      fetch(`${API}/api/clientes/${clientId}`),
      fetch(`${API}/api/cuentas/${clientId}/movimientos`)
    ])

    if (!clienteRes.ok) throw new Error('Error al cargar perfil del cliente')
    
    cliente.value = await clienteRes.json()
    
    if (movimientosRes.ok) {
      movimientos.value = await movimientosRes.json()
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// Payment logic
const showPaymentModal = ref(false)
const paymentAmount = ref<number | null>(null)
const paymentMethod = ref('Efectivo')
const isSubmitting = ref(false)

const openPaymentModal = () => {
  paymentAmount.value = null
  paymentMethod.value = 'Efectivo'
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
}

const submitPayment = async () => {
  if (!paymentAmount.value || paymentAmount.value <= 0) {
    alert("Ingresa un monto válido");
    return;
  }
  isSubmitting.value = true;
  try {
    const res = await fetch(`${API}/api/cuentas/${clientId}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: paymentAmount.value,
        payment_method: paymentMethod.value
      })
    })
    if (!res.ok) throw new Error('Error al guardar el abono')
    closePaymentModal()
    await fetchData() // Refresh data
  } catch (err) {
    alert("Hubo un error al procesar el abono.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>
