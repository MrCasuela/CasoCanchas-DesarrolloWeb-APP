# CasoCanchas - Sistema de Reservas de Canchas Deportivas

Aplicación móvil desarrollada con React Native y Expo para la gestión de reservas de canchas deportivas.

## 📋 Características

- ✅ Autenticación de usuarios (Login/Registro)
- ✅ Visualización de canchas disponibles con calificaciones
- ✅ Sistema de reservas con selección de fecha y hora
- ✅ Verificación de disponibilidad en tiempo real
- ✅ Información del clima integrada para fechas de reserva
- ✅ Gestión de reservas (ver y cancelar reservas)
- ✅ Sistema de feedback y calificaciones por reserva
- ✅ Perfil de usuario

## 🚀 Tecnologías

- **React Native** con **Expo** (~54.0.25)
- **TypeScript** (~5.9.2)
- **React Navigation** v7 (Stack + Bottom Tabs)
- **Axios** para peticiones HTTP
- **AsyncStorage** para almacenamiento local
- **react-native-calendars** para selección de fechas
- **expo-vector-icons** (Ionicons)

## 📦 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Expo Go app en tu dispositivo móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/MrCasuela/CasoCanchas-DesarrolloWeb-APP.git
   cd CasoCanchas-DesarrolloWeb-APP/CasoCanchas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar el backend** (opcional)
   
   Si necesitas cambiar la URL del backend, edita el archivo:
   ```
   CasoCanchas/src/constants/config.ts
   ```
   ```typescript
   export const API_BASE = 'http://tu-backend-url:puerto';
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npx expo start
   ```

5. **Ejecutar en tu dispositivo**
   - Escanea el código QR con la app **Expo Go** (Android) o la **Cámara** (iOS)
   - Asegúrate de estar en la misma red WiFi que tu computadora

## 📱 Uso de la Aplicación

### Registro e Inicio de Sesión
1. Al abrir la app, verás la pantalla de **Login**
2. Si no tienes cuenta, presiona **"Registrarse"**
3. Completa el formulario con: nombre, email, teléfono y contraseña
4. Inicia sesión con tu email y contraseña

### Reservar una Cancha
1. En la pantalla de **Inicio**, navega por las canchas disponibles
2. Las canchas muestran su calificación promedio (estrellas)
3. Selecciona una cancha para ver los detalles
4. Elige una **fecha** en el calendario
5. Verás la información del **clima** para esa fecha
6. Selecciona un **horario disponible** (los ocupados están deshabilitados)
7. Presiona **"Confirmar Reserva"**

### Gestionar Reservas
1. Ve a la pestaña **"Reservas"** en el menú inferior
2. Verás todas tus reservas activas
3. Puedes **calificar** una cancha desde el botón "Calificar"
4. O **cancelar** una reserva con el botón "Cancelar"

### Dejar Feedback
1. Desde tus reservas, presiona **"Calificar"**
2. Selecciona las estrellas (1-5)
3. Opcionalmente, escribe un comentario
4. Presiona **"Enviar valoración"**

### Ver Opiniones de una Cancha
1. Desde los detalles de reserva, presiona **"⭐ Ver valoraciones y opiniones"**
2. Verás todas las calificaciones y comentarios de otros usuarios

## 🏗️ Estructura del Proyecto

```
CasoCanchas/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── CanchaCard.tsx
│   │   ├── StarRating.tsx
│   │   ├── TimeSlot.tsx
│   │   └── Loading.tsx
│   ├── constants/        # Constantes y configuración
│   │   └── config.ts
│   ├── navigation/       # Navegación de la app
│   │   ├── types.ts
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/          # Pantallas de la app
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ReservaDetailScreen.tsx
│   │   ├── ReservasScreen.tsx
│   │   ├── FeedbackScreen.tsx
│   │   └── PerfilScreen.tsx
│   ├── services/         # Servicios de API
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── canchas.service.ts
│   │   ├── reservas.service.ts
│   │   ├── clima.service.ts
│   │   └── feedback.service.ts
│   ├── types/            # Interfaces TypeScript
│   │   └── index.ts
│   └── utils/            # Utilidades
├── App.tsx               # Punto de entrada
├── package.json
└── tsconfig.json
```

## 🔌 API Backend

La aplicación se conecta a un backend FastAPI que proporciona los siguientes endpoints:

- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Inicio de sesión
- `GET /api/v1/canchas/` - Listar canchas
- `GET /api/v1/canchas/{id}` - Detalles de una cancha
- `GET /api/v1/reservas/?usuario_id={id}` - Reservas de un usuario
- `POST /api/v1/reservas/` - Crear reserva
- `DELETE /api/v1/reservas/{id}` - Cancelar reserva
- `GET /api/v1/feedbacks/cancha/{id}` - Feedbacks de una cancha
- `POST /api/v1/feedbacks/reserva/{id}?usuario_id={id}` - Crear feedback
- `GET /api/v1/clima?fecha=YYYY-MM-DD` - Información del clima

## 🐛 Solución de Problemas

### La app no se conecta al backend
- Verifica que la URL del backend en `config.ts` sea correcta
- Asegúrate de que el backend esté ejecutándose
- Si usas `localhost`, cámbialo por la IP local de tu computadora

### No puedo escanear el código QR
- Asegúrate de tener Expo Go instalado
- Verifica que tu dispositivo y computadora estén en la misma red WiFi
- Intenta con el modo Túnel: `npx expo start --tunnel`

### Error de compilación de TypeScript
- Ejecuta `npm install` nuevamente
- Borra la caché: `npx expo start -c`

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📧 Contacto

Para preguntas o soporte, por favor abre un issue en el repositorio.

---

Desarrollado con ❤️ usando React Native y Expo