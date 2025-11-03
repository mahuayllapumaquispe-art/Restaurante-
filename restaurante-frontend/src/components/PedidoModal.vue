<script setup>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '@/stores/productos.store'

const props = defineProps({
  mesa: Object
})

const emit = defineEmits(['cerrar', 'pedido-creado'])

const productosStore = useProductsStore()


const carrito = ref([])

onMounted(() => {
  if (productosStore.productos.length === 0) {
    productosStore.fetchProductos()
  }
})


const agregarAlCarrito = (producto) => {

  const itemExistente = carrito.value.find(item => item.productoId === producto.id)

  if (itemExistente) {

    itemExistente.cantidad++
  } else {

    carrito.value.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      cantidad: 1,
      observaciones: ''
    })
  }
}

const calcularTotal = () => {
  return carrito.value.reduce((total, item) => {
    return total + (item.precioUnitario * item.cantidad)
  }, 0).toFixed(2)
}
const enviarPedido = () => {
  if (carrito.value.length === 0) {
    alert('El pedido está vacío')
    return
  }

  const pedidoData = {
    mesaId: props.mesa.id,
    items: carrito.value
  }
  emit('pedido-creado', pedidoData)
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('cerrar')">
    <div class="modal-content">
      <header>
        <h3>Nuevo Pedido para Mesa: {{ mesa.id }}</h3>
        <button class="btn-cerrar" @click="emit('cerrar')">X</button>
      </header>

      <div class="modal-body">
        <div class="menu-lista">
          <h4>Menú</h4>
          <div
            v-for="producto in productosStore.productos"
            :key="producto.id"
            class="menu-item"
            @click="agregarAlCarrito(producto)"
          >
            {{ producto.nombre }} - <span>S/ {{ producto.precio.toFixed(2) }}</span>
          </div>
        </div>

        <div class="carrito-lista">
          <h4>Pedido Actual</h4>
          <div v-if="carrito.length === 0" class="carrito-vacio">
            Selecciona items del menú...
          </div>
          <div v-else>
            <div v-for="(item, index) in carrito" :key="index" class="carrito-item">
              <span>{{ item.cantidad }}x {{ item.nombre }}</span>
              <span>S/ {{ (item.precioUnitario * item.cantidad).toFixed(2) }}</span>
              </div>
            <hr>
            <div class="carrito-total">
              <strong>Total: S/ {{ calcularTotal() }}</strong>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <button class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
        <button
          class="btn-confirmar"
          @click="enviarPedido"
          :disabled="carrito.length === 0"
        >
          Generar Ticket
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-content {
  width: 80%;
  max-width: 800px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}
header, footer {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
footer {
  border-top: 1px solid #ddd;
  border-bottom: none;
}
header h3 {
  margin: 0;
}
.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-body {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  min-height: 400px;
}
.menu-lista, .carrito-lista {
  flex: 1;
  border: 1px solid #eee;
  padding: 0.5rem;
  height: 400px;
  overflow-y: auto;
}
.menu-item {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}
.menu-item:hover {
  background-color: #f9f9f9;
}
.menu-item span {
  float: right;
  font-weight: bold;
}
.carrito-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}
.carrito-total {
  text-align: right;
  font-size: 1.2rem;
  margin-top: 1rem;
}
.carrito-vacio {
  color: #888;
  text-align: center;
  margin-top: 2rem;
}
.btn-confirmar, .btn-cancelar {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}
.btn-cancelar {
  background-color: #f0f0f0;
}
.btn-confirmar {
  background-color: #28a745;
  color: white;
}
.btn-confirmar:disabled {
  background-color: #ccc;
}
</style>
