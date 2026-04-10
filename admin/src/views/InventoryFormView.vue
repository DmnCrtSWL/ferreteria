<template>
  <admin-layout>
    <div class="max-w-4xl mx-auto space-y-6 flex flex-col">
      <div class="flex items-center gap-4">
        <router-link
          to="/inventario"
          class="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </router-link>
        <PageBreadcrumb pageTitle="Nuevo Producto" />
      </div>

      <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <form @submit.prevent="submitForm" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Código -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Código</label>
              <input 
                v-model="form.codigo" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                placeholder="Ej. 11575"
              />
            </div>
            
            <!-- Producto -->
            <div class="md:col-span-2">
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Producto *</label>
              <input 
                v-model="form.producto" 
                required
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                placeholder="Nombre del producto o descripción"
              />
            </div>

            <!-- Precios -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Costo</label>
              <input 
                v-model.number="form.p_costo" 
                type="number" 
                step="0.01" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Venta</label>
              <input 
                v-model.number="form.p_venta" 
                type="number" 
                step="0.01" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Mayoreo</label>
              <input 
                v-model.number="form.p_mayoreo" 
                type="number" 
                step="0.01" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <!-- Departamento -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Departamento</label>
              <input 
                v-model="form.departamento" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                placeholder="Ej. Abrasivos, Plomeria..."
              />
            </div>

            <!-- Existencias e inventario -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Existencia Actual</label>
              <input 
                v-model.number="form.existencia" 
                type="number" 
                step="0.01" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Inv. Mínimo</label>
              <input 
                v-model.number="form.inv_minimo" 
                type="number" 
                step="0.01" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Inv. Máximo</label>
              <input 
                v-model.number="form.inv_maximo" 
                type="number" 
                step="0.01" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div v-if="error" class="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {{ error }}
          </div>

          <div class="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <router-link
              to="/inventario"
              class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
            >
              {{ loading ? 'Guardando...' : 'Guardar Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const router = useRouter()
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const form = ref({
  codigo: '',
  producto: '',
  p_costo: 0,
  p_venta: 0,
  p_mayoreo: 0,
  departamento: '',
  existencia: 0,
  inv_minimo: 0,
  inv_maximo: 0
})

const loading = ref(false)
const error = ref('')

const submitForm = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await fetch(`${API}/api/inventario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    
    if (!res.ok) {
      const { error: errorMsg } = await res.json()
      throw new Error(errorMsg || 'Error al guardar el producto')
    }
    
    router.push('/inventario')
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
