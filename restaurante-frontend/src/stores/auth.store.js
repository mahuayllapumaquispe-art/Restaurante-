import { defineStore } from 'pinia'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const API_URL = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    rol: localStorage.getItem('rol') || null,
    piso: localStorage.getItem('piso') || null,
    username: localStorage.getItem('username') || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.rol === 'Admin',
    isMozo: (state) => state.rol === 'Mozo',
    isCaja: (state) => state.rol === 'Caja',
    isCocinero: (state) => state.rol === 'Cocinero',

  },
  actions: {
    async login(username, password) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          username: username,
          password: password
        })

        const { token } = response.data

        const payload = jwtDecode(token)

        this.token = token
        this.rol = payload.rol
        this.piso = payload.piso
        this.username = payload.username

        localStorage.setItem('token', token)
        localStorage.setItem('rol', payload.rol)
        localStorage.setItem('piso', payload.piso)
        localStorage.setItem('username', payload.username)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        return true

      } catch (error) {
        this.logout()
        console.error('Error en el login:', error)
        throw error
      }
    },

    logout() {
      this.token = null
      this.rol = null
      this.piso = null
      this.username = null

      localStorage.removeItem('token')
      localStorage.removeItem('rol')
      localStorage.removeItem('piso')
      localStorage.removeItem('username')

      delete axios.defaults.headers.common['Authorization']
    }
  }
})
