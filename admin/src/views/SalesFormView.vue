<template>
  <admin-layout>
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb pageTitle="Nueva Venta" />
        <router-link
          to="/ventas"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-theme-xs dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver a Ventas
        </router-link>
      </div>

      <!-- 1. Header Card (Sale Information) -->
      <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <h3 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Datos de la Venta</h3>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <!-- Client Autocomplete -->
          <div ref="clientContainer" class="relative">
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre (Cliente)</label>
            <input
              v-model="clientSearch"
              @focus="showClientDropdown = true"
              @input="onClientInput"
              type="text"
              autocomplete="off"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
              placeholder="Buscar cliente o escribir nombre…"
            />
            <!-- Dropdown -->
            <ul
              v-if="showClientDropdown && filteredClients.length > 0 && clientSearch"
              class="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto dark:bg-gray-800 dark:border-gray-700"
            >
              <li
                v-for="c in filteredClients"
                :key="c.id"
                @mousedown.prevent="selectClient(c)"
                class="px-4 py-2 cursor-pointer hover:bg-brand-50 dark:hover:bg-gray-700 border-b last:border-0 dark:border-gray-700 text-sm"
              >
                <span class="font-medium text-gray-900 dark:text-white">{{ c.name }}</span>
                <span v-if="c.folio" class="ml-2 text-xs text-gray-400">{{ c.folio }}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <!-- 2. Form Card for Adding Products -->
      <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <h3 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Añadir Producto (Inventario)</h3>
        
        <form @submit.prevent="addProduct" class="flex flex-col gap-4 lg:flex-row lg:items-start relative">
          <!-- Autocomplete Dropdown Logic -->
          <div class="flex-1 relative">
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Búsqueda de Producto</label>
            <input 
              v-model="searchQuery"
              @focus="showDropdown = true"
              @input="onSearchInput"
              type="text"
              placeholder="Escribe para buscar..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
            />
            
            <!-- Dropdown Menu -->
            <ul 
              v-if="showDropdown && filteredInventory.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700"
            >
              <li 
                v-for="item in filteredInventory" 
                :key="item.id"
                @mousedown.prevent="selectProduct(item)"
                class="px-4 py-2 cursor-pointer hover:bg-brand-50 dark:hover:bg-gray-700 border-b last:border-0 dark:border-gray-700 text-sm"
              >
                <div class="font-medium text-gray-900 dark:text-white">{{ item.product_name }}</div>
                <div class="text-xs text-gray-500 flex justify-between mt-1">
                  <span>Stock: <strong :class="{'text-red-500': item.stock <= 0}">{{ item.stock }} {{ item.unit }}</strong></span>
                </div>
              </li>
            </ul>
            <ul v-else-if="showDropdown && searchQuery && filteredInventory.length === 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500 dark:bg-gray-800 dark:border-gray-700">
              No hay coincidencias / Sin stock
            </ul>

            <!-- Selected Product Info -->
            <div v-if="newProduct.product" class="mt-2 text-sm text-brand-600 dark:text-brand-400 font-medium flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              Seleccionado: {{ newProduct.product.product_name }} (Max: {{ newProduct.product.stock }})
            </div>
          </div>
          


          <div class="w-full lg:w-24">
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
            <input 
              v-model.number="newProduct.quantity" 
              type="number" 
              min="1" 
              :max="newProduct.product ? newProduct.product.stock : 1"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" 
            />
            <p v-if="newProduct.quantity > (newProduct.product?.stock || 0)" class="text-xs text-red-500 mt-1">Supera stock</p>
          </div>

          <div class="w-full lg:w-32">
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Precio Venta</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input 
                v-model.number="newProduct.price" 
                type="number" 
                min="0" 
                step="0.01" 
                required
                class="w-full py-2 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" 
              />
            </div>
          </div>

          <div class="w-full lg:w-32">
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Descuento</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input 
                v-model.number="newProduct.discount" 
                type="number" 
                min="0" 
                step="0.01" 
                class="w-full py-2 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" 
              />
            </div>
          </div>

          <div class="w-full lg:w-28 flex flex-col pt-1">
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal</label>
            <div class="text-lg font-bold text-gray-900 dark:text-white">
              ${{ calculatedSubtotal.toFixed(2) }}
            </div>
          </div>

          <div class="pt-7">
            <button 
              type="submit"
              class="w-full lg:w-auto p-2.5 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors focus:ring-4 focus:ring-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Añadir al Ticket"
              :disabled="!newProduct.product || newProduct.quantity > newProduct.product.stock || newProduct.quantity <= 0"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>

      <!-- 3. Table Card for Ticket Products -->
      <div class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Ticket de Venta</h3>
          <div class="text-xl font-bold text-brand-500">
            Total: ${{ totalSale.toFixed(2) }}
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Producto</th>
                <th scope="col" class="px-6 py-4 font-medium">Cantidad</th>
                <th scope="col" class="px-6 py-4 font-medium">Precio Unit.</th>
                <th scope="col" class="px-6 py-4 font-medium">Descuento</th>
                <th scope="col" class="px-6 py-4 font-medium">Subtotal</th>
                <th scope="col" class="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="ticketProducts.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Agrega productos al ticket para comenzar la venta.
                </td>
              </tr>
              <tr 
                v-for="(product, index) in ticketProducts" 
                :key="index"
                class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ product.name }}
                </td>
                <td class="px-6 py-4">{{ product.quantity }}</td>
                <td class="px-6 py-4">${{ Number(product.price).toFixed(2) }}</td>
                <td class="px-6 py-4">${{ Number(product.discount).toFixed(2) }}</td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${{ Number(product.subtotal).toFixed(2) }}</td>
                <td class="px-6 py-4 text-center">
                  <button @click="removeProduct(index)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
                    <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div v-if="errorMsg" class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{{ errorMsg }}</div>
      
      <div class="flex justify-end gap-4 mt-6">
        <button 
          @click="saveSale"
          :disabled="ticketProducts.length === 0 || isSaving"
          class="px-8 py-3 text-sm font-medium text-white transition-colors rounded-full shadow-theme-xs bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isSaving">Guardando...</span>
          <span v-else>Guardar Venta</span>
        </button>
      </div>

      <!-- ── Modal: Registrar cliente nuevo ───────────────────────────────── -->
      <div
        v-if="showNewClientModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
      >
        <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">Cliente no registrado</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">¿Deseas registrarlo ahora?</p>
            </div>
            <button @click="skipNewClient" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <!-- Form -->
          <div class="p-6 space-y-4">
            <div v-if="newClientError" class="px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">{{ newClientError }}</div>
            <div>
              <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo <span class="text-red-500">*</span></label>
              <input v-model="newClientForm.name" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
              <input
                v-model="newClientForm.phone"
                type="tel"
                pattern="[0-9]{10}"
                maxlength="10"
                @input="newClientForm.phone = newClientForm.phone.replace(/\D/g, '').slice(0, 10)"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="10 dígitos, ej. 5512345678"
              />
              <p v-if="newClientForm.phone && newClientForm.phone.length < 10" class="mt-1 text-xs text-amber-600 dark:text-amber-400">Faltan {{ 10 - newClientForm.phone.length }} dígito(s)</p>
              <p v-else-if="newClientForm.phone && newClientForm.phone.length === 10" class="mt-1 text-xs text-green-600 dark:text-green-400">✓ Formato correcto</p>
            </div>
            <div>
              <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Domicilio</label>
              <textarea v-model="newClientForm.address" rows="2" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"></textarea>
            </div>
          </div>
          <!-- Actions -->
          <div class="flex gap-3 px-6 pb-6">
            <button type="button" @click="skipNewClient" class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
              Continuar sin registrar
            </button>
            <button type="button" @click="saveNewClientAndContinue" :disabled="newClientLoading || !newClientForm.name" class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors">
              {{ newClientLoading ? 'Guardando…' : 'Registrar y continuar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const router = useRouter()
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ─── Header Sale Data
const saleData = ref({
  folio: '',
  clientName: '',
  paymentMethod: 'Efectivo'
})

// ─── Client Autocomplete
const clients = ref<any[]>([])
const clientSearch = ref('')
const showClientDropdown = ref(false)

const fetchClients = async () => {
  try {
    const res = await fetch(`${API}/api/clientes`)
    if (res.ok) clients.value = await res.json()
  } catch { /* silently ignore */ }
}

const filteredClients = computed(() => {
  const q = clientSearch.value.toLowerCase().trim()
  if (!q) return clients.value.slice(0, 10)
  return clients.value
    .filter(c => c.name.toLowerCase().includes(q) || (c.folio && c.folio.toLowerCase().includes(q)))
    .slice(0, 10)
})

const selectClient = (c: any) => {
  clientSearch.value = c.name
  saleData.value.clientName = c.name
  showClientDropdown.value = false
}

const onClientInput = () => {
  // Keep saleData.clientName in sync with free-text entry
  saleData.value.clientName = clientSearch.value
}

// Returns true if the current clientSearch matches a registered client
const isClientRegistered = () => {
  if (!clientSearch.value.trim()) return true // blank = anonymous, always OK
  return clients.value.some(c => c.name.toLowerCase() === clientSearch.value.trim().toLowerCase())
}

const clientContainer = ref<HTMLElement | null>(null)

const closeClientDropdown = (e: Event) => {
  if (clientContainer.value && !clientContainer.value.contains(e.target as Node)) {
    showClientDropdown.value = false
  }
}

// ─── Inventory & Autocomplete Logic
const inventory = ref<any[]>([])
const searchQuery = ref('')
const showDropdown = ref(false)

const fetchInventory = async () => {
  try {
    const res = await fetch(`${API}/api/inventory`);
    if (res.ok) inventory.value = await res.json();
  } catch (e) {
    console.error('Failed to load inventory');
  }
}

onMounted(() => {
  fetchInventory()
  fetchClients()
  document.addEventListener('click', closeDropdown)
  document.addEventListener('click', closeClientDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  document.removeEventListener('click', closeClientDropdown)
})

const closeDropdown = (e: Event) => {
  const el = e.target as HTMLElement
  if (!el.closest('.relative')) {
    showDropdown.value = false
  }
}

// Filter the inventory based on search query AND ensures stock > 0
const filteredInventory = computed(() => {
  if (!searchQuery.value) return inventory.value.filter(i => i.stock > 0).slice(0, 10)
  const q = searchQuery.value.toLowerCase()
  return inventory.value
    .filter(i => i.stock > 0 && i.product_name.toLowerCase().includes(q))
    .slice(0, 10) // Render limit for performance
})

const selectProduct = (item: any) => {
  searchQuery.value = item.product_name
  newProduct.value.product = item
  newProduct.value.unit = item.unit
  newProduct.value.price = 0 // Needs manual input for sales or you can wire an API price catalogue later
  showDropdown.value = false
}

const onSearchInput = () => {
  // If user modifies search, clear selected product
  if (newProduct.value.product && searchQuery.value !== newProduct.value.product.product_name) {
    newProduct.value.product = null
    newProduct.value.unit = 'Pza'
    newProduct.value.price = 0
  }
}

// ─── Form State
const getEmptyProduct = () => ({
  product: null as any | null,
  unit: 'Pza',
  quantity: 1,
  price: 0,
  discount: 0
})

const newProduct = ref(getEmptyProduct())

const calculatedSubtotal = computed(() => {
  const sub = (newProduct.value.quantity * newProduct.value.price) - newProduct.value.discount
  return Math.max(0, sub)
})

// Added Products Array
const ticketProducts = ref<any[]>([])

const totalSale = computed(() => {
  return ticketProducts.value.reduce((sum, item) => sum + item.subtotal, 0)
})

// ─── Actions
const addProduct = () => {
  const p = newProduct.value.product
  if (!p || newProduct.value.quantity <= 0 || newProduct.value.quantity > p.stock) return
  
  // Enforce single entry per product logic or simply add to array
  ticketProducts.value.push({
    id: p.id,
    name: p.product_name,
    unit: newProduct.value.unit,
    quantity: newProduct.value.quantity,
    price: newProduct.value.price,
    discount: newProduct.value.discount,
    subtotal: calculatedSubtotal.value
  })
  
  // Decrease local available stock to prevent double-selling the same stock in the same ticket
  p.stock -= newProduct.value.quantity

  // Reset form
  searchQuery.value = ''
  newProduct.value = getEmptyProduct()
}

const removeProduct = (index: number) => {
  const removed = ticketProducts.value[index]
  ticketProducts.value.splice(index, 1)

  // Restore local available stock
  const invMatch = inventory.value.find(i => i.id === removed.id)
  if (invMatch) invMatch.stock += removed.quantity
}

const isSaving = ref(false)
const errorMsg = ref('')

// ─── New Client Modal
const showNewClientModal = ref(false)
const newClientForm = ref({ name: '', phone: '', address: '' })
const newClientLoading = ref(false)
const newClientError = ref('')

// Actual POST to the API - called after user decides what to do
const doSaveSale = async () => {
  const body = {
    folio: saleData.value.folio || `V-${Date.now().toString().slice(-6)}`,
    client_name: saleData.value.clientName || 'Anónimo',
    payment_method: saleData.value.paymentMethod,
    date: new Date().toISOString().split('T')[0],
    total: totalSale.value,
    items: ticketProducts.value
  }
  const res = await fetch(`${API}/api/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al guardar')
  router.push('/ventas')
}

const saveSale = async () => {
  if (ticketProducts.value.length === 0) return
  errorMsg.value = ''

  // If client was typed but not found in the DB, prompt to register
  if (clientSearch.value.trim() && !isClientRegistered()) {
    newClientForm.value = { name: clientSearch.value.trim(), phone: '', address: '' }
    newClientError.value = ''
    showNewClientModal.value = true
    return
  }

  isSaving.value = true
  try {
    await doSaveSale()
  } catch (err: any) {
    errorMsg.value = err.message
  } finally {
    isSaving.value = false
  }
}

// User chose to save the new client then continue with the sale
const saveNewClientAndContinue = async () => {
  if (!newClientForm.value.name) return
  newClientLoading.value = true
  newClientError.value = ''
  try {
    const res = await fetch(`${API}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClientForm.value)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al registrar cliente')
    // Refresh local clients list and set the selected client name
    await fetchClients()
    clientSearch.value = newClientForm.value.name
    saleData.value.clientName = newClientForm.value.name
    showNewClientModal.value = false
    // Now proceed with the sale
    isSaving.value = true
    await doSaveSale()
  } catch (err: any) {
    newClientError.value = err.message
  } finally {
    newClientLoading.value = false
    isSaving.value = false
  }
}

// User chose to skip registration and continue with the typed name anyway
const skipNewClient = async () => {
  showNewClientModal.value = false
  isSaving.value = true
  try {
    await doSaveSale()
  } catch (err: any) {
    errorMsg.value = err.message
  } finally {
    isSaving.value = false
  }
}
</script>
