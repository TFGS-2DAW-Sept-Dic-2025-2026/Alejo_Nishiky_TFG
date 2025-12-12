# **VecinoTech**
### *Plataforma colaborativa que conecta vecinos con diferentes niveles de conocimiento tecnológico*

---

## 🧭 Descripción del Proyecto

**VecinoTech** es una plataforma web que facilita la ayuda mutua entre vecinos en temas tecnológicos. La aplicación conecta a personas que necesitan asistencia técnica con voluntarios dispuestos a ayudar, creando una red de apoyo comunitario digital.

Los usuarios pueden:

- 🙋 **Solicitar ayuda** para resolver problemas tecnológicos
- 💪 **Ofrecer ayuda** como voluntario en su comunidad
- 💬 **Comunicarse en tiempo real** mediante chat integrado
- 📹 **Realizar videollamadas** para asistencia remota
- 🎓 **Obtener diplomas** al completar 50 ayudas como voluntario
- ⭐ **Valorar** la experiencia después de cada ayuda

El proyecto está dividido en:

- **Backend**: Spring Boot 3 + WebSockets + PostgreSQL + PostGIS
- **Frontend**: Angular 19 + Tailwind CSS + Signals + RxJS

---

## 🚀 Tecnologías Principales

### 🛠 Backend
- **Java 17**
- **Spring Boot 3**
- Spring Security + JWT
- Spring WebSocket (STOMP)
- Spring Data JPA
- PostgreSQL + PostGIS (geolocalización)
- Mailjet API (envío de emails)
- Lombok

### 🎨 Frontend
- **Angular 19**
- Angular Signals
- RxJS
- Tailwind CSS
- SweetAlert2
- STOMP + SockJS
- Leaflet (mapas interactivos)
- Jitsi Meet (videollamadas)

---

## 🎯 Funcionalidades Principales

### 🔐 Autenticación y Seguridad
- Registro con **verificación por email (2FA)**
- Login con JWT (access + refresh tokens)
- Recuperación de contraseña
- Protección de endpoints REST y WebSocket

---

### 👤 Gestión de Perfil
- Información personal editable
- Avatar personalizable (subida de imágenes)
- Modo voluntario activable/desactivable
- Estadísticas de actividad
- Rating promedio como voluntario
- Historial completo de solicitudes

---

### 📍 Sistema de Geolocalización
- Búsqueda de solicitudes cercanas con **PostGIS**
- Mapa interactivo con **Leaflet + OpenStreetMap**
- Geocodificación de direcciones (Nominatim)
- Radio de búsqueda configurable
- Visualización de solicitudes en tiempo real

---

### 🤝 Solicitudes de Ayuda

#### Como Solicitante:
- Crear solicitudes con ubicación
- Ver estado en tiempo real
- Comunicarse con el voluntario asignado
- Valorar la ayuda recibida (1-5 estrellas)
- Cerrar solicitudes completadas

#### Como Voluntario:
- Ver solicitudes abiertas en el mapa
- Aceptar solicitudes cercanas
- Establecer recordatorios
- Completar ayudas y recibir valoraciones
- Progresar hacia el diploma de reconocimiento + enlace público para anexarlo en LinkedIn

---

### 💬 Sistema de Chat en Tiempo Real
- Mensajería instantánea con WebSockets (STOMP)
- Chat por cada solicitud activa
- Notificaciones de nuevos mensajes
- Invitaciones a videollamadas
- Finalización colaborativa del chat

---

### 📹 Videollamadas Integradas
- Integración con **Jitsi Meet** (meet.guifi.net) (Servicio en España)
- Invitaciones desde el chat
- Salas temporales únicas por solicitud
- Sin instalación adicional requerida

---

### ⭐ Sistema de Valoraciones
- Valoración de 1 a 5 estrellas
- Comentarios opcionales
- Cálculo automático de rating promedio
- Restricción: una valoración por solicitud
- Visualización en perfil del voluntario

---

### 🎓 Sistema de Diplomas
- **Requisito**: completar 50 ayudas como voluntario
- Generación automática de certificado
- Número único de diploma (VTCH-YYYY-NNNNN)
- URL pública verificable (para LinkedIn)
- Impresión directa del diploma

---

### 🏆 Portal Principal (Dashboard)
- Resumen de actividad del usuario
- Leaderboard de mejores voluntarios
- Actividad reciente de la comunidad
- Banners aleatorios motivacionales
- Navegación rápida a funcionalidades

---

## 🗃️ Base de Datos

### 📦 Tablas PostgreSQL

