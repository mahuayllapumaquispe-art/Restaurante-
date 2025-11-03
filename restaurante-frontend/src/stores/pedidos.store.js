import { defineStore } from 'pinia'
import axios from 'axios'
import { useMesasStore } from './mesas.store'

const API_URL = 'http://localhost:3000/api'

export const usePedidosStore = defineStore('pedidos', {
  state: () => ({
    pedidosListos: [],
    error: null,
    isLoading: false,
  }),

  actions: {
    async crearPedido(pedidoData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await axios.post(`${API_URL}/pedidos`, pedidoData)
        const mesasStore = useMesasStore()
        const index = mesasStore.mesas.findIndex((m) => m.id === pedidoData.mesaId)
        if (index !== -1) {
          mesasStore.mesas[index].estado = 'ocupada'
        }

        return response.data.ticketId
      } catch (error) {
        console.error('Error al crear el pedido:', error)
        this.error = error.response?.data?.message || 'Error al crear pedido'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async agregarPedidoListo(pedido) {
      this.pedidosListos.push(pedido)
    },

    async marcarEntregado(idPedido) {
      this.isLoading = true
      try {

        await axios.put(`${API_URL}/pedidos/${idPedido}/entregar`)

        this.pedidosListos = this.pedidosListos.filter((p) => p.idPedido !== idPedido)
      } catch (error) {
        console.error('Error al marcar como entregado:', error)
        this.error = 'Error al marcar pedido como entregado'
      } finally {
        this.isLoading = false
      }
    },
  },
})
