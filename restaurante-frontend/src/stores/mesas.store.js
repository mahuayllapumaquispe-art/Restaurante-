import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useMesasStore = defineStore('mesas', {
  state: () => ({
    mesas: []
  }),

  getters: {
    mesasPorPiso: (state) => {
      return (piso) => state.mesas.filter(mesa => mesa.piso === piso)
    }
  },

  actions: {
    async fetchMesas() {
      try {
        const response = await axios.get(`${API_URL}/mesas`)
        this.mesas = response.data
      } catch (error) {
        console.error('Error al obtener mesas:', error)
      }
    },
    async liberarMesa(idMesa) {
      try {
        await axios.put(`${API_URL}/mesas/${idMesa}/estado`, { estado: 'libre' })
        const index = this.mesas.findIndex(m => m.id === idMesa)
        if (index !== -1) {
          this.mesas[index].estado = 'libre'
        }

      } catch (error) {
        console.error('Error al liberar mesa:', error)
        throw error
      }
    }
  }
})
