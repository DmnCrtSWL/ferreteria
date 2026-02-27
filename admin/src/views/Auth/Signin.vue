<template>
  <FullScreenLayout>
    <!-- Fondo blanco, centrado -->
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <!-- Card de login -->
      <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-8 py-10">

        <!-- Logo centrado -->
        <div class="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Ferremania Logo" class="h-24 w-24 object-contain mb-4" />
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white text-center">
            Ferremania
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center">
            Sistema de Administración
          </p>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-100 dark:border-gray-700 mb-8"></div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">

          <!-- Email -->
          <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo electrónico
            </label>
            <input
              v-model="email"
              type="email"
              id="email"
              name="email"
              placeholder="correo@ejemplo.com"
              autocomplete="email"
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                id="password"
                placeholder="••••••••"
                autocomplete="current-password"
                class="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
              />
              <span
                @click="togglePasswordVisibility"
                class="absolute z-30 text-gray-400 -translate-y-1/2 cursor-pointer right-4 top-1/2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <!-- Eye off -->
                <svg v-if="!showPassword" class="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z" fill="#98A2B3"/>
                </svg>
                <!-- Eye on -->
                <svg v-else class="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z" fill="#98A2B3"/>
                </svg>
              </span>
            </div>
          </div>

          <!-- Mantener sesión -->
          <div class="flex items-center justify-between">
            <label for="keepLoggedIn" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <div class="relative">
                <input v-model="keepLoggedIn" type="checkbox" id="keepLoggedIn" class="sr-only" />
                <div
                  :class="keepLoggedIn ? 'border-brand-500 bg-brand-500' : 'bg-transparent border-gray-300 dark:border-gray-600'"
                  class="flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] transition-colors"
                >
                  <span :class="keepLoggedIn ? '' : 'opacity-0'">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" stroke-width="1.94437" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
              Mantener sesión iniciada
            </label>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ errorMsg }}
          </div>

          <!-- Botón -->
          <button
            type="submit"
            :disabled="loading"
            class="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? 'Verificando...' : 'Ingresar' }}
          </button>

        </form>

        <!-- Footer -->
        <p class="mt-8 text-center text-xs text-gray-400">
          © {{ new Date().getFullYear() }} Ferremania. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  errorMsg.value = ''
  if (!email.value || !password.value) {
    errorMsg.value = 'Ingresa tu correo y contraseña.'
    return
  }
  loading.value = true
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    const data = await res.json()
    if (!res.ok) {
      errorMsg.value = data.error || 'Credenciales incorrectas'
      return
    }
    const storage = keepLoggedIn.value ? localStorage : sessionStorage
    storage.setItem('user', JSON.stringify(data))
    router.push('/compras')
  } catch {
    errorMsg.value = 'No se pudo conectar al servidor. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>
