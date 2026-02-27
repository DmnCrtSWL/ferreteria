<template>
  <admin-layout>
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageBreadcrumb pageTitle="Usuarios" />
        <router-link
          to="/usuarios/nuevo"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-full bg-brand-500 hover:bg-brand-600 transition-colors shadow-theme-xs"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nuevo Usuario
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-12 text-center text-gray-400">Cargando usuarios…</div>

      <!-- Error -->
      <div v-else-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">{{ error }}</div>

      <div v-else class="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">ID</th>
                <th scope="col" class="px-6 py-4 font-medium">Nombre</th>
                <th scope="col" class="px-6 py-4 font-medium">Correo</th>
                <th scope="col" class="px-6 py-4 font-medium">Rol</th>
                <th scope="col" class="px-6 py-4 font-medium">Fecha de Alta</th>
                <th scope="col" class="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="users.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">No hay usuarios registrados.</td>
              </tr>
              <tr
                v-for="user in pagedUsers"
                :key="user.id"
                class="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">#{{ user.id }}</td>
                <td class="px-6 py-4">{{ user.name }}</td>
                <td class="px-6 py-4">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="user.role === 'administrador' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
                  >
                    {{ user.role === 'administrador' ? 'Administrador' : 'Operativo' }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ formatDate(user.created_at) }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-3">
                    <!-- Ver -->
                    <button @click="openDetail(user)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver detalle">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <!-- Editar -->
                    <button @click="openEdit(user)" class="text-gray-400 hover:text-blue-500 transition-colors" title="Editar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <!-- Eliminar -->
                    <button @click="deleteUser(user)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <span class="text-xs text-gray-500">Mostrando {{ (currentPage-1)*PAGE_SIZE+1 }}–{{ Math.min(currentPage*PAGE_SIZE, users.length) }} de {{ users.length }}</span>
          <div class="flex items-center gap-1">
            <button @click="currentPage--" :disabled="currentPage===1" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">‹</button>
            <button v-for="p in totalPages" :key="p" @click="currentPage=p" :class="p===currentPage ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'" class="px-2.5 py-1 text-xs rounded-lg border transition-colors">{{ p }}</button>
            <button @click="currentPage++" :disabled="currentPage===totalPages" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">›</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailUser" class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50" @click.self="detailUser = null">
      <div class="w-full max-w-md p-6 bg-white rounded-2xl dark:bg-gray-900 shadow-xl">
        <h3 class="mb-4 text-lg font-bold text-gray-800 dark:text-white">Detalle del Usuario</h3>
        <dl class="space-y-3 text-sm">
          <div class="flex gap-2"><dt class="font-medium text-gray-500 w-32">ID</dt><dd class="text-gray-900 dark:text-white">#{{ detailUser.id }}</dd></div>
          <div class="flex gap-2"><dt class="font-medium text-gray-500 w-32">Nombre</dt><dd class="text-gray-900 dark:text-white">{{ detailUser.name }}</dd></div>
          <div class="flex gap-2"><dt class="font-medium text-gray-500 w-32">Correo</dt><dd class="text-gray-900 dark:text-white">{{ detailUser.email }}</dd></div>
          <div class="flex gap-2"><dt class="font-medium text-gray-500 w-32">Rol</dt><dd><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="detailUser.role === 'administrador' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'">{{ detailUser.role === 'administrador' ? 'Administrador' : 'Operativo' }}</span></dd></div>
          <div class="flex gap-2"><dt class="font-medium text-gray-500 w-32">Alta</dt><dd class="text-gray-900 dark:text-white">{{ formatDate(detailUser.created_at) }}</dd></div>
          <div v-if="detailUser.edited_at" class="flex gap-2"><dt class="font-medium text-gray-500 w-32">Última edición</dt><dd class="text-gray-900 dark:text-white">{{ formatDate(detailUser.edited_at) }}</dd></div>
        </dl>
        <button @click="detailUser = null" class="mt-6 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Cerrar</button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editUser" class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50" @click.self="editUser = null">
      <div class="w-full max-w-md p-6 bg-white rounded-2xl dark:bg-gray-900 shadow-xl">
        <h3 class="mb-4 text-lg font-bold text-gray-800 dark:text-white">Editar Usuario</h3>
        <div v-if="editError" class="mb-3 px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">{{ editError }}</div>
        <form @submit.prevent="saveEdit" class="space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
            <input v-model="editForm.name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Correo</label>
            <input v-model="editForm.email" type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
            <select v-model="editForm.role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <option value="administrador">Administrador</option>
              <option value="operativo">Operativo</option>
            </select>
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Contraseña <span class="text-gray-400 font-normal">(opcional)</span></label>
            <input v-model="editForm.password" type="password" placeholder="Dejar vacío para no cambiar" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="editUser = null" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Cancelar</button>
            <button type="submit" :disabled="editLoading" class="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60">{{ editLoading ? 'Guardando…' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── LIST ──────────────────────────────────────────────────────────────────────
const users = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const PAGE_SIZE = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(users.value.length / PAGE_SIZE)))
const pagedUsers = computed(() => users.value.slice((currentPage.value-1)*PAGE_SIZE, currentPage.value*PAGE_SIZE))

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/users`)
    if (!res.ok) throw new Error()
    users.value = await res.json()
  } catch {
    error.value = 'No se pudieron cargar los usuarios'
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

const formatDate = (iso: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── DETAIL ────────────────────────────────────────────────────────────────────
const detailUser = ref<any | null>(null)
const openDetail = (user: any) => { detailUser.value = user }

// ── EDIT ──────────────────────────────────────────────────────────────────────
const editUser = ref<any | null>(null)
const editForm = ref({ name: '', email: '', password: '', role: 'operativo' })
const editLoading = ref(false)
const editError = ref('')

const openEdit = (user: any) => {
  editUser.value = user
  editForm.value = { name: user.name, email: user.email, password: '', role: user.role || 'operativo' }
  editError.value = ''
}

const saveEdit = async () => {
  editLoading.value = true
  editError.value = ''
  const body: any = { name: editForm.value.name, email: editForm.value.email, role: editForm.value.role }
  if (editForm.value.password) body.password = editForm.value.password
  try {
    const res = await fetch(`${API}/api/users/${editUser.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const data = await res.json()
      editError.value = data.error || 'Error al actualizar'
      return
    }
    editUser.value = null
    await fetchUsers()
  } catch {
    editError.value = 'No se pudo conectar al servidor'
  } finally {
    editLoading.value = false
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
const deleteUser = async (user: any) => {
  if (!confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) return
  try {
    const res = await fetch(`${API}/api/users/${user.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    await fetchUsers()
  } catch {
    alert('No se pudo eliminar el usuario')
  }
}
</script>
