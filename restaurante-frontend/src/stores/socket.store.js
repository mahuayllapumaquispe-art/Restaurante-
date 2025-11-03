import { defineStore } from 'pinia'
import io from 'socket.io-client'
import { usePedidosStore } from './pedidos.store'

const API_URL = 'http://localhost:3000'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null,
  }),

  actions: {
    connect(rol, piso) {
      if (this.socket) return

      this.socket = io(API_URL)

      this.socket.on('connect', () => {
        console.log(`Socket.io: Conectado al servidor con ID ${this.socket.id}`)
        if (rol === 'Mozo') {
          this.socket.emit('joinRoom', `piso-${piso}`)
        }
        if (rol === 'Cocinero') {
          this.socket.emit('joinRoom', 'Cocina')
          this.socket.emit('joinRoom', 'Bar')
        }
      })
      this.socket.on('pedido-listo', (pedido) => {
        console.log('Socket.io: ¡Pedido listo recibido!', pedido)
        const pedidosStore = usePedidosStore()
        pedidosStore.agregarPedidoListo(pedido)
      })

      this.socket.on('nuevo-pedido', (pedido) => {
        console.log('¡Nuevo pedido para KDS!', pedido)
      })
    },
    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
        console.log('Socket.io: Desconectado del servidor')
      }
    },
  },
})
