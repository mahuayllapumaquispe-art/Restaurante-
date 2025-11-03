import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useProductsStore = defineStore('productos', {
  state: () => ({
    productos: []
  }),
  actions: {
    async fetchProductos() {
      try {
        const response = await axios.get(`${API_URL}/productos`)
        this.productos = response.data
      } catch (error) {
        console.error('Error al obtener productos:', error)
      }
    },
    async crearProducto(productoData) {
      try {
        await axios.post(`${API_URL}/productos`, productoData)
        await this.fetchProductos()

      } catch (error) {
        console.error('Error al crear producto:', error)
        throw error
      }
    }
  }
})
