// Configuración simplificada - el backend ya tiene CORS configurado
export const API_BASE = 'http://ec2-18-231-249-109.sa-east-1.compute.amazonaws.com:8000';
export const OPENAPI_URL = `${API_BASE}/openapi.json`;

export const API_CONFIG = {
  BASE_URL: API_BASE,
  TIMEOUT: 10000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@CasoCanchas:token',
  USER_DATA: '@CasoCanchas:user',
};
