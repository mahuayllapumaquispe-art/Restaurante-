<script setup>
import { onMounted } from 'vue'
import { useReportesStore } from '@/stores/reportes.store'
const reportesStore = useReportesStore()
onMounted(() => {
  reportesStore.fetchReporteDiario()
})
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}
</script>

<template>
  <div class="reportes-container">
    <h2>Reporte de Hoy ({{ reportesStore.reporteDiario?.fechaReporte }})</h2>

    <div v-if="reportesStore.isLoading">
      <p>Cargando reporte...</p>
    </div>

    <div v-else-if="reportesStore.error" class="error">
      <p>{{ reportesStore.error }}</p>
    </div>

    <div v-else-if="reportesStore.reporteDiario" class="reporte-content">

      <div class="reporte-seccion">
        <h3>Resumen de Ventas</h3>
        <div class="ventas-summary">
          <div class="stat-card">
            <h4>Total Ventas</h4>
            <span class="monto-total">{{ formatCurrency(reportesStore.reporteDiario.ventas.totalVentas) }}</span>
          </div>
          <div class="stat-card">
            <h4># Pagos</h4>
            <span class="monto-total">{{ reportesStore.reporteDiario.ventas.conteoPagos }}</span>
          </div>
        </div>
        <h4>Desglose por Método de Pago:</h4>
        <ul>
          <li v-for="(monto, metodo) in reportesStore.reporteDiario.ventas.desgloseMetodos" :key="metodo">
            <strong>{{ metodo }}:</strong> {{ formatCurrency(monto) }}
          </li>
        </ul>
      </div>

      <div class="reporte-seccion">
        <h3>Productos Más Vendidos</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad Vendida</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in reportesStore.reporteDiario.productos" :key="producto.nombre">
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.cantidad }}</td>
            </tr>
            <tr v-if="reportesStore.reporteDiario.productos.length === 0">
              <td colspan="2">Aún no se han vendido productos hoy.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<style scoped>
.reporte-content {
  display: flex;
  gap: 2rem;
}
.reporte-seccion {
  flex: 1;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
}
.ventas-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.stat-card {
  flex: 1;
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}
.stat-card h4 {
  margin: 0 0 0.5rem 0;
}
.monto-total {
  font-size: 2rem;
  font-weight: bold;
  color: #28a745;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
.error {
  color: red;
}
</style>
