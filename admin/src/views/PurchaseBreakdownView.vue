<template>
  <admin-layout>
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb :pageTitle="`Desglose de Compra #${purchaseId}`" />
        <router-link
          to="/compras"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-theme-xs dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Volver a Compras
        </router-link>
      </div>

      <div v-if="loadingHeader" class="py-12 text-center text-gray-400">Cargando compra…</div>
      <div v-else-if="errorHeader" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg">{{ errorHeader }}</div>

      <template v-else>
        <!-- 1. Header Card -->
        <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Proveedor</p>
              <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{{ currentPurchase.provider }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Folio</p>
              <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{{ currentPurchase.folio }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Forma de Pago</p>
              <p class="mt-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {{ currentPurchase.payment_method }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Compra</p>
              <p class="mt-1 text-2xl font-bold text-brand-500">${{ Number(currentPurchase.total).toLocaleString('es-MX', {minimumFractionDigits:2}) }}</p>
            </div>
          </div>
        </div>

        <!-- 2. Form Card for Adding Products -->
        <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
          <h3 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Añadir Producto</h3>
          
          <form @submit.prevent="addProduct" class="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div class="flex-1">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Producto</label>
              <input v-model="newProduct.name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" placeholder="Nombre del producto" />
            </div>
            
            <div class="w-full lg:w-24">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">UTM</label>
              <select v-model="newProduct.unit" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none">
                <option>Pza</option><option>Kg</option><option>Caja</option><option>Mts</option>
              </select>
            </div>

            <div class="w-full lg:w-24">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
              <input v-model.number="newProduct.quantity" type="number" min="0.01" step="0.01" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" />
            </div>

            <div class="w-full lg:w-32">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Precio</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input v-model.number="newProduct.price" type="number" min="0" step="0.01" required class="w-full py-2 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" />
              </div>
            </div>

            <div class="w-full lg:w-32">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Descuento</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input v-model.number="newProduct.discount" type="number" min="0" step="0.01" class="w-full py-2 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" />
              </div>
            </div>

            <div class="w-full lg:w-32">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal</label>
              <div class="py-2 text-lg font-bold text-gray-900 dark:text-white">
                ${{ calculatedSubtotal.toFixed(2) }}
              </div>
            </div>

            <div>
              <button type="submit" class="w-full lg:w-auto p-2.5 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors focus:ring-4 focus:ring-brand-500/30" title="Añadir a la lista">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </form>
        </div>

        <!-- 3. Table Card for Added Products -->
        <div class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Productos en el Ticket</h3>
            <div class="text-sm font-medium" :class="isMatch ? 'text-green-500' : 'text-orange-500'">
              Desglosado: ${{ totalBrokenDown.toFixed(2) }} / ${{ Number(currentPurchase.total).toLocaleString('es-MX',{minimumFractionDigits:2}) }}
            </div>
          </div>
          
          <div v-if="loadingItems" class="p-6 text-center text-gray-400">Cargando desglose…</div>
          <div class="overflow-x-auto" v-else>
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th class="px-6 py-4 font-medium">Est.</th>
                  <th class="px-6 py-4 font-medium">Producto</th>
                  <th class="px-6 py-4 font-medium">Cantidad</th>
                  <th class="px-6 py-4 font-medium">UTM</th>
                  <th class="px-6 py-4 font-medium">Precio</th>
                  <th class="px-6 py-4 font-medium">Desc.</th>
                  <th class="px-6 py-4 font-medium">Subtotal</th>
                  <th class="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="addedProducts.length === 0">
                  <td colspan="8" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Aún no hay productos añadidos.</td>
                </tr>
                <tr v-for="(product, index) in addedProducts" :key="index" class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="px-6 py-4"><div class="w-2 h-2 rounded-full bg-brand-500"></div></td>
                  <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ product.name }}</td>
                  <td class="px-6 py-4">{{ product.quantity }}</td>
                  <td class="px-6 py-4">{{ product.unit }}</td>
                  <td class="px-6 py-4">${{ Number(product.price).toFixed(2) }}</td>
                  <td class="px-6 py-4">${{ Number(product.discount).toFixed(2) }}</td>
                  <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${{ Number(product.subtotal).toFixed(2) }}</td>
                  <td class="px-6 py-4 text-center">
                    <button @click="removeProduct(index)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
                      <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 mt-6">
          <button 
            @click="saveBreakdown"
            :disabled="saving"
            class="px-6 py-3 text-sm font-medium text-white transition-colors rounded-full shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isMatch ? 'bg-brand-500 hover:bg-brand-600' : 'bg-gray-400'"
          >
            {{ saving ? 'Guardando…' : (isMatch ? 'Guardar Desglose Completo' : 'Guardar Progreso (Incompleto)') }}
          </button>
        </div>
      </template>

    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const route = useRoute()
