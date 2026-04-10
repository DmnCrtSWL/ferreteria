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
            <div class="mt-4 flex gap-2 flex-wrap justify-end">
              <button
                @click="generateEstadoCuenta"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 shadow-theme-xs"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Estado de Cuenta
              </button>
              <button 
                @click="openPaymentModal"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-green-500 hover:bg-green-600 shadow-theme-xs"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Abonar o Pagar
              </button>
            </div>
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

// ─── Canvas-based Estado de Cuenta generator ─────────────────────────────────
const generateEstadoCuenta = () => {
  const W = 720
  const H = 900
  const canvas = document.createElement('canvas')
  canvas.width = W * 2      // 2x for retina
  canvas.height = H * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  const BRAND    = '#1D4ED8'
  const BRAND_LT = '#EFF6FF'
  const GREEN    = '#16A34A'
  const RED      = '#DC2626'
  const GRAY_900 = '#111827'
  const GRAY_500 = '#6B7280'
  const GRAY_200 = '#E5E7EB'
  const WHITE    = '#FFFFFF'

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(0, 0, W, H)

  // ── Top header bar ──────────────────────────────────────────────────────────
  ctx.fillStyle = BRAND
  ctx.fillRect(0, 0, W, 80)

  // Store name
  ctx.fillStyle = WHITE
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText('Ferretería', 36, 36)
  ctx.font = '13px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText('Estado de Cuenta del Cliente', 36, 58)

  // Date top-right
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
  ctx.font = '12px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.textAlign = 'right'
  ctx.fillText(dateStr, W - 36, 44)
  ctx.textAlign = 'left'

  // ── Client info card ────────────────────────────────────────────────────────
  roundRect(ctx, 28, 100, W - 56, 110, 12)
  ctx.fillStyle = WHITE
  ctx.fill()
  ctx.strokeStyle = GRAY_200
  ctx.lineWidth = 1
  ctx.stroke()

  const c = cliente.value
  ctx.fillStyle = GRAY_500
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText('CLIENTE', 50, 128)

  ctx.fillStyle = GRAY_900
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillText(c?.name || '—', 50, 152)

  ctx.fillStyle = GRAY_500
  ctx.font = '13px system-ui, sans-serif'
  const contactParts = []
  if (c?.phone)   contactParts.push('📞 ' + c.phone)
  if (c?.address) contactParts.push('🏠 ' + c.address)
  ctx.fillText(contactParts.join('   ') || 'Sin datos de contacto', 50, 175)

  // ── Balance card ────────────────────────────────────────────────────────────
  const isNeg = cuentaTotal.value < 0
  const balColor  = isNeg ? RED   : GREEN
  const balBg     = isNeg ? '#FEF2F2' : '#F0FDF4'
  const balBorder = isNeg ? '#FECACA' : '#BBF7D0'
  const balLabel  = isNeg ? 'SALDO PENDIENTE' : 'SALDO A FAVOR'
  const balSign   = isNeg ? '' : (cuentaTotal.value > 0 ? '+' : '')
  const balAmt    = `${balSign}$${Math.abs(cuentaTotal.value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  roundRect(ctx, 28, 230, W - 56, 88, 12)
  ctx.fillStyle = balBg
  ctx.fill()
  ctx.strokeStyle = balBorder
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = balColor
  ctx.font = 'bold 11px system-ui, sans-serif'
  ctx.fillText(balLabel, 50, 258)

  ctx.font = 'bold 32px system-ui, sans-serif'
  ctx.fillText(balAmt, 50, 300)

  // ── Movements section ───────────────────────────────────────────────────────
  const last5 = [...movimientos.value].slice(0, 5)

  ctx.fillStyle = GRAY_500
  ctx.font = 'bold 11px system-ui, sans-serif'
  ctx.fillText('ÚLTIMOS MOVIMIENTOS', 28, 352)

  // Table header
  ctx.fillStyle = GRAY_200
  ctx.fillRect(28, 362, W - 56, 32)
  ctx.fillStyle = GRAY_500
  ctx.font = 'bold 11px system-ui, sans-serif'
  ctx.fillText('CONCEPTO', 44, 383)
  ctx.fillText('FORMA DE PAGO', 280, 383)
  ctx.fillText('FECHA', 450, 383)
  ctx.textAlign = 'right'
  ctx.fillText('MONTO', W - 44, 383)
  ctx.textAlign = 'left'

  // Rows
  let rowY = 394
  if (last5.length === 0) {
    ctx.fillStyle = GRAY_500
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText('Sin movimientos registrados.', 44, rowY + 30)
  } else {
    last5.forEach((mov, idx) => {
      const rowH = 44
      // Alternating row bg
      ctx.fillStyle = idx % 2 === 0 ? WHITE : '#F9FAFB'
      ctx.fillRect(28, rowY, W - 56, rowH)

      const label = mov.type === 'abono' ? 'Abono #' + mov.id : 'Venta #' + mov.id
      const dateLabel = fmtDate(mov.date)
      const amtLabel = (mov.type === 'cargo' ? '' : '+') + '$' + Math.abs(mov.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })
      const amtColor = mov.type === 'cargo' ? RED : GREEN

      ctx.fillStyle = GRAY_900
      ctx.font = 'bold 13px system-ui, sans-serif'
      ctx.fillText(label, 44, rowY + 22)

      ctx.fillStyle = GRAY_500
      ctx.font = '12px system-ui, sans-serif'
      ctx.fillText(mov.payment_method || '—', 280, rowY + 22)
      ctx.fillText(dateLabel, 450, rowY + 22)

      ctx.fillStyle = amtColor
      ctx.font = 'bold 13px system-ui, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(amtLabel, W - 44, rowY + 22)
      ctx.textAlign = 'left'

      // Bottom divider
      ctx.strokeStyle = GRAY_200
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(28, rowY + rowH)
      ctx.lineTo(W - 28, rowY + rowH)
      ctx.stroke()

      rowY += rowH
    })
  }

  // ── Disclaimer ──────────────────────────────────────────────────────────────
  const discY = H - 70
  ctx.fillStyle = BRAND_LT
  ctx.fillRect(0, discY, W, H - discY)

  ctx.fillStyle = BRAND
  ctx.font = 'bold 10px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('DOCUMENTO DE CARÁCTER INFORMATIVO', W / 2, discY + 22)
  ctx.fillStyle = GRAY_500
  ctx.font = '10px system-ui, sans-serif'
  ctx.fillText('Este estado de cuenta es una referencia informativa y no constituye un documento legal o fiscal.', W / 2, discY + 40)
  ctx.fillText(`Generado el ${now.toLocaleString('es-MX')}`, W / 2, discY + 57)
  ctx.textAlign = 'left'

  // ── Download ─────────────────────────────────────────────────────────────────
  const link = document.createElement('a')
  const safeName = (c?.name || 'cliente').replace(/\s+/g, '_')
  link.download = `estado_cuenta_${safeName}_${now.toISOString().split('T')[0]}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// Helper: rounded rectangle path
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
// ─────────────────────────────────────────────────────────────────────────────
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
