import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useReportesStore = defineStore('reportes', {
  state: () => ({
    reporteDiario: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchReporteDiario() {
      this.isLoading = true
      this.error = null
      this.reporteDiario = null

      try {
        const response = await axios.get(`${API_URL}/reportes/hoy`)
        this.reporteDiario = response.data
      } catch (error) {
        console.error('Error al obtener el reporte diario:', error)
        this.error = 'No se pudo cargar el reporte.'
      } finally {
        this.isLoading = false
      }
    },
  },
})