const router = useRouter()
const purchaseId = route.params.id

// ── HEADER STATE ──────────────────────────────────────────────────────────────
const currentPurchase = ref<any>({})
const loadingHeader = ref(true)
const errorHeader = ref('')

const fetchHeader = async () => {
  try {
    const res = await fetch(`${API}/api/purchases/${purchaseId}`)
    if (!res.ok) throw new Error()
    currentPurchase.value = await res.json()
  } catch {
    errorHeader.value = 'No se pudo cargar la información de la compra.'
  } finally {
    loadingHeader.value = false
  }
}

// ── ITEMS STATE ───────────────────────────────────────────────────────────────
const addedProducts = ref<any[]>([])
const loadingItems = ref(true)

const fetchItems = async () => {
  try {
    const res = await fetch(`${API}/api/purchases/${purchaseId}/items`)
    if (res.ok) {
      const data = await res.json()
      // parse numeric strings from DB to numbers
      addedProducts.value = data.map((d: any) => ({
        ...d,
        quantity: Number(d.quantity),
        price: Number(d.price),
        discount: Number(d.discount),
        subtotal: Number(d.subtotal)
      }))
    }
  } catch (e) {
    console.error('Failed to load items', e)
  } finally {
    loadingItems.value = false
  }
}

onMounted(() => {
  fetchHeader()
  fetchItems()
})

// ── FORM LOGIC ────────────────────────────────────────────────────────────────
const getEmptyProduct = () => ({ name: '', unit: 'Pza', quantity: 1, price: 0, discount: 0 })
const newProduct = ref(getEmptyProduct())

const calculatedSubtotal = computed(() => {
  const sub = (newProduct.value.quantity * newProduct.value.price) - newProduct.value.discount
  return Math.max(0, sub)
})

const totalBrokenDown = computed(() => {
  return addedProducts.value.reduce((sum, item) => sum + Number(item.subtotal), 0)
})

const isMatch = computed(() => {
  const target = Number(currentPurchase.value.total || 0)
  return Math.abs(totalBrokenDown.value - target) < 0.01
})

const addProduct = () => {
  if (!newProduct.value.name || newProduct.value.quantity <= 0) return
  addedProducts.value.push({ ...newProduct.value, subtotal: calculatedSubtotal.value })
  newProduct.value = getEmptyProduct()
}

const removeProduct = (index: number) => {
  addedProducts.value.splice(index, 1)
}

// ── SAVE ──────────────────────────────────────────────────────────────────────
const saving = ref(false)

const saveBreakdown = async () => {
  saving.value = true
  const status = isMatch.value ? 'Desglosado' : 'Sin desglosar'
  
  try {
    const res = await fetch(`${API}/api/purchases/${purchaseId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: addedProducts.value, status })
    })
    
    if (!res.ok) {
      alert('Error al guardar el desglose')
      return
    }
    
    router.push('/compras')
  } catch (e) {
    alert('Fallo de conexión al servidor')
  } finally {
    saving.value = false
  }
}
</script>
