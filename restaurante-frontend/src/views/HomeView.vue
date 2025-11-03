<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useSocketStore } from '@/stores/socket.store'
import { useRouter } from 'vue-router'
import AdminDashboard from './dashboards/AdminDashboard.vue'
import MozoDashboard from './dashboards/MozoDashboard.vue'
import CajaDashboard from './dashboards/CajaDashboard.vue'
import CocineroDashboard from './dashboards/CocineroDashboard.vue'

const authStore = useAuthStore()
const socketStore = useSocketStore()
const router = useRouter()

onMounted(() => {
  socketStore.connect(authStore.rol, authStore.piso)
})

onUnmounted(() => {
  socketStore.disconnect()
})
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <main>
    <header class="main-header">
      <h2>Bienvenido, {{ authStore.username }}</h2>
      <p>
        Rol: <strong>{{ authStore.rol }}</strong>
      </p>
      <button @click="handleLogout">Cerrar Sesión</button>
    </header>

    <hr />

    <div class="dashboard-content">
      <AdminDashboard v-if="authStore.isAdmin" />
      <MozoDashboard v-else-if="authStore.isMozo" />
      <CajaDashboard v-else-if="authStore.isCaja" />
      <CocineroDashboard v-else-if="authStore.isCocinero" />
      <div v-else>
        <p>Tu rol ({{ authStore.rol }}) no tiene un panel asignado.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f4f4f4;
}
.main-header h2 {
  margin: 0;
}
.main-header p {
  margin: 0;
}
.main-header button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.main-header button:hover {
  background-color: #c82333;
}
.dashboard-content {
  padding: 2rem;
}
</style>
