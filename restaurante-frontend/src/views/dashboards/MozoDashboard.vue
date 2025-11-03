<script setup>
import { onMounted, computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useMesasStore } from '@/stores/mesas.store'
import { usePedidosStore } from '@/stores/pedidos.store'
import PedidoModal from '@/components/PedidoModal.vue'

const authStore = useAuthStore()
const mesasStore = useMesasStore()
const pedidosStore = usePedidosStore()


const miPiso = authStore.piso
const mostrarModal = ref(false)
const mesaSeleccionada = ref(null)


const vistaActual = ref('Mesas')

const misMesas = computed(() => {
  return mesasStore.mesasPorPiso(miPiso)
})
const pedidosListosCount = computed(() => {
  return pedidosStore.pedidosListos.length
})
onMounted(() => {
  mesasStore.fetchMesas()

})


const seleccionarMesa = (mesa) => {
  if (mesa.estado === 'libre') {
    mesaSeleccionada.value = mesa
    mostrarModal.value = true
  }
}

const handleLiberarMesa = async (mesaId) => {
  if (
    !confirm(`¿Estás seguro de liberar la Mesa ${mesaId}?\n(Solo haz esto si la mesa está vacía).`)
  ) {
    return
  }
  try {
    await mesasStore.liberarMesa(mesaId)
  } catch (error) {
    alert(`Error al liberar la mesa: ${error.message}`)
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
  mesaSeleccionada.value = null
}

const handleCrearPedido = async (pedidoData) => {
  try {
    const ticketId = await pedidosStore.crearPedido(pedidoData)
    alert(`Ticket Generado: ${ticketId}\n\nEl cliente debe ir a caja para pagar.`)
    cerrarModal()
  } catch (error) {
    alert(`Error: ${pedidosStore.error}`)
    console.error('Error al crear pedido:', error)
  }
}

const handleMarcarEntregado = async (idPedido) => {
  await pedidosStore.marcarEntregado(idPedido)
}
</script>

<template>
  <div>
    <h1>Panel del Mozo - (Piso {{ miPiso }})</h1>

    <div class="tabs">
      <button :class="{ active: vistaActual === 'Mesas' }" @click="vistaActual = 'Mesas'">
        <i class="icon-mesas"></i> Mapa de Mesas
      </button>
      <button :class="{ active: vistaActual === 'Pedidos' }" @click="vistaActual = 'Pedidos'">
        <i class="icon-pedidos"></i> Pedidos para Recoger
        <span v-if="pedidosListosCount > 0" class="badge">
          {{ pedidosListosCount }}
        </span>
      </button>
    </div>

    <div class="tab-content">
      <div v-if="vistaActual === 'Mesas'" class="mapa-mesas-container">
        <p class="instruccion">Selecciona una mesa libre para tomar un pedido.</p>
        <div class="mapa-mesas">
          <div
            v-for="mesa in misMesas"
            :key="mesa.id"
            class="mesa"
            :class="mesa.estado"
            @click="seleccionarMesa(mesa)"
          >
            <span class="mesa-id">{{ mesa.id }}</span>
            <span class="mesa-estado">{{ mesa.estado }}</span>

            <button
              v-if="mesa.estado === 'ocupada'"
              class="btn-liberar"
              @click.stop="handleLiberarMesa(mesa.id)"
            >
              Liberar
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="vistaActual === 'Pedidos'" class="pedidos-listos">
        <h2>Pedidos Listos para Recoger</h2>

        <div v-if="pedidosListosCount === 0" class="pedidos-vacios">
          <p>Aún no hay pedidos listos...</p>
          <span>En cuanto la cocina termine un pedido, aparecerá aquí en tiempo real.</span>
        </div>

        <ul v-else class="lista-listos">
          <li v-for="pedido in pedidosStore.pedidosListos" :key="pedido.idPedido">
            <div class="info-pedido">
              <span class="pedido-id">Pedido: {{ pedido.idPedido.slice(-6) }}</span>
              <span class="pedido-mesa">(Mesa ?)</span>
            </div>
            <button class="btn-entregar" @click="handleMarcarEntregado(pedido.idPedido)">
              Marcar Entregado
            </button>
          </li>
        </ul>
      </div>
    </div>

    <PedidoModal
      v-if="mostrarModal"
      :mesa="mesaSeleccionada"
      @cerrar="cerrarModal"
      @pedido-creado="handleCrearPedido"
    />
  </div>
</template>

<style scoped>

h1 {
  font-weight: 500;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}
.tabs button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
.badge {
  background-color: #dc3545;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 3px 7px;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.instruccion {
  font-size: 1rem;
  color: #555;
}
.mapa-mesas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1.25rem;
}
.mesa {
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #ccc;
}
.mesa-id {
  font-weight: 600;
  font-size: 1.2rem;
}
.mesa-estado {
  font-size: 0.9rem;
  text-transform: capitalize;
}

.mesa.libre {
  border-left-color: #28a745;
  color: #155724;
  cursor: pointer;
}
.mesa.libre:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
.mesa.ocupada {
  border-left-color: #dc3545;
  color: #721c24;
  background-color: #fdfdfd;
  opacity: 0.8;
}
.btn-liberar {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 0.7rem;
  padding: 3px 6px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-liberar:hover {
  background-color: #0056b3;
}

.pedidos-listos h2 {
  font-weight: 500;
}
.pedidos-vacios {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #777;
}
.lista-listos {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.lista-listos li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.info-pedido {
  display: flex;
  flex-direction: column;
}
.info-pedido .pedido-id {
  font-weight: bold;
  font-size: 1.1rem;
}
.info-pedido .pedido-mesa {
  font-size: 0.9rem;
  color: #555;
}
.btn-entregar {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-entregar:hover {
  background-color: #218838;
}
</style>
