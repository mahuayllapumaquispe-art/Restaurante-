<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const API_URL = 'http://localhost:3000/api'
const vistaActual = ref('Pagar')
const ticketId = ref('')
const metodoDePago = ref('Efectivo')

const isLoading = ref(false)
const mensajeExito = ref(null)
const mensajeError = ref(null)

const resetearForm = () => {
  ticketId.value = ''
  mensajeExito.value = null
  mensajeError.value = null
  isLoading.value = false
}

const handlePagar = async () => {
  resetearForm()
  isLoading.value = true

  try {
    const response = await axios.post(`${API_URL}/caja/pagar`, {
      ticketId: ticketId.value,
      metodoDePago: metodoDePago.value
    })

    mensajeExito.value = response.data.message

  } catch (error) {
    mensajeError.value = error.response?.data?.message || 'Error al procesar el pago'
  } finally {
    isLoading.value = false
  }
}
const handleCancelar = async () => {
  if (!confirm(`¿Estás seguro de CANCELAR el ticket ${ticketId.value}?\nEsta acción no se puede deshacer.`)) {
    return
  }

  resetearForm()
  isLoading.value = true

  try {
    const response = await axios.post(`${API_URL}/caja/cancelar-ticket`, {
      ticketId: ticketId.value
    })

    mensajeExito.value = response.data.message

  } catch (error) {
    mensajeError.value = error.response?.data?.message || 'Error al cancelar el ticket'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <h1>Panel de Caja - (Piso {{ authStore.piso }})</h1>

    <div class="tabs">
      <button
        :class="{ active: vistaActual === 'Pagar' }"
        @click="vistaActual = 'Pagar'; resetearForm()">
        Pagar Ticket
      </button>
      <button
        :class="{ active: vistaActual === 'Cancelar' }"
        @click="vistaActual = 'Cancelar'; resetearForm()">
        Cancelar Ticket
      </button>
    </div>

    <div class="tab-content">
      <form @submit.prevent="vistaActual === 'Pagar' ? handlePagar() : handleCancelar()">
        <div class="form-group">
          <label for="ticketId">Número de Ticket:</label>
          <input
            type="text"
            id="ticketId"
            v-model="ticketId"
            placeholder="T-176..."
            required
          />
        </div>

        <div v-if="vistaActual === 'Pagar'" class="form-group">
          <label for="metodoDePago">Método de Pago:</label>
          <select id="metodoDePago" v-model="metodoDePago">
            <option>Efectivo</option>
            <option>Yape</option>
            <option>Tarjeta</option>
          </select>
        </div>

        <button type="submit" :disabled="isLoading" class="btn-principal" :class="vistaActual">
          {{ isLoading ? 'Procesando...' : (vistaActual === 'Pagar' ? 'Registrar Pago' : 'Confirmar Cancelación') }}
        </button>
      </form>

      <div v-if="mensajeExito" class="mensaje exito">
        {{ mensajeExito }}
      </div>
      <div v-if="mensajeError" class="mensaje error">
        {{ mensajeError }}
      </div>
    </div>

  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.tabs button {
  padding: 0.75rem 1.25rem;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
}
.tabs button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
.tab-content {
  max-width: 500px;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.2rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}
.btn-principal {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}
.btn-principal.Pagar {
  background-color: #28a745;
}
.btn-principal.Cancelar {
  background-color: #dc3545;
}
.btn-principal:disabled {
  background-color: #ccc;
}

.mensaje {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}
.mensaje.exito {
  background-color: #d4edda;
  color: #155724;
}
.mensaje.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
