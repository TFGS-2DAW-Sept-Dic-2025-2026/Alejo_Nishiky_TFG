![VecinoTech](./Images/VecinoTech_readme.png "This is a sample image.")
---
## 📋 Información del Proyecto


- **Autor:** Alejandro Nishiky
- **Año académico:** 2025/2026
- **Ciclo:** Desarrollo de Aplicaciones Web (DAW)
- **Centro:** IES Alonso de Avellaneda
- **Licencia:** MIT

---
## 📖 Tabla de Contenidos

1. [Introducción y Justificación](#1-introducción-y-justificación)
2. [Estudio de Viabilidad](#2-estudio-de-viabilidad)
3. [Análisis y Diseño](#3-análisis-y-diseño)
4. [Conclusiones](#4-conclusiones)
5. [Bibliografía](#5-bibliografía)
6. [Anexos](#6-anexos)

## 1. Introducción y Justificación

### 1.1. Descripción del Proyecto

**VecinoTech** es una plataforma web colaborativa que conecta a personas con diferentes niveles de conocimiento tecnológico, facilitando el intercambio de ayuda en el ámbito digital. Los usuarios con dificultades tecnológicas (solicitantes) reciben asistencia gratuita de voluntarios de su comunidad para resolver problemas cotidianos relacionados con la tecnología.

**Finalidad:** Reducir la brecha digital creando un puente entre generaciones y niveles de alfabetización digital, democratizando el acceso al conocimiento tecnológico sin barreras económicas ni desplazamientos.

**Objetivos principales:**
- **Sociales:** Facilitar la inclusión digital, fomentar la solidaridad entre vecinos y proporcionar asesoramiento tecnológico gratuito
- **Técnicos:** Desarrollar una aplicación full-stack con geolocalización, comunicación en tiempo real (chat/videollamadas) e interfaces diferenciadas por perfil
- **Educativos:** Demostrar competencias avanzadas en desarrollo web, bases de datos geoespaciales e integración de múltiples tecnologías

### 1.2. Motivación

Este proyecto nace de una **vocación de servicio** y el deseo de contribuir a la sociedad mediante la tecnología. Inspirado en **BeMyEyes** (aplicación que conecta personas con discapacidad visual con voluntarios) adapté este modelo de ayuda persona a persona al ámbito tecnológico.

**El problema:** La tecnología avanza a pasos agigantados, convirtiéndose en imprescindible para gestiones bancarias, citas médicas o comunicación familiar. Sin embargo, lo que para algunos es trivial (configurar email, instalar aplicaciones, usar videollamadas), para otros representa una barrera significativa. Muchas personas se sienten excluidas, frustradas o terminan pagando por resolver dudas simples.

**La solución:** VecinoTech ofrece asesoramiento gratuito, inmediato y sin desplazamientos. Un voluntario puede dedicar 10 minutos a ayudar con una configuración, y para esa persona puede significar la diferencia entre comunicarse con sus nietos o sentirse aislada.

Este proyecto refleja la convicción de que **la tecnología debe incluir, no excluir**. VecinoTech no es solo un ejercicio académico, es un compromiso con la inclusión digital y la solidaridad comunitaria.

---
## 2. Estudio de la Viabilidad

### 2.1. Viabilidad Económica

#### Estimación de Costos

**Estado actual (Desarrollo - TFG):**

El desarrollo del proyecto se ha realizado completamente en entorno local sin costes asociados:

| Recurso | Coste |
|---------|-------|
| Herramientas de desarrollo (VS Code, IntelliJ IDEA, Git) | 0€ |
| PostgreSQL + PostGIS | 0€ |
| Node.js, Angular CLI, Maven | 0€ |
| APIs externas (Nominatim, Jitsi Meet) | 0€ |
| Almacenamiento local de imágenes | 0€ |
| **Total inversión actual** | **0€** |

**Costos estimados para producción:**

Para un despliegue en producción con capacidad inicial de hasta 1000 usuarios activos:

| Recurso | Coste mensual | Coste anual |
|---------|---------------|-------------|
| Hosting VPS (2GB RAM, 50GB SSD) | 5-10€ | 60-120€ |
| Dominio (.es o .com) | - | 10-15€ |
| Certificado SSL | 0€ (Let's Encrypt) | 0€ |
| Mailjet (plan gratuito: 6000 emails/mes) | 0€ | 0€ |
| Base de datos PostgreSQL (incluida en VPS) | 0€ | 0€ |
| Backup y mantenimiento | 2-5€ | 24-60€ |
| **Total estimado** | **7-15€/mes** | **94-195€/año** |

**Costos escalables (>1000 usuarios):**

- VPS de mayor capacidad: 15-30€/mes
- CDN para imágenes (Cloudinary, plan gratuito inicial): 0-20€/mes
- Plan de emails superior: 10-25€/mes
- **Total escalado:** 25-75€/mes (300-900€/año)

#### Retorno de la Inversión (ROI)

**Modelo de negocio:** VecinoTech está concebido como un proyecto **100% gratuito y sin ánimo de lucro**, orientado al impacto social más que al beneficio económico.

**Posibles fuentes de financiación futura:**

1. **Donaciones voluntarias**
   - Sistema de donaciones opcionales de usuarios satisfechos
   - Crowdfunding (Kickstarter, Patreon, GoFundMe)

2. **Subvenciones y ayudas públicas**
   - Ayuntamientos interesados en inclusión digital
   - Programas de innovación social
   - Fondos europeos para brecha digital

3. **Patrocinios corporativos**
   - Empresas tecnológicas con programas de RSC
   - Operadoras de telecomunicaciones
   - Organizaciones sin ánimo de lucro

**Análisis de ROI:**

Dado el **carácter social del proyecto**, el retorno de inversión no se mide en términos puramente económicos:

| Tipo de ROI | Descripción |
|-------------|-------------|
| **ROI Económico** | Recuperación de costes básicos (100-200€/año) mediante donaciones: **12-24 meses** |
| **ROI Social** | Impacto en reducción de brecha digital: **Inmediato** desde el primer usuario ayudado |
| **ROI Educativo** | Valor del aprendizaje técnico adquirido: **Incalculable** para desarrollo profesional |

**Conclusión de viabilidad económica:**

El proyecto es **económicamente viable** con una inversión mínima (<200€/año) que puede ser cubierta mediante donaciones voluntarias o microfinanciación. El verdadero valor de VecinoTech reside en su **impacto social**, generando un retorno intangible pero significativo en forma de inclusión digital y fortalecimiento comunitario.

La sostenibilidad a largo plazo no depende de generar beneficios, sino de mantener costes controlados y construir una comunidad comprometida con la misión del proyecto.

---
### 2.2. Viabilidad Legal

#### Cumplimiento Normativo

**Estado actual (Entorno TFG - Local):**

El proyecto se encuentra en fase de desarrollo académico en entorno local. Para un despliegue en producción será necesario implementar la siguiente documentación legal:

**Normativa aplicable:**

**Implementación actual del RGPD:**

✅ **Cumplido:**
- Autenticación segura con contraseñas hasheadas (BCrypt)
- Los usuarios pueden eliminar su cuenta y datos asociados (derecho al olvido)
- Almacenamiento seguro de datos personales
- Verificación por email (consentimiento implícito)

❌ **Pendiente para producción:**
- Política de Privacidad formal
- Términos y Condiciones de uso
- Aviso Legal
- Banner de consentimiento de cookies

**Datos personales procesados:**

La plataforma recopila y procesa los siguientes datos:
- Información de registro: nombre, apellidos, email, contraseña (hasheada)
- Ubicación: dirección postal y coordenadas geográficas
- Imagen de perfil (opcional)
- Mensajes de chat (almacenados localmente)
- Historial de solicitudes y ayudas prestadas

#### Licencias de Software Utilizadas

**Todas las herramientas y librerías empleadas son de código abierto y permiten uso comercial:**

**Frontend (Angular):**
- Licencias **Apache 2.0 y License MIT**

**Backend (Spring Boot):**
- Licencias **Apache 2.0, License MIT** y **GPL 2.0 - 2.1**


**APIs Externas:**
- Nominatim (OpenStreetMap): **ODbL (Open Database License)** ✅
- Jitsi Meet: **Apache 2.0** ✅
- Mailjet: **Servicio comercial con plan gratuito** ✅

**Herramientas de desarrollo:**
- VS Code: **MIT License** ✅
- IntelliJ IDEA: **Licencia no-comercial** (licencia educativa)
- Git: **GPL v2** ✅
- pgAdmin: **PostgreSQL License** ✅

#### Propiedad Intelectual

**Código fuente:**
- ✅ El código de VecinoTech es de código abierto y desarrollado íntegramente por el autor

**Recursos visuales:**
- ✅ Imágenes obtenidas de **Pexels** y **Pixabay** (licencias libres de derechos)
- ✅ Diseño de interfaces creado con **Figma** y **Canva**
- ✅ Iconos de **Font Awesome** (licencia gratuita)

**Licencia del proyecto:**

VecinoTech se distribuirá bajo **MIT License**, una de las licencias de código abierto más permisivas:

```
MIT License

Copyright (c) 2025 Alejandro Nishiky
Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
de este software y archivos de documentación asociados, para utilizar el software
sin restricción, incluyendo sin limitación los derechos a usar, copiar, modificar,
fusionar, publicar, distribuir, sublicenciar y/o vender copias del software.
```

El cumplimiento legal completo es **alcanzable** con tiempo y recursos moderados, sin obstáculos significativos que impidan el despliegue en producción.

---

### 2.3. Viabilidad de Tiempo o Cronograma

#### Planificación del Proyecto

**Duración total:** 4 meses (Agosto - Diciembre 2024)

El proyecto se organizó en fases iterativas, combinando análisis, diseño y desarrollo de forma incremental:

| Fase | Duración | Periodo | Actividades principales |
|------|----------|---------|------------------------|
| **1. Análisis y Diseño** | 2 semanas | Septiembre | Definición de requisitos, diseño de interfaces (Figma), modelo de datos, arquitectura del sistema |
| **2. Desarrollo Backend** | 5 semanas | Sept - Oct | Spring Boot, PostgreSQL + PostGIS, autenticación JWT, API REST, migraciones Flyway |
| **3. Desarrollo Frontend** | 5 semanas | Oct - Nov | Angular 19 standalone components, integración de mapas (Leaflet), servicios HTTP, guards e interceptors |
| **4. Funcionalidades Avanzadas** | 3 semanas | Noviembre | WebSocket/STOMP (chat), geocodificación (Nominatim), videollamadas (Jitsi), sistema de diplomas |
| **5. Documentación** | 1 semana | Diciembre | Memoria TFG, README, comentarios, guías de instalación |

**Metodología aplicada:**

- **Gestión de tareas:** Tablero Kanban en **Notion**
- **Control de versiones:** Git con commits frecuentes
- **Desarrollo iterativo:** Funcionalidades implementadas en sprints de 1-2 semanas
- **Testing:** Validación manual continua durante el desarrollo

#### Desviaciones Respecto a la Planificación Inicial

**Tareas que tardaron más de lo esperado:**

| Funcionalidad | Tiempo estimado | Tiempo real | Desviación | Motivo |
|---------------|----------------|-------------|------------|--------|
| **Integración WebSocket/STOMP** | 1 semana | 2 semanas | +100% | Complejidad de configuración en Spring Boot, sincronización de mensajes en tiempo real, gestión de usuarios conectados |
| **PostGIS y consultas geoespaciales** | 3 días | 1.5 semanas | +250% | Tecnología nueva no vista en el ciclo, curva de aprendizaje de funciones espaciales (ST_Distance), integración con Hibernate Spatial |
| **Geocodificación con Nominatim** | 2 días | 1 semana | +250% | Problemas con HttpURLConnection, investigación de API REST correcta, ajuste de formato para direcciones españolas |

**Tareas más rápidas de lo esperado:**

| Funcionalidad | Tiempo estimado | Tiempo real | Motivo |
|---------------|----------------|-------------|--------|
| **Videollamadas Jitsi** | 1 semana | 2 días | Integración sencilla mediante iframe, sin necesidad de autenticación externa |
| **Sistema de diplomas** | 1 semana | 3 días | Generación automática simple basada en plantilla, lógica de negocio directa |

---
**Funcionalidades descartadas o no completadas:**

Por limitaciones de tiempo y priorización de funcionalidades core, se descartaron:

- ❌ **Notificaciones push** en tiempo real
- ❌ **Panel de administración** para moderadores
- ❌ **Sistema de reportes/denuncias** de usuarios
- ❌ **Estadísticas avanzadas** y analytics completos
- ❌ **Sistema de valoraciones completo** (implementación básica únicamente)

Estas funcionalidades quedan documentadas como **mejoras futuras** del proyecto.
---
## 3. Análisis y Diseño del Proyecto

### 3.1. Descripción de la Arquitectura Web

VecinoTech implementa una arquitectura **SPA (Single Page Application)** con separación completa entre cliente y servidor, siguiendo el patrón **Cliente-Servidor** con comunicación mediante API REST y WebSocket.

#### Tipo de Arquitectura: SPA + API REST

**Frontend (Cliente):**
- **Angular 19 SPA** con routing del lado del cliente
- Componentes standalone con signals para reactividad
- Comunicación con backend mediante:
  - HTTP Client para API REST (operaciones CRUD)
  - STOMP sobre WebSocket para chat en tiempo real

**Backend (Servidor):**
- **Spring Boot** como API REST pura (sin renderizado de vistas)
- Arquitectura en capas (Layered Architecture):
  - Controller → Service → Repository → Database
- Patrón MVC adaptado: solo Modelo y Controlador, sin Vista

#### Arquitectura Frontend (Angular 19)

**Organización por funcionalidad:**

```
src/app/
├── components/
│   ├── bienvenida/          # Zona pública (home, landing)
│   ├── zonaUsuario/         # Autenticación (login, registro, activación)
│   └── zonaPortal/          # Zona privada (solicitantes y voluntarios)
│       ├── solicitanteComponent/
│       ├── voluntarioComponent/
│       ├── chat/
│       ├── perfil/
│       └── historial/
├── services/                # Lógica de negocio
│   ├── auth.service.ts
│   ├── chat.service.ts
│   ├── rest-portal.service.ts
│   └── ...
├── guards/                  # Protección de rutas
│   └── auth.guard.ts
├── interceptors/            # Manejo automático de tokens JWT
│   └── auth.interceptor.ts
├── models/                  # Interfaces TypeScript
└── pipes/                   # Transformaciones de datos
```

**Características clave:**
- ✅ Componentes standalone (sin módulos NgModule)
- ✅ Signals para estado reactivo
- ✅ Guards para rutas protegidas (`AuthGuard`)
- ✅ Interceptores HTTP para inyectar tokens JWT automáticamente
- ✅ Servicios inyectables para comunicación con backend

#### Arquitectura Backend (Spring Boot)

**Patrón en capas:**

```
src/main/java/es/daw/vecinotechbackend/
├── controller/              # Capa de presentación (API endpoints)
│   ├── ZonaUsuarioController.java
│   ├── ZonaPortalController.java
│   ├── ChatController.java
│   ├── DiplomaController.java
│   └── ValoracionController.java
├── service/                 # Capa de lógica de negocio
│   ├── PortalService.java
│   ├── ChatService.java
│   ├── GeocodeService.java
│   ├── MailService.java
│   └── ...
├── repository/              # Capa de acceso a datos (JPA)
│   ├── UsuarioRepository.java
│   ├── SolicitudRepository.java
│   └── ...
├── entity/                  # Modelos del dominio (tablas BD)
│   ├── Usuario.java
│   ├── Solicitud.java
│   └── ...
├── dto/                     # Objetos de transferencia de datos
├── mapper/                  # Transformación Entity ↔ DTO (MapStruct)
├── security/                # Autenticación y autorización
│   ├── JwtUtils.java
│   ├── JwtAuthenticationFilter.java
│   └── SecurityConfig.java
└── config/                  # Configuración del framework
    ├── SecurityConfig.java
    ├── WebSocketConfig.java
    └── WebConfig.java
```

**Flujo de una petición típica:**

```
1. Cliente (Angular) → HTTP Request
2. Controller recibe petición → valida entrada
3. Controller llama a Service
4. Service ejecuta lógica de negocio
5. Service usa Repository para acceder a BD
6. Repository (JPA) ejecuta query en PostgreSQL
7. Datos retornan como Entity
8. Mapper convierte Entity → DTO
9. Controller devuelve DTO como JSON
10. Cliente recibe respuesta
```

#### Base de Datos

**PostgreSQL 17 + PostGIS:**
- Sistema relacional normalizado
- Extensión PostGIS para datos geoespaciales
- Migraciones gestionadas con Flyway

![VecinoTech DB](./Images/db_view.png "This is a sample image.")

#### Comunicación Entre Componentes

**1. API REST (HTTP):**
- **Base URL:** `http://localhost:8080/api`
- **Formato:** JSON
- **Autenticación:** Bearer Token (JWT en header `Authorization`)
- **Endpoints principales:**
  - `/api/zonaUsuario/*` - Autenticación
  - `/api/portal/*` - Gestión de solicitudes y perfiles
  - `/api/portal/chat/*` - Mensajería

**2. WebSocket (Tiempo Real):**
- **Protocolo:** STOMP sobre SockJS
- **URL WebSocket:** `http://localhost:8080/ws`
- **Canales:**
  - `/topic/chat/{solicitudId}` - Chat de solicitud específica
  - `/topic/notificaciones/{usuarioId}` - Notificaciones personales
- **Uso:** Chat en tiempo real, notificaciones de conexión/desconexión

#### Seguridad

**Autenticación JWT:**
- Login → Backend genera token JWT
- Token almacenado en LocalStorage (frontend)
- Interceptor Angular inyecta token en todas las peticiones
- Backend valida token en cada request mediante `JwtAuthenticationFilter`

**Verificación por Email (2FA):**
- Registro → Backend envía email con enlace de activación
- Usuario confirma → Cuenta habilitada
- Servicio: JavaMailSender + Mailjet API

**CORS:**
- Configurado en `WebConfig` y `SecurityConfig`
- Permite peticiones desde `http://localhost:4200` (desarrollo)

---

### 3.2. Tecnologías y Herramientas Utilizadas

#### Frontend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Angular** | 19.2.0 | Framework principal para SPA, standalone components, signals |
| **TypeScript** | 5.7.2 | Lenguaje de programación tipado |
| **Tailwind CSS** | 4.1.13 | Framework de estilos utility-first |
| **Leaflet** | 1.9.4 | Biblioteca de mapas interactivos con OpenStreetMap |
| **SweetAlert2** | 11.26.4 | Modales y alertas personalizadas |
| **STOMP.js** | 7.2.1 | Cliente WebSocket para comunicación en tiempo real |
| **SockJS-client** | 1.6.1 | Fallback para WebSocket en navegadores antiguos |
| **RxJS** | 7.8.0 | Programación reactiva con Observables |
| **Font Awesome** | 7.0.0 | Iconos vectoriales |
| **html2canvas** | 1.4.1 | Captura de elementos HTML para diplomas |
| **CountUp.js** | 2.9.0 | Animaciones de contadores numéricos |

#### Backend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Spring Boot** | 3.5.4 | Framework principal Java |
| **Java** | 21 | Lenguaje de programación |
| **Spring Security** | 3.5.4 | Autenticación y autorización |
| **Spring Data JPA** | 3.5.4 | Persistencia de datos con Hibernate |
| **Spring WebSocket** | 3.5.4 | Comunicación bidireccional en tiempo real |
| **Hibernate** | 6.x | ORM (Object-Relational Mapping) |
| **Hibernate Spatial** | 6.x | Soporte para tipos geométricos PostGIS |
| **Flyway** | 10.x | Migraciones de base de datos versionadas |
| **MapStruct** | 1.5.5 | Mapeo automático Entity ↔ DTO |
| **Lombok** | - | Reducción de código boilerplate (getters, setters) |
| **JJWT** | 0.12.6 | Generación y validación de tokens JWT |
| **JavaMailSender** | 3.5.4 | Envío de correos electrónicos |
| **Mailjet Client** | 6.0.0 | Cliente API de Mailjet para emails |
| **Maven** | 3.x | Gestión de dependencias y construcción |

#### Base de Datos

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **PostgreSQL** | 17 | Sistema de gestión de base de datos relacional |
| **PostGIS** | 3.x | Extensión geoespacial para consultas de proximidad |
| **pgAdmin** | 8.1.4 | Herramienta de administración de PostgreSQL |
| **DBeaver** | - | Cliente universal de bases de datos (alternativa) |

#### APIs Externas

| Servicio | Propósito | Plan |
|----------|-----------|------|
| **Nominatim (OpenStreetMap)** | Geocodificación de direcciones españolas | Gratuito |
| **Jitsi Meet** (meet.guifi.net) | Videollamadas sin autenticación | Gratuito |
| **Mailjet** | Envío de emails de verificación (2FA) | Plan gratuito (6000 emails/mes) |

#### Integración y Pruebas

| Herramienta | Uso |
|-------------|-----|
| **Postman** | Testing manual de endpoints REST |
| **Thunder Client** | Alternativa a Postman integrada en VS Code |
| **Navegador DevTools** | Depuración de frontend, inspección de network |

#### Seguridad

| Tecnología | Implementación |
|------------|----------------|
| **BCrypt** | Hashing de contraseñas (incluido en Spring Security) |
| **JWT** | Autenticación stateless con tokens |
| **CORS** | Configurado en `SecurityConfig` y `WebConfig` |
| **HTTPS** | Pendiente para producción (Let's Encrypt) |

#### Despliegue y Hosting

| Categoría | Estado actual | Futuro |
|-----------|---------------|--------|
| **Entorno** | Desarrollo local | VPS (Railway, Render, DigitalOcean) |
| **Frontend** | `ng serve` (Puerto 4200) | Nginx + build estático |
| **Backend** | `mvn spring-boot:run` (Puerto 8080) | JAR ejecutable |
| **Base de datos** | PostgreSQL local | PostgreSQL en servidor |
| **Dominio** | localhost | Dominio .es o .com |

#### Otras Herramientas

**Desarrollo:**
- **VS Code**: Editor de código para frontend (Angular, TypeScript)
- **IntelliJ IDEA**: IDE para backend (Spring Boot, Java)
- **Git**: Control de versiones
- **GitHub**: Repositorio remoto

**Diseño:**
- **Figma**: Diseño de interfaces y prototipos
- **Canva**: Recursos gráficos y branding
- **Pexels/Pixabay**: Imágenes libres de derechos

**Gestión de proyecto:**
- **Notion**: Tablero Kanban, documentación, notas
- **Markdown**: Formato de documentación (README, guías)

#### Stack Tecnológico Resumido

```
┌─────────────────────────────────────────┐
│           FRONTEND (Cliente)            │
│  Angular 19 + TypeScript + Tailwind     │
│  Leaflet + SweetAlert2 + STOMP.js       │
└─────────────┬───────────────────────────┘
              │ HTTP REST + WebSocket
┌─────────────▼───────────────────────────┐
│           BACKEND (Servidor)            │
│  Spring Boot 3.5 + Java 21              │
│  Spring Security + JWT + WebSocket      │
└─────────────┬───────────────────────────┘
              │ JPA/Hibernate + PostGIS
┌─────────────▼───────────────────────────┐
│         BASE DE DATOS                   │
│  PostgreSQL 17 + PostGIS                │
└─────────────────────────────────────────┘

       APIs Externas:
       - Nominatim (Geocoding)
       - Jitsi Meet (Video)
       - Mailjet (Email)
```

### 3.3. Análisis de Usuarios (Perfiles de Usuario)

VecinoTech diferencia dos perfiles de usuario con necesidades y capacidades tecnológicas distintas, adaptando la interfaz según el rol.

#### 1. Solicitante (Requester)

**Perfil:** Personas con conocimientos tecnológicos básicos o limitados. Pueden navegar por internet pero encuentran barreras con tareas más complejas. Incluye adultos mayores con experiencia mínima en tecnología.

**Funcionalidades:**
- Crear solicitudes de ayuda (título, descripción, ubicación)
- Ver voluntarios disponibles en mapa
- Chat en tiempo real con voluntario asignado
- Videollamadas mediante enlace simple
- Historial de solicitudes

**Interfaz:** Diseño minimalista, botones grandes, navegación simplificada (3-4 opciones), formularios básicos con validación clara.

---

#### 2. Voluntario (Volunteer)

**Perfil:** Personas con conocimientos tecnológicos medios-avanzados, cualquier edad, con vocación de servicio y tiempo disponible para ayudar a su comunidad.

**Funcionalidades:**
- Ver mapa interactivo de solicitudes activas
- Aceptar y gestionar solicitudes por proximidad
- Chat y videollamadas con solicitantes
- Marcar solicitudes como completadas
- Generar diplomas automáticos (enlace público para LinkedIn)
- Dashboard con estadísticas personales
- Leaderboard de voluntarios más activos

**Interfaz:** Completa y funcional, dashboard con métricas, mapa central con marcadores, más opciones de navegación (6-8 opciones).

---

#### Diferenciación de Experiencia

| Característica | Solicitante | Voluntario |
|----------------|-------------|------------|
| **Complejidad UI** | Minimalista | Completa |
| **Navegación** | 3-4 opciones | 6-8 opciones |
| **Dashboard** | No | Sí (estadísticas) |
| **Mapa** | Vista simple | Vista completa con gestión |
| **Diplomas** | No | Sí (generación y visualización) |
| **Leaderboard** | No | Sí |

**Diseño UX:** Para solicitantes se evita jerga técnica, se minimiza pasos y se usa lenguaje empático. Para voluntarios se facilita descubrimiento rápido de solicitudes y se incorpora gamificación moderada (diplomas, ranking).

---

### 3.4. Requisitos Funcionales y No Funcionales

#### Requisitos Funcionales

**Autenticación y Gestión de Usuarios:**
- RF1: Registro de usuarios con rol (Solicitante/Voluntario)
- RF2: Verificación de cuenta por email (2FA)
- RF3: Login con JWT y sesión persistente
- RF4: Gestión de perfil (editar datos, cambiar avatar)

**Gestión de Solicitudes:**
- RF5: Crear solicitudes con título, descripción y ubicación
- RF6: Geocodificación automática de direcciones (Nominatim API)
- RF7: Visualización de solicitudes en mapa interactivo (Leaflet)
- RF8: Filtrado por proximidad geográfica (PostGIS)
- RF9: Aceptar solicitudes (solo voluntarios)
- RF10: Marcar solicitudes como completadas
- RF11: Ver historial de solicitudes (propias o aceptadas)

**Comunicación:**
- RF12: Chat en tiempo real mediante WebSocket/STOMP
- RF13: Historial de mensajes persistente
- RF14: Notificaciones de conexión/desconexión de usuarios
- RF15: Videollamadas integradas (Jitsi Meet)

**Sistema de Diplomas:**
- RF16: Generación automática de diplomas al completar ayuda
- RF17: Visualización de diplomas obtenidos
- RF18: Enlace público de diploma para compartir (LinkedIn)
- RF19: Opción de impresión de diplomas

**Estadísticas y Gamificación:**
- RF20: Dashboard con métricas personales (voluntarios)
- RF21: Leaderboard de voluntarios más activos
- RF22: Contador de ayudas prestadas/recibidas

#### Requisitos No Funcionales

**Rendimiento:**
- RNF1: Tiempo de respuesta de API REST < 2 segundos
- RNF2: Carga de mapa con marcadores < 3 segundos
- RNF3: Latencia de chat en tiempo real < 500ms

**Usabilidad:**
- RNF4: Interfaz responsive (móvil, tablet, desktop)
- RNF5: Navegación intuitiva diferenciada por perfil de usuario
- RNF6: Mensajes de error claros y comprensibles
- RNF7: Confirmaciones visuales de acciones importantes (SweetAlert2)

**Seguridad:**
- RNF8: Contraseñas hasheadas con BCrypt
- RNF9: Autenticación mediante tokens JWT
- RNF10: Protección CORS configurada
- RNF11: Validación de entrada en backend (Spring Validation)
- RNF12: HTTPS obligatorio en producción

**Compatibilidad:**
- RNF13: Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- RNF14: Responsive design para pantallas desde 320px hasta 1920px

**Escalabilidad:**
- RNF15: Arquitectura preparada para crecimiento horizontal
- RNF16: Base de datos PostgreSQL optimizada con índices
- RNF17: Consultas geoespaciales eficientes con PostGIS

**Disponibilidad:**
- RNF18: Sistema de migraciones Flyway para actualizaciones sin downtime
- RNF19: Manejo de errores con mensajes al usuario (sin crashes)

---

## 3.6. Organización de la Lógica de Negocio

### Arquitectura Backend (Spring Boot)

VecinoTech sigue una **arquitectura en capas (Layered Architecture)** que separa responsabilidades:

#### Capas del Backend

**1. Controller (Presentación):**
- `ZonaUsuarioController`: Autenticación (registro, login, activación)
- `ZonaPortalController`: Gestión de solicitudes, perfiles, imágenes
- `ChatController`: WebSocket endpoints para chat en tiempo real
- `DiplomaController`: Generación y visualización de diplomas
- `ValoracionController`: Sistema de valoraciones

**2. Service (Lógica de Negocio):**
- `PortalService`: Gestión de solicitudes, búsqueda geoespacial (PostGIS)
- `ChatService`: Persistencia de mensajes, notificaciones
- `GeocodeService`: Geocodificación con Nominatim API
- `MailService`: Envío de emails de verificación (Mailjet)
- `DiplomaService`: Generación automática de diplomas
- `FileStorageService`: Almacenamiento local de imágenes de perfil
- `ValoracionService`: Sistema de valoraciones entre usuarios

**3. Repository (Acceso a Datos):**
- `UsuarioRepository`: Consultas sobre usuarios
- `UsuarioDetalleRepository`: Datos extendidos de usuario
- `SolicitudRepository`: Queries geoespaciales con PostGIS (ST_Distance)
- `MensajeRepository`: Persistencia de mensajes de chat
- `DiplomaRepository`: Gestión de diplomas generados
- `ValoracionRepository`: Sistema de valoraciones

**4. Entity (Modelo de Dominio):**
- `Usuario`: Autenticación, email, password, rol, habilitado
- `UsuarioDetalle`: Información extendida (nombre, dirección, Point PostGIS para ubicación, avatar)
- `Solicitud`: Solicitudes de ayuda (título, descripción, Point PostGIS, estado, fechas)
- `Mensaje`: Mensajes del chat (contenido, remitente, destinatario, solicitud)
- `Diploma`: Certificados generados (código único, voluntario, solicitud)
- `Valoracion`: Ratings entre usuarios
- `Rol`: Enum (USUARIO Y ADMIN para gestión de moderadores a futuro)

**5. DTO (Transferencia de Datos):**

DTOs organizados por dominio en subcarpetas:
- `dto/auth/`: LoginRequest, RegisterRequest, LoginResponse, VerifyAccountDTO
- `dto/usuario/`: UsuarioPerfilDTO, UsuarioInfoDTO, UsuarioDetalleDTO
- `dto/solicitud/`: CrearSolicitudRequest, SolicitudDTO, SolicitudMapaDTO
- `dto/chat/`: MensajeDTO, EnviarMensajeRequest, ChatNotificationDTO
- `dto/diploma/`: DiplomaDTO, DiplomaPublicoDTO
- `dto/valoracion/`: ValoracionDTO, CrearValoracionRequest
- `dto/`: ApiResponse, TicketResponse, VideoCallInviteDTO

**6. Mapper (Transformación Entity ↔ DTO):**
- `UsuarioMapper`
- `UsuarioDetalleMapper`
- `SolicitudMapper`
- `DiplomaMapper`
- `ValoracionMapper`
- `MensajeMapper`

Utiliza **MapStruct** para conversiones automáticas.

**7. Security (Autenticación/Autorización):**
- `JwtUtils`: Generación y validación de tokens JWT
- `JwtAuthenticationFilter`: Interceptor que valida tokens en cada petición
- `SecurityUtils`: Utilidades para obtener usuario autenticado del contexto
- `SecurityConfig`: Configuración de Spring Security (endpoints públicos/privados, CORS)

**8. Config (Configuración):**
- `SecurityConfig`: Spring Security + JWT
- `WebSocketConfig`: Configuración STOMP para chat
- `WebConfig`: Configuración CORS
- `GeometryConfig`: Configuración PostGIS para tipos geométricos

### Conexión con APIs y Servicios Externos

#### 1. Nominatim (OpenStreetMap API)
- **Propósito:** Geocodificación de direcciones españolas
- **URL:** `https://nominatim.openstreetmap.org/search`
- **Implementación:** `GeocodeService` con `HttpURLConnection`
- **Uso:** Convertir dirección textual → coordenadas (latitud, longitud)
- **Retorno:** JSON con campos `lat` y `lon`

#### 2. Jitsi Meet (meet.guifi.net)
- **Propósito:** Videollamadas sin autenticación externa
- **URL:** `https://meet.guifi.net/{roomName}`
- **Implementación:** Frontend (Angular) genera URL única basada en `solicitudId`
- **Integración:** Iframe embebido en componente de chat
- **Ventaja:** Acceso directo sin registro ni configuración adicional

#### 3. Mailjet API
- **Propósito:** Envío de emails de verificación (2FA)
- **Implementación:** `MailService` con librería `mailjet-client` (Java)
- **Configuración:** API Key y Secret en `application.properties`
- **Plan:** Gratuito (6000 emails/mes)
- **Uso:** Envío de enlaces de activación de cuenta

#### 4. PostgreSQL + PostGIS
- **Propósito:** Consultas geoespaciales para búsqueda por proximidad
- **Función clave:** `ST_Distance` para calcular distancias entre coordenadas
- **Tipo de dato:** `Point` (geometría PostGIS) en campos `ubicacion`
- **SRID:** 4326 (sistema de coordenadas WGS 84)
- **Implementación:** Queries nativas en `SolicitudRepository` con anotación `@Query`

**Ejemplo de query geoespacial:**
```sql
SELECT * FROM solicitud 
WHERE ST_Distance(ubicacion, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) < :radioMetros
ORDER BY ST_Distance(ubicacion, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))
```

---

## 3.7. Modelo de Datos Simplificado

VecinoTech utiliza una **base de datos relacional PostgreSQL 17** con extensión **PostGIS** para datos geoespaciales.

### Entidades Principales

#### Usuario
Información de autenticación y rol.

**Atributos clave:**
- `id` (PK)
- `email` (único)
- `password` (hasheado con BCrypt)
- `rol` (SOLICITANTE | VOLUNTARIO)
- `habilitado` (Boolean - activación por email)
- `fecha_registro`

**Relaciones:**
- 1:1 con `UsuarioDetalle`
- 1:N con `Solicitud` (como solicitante)
- 1:N con `Solicitud` (como voluntario)
- 1:N con `Mensaje`
- 1:N con `Diploma`
- 1:N con `Valoracion`

---

#### UsuarioDetalle
Información extendida del perfil.

**Atributos clave:**
- `id` (PK)
- `usuario_id` (FK → Usuario)
- `nombre`, `apellidos`
- `direccion`, `codigo_postal`
- `ubicacion` (**Point PostGIS** - coordenadas)
- `avatar` (ruta de imagen)
- `telefono`

---

#### Solicitud
Peticiones de ayuda tecnológica.

**Atributos clave:**
- `id` (PK)
- `titulo`, `descripcion`
- `ubicacion` (**Point PostGIS** - coordenadas)
- `direccion` (texto)
- `estado` (PENDIENTE | EN_PROGRESO | COMPLETADA | CANCELADA)
- `fecha_creacion`, `fecha_asignacion`, `fecha_completada`
- `solicitante_id` (FK → Usuario)
- `voluntario_id` (FK → Usuario, nullable)

**Relaciones:**
- N:1 con `Usuario` (solicitante)
- N:1 con `Usuario` (voluntario, opcional)
- 1:N con `Mensaje`
- 1:1 con `Diploma`
- 1:1 con `Valoracion`

---

#### Mensaje
Chat en tiempo real.

**Atributos clave:**
- `id` (PK)
- `contenido`
- `fecha_envio`
- `remitente_id` (FK → Usuario)
- `destinatario_id` (FK → Usuario)
- `solicitud_id` (FK → Solicitud)
- `leido` (Boolean)

---

#### Diploma
Certificados automáticos al completar ayuda.

**Atributos clave:**
- `id` (PK)
- `codigo_diploma` (String único - para enlace público)
- `fecha_emision`
- `voluntario_id` (FK → Usuario)
- `solicitud_id` (FK → Solicitud)
- `nombre_solicitante`
- `titulo_solicitud`

---

#### Valoracion
Sistema de valoraciones entre usuarios.

**Atributos clave:**
- `id` (PK)
- `puntuacion` (1-5)
- `comentario`
- `fecha_valoracion`
- `valorador_id` (FK → Usuario)
- `valorado_id` (FK → Usuario)
- `solicitud_id` (FK → Solicitud)

---

### Diagrama de Relaciones

```
Usuario (1) ←→ (1) UsuarioDetalle
   |
   ├─ (1:N) Solicitud (como solicitante)
   ├─ (1:N) Solicitud (como voluntario)
   ├─ (1:N) Mensaje
   ├─ (1:N) Diploma
   └─ (1:N) Valoracion

Solicitud
   ├─ (N:1) Usuario (solicitante)
   ├─ (N:1) Usuario (voluntario, nullable)
   ├─ (1:N) Mensaje
   ├─ (1:1) Diploma
   └─ (1:1) Valoracion
```

### Características PostGIS

**Tipo geométrico:** `Point` (SRID 4326 - WGS 84)

**Entidades con geolocalización:**
- `UsuarioDetalle.ubicacion` → Ubicación del usuario
- `Solicitud.ubicacion` → Ubicación donde se requiere ayuda

**Consultas geoespaciales:**
- `ST_Distance`: Calcular distancia entre puntos
- `ST_SetSRID`: Establecer sistema de coordenadas
- `ST_MakePoint`: Crear punto desde coordenadas

**Ventaja:** Búsqueda eficiente de solicitudes por proximidad al voluntario.

### Migraciones con Flyway

Las migraciones están en `src/main/resources/db/migration/`:
- Versionadas (V1, V2, V3...)
- Se ejecutan automáticamente al iniciar Spring Boot
- Garantizan consistencia de esquema entre entornos

---

## 4. Conclusiones

### 4.1. Resultados Obtenidos y Cumplimiento de Objetivos

VecinoTech ha cumplido satisfactoriamente los objetivos planteados, logrando crear una **plataforma funcional y completa** que conecta personas con diferentes niveles de conocimiento tecnológico.

**Objetivos técnicos alcanzados:**
- Arquitectura full-stack con Angular 19 y Spring Boot
- Autenticación segura JWT + verificación email (2FA)
- Geolocalización con Leaflet y PostGIS
- Chat en tiempo real (WebSocket/STOMP)
- Videollamadas integradas (Jitsi Meet)
- Sistema automático de diplomas
- Interfaz responsive diferenciada por perfil

**Objetivos de impacto social:**

VecinoTech representa una **contribución real al problema de la brecha digital**. La plataforma está diseñada con interfaces simples para personas con conocimientos básicos, demostrando que la tecnología puede ser una herramienta de inclusión social cuando se diseña pensando en las personas.

**Funcionalidades descartadas** (por tiempo):
- Notificaciones push, panel de administración, sistema de reportes/denuncias, estadísticas avanzadas, integración con redes sociales

---

### 4.2. Retos Encontrados y Soluciones Implementadas

#### Integración de WebSocket/STOMP para Chat en Tiempo Real
**Reto:** Configuración de STOMP en Spring Boot, conexión del cliente Angular con WebSocket y **sincronización de mensajes en tiempo real** entre usuarios. El manejo de usuarios conectados/desconectados añadió complejidad adicional.

**Solución:** Arquitectura robusta con `ChatController` manejando endpoints WebSocket (`/app/chat.send`) y topics (`/topic/chat/{solicitudId}`). `ChatService` persiste mensajes mientras se transmiten en tiempo real, garantizando que no se pierdan datos. Configuración CORS específica para WebSocket fue crucial.

**Tiempo:** +100% sobre estimación inicial (2 semanas vs 1 semana)

---

#### PostGIS y Consultas Geoespaciales
**Reto:** Tecnología **completamente nueva no vista en el ciclo**. Comprender sistemas de referencia espacial (SRID), tipos geométricos (`Point`), y funciones espaciales (`ST_Distance`) requirió aprendizaje autodidacta. La complejidad de bases de datos relacionales combinada con operaciones geoespaciales supuso un reto doble.

**Solución:** Estudio de documentación oficial de PostGIS y ejemplos prácticos. Implementación de queries nativas en `SolicitudRepository` usando `ST_Distance` para búsquedas por proximidad. Configuración de `GeometryConfig` para que Hibernate reconociera tipos geométricos.

**Tiempo:** +250% sobre estimación (1.5 semanas vs 3 días)

---

#### Geocodificación con Nominatim API
**Reto:** Inicialmente se usaron métodos básicos de Java (`URL.openStream()`) que solo retornan `InputStream` sin manejar HTTP correctamente, resultando en **timeouts constantes**. Tras investigación en foros, se descubrió la necesidad de usar `HttpURLConnection` para gestionar headers, códigos de respuesta y parsear JSON. El formato de direcciones españolas requirió ajustes adicionales.

**Solución:** Implementación de `GeocodeService` con `HttpURLConnection` correctamente configurado, manejando códigos HTTP y parseando respuestas JSON manualmente. Lógica de fallback para casos sin resultados precisos.

**Tiempo:** +250% sobre estimación (1 semana vs 2 días)

---

#### Gestión del Tiempo y Presión de Plazos
**Reto no técnico:** Desarrollo individual con **plazos ajustados**, generando momentos de frustración. Tomar todas las decisiones técnicas sin equipo añadió presión adicional.

**Solución:** Metodología organizada con **Notion (Kanban)**, dividiendo el proyecto en sprints. Documentación continua (JSDoc) facilitó la memoria final. El compromiso con el impacto social fue la motivación principal.

---

### 4.3. Aprendizajes y Mejoras Futuras

#### Aprendizajes Técnicos

**Tecnologías aprendidas desde cero:**
- PostGIS y bases de datos geoespaciales
- WebSocket/STOMP para comunicación en tiempo real
- MapStruct para mapeo Entity ↔ DTO
- Leaflet para mapas interactivos
- Flyway para migraciones de base de datos

**Tecnologías reforzadas a nivel profesional:**
- Spring Boot 3: Arquitectura en capas, Spring Security, WebSocket
- Angular 19: Standalone components, signals, guards, interceptors
- PostgreSQL: Queries complejas, optimización, índices

#### Aprendizajes No Técnicos

Competencias desarrolladas más allá de lo técnico:
- **Planificación:** Organización de proyecto complejo en fases manejables
- **Autodisciplina:** Trabajo autónomo manteniendo motivación durante meses
- **Resolución de problemas:** Investigación profunda sin soluciones inmediatas
- **Toma de decisiones técnicas:** Selección de tecnologías y patrones sin equipo

**Mayor aprendizaje:** Descubrir que es posible llevar una idea desde cero hasta un producto funcional completo, superando obstáculos técnicos mediante investigación, persistencia y creatividad.

#### Mejoras Futuras

**Despliegue y producción:**
- Hosting en VPS (Railway, Render, DigitalOcean)
- Dominio propio (.es o .com)
- Certificado SSL (Let's Encrypt)
- Documentación legal completa (RGPD, Privacidad, Términos)

**Funcionalidades adicionales:**
- Sistema de valoraciones completo (ratings bidireccionales, reputación)
- Aplicación móvil nativa (React Native / Flutter)
- Multiidioma (español, catalán, inglés)
- Historial de chat persistente
- Aprendizaje en línea (cursos interactivos, tutoriales)
- Notificaciones push en tiempo real
- Panel de administración para moderación
- Sistema de reportes/denuncias
- Gamificación avanzada (badges, niveles, logros)
- Accesibilidad WCAG

**Optimizaciones técnicas:**
- Tests unitarios y de integración (JUnit, Jest, Cypress)
- Caché con Redis
- CI/CD con GitHub Actions
- Monitorización (Prometheus/Grafana)

---
## 5. Bibliografía y Fuentes de Información

### Documentación Oficial

**Frontend:**
- [Angular 19 - 20 Documentation(2025)](https://angular.dev)
- [Tailwind CSS Documentation. (2024)](https://tailwindcss.com/docs)
- [Leaflet Documentation. (2024)](https://leafletjs.com/reference.html)
- [SweetAlert2 Documentation. (2024)](https://sweetalert2.github.io)
- [STOMP.js Documentation. (2024)](https://stomp-js.github.io/stomp-websocket/)

**Backend:**
- [Spring Boot Documentation. (2024)](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security Documentation. (2024)](https://docs.spring.io/spring-security/reference/)
- [Spring Data JPA Documentation. (2024)](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Hibernate Documentation. (2024)](https://hibernate.org/orm/documentation/)
- [MapStruct Documentation. (2024)](https://mapstruct.org/documentation/stable/reference/html/)

**Base de Datos:**
- [PostgreSQL Documentation.](https://www.postgresql.org/docs/17/)
- [PostGIS Documentation. (2024)](https://postgis.net/documentation/)
- [Flyway Documentation. (2024)](https://flywaydb.org/documentation/)

**APIs Externas:**
- [Nominatim API Documentation. (2024)](https://nominatim.org/release-docs/develop/api/Overview/)
- [OpenStreetMap Documentation. (2024)](https://wiki.openstreetmap.org/)
- [Jitsi Meet Documentation. (2024)](https://jitsi.github.io/handbook/)
- [Mailjet API Documentation. (2024)](https://dev.mailjet.com/)

### Recursos de Aprendizaje

**Tutoriales y Guías:**
- [Real time Notification System: WebSocket | Spring Boot | Angular 2024](https://www.youtube.com/watch?v=Pulk8JrPPoA)
- [Javascript - Geolocation with Leaflet, Nominatim and Openstreetmap](https://www.youtube.com/watch?v=vOPr5k_SGVA)
- [Querying nominatim from Java class](https://help.openstreetmap.org/questions/67517/querying-nominatim-from-java-class/)
- [Leaflet - Docs](https://leafletjs.com/reference.html)
- [CountUp.js  2.9.0](https://inorganik.github.io/countUp.js/)


**Herramientas y Recursos:**
- [GitHub](https://github.com)
- [Notion. (2024)](https://www.notion.so)
- [Figma. (2024)](https://www.figma.com)
- [Canva. (2024)](https://www.canva.com)

### Recursos Visuales

- [Pexels](https://www.pexels.com)
- [Pixabay (2024)](https://pixabay.com)
- [Font Awesome](https://fontawesome.com)
- [Stitch AI powered by Google](stitch.withgoogle.com)


**Nota:** Todas las URLs fueron consultadas durante el periodo de desarrollo del proyecto (Agosto - Diciembre 2024). Las versiones específicas de las tecnologías utilizadas están documentadas en la sección 3.2.

---

## 6. Anexos

### 6.1. Guía de Instalación, Configuración y Despliegue

[Arquitectura del sistema](docs/guia_manual_vecinoTech.md)

---
### Reflexión Final

VecinoTech no es solo un proyecto académico, es una **herramienta con propósito social real**. La convicción de que la tecnología debe servir para incluir, no para excluir, fue el motor que impulsó este proyecto.

El camino no fue fácil: hubo bugs frustrantes, tecnologías desconocidas que aprender, y momentos de duda. Pero cada desafío superado reforzó la certeza de que **la programación es una herramienta poderosa para transformar ideas en realidad**.

VecinoTech está listo para su próxima fase: salir del entorno local y llegar a usuarios reales que puedan beneficiarse de él. El proyecto queda como testimonio de que la tecnología, cuando se diseña con empatía y vocación de servicio, puede tender puentes entre generaciones y democratizar el acceso al conocimiento digital.

---

