<template>
  <admin-layout>
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <router-link to="/usuarios" class="flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800 dark:hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </router-link>
        <PageBreadcrumb :pageTitle="pageTitle" />
      </div>

      <div v-if="loadingData" class="py-12 text-center text-gray-400">Cargando datos…</div>

      <div v-else class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <h2 class="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">Información del Usuario</h2>

        <div v-if="errorMsg" class="mb-4 px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">

            <!-- Nombre -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre Completo<span v-if="!isView" class="text-error-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ej. Ana Martínez"
                :required="!isView"
                :disabled="isView"
                class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Correo -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo Electrónico<span v-if="!isView" class="text-error-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="ana@ferreteria.com"
                :required="!isView"
                :disabled="isView"
                class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Contraseña — solo en crear/editar -->
            <div v-if="!isView" class="md:col-span-2">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ isCreate ? 'Contraseña Temporal' : 'Nueva Contraseña' }}
                <span v-if="isCreate" class="text-error-500">*</span>
                <span v-else class="text-gray-400 font-normal"> (opcional)</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                :required="isCreate"
                class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white"
              />
            </div>

            <!-- Rol -->
            <div class="md:col-span-2">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
              <select
                v-model="form.role"
                :disabled="isView"
                class="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="administrador">Administrador</option>
                <option value="operativo">Operativo</option>
                <option value="Sistemas">Sistemas</option>
              </select>
            </div>

            <!-- Metadatos (solo en ver/editar) -->
            <template v-if="!isCreate">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">ID</label>
                <input :value="`#${userData?.id}`" disabled class="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 disabled:opacity-70 cursor-not-allowed" />
              </div>
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Alta</label>
                <input :value="formatDate(userData?.created_at)" disabled class="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 disabled:opacity-70 cursor-not-allowed" />
              </div>
              <div class="md:col-span-2">
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Última edición</label>
                <input :value="formatDate(userData?.edited_at)" disabled class="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 disabled:opacity-70 cursor-not-allowed" />
              </div>
            </template>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <!-- Ver: botón Editar + Cerrar -->
            <template v-if="isView">
              <router-link
                :to="`/usuarios/${userId}/editar`"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Editar
              </router-link>
              <router-link to="/usuarios" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                Cerrar
              </router-link>
            </template>

            <!-- Crear / Editar: Cancelar + Guardar -->
            <template v-else>
              <router-link to="/usuarios" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </router-link>
              <button
                type="submit"
                :disabled="loading"
                class="px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Guardando…' : isCreate ? 'Guardar Usuario' : 'Actualizar Usuario' }}
              </button>
            </template>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const router  = useRouter()
const route   = useRoute()
const API     = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Mode detection
const isCreate = computed(() => route.name === 'Nuevo Usuario')
const isEdit   = computed(() => route.name === 'Editar Usuario')
const isView   = computed(() => route.name === 'Ver Usuario')
const userId   = computed(() => route.params.id as string | undefined)

const pageTitle = computed(() => {
  if (isCreate.value) return 'Nuevo Usuario'
  if (isEdit.value)   return 'Editar Usuario'
  return 'Detalle del Usuario'
})

// Form state
const form = ref({ name: '', email: '', password: '', role: 'operativo' })
const userData   = ref<any>(null)
const loading    = ref(false)
const loadingData = ref(false)
const errorMsg   = ref('')

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Load user when editing or viewing
const loadUser = async () => {
  if (!userId.value) return
  loadingData.value = true
  try {
    const res = await fetch(`${API}/api/users/${userId.value}`)
    if (!res.ok) throw new Error('Usuario no encontrado')
    const data = await res.json()
    userData.value = data
    form.value = {
      name:     data.name  || '',
      email:    data.email || '',
      password: '',
      role:     data.role  || 'operativo'
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'No se pudo cargar el usuario'
  } finally {
    loadingData.value = false
  }
}

onMounted(() => {
  if (!isCreate.value) loadUser()
})

// Submit
const handleSubmit = async () => {
  if (isView.value) return
  loading.value  = true
  errorMsg.value = ''

  try {
    const url    = isCreate.value ? `${API}/api/users` : `${API}/api/users/${userId.value}`
    const method = isCreate.value ? 'POST' : 'PUT'

    const body: any = { name: form.value.name, email: form.value.email, role: form.value.role }
    if (isCreate.value || form.value.password) body.password = form.value.password

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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
