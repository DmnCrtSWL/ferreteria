<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700 dark:text-gray-400"
      @click.prevent="toggleDropdown"
    >
      <span class="block mr-1 font-medium text-theme-sm">{{ userName }}</span>
      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
    >
      <div class="pb-3 border-b border-gray-200 dark:border-gray-800">
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{ userName }}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 capitalize">
          {{ userRole }}
        </span>
      </div>

      <button
        @click="signOut"
        class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
      >
        <LogoutIcon
          class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        />
        Cerrar sesión
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup>
import { ChevronDownIcon, LogoutIcon } from '@/icons'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

// Read user from storage
const storedUser = computed(() => {
  try {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
})

const userName = computed(() => storedUser.value?.name || 'Usuario')
const userRole = computed(() => storedUser.value?.role || '')

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const signOut = () => {
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
  closeDropdown()
  router.push('/signin')
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
