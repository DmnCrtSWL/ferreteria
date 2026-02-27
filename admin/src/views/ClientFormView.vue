<template>
  <admin-layout>
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <router-link to="/clientes" class="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </router-link>
        <PageBreadcrumb pageTitle="Nuevo Cliente" />
      </div>

      <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-sm">
        <form @submit.prevent="saveClient" class="space-y-5">
          <div v-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {{ error }}
          </div>

          <div>
            <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo <span class="text-error-500">*</span></label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
            <input
              v-model="form.phone"
              type="tel"
              pattern="[0-9]{10}"
              maxlength="10"
              @input="form.phone = form.phone.replace(/\D/g, '').slice(0, 10)"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="10 dígitos, ej. 5512345678"
            />
            <p v-if="form.phone && form.phone.length < 10" class="mt-1 text-xs text-amber-600 dark:text-amber-400">Faltan {{ 10 - form.phone.length }} dígito(s)</p>
            <p v-else-if="form.phone && form.phone.length === 10" class="mt-1 text-xs text-green-600 dark:text-green-400">✓ Formato correcto</p>
          </div>

          <div>
            <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Domicilio</label>
            <textarea
              v-model="form.address"
              rows="3"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
              placeholder="Ej. Calle Principal 123, Colonia Centro..."
            ></textarea>
          </div>

          <div class="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <router-link
              to="/clientes"
              class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-theme-xs"
            >
              {{ loading ? 'Guardando...' : 'Guardar Cliente' }}
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
  name: '',
  phone: '',
  address: ''
})

const loading = ref(false)
const error = ref('')

const saveClient = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await fetch(`${API}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al guardar el cliente')
    }

    router.push('/clientes')
  } catch (err: any) {
    error.value = err.message || 'No se pudo conectar al servidor'
  } finally {
    loading.value = false
  }
}
</script>
