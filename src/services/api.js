import axios from 'axios'

/**
 * Instância do Axios configurada para comunicação com a API Go (:8080).
 * Em ambiente de desenvolvimento local, utiliza o proxy '/api' do Vite
 * para redirecionar automaticamente para http://localhost:8080 sem erros de CORS.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

