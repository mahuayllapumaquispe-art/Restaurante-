<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/usuarios.store'
const usersStore = useUsersStore()
const nuevoUsuario = ref({
  nombre: '',
  username: '',
  password: '',
  rol: 'Mozo',
  pisoAsignado: null,
})
const errorMsg = ref(null)
onMounted(() => {
  usersStore.fetchUsuarios()
})
const handleCrearUsuario = async () => {
  errorMsg.value = null
  try {
    const data = { ...nuevoUsuario.value }
    if (data.rol !== 'Mozo' && data.rol !== 'Caja') {
      data.pisoAsignado = null
    } else if (!data.pisoAsignado) {
      errorMsg.value = 'Un Mozo o Caja debe tener un piso asignado.'
      return
    }

    await usersStore.crearUsuario(data)
    nuevoUsuario.value = {
      nombre: '',
      username: '',
      password: '',
      rol: 'Mozo',
      pisoAsignado: null,
    }
  } catch (error) {
    console.error(error)
    errorMsg.value = 'Error al crear el usuario. (Verifica que el username no exista)'
  }
}
</script>

<template>
  <div class="usuarios-manager">
    <div class="form-container">
      <h3>Añadir Nuevo Empleado</h3>
      <form @submit.prevent="handleCrearUsuario">
        <input v-model="nuevoUsuario.nombre" placeholder="Nombre Completo" required />
        <input v-model="nuevoUsuario.username" placeholder="Username (para login)" required />
        <input v-model="nuevoUsuario.password" type="password" placeholder="Contraseña" required />

        <select v-model="nuevoUsuario.rol">
          <option value="Mozo">Mozo</option>
          <option value="Caja">Caja</option>
          <option value="Cocinero">Cocinero</option>
          <option value="Admin">Administrador</option>
        </select>

        <select
          v.if="nuevoUsuario.rol === 'Mozo' || nuevoUsuario.rol === 'Caja'"
          v-model.number="nuevoUsuario.pisoAsignado"
        >
          <option :value="null" disabled>Asignar Piso</option>
          <option :value="1">Piso 1</option>
          <option :value="2">Piso 2</option>
          <option :value="3">Piso 3</option>
        </select>

        <button type="submit">Crear Empleado</button>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </form>
    </div>

    <div class="lista-container">
      <h3>Empleados Actuales</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Username</th>
            <th>Rol</th>
            <th>Piso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usersStore.usuarios" :key="usuario.id">
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.username }}</td>
            <td>{{ usuario.rol }}</td>
            <td>{{ usuario.pisoAsignado || 'N/A' }}</td>
            <td>
              <button class="btn-editar">Editar</button>
              <button class="btn-eliminar">Desactivar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.usuarios-manager {
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
  border-radius: 4px;
  border: 1px solid #ccc;
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
button {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
button:hover {
  background-color: #0056b3;
}
.btn-editar,
.btn-eliminar {
  margin-right: 5px;
  border: none;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.8rem;
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
