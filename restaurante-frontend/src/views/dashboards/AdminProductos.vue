<script setup>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '@/stores/productos.store'

const productosStore = useProductsStore()

const nuevoProducto = ref({
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoria: 'Platos de Fondo',
  tipo: 'Cocina',
})
const errorMsg = ref(null)
onMounted(() => {
  productosStore.fetchProductos()
})
const handleCrearProducto = async () => {
  errorMsg.value = null
  try {
    const data = {
      ...nuevoProducto.value,
      precio: parseFloat(nuevoProducto.value.precio),
      stock: parseInt(nuevoProducto.value.stock),
    }

    await productosStore.crearProducto(data)
    nuevoProducto.value = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: 'Platos de Fondo',
      tipo: 'Cocina',
    }
  } catch (error) {
    console.error(error)
    errorMsg.value = 'Error al crear el producto.'
  }
}
</script>

<template>
  <div class="productos-manager">
    <div class="form-container">
      <h3>Añadir Nuevo Producto al Menú</h3>
      <form @submit.prevent="handleCrearProducto">
        <input v.model="nuevoProducto.nombre" placeholder="Nombre (Lomo Saltado)" required />
        <input v-model="nuevoProducto.descripcion" placeholder="Descripción" required />
        <input
          v-model.number="nuevoProducto.precio"
          type="number"
          step="0.50"
          placeholder="Precio (35.50)"
          required
        />
        <input
          v-model.number="nuevoProducto.stock"
          type="number"
          placeholder="Stock Inicial (50)"
          required
        />

        <select v-model="nuevoProducto.categoria">
          <option>Platos de Fondo</option>
          <option>Entradas</option>
          <option>Postres</option>
          <option>Bebidas</option>
        </select>

        <select v-model="nuevoProducto.tipo">
          <option value="Cocina">Enviar a Cocina</option>
          <option value="Bar">Enviar a Bar (Bebidas)</option>
        </select>

        <button type="submit">Crear Producto</button>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </form>
    </div>

    <hr />

    <div class="lista-container">
      <h3>Menú Actual</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productosStore.productos" :key="producto.id">
            <td>{{ producto.nombre }}</td>
            <td>S/ {{ producto.precio.toFixed(2) }}</td>
            <td>{{ producto.stock }}</td>
            <td>{{ producto.tipo }}</td>
            <td>
              <button class="btn-editar">Editar</button>
              <button class="btn-eliminar">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.productos-manager {
  display: flex;
  gap: 2rem;
}
.form-container,
.lista-container {
  flex: 1;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
input,
select {
  padding: 0.5rem;
  font-size: 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
.btn-editar,
.btn-eliminar {
  margin-right: 5px;
  border: none;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 4px;
}
.btn-editar {
  background-color: #ffc107;
}
.btn-eliminar {
  background-color: #dc3545;
  color: white;
}
.error {
  color: red;
}
</style>
