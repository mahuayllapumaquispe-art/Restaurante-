import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useUsersStore = defineStore('usuarios', {
  state: () => ({
    usuarios: []
  }),
  actions: {
    async fetchUsuarios() {
      try {
        const response = await axios.get(`${API_URL}/usuarios`)
        this.usuarios = response.data
      } catch (error) {
        console.error('Error al obtener usuarios:', error)
      }
    },

    async crearUsuario(usuarioData) {
      try {
        await axios.post(`${API_URL}/usuarios`, usuarioData)
        await this.fetchUsuarios()

      } catch (error) {
        console.error('Error al crear usuario:', error)
        throw error
      }
    }
  }
})