| Tabla | Contenido |
|-------|-----------|
| **usuario** | Credenciales, email, rating, avatar |
| **usuario_detalle** | Teléfono, dirección, ubicación (Point), es_voluntario |
| **solicitud** | Título, descripción, categoría, estado, ubicación |
| **mensaje** | Contenido, timestamp, chat de solicitud |
| **valoracion** | Puntuación, comentario, fecha |
| **diploma** | Certificado, estadísticas, URL pública |

### 📍 Extensión PostGIS
- Tipo de dato: `geography(Point, 4326)`
- Consultas espaciales: `ST_Distance`, `ST_DWithin`
- Sistema de referencia: WGS84

---

## 🧩 Arquitectura del Backend

### Controladores REST Principales

| Controlador | Endpoints |
|-------------|-----------|
| `/api/zonaUsuario` | Registro, login, 2FA, activación, recuperación |
| `/api/portal` | Funcionalidades autenticadas |
| `/api/portal/solicitudes` | CRUD de solicitudes, búsqueda por proximidad |
| `/api/portal/valoraciones` | Crear, obtener valoraciones |
| `/api/portal/diplomas` | Elegibilidad, generación, verificación pública |
| `/api/portal/perfil` | Actualizar datos, avatar, modo voluntario |

### 📡 WebSocket Topics
- `/topic/chat/{solicitudId}` - Mensajes de chat
- `/topic/invitacion-video/{solicitudId}` - Invitaciones a videollamada

---

## 🎨 Arquitectura del Frontend

### Componentes Principales

| Componente | Funcionalidad |
|------------|---------------|
| **Bienvenida** | Landing page, información del proyecto |
| **Portal** | Dashboard principal, estadísticas |
| **Solicitante** | Crear y gestionar solicitudes propias |
| **Voluntario** | Ver mapa, aceptar solicitudes |
| **Chat** | Mensajería en tiempo real con videollamadas |
| **Historial** | Solicitudes completadas, valoraciones |
| **Perfil** | Gestión de cuenta, modo voluntario |
| **Diplomas** | Progreso y generación de certificado |

### 🎨 Patrones de Diseño
- **Signals** para reactividad
- **Computed Signals** para valores derivados
- **Effects** para side-effects
- **toSignal** para integración con Observables
- **Sintaxis moderna**: `@if`, `@for`, `@switch`

---

## 🖥️ Instalación y Uso

### 📌 Requisitos Previos
- Node.js 18+
- Java 17+
- PostgreSQL 14+ con extensión PostGIS
- Maven 3.8+

---

### 🗄️ Base de Datos

```bash
# Crear base de datos PostgreSQL
psql -U postgres
CREATE DATABASE vecinotech;

# Habilitar extensión PostGIS
\c vecinotech
CREATE EXTENSION IF NOT EXISTS postgis;

# Las migraciones se ejecutan automáticamente con Flyway
# Archivos en: src/main/resources/db/migration/
```

---

## 📋 Migraciones de Base de Datos

El proyecto usa **Flyway** para versionado de la base de datos:

| Migración | Descripción |
|-----------|-------------|
| `V1__init.sql` | Tablas iniciales: usuario, rol, solicitud |
| `V2__fechas_alter.sql` | Ajustes de campos fecha |
| `V3__usuariodetalle_alter.sql` | Tabla usuario_detalle con ubicación |
| `V4__add_geolocation_support.sql` | Soporte completo PostGIS |
| `V5__fix_timestamp_defaults.sql` | Corrección de timestamps |
| `V6__add_chat_messages.sql` | Sistema de mensajería |
| `V7__add_ratings_system.sql` | Sistema de valoraciones |
| `V8__add_diplomas_table.sql` | Sistema de diplomas |

---

## 🌐 URLs y Endpoints Importantes

### Frontend
- **Landing**: `http://localhost:4200/vecinotech/home`
- **Portal**: `http://localhost:4200/portal`
- **Diplomas**: `http://localhost:4200/portal/diplomas`
- **Verificación pública**: `http://localhost:4200/diplomas/verify/{uuid}`

### Backend
- **Health Check**: `http://localhost:8080/api/health`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html` *(si está habilitado)*

--

## 📄 Licencia

Este proyecto es un **Trabajo de Fin de Grado (TFG)** desarrollado con fines académicos.

Todos los derechos reservados © 2025 Alejandro Nishiky

---

## 💙 ¡Gracias por usar VecinoTech!

*Conectando comunidades, un vecino a la vez.*

---

## 👨‍💻 Autor

**Alejandro Nishiky**  
Desarrollador Full Stack Junior

### 🔗 Contacto

📧 Email: alejo.nishiky@gmail.com  
💼 LinkedIn: [linkedin.com/in/alejandro-nishiky](https://www.linkedin.com/in/alejandro-nishiky)  
🐙 GitHub: [github.com/alejandro-nishiky](https://github.com/alejandro-nishiky)

---

*Versión 1.0.0 - Diciembre 2025*