<template>
  <admin-layout>
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <router-link to="/usuarios" class="flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800 dark:hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </router-link>
        <PageBreadcrumb pageTitle="Nuevo Usuario" />
      </div>

      <div class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <h2 class="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">Información del Usuario</h2>

        <!-- Error Notice -->
        <div v-if="errorMsg" class="mb-4 px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre Completo<span class="text-error-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ej. Ana Martínez"
                class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo Electrónico<span class="text-error-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="ana@ferreteria.com"
                class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            <div class="md:col-span-2">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña Temporal<span class="text-error-500">*</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
            <div class="md:col-span-2">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
              <select
                v-model="form.role"
                class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white"
              >
                <option value="administrador">Administrador</option>
                <option value="operativo">Operativo</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <router-link to="/usuarios" class="px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancelar
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Guardando…' : 'Guardar Usuario' }}
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

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const router = useRouter()

const form = ref({ name: '', email: '', password: '', role: 'operativo' })
const loading = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`${API}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (!res.ok) {
      const data = await res.json()
      errorMsg.value = data.error || 'Error al guardar el usuario'
      return
    }
    router.push('/usuarios')
  } catch (e) {
    errorMsg.value = 'No se pudo conectar con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
