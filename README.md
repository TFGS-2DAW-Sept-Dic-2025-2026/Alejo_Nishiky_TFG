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
| **jsPDF** | 3.0.4 | Generación de PDFs en cliente |
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

