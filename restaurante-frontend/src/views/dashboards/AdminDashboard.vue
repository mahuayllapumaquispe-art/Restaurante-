<script setup>
import { ref } from 'vue'
import AdminProductos from './AdminProductos.vue'
import AdminUsuarios from './AdminUsuarios.vue'
import AdminReportes from './AdminReportes.vue'
const vistaActual = ref('Productos')
</script>

<template>
  <div>
    <h1>Panel del Administrador</h1>

    <div class="tabs">
      <button :class="{ active: vistaActual === 'Productos' }" @click="vistaActual = 'Productos'">
        Gestionar Productos
      </button>
      <button :class="{ active: vistaActual === 'Usuarios' }" @click="vistaActual = 'Usuarios'">
        Gestionar Empleados
      </button>
      <button :class="{ active: vistaActual === 'Reportes' }" @click="vistaActual = 'Reportes'">
        Ver Reportes
      </button>
    </div>

    <hr />

    <div class="tab-content">
      <AdminProductos v-if="vistaActual === 'Productos'" />
      <AdminUsuarios v-else-if="vistaActual === 'Usuarios'" />
      <AdminReportes v-else-if="vistaActual === 'Reportes'" />
    </div>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #ccc;
  margin-bottom: 1rem;
}
.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 4px 4px 0 0;
}
.tabs button.active {
  background-color: #007bff;
  color: white;
}
</style>
