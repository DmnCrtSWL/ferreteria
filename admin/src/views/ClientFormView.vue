<template>
  <admin-layout>
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <router-link to="/clientes" class="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </router-link>
        <PageBreadcrumb :pageTitle="pageTitle" />
      </div>

      <div v-if="loadingData" class="py-12 text-center text-gray-400">Cargando datos…</div>

      <div v-else class="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-theme-sm">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div v-if="error" class="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {{ error }}
          </div>

          <!-- Nombre -->
          <div>
            <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre Completo <span v-if="!isView" class="text-error-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              :required="!isView"
              :disabled="isView"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
            <input
              v-model="form.phone"
              type="tel"
              pattern="[0-9]{10}"
              maxlength="10"
              :disabled="isView"
              @input="!isView && (form.phone = form.phone.replace(/\D/g, '').slice(0, 10))"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="10 dígitos, ej. 5512345678"
            />
            <p v-if="!isView && form.phone && form.phone.length < 10" class="mt-1 text-xs text-amber-600 dark:text-amber-400">Faltan {{ 10 - form.phone.length }} dígito(s)</p>
            <p v-else-if="!isView && form.phone && form.phone.length === 10" class="mt-1 text-xs text-green-600 dark:text-green-400">✓ Formato correcto</p>
          </div>

          <!-- RFC -->
          <div>
            <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">RFC</label>
            <input
              v-model="form.rfc"
              type="text"
              maxlength="13"
              :disabled="isView"
              @input="!isView && (form.rfc = form.rfc.toUpperCase())"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Ej. XAXX010101000"
            />
          </div>

          <!-- Régimen Fiscal -->
          <div>
            <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Régimen Fiscal</label>
            <select
              v-model="form.regimen_fiscal"
              :disabled="isView"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">-- Seleccionar régimen --</option>
              <option value="601">601 - Régimen General de Ley Personas Morales</option>
              <option value="602">602 - Régimen Simplificado de Ley Personas Morales</option>
              <option value="603">603 - Personas Morales con Fines No Lucrativos</option>
              <option value="604">604 - Régimen de Pequeños Contribuyentes</option>
              <option value="605">605 - Régimen de Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
              <option value="606">606 - Régimen de Arrendamiento</option>
              <option value="607">607 - Régimen de Enajenación o Adquisición de Bienes</option>
              <option value="608">608 - Régimen de los Demás Ingresos</option>
              <option value="609">609 - Régimen de Consolidación</option>
              <option value="610">610 - Régimen Residentes en el Extranjero sin Establecimiento Permanente en México</option>
              <option value="611">611 - Régimen de Ingresos por Dividendos (Socios y Accionistas)</option>
              <option value="612">612 - Régimen de las Personas Físicas con Actividades Empresariales y Profesionales</option>
              <option value="613">613 - Régimen Intermedio de las Personas Físicas con Actividades Empresariales</option>
              <option value="614">614 - Régimen de los Ingresos por Intereses</option>
              <option value="615">615 - Régimen de los Ingresos por Obtención de Premios</option>
              <option value="616">616 - Sin Obligaciones Fiscales</option>
              <option value="617">617 - PEMEX</option>
              <option value="618">618 - Régimen Simplificado de Ley Personas Físicas</option>
              <option value="619">619 - Ingresos por la Obtención de Préstamos</option>
              <option value="620">620 - Sociedades Cooperativas de Producción que Optan por Diferir sus Ingresos</option>
              <option value="621">621 - Régimen de Incorporación Fiscal</option>
              <option value="622">622 - Régimen de Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras PM</option>
              <option value="623">623 - Régimen Opcional para Grupos de Sociedades</option>
              <option value="624">624 - Régimen de los Coordinados</option>
              <option value="625">625 - Régimen de las Actividades Empresariales con Ingresos a través de Plataformas Tecnológicas</option>
              <option value="626">626 - Régimen Simplificado de Confianza</option>
            </select>
          </div>

          <!-- Domicilio -->
          <div>
            <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Domicilio</label>
            <textarea
              v-model="form.address"
              rows="3"
              :disabled="isView"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Ej. Calle Principal 123, Colonia Centro..."
            ></textarea>
          </div>

          <!-- Folio + fechas (solo en ver/editar) -->
          <div v-if="!isCreate" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Folio</label>
              <input :value="clientData?.folio" disabled class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 disabled:opacity-70 cursor-not-allowed" />
            </div>
            <div>
              <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Alta</label>
              <input :value="formatDate(clientData?.created_at)" disabled class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 disabled:opacity-70 cursor-not-allowed" />
            </div>
            <div>
              <label class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Última edición</label>
              <input :value="formatDate(clientData?.edited_at)" disabled class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 disabled:opacity-70 cursor-not-allowed" />
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <router-link
              v-if="isView"
              :to="`/clientes/${clientId}/editar`"
              class="px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors shadow-theme-xs inline-flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Editar
            </router-link>

            <template v-if="!isView">
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
                {{ loading ? 'Guardando...' : isCreate ? 'Guardar Cliente' : 'Actualizar Cliente' }}
              </button>
            </template>

            <router-link
              v-if="isView"
              to="/clientes"
              class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </router-link>
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

const router = useRouter()
const route = useRoute()
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Determine mode from route
const isCreate = computed(() => route.name === 'Nuevo Cliente')
const isEdit   = computed(() => route.name === 'Editar Cliente')
const isView   = computed(() => route.name === 'Ver Cliente')
const clientId = computed(() => route.params.id as string | undefined)

const pageTitle = computed(() => {
  if (isCreate.value) return 'Nuevo Cliente'
  if (isEdit.value)   return 'Editar Cliente'
  return 'Detalle del Cliente'
})

const form = ref({
  name: '',
  phone: '',
  rfc: '',
  regimen_fiscal: '',
  address: ''
})

const clientData = ref<any>(null)
const loading     = ref(false)
const loadingData = ref(false)
const error       = ref('')

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Load existing client data when editing or viewing
const loadClient = async () => {
  if (!clientId.value) return
  loadingData.value = true
  try {
    const res = await fetch(`${API}/api/clientes/${clientId.value}`)
    if (!res.ok) throw new Error('Cliente no encontrado')
    const data = await res.json()
    clientData.value = data
    form.value = {
      name: data.name || '',
      phone: data.phone || '',
      rfc: data.rfc || '',
      regimen_fiscal: data.regimen_fiscal || '',
      address: data.address || ''
    }
  } catch (err: any) {
    error.value = err.message || 'No se pudo cargar el cliente'
  } finally {
    loadingData.value = false
  }
}

onMounted(() => {
  if (!isCreate.value) loadClient()
})

// Submit handler (create or update)
const handleSubmit = async () => {
  if (isView.value) return
  loading.value = true
  error.value = ''

  try {
    const url    = isCreate.value ? `${API}/api/clientes` : `${API}/api/clientes/${clientId.value}`
    const method = isCreate.value ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
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
