## 6. Anexos

### 6.1. Guía de Instalación, Configuración y Despliegue

#### Requisitos Previos

**Software necesario:**

| Software | Versión mínima | Versión utilizada |
|----------|----------------|-------------------|
| **Node.js** | 18.x | 20.17.0 |
| **npm** | 9.x | 10.8.2 |
| **Java JDK** | 17+ | 21 |
| **Maven** | 3.6+ | 3.x |
| **PostgreSQL** | 14+ | 17 |
| **pgAdmin** (opcional) | - | 8.1.4 |
| **Git** | 2.x | Última versión |

**Sistemas operativos compatibles:**
- Windows 10/11
- macOS (Big Sur o superior)
- Linux (Ubuntu 20.04+, Fedora, etc.)

---

#### Instalación Paso a Paso

**1. Clonar o descargar el proyecto**

```bash
# Si tienes el proyecto en GitHub
git clone https://github.com/tu-usuario/vecinotech.git
cd vecinotech

# O descomprimir los archivos ZIP proporcionados
# - frontend_vecinotech.zip
# - VecinoTech_spring.zip
```

---

**2. Configurar la Base de Datos**

**2.1. Instalar PostgreSQL**

- Descargar desde: https://www.postgresql.org/download/
- Instalar PostgreSQL (incluye pgAdmin)
- Durante la instalación, configurar contraseña para usuario `postgres`

**2.2. Crear la base de datos**

Abrir pgAdmin o terminal de PostgreSQL:

```sql
-- Conectar como usuario postgres
CREATE DATABASE vecinotech;

-- Conectar a la base de datos
\c vecinotech

-- Habilitar extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Verificar PostGIS:**
```sql
SELECT PostGIS_Version();
```

---

**3. Configurar el Backend (Spring Boot)**

**3.1. Navegar a la carpeta del backend**

```bash
cd VecinoTech_spring
```

**3.2. Configurar `application.properties`**

Editar el archivo: `src/main/resources/application.properties`

```properties
# Configuración básica
spring.application.name=VecinoTech-Backend
server.port=8080
app.frontend.base-url=http://localhost:4200
app.backend.base-url=http://localhost:8080

# Base de datos PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/vecinotech
spring.datasource.username=postgres
spring.datasource.password=TU_CONTRASEÑA_POSTGRESQL

# Mailjet (para envío de emails - usar tus propias credenciales)
mailjet.api.key=TU_MAILJET_API_KEY
mailjet.api.secret=TU_MAILJET_API_SECRET
mailjet.sender.email=tu-email@example.com
mailjet.sender.name=VecinoTech

# JWT (generar secrets seguros de al menos 32 caracteres)
jwt.issuer=VecinoTech
jwt.link.secret=TU_JWT_LINK_SECRET_MIN_32_CARACTERES
jwt.access.secret=TU_JWT_ACCESS_SECRET_MIN_32_CARACTERES
jwt.refresh.secret=TU_JWT_REFRESH_SECRET_MIN_32_CARACTERES

# Configuración de archivos
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
app.upload.dir=src/main/resources/static/avatars
```

**⚠️ IMPORTANTE - Obtener credenciales de Mailjet:**
1. Crear cuenta gratuita en https://www.mailjet.com
2. Ir a Account Settings → API Keys
3. Copiar API Key y Secret Key

**3.3. Instalar dependencias y compilar**

```bash
# Descargar dependencias Maven
mvn clean install

# O si usas el wrapper de Maven
./mvnw clean install
```

**3.4. Ejecutar el backend**

```bash
mvn spring-boot:run

# O con el wrapper
./mvnw spring-boot:run
```

**Verificar que está funcionando:**
- Debe mostrar: `Started VecinoTechBackendApplication in X seconds`
- API REST disponible en: http://localhost:8080
- WebSocket disponible en: http://localhost:8080/ws

**Las migraciones de Flyway se ejecutan automáticamente** al iniciar, creando todas las tablas necesarias.

---

**4. Configurar el Frontend (Angular)**

**4.1. Navegar a la carpeta del frontend**

```bash
cd frontend_vecinotech
# O si estás en la raíz del proyecto con el código descomprimido
```

**4.2. Instalar dependencias**

```bash
npm install
```

**Posibles errores comunes:**
- Si hay problemas con dependencias: `npm install --legacy-peer-deps`
- Si falla Tailwind: `npm install tailwindcss postcss --save-dev`

**4.3. Configurar URLs del Backend**

**Importante:** Las URLs del backend están hardcodeadas en los servicios. Si necesitas cambiar el puerto, edita estos archivos:

- `src/app/services/auth.service.ts` → líneas 14-15
- `src/app/services/chat.service.ts` → líneas 25-26
- `src/app/services/rest-portal.service.ts` → buscar `localhost:8080`

Cambiar `http://localhost:8080` por la URL deseada.

**4.4. Ejecutar el frontend**

```bash
ng serve

# O si prefieres especificar el puerto
ng serve --port 4200
```

**Verificar que está funcionando:**
- Debe mostrar: `Angular Live Development Server is listening on localhost:4200`
- Abrir navegador en: http://localhost:4200

---

#### Verificación de la Instalación

**Checklist completo:**

- [ ] PostgreSQL corriendo en puerto 5432
- [ ] Base de datos `vecinotech` creada
- [ ] Extensión PostGIS habilitada
- [ ] Backend Spring Boot corriendo en puerto 8080
- [ ] Frontend Angular corriendo en puerto 4200
- [ ] Puedes acceder a http://localhost:4200 en el navegador
- [ ] La página de inicio carga correctamente

**Prueba de funcionamiento básico:**

1. Abrir http://localhost:4200
2. Navegar a "Registro"
3. Crear una cuenta de prueba
4. Verificar que se envía el email de activación (revisar logs del backend)
5. Activar la cuenta manualmente en la base de datos (si no tienes Mailjet configurado):

```sql
UPDATE usuario SET habilitado = true WHERE email = 'tu-email@test.com';
```

6. Hacer login y acceder al portal

---

#### Solución de Problemas Comunes

**Backend no inicia:**
```
Error: Could not connect to database
Solución: Verificar que PostgreSQL está corriendo y las credenciales son correctas
```

**Frontend no compila:**
```
Error: Cannot find module 'tailwindcss'
Solución: npm install --legacy-peer-deps
```

**Error CORS en consola del navegador:**
```
Solución: Verificar que el backend tiene configurado CORS para http://localhost:4200
(Ya debería estar configurado en SecurityConfig.java)
```

**WebSocket no conecta:**
```
Solución: Verificar que el backend está corriendo y que la URL en chat.service.ts es correcta
```

**Las migraciones de Flyway fallan:**
```
Solución: Borrar la base de datos y volver a crearla desde cero
DROP DATABASE vecinotech;
CREATE DATABASE vecinotech;
```

---

### 6.2. Manual de Usuario

Este manual cubre los flujos principales para ambos tipos de usuario: **Solicitantes** y **Voluntarios**.

---

#### Registro y Activación de Cuenta

**Para todos los usuarios:**

1. **Acceder a la aplicación**
   - Abrir http://localhost:4200 en el navegador
   - Click en "Registro" o "Crear cuenta"

2. **Completar formulario de registro**
   - Nombre y apellidos
   - Email (único)
   - Contraseña (mínimo 6 caracteres)
   - Dirección completa
   - Código postal
   - Teléfono
   - Seleccionar rol: **Solicitante** o **Voluntario**

3. **Envío de email de verificación**
   - El sistema envía un email con enlace de activación
   - **Nota:** Si Mailjet no está configurado, activar manualmente en BD

4. **Activar cuenta**
   - Click en el enlace del email
   - O ejecutar en BD: `UPDATE usuario SET habilitado = true WHERE email = 'tu-email';`

5. **Iniciar sesión**
   - Email y contraseña
   - Acceso al portal según rol

---

#### Manual para Solicitantes

**Objetivo:** Pedir ayuda con problemas tecnológicos a voluntarios cercanos.

---

**1. Crear una solicitud de ayuda**

- Iniciar sesión como Solicitante
- Click en "Crear Solicitud" o botón "+"
- Completar formulario:
  - **Título:** Breve descripción (ej: "Ayuda con WhatsApp")
  - **Descripción:** Explicar el problema detalladamente
  - **Dirección:** Automáticamente cargada del perfil (editable)
- Click en "Enviar solicitud"
- La solicitud queda en estado **PENDIENTE**

**2. Esperar aceptación de un voluntario**

- Ver lista de solicitudes propias
- Estado cambia a **EN_PROGRESO** cuando un voluntario acepta
- Recibes notificación en la aplicación

**3. Comunicarse con el voluntario**

**Chat en tiempo real:**
- Click en "Ver detalles" de la solicitud aceptada
- Abrir pestaña "Chat"
- Escribir mensajes en tiempo real
- Ver indicador de usuario en línea

**Videollamada:**
- Dentro del chat, click en "Iniciar videollamada"
- Se abre ventana de Jitsi Meet
- Permitir acceso a cámara/micrófono si es necesario
- Compartir pantalla si el voluntario lo solicita

**4. Completar la solicitud**

- El **voluntario** marca la solicitud como completada
- Ver solicitud en historial con estado **COMPLETADA**
- Opcionalmente, dejar una valoración al voluntario

---

#### Manual para Voluntarios

**Objetivo:** Ayudar a personas con problemas tecnológicos en tu comunidad.

---

**1. Ver solicitudes disponibles**

- Iniciar sesión como Voluntario
- Ver mapa interactivo con marcadores
- Cada marcador representa una solicitud activa
- Click en marcador para ver detalles:
  - Título de la solicitud
  - Descripción del problema
  - Distancia aproximada
  - Nombre del solicitante

**2. Aceptar una solicitud**

- Seleccionar solicitud en el mapa
- Click en "Aceptar solicitud"
- La solicitud pasa a estado **EN_PROGRESO**
- Se notifica automáticamente al solicitante

**3. Comunicarse con el solicitante**

**Chat:**
- Acceder a "Mis Voluntariados" o "Solicitudes Activas"
- Click en la solicitud aceptada
- Usar chat en tiempo real para coordinar ayuda

**Videollamada:**
- Click en "Iniciar videollamada"
- Explicar solución paso a paso
- Usar compartir pantalla si es necesario

**4. Completar la solicitud**

- Una vez resuelto el problema, click en "Marcar como completada"
- Se genera automáticamente un **diploma digital**
- El diploma queda disponible en tu perfil

**5. Ver y compartir diplomas**

- Ir a "Perfil" → "Mis Diplomas"
- Ver lista de diplomas obtenidos
- Cada diploma tiene:
  - Código único
  - Fecha de emisión
  - Nombre del solicitante ayudado
  - Descripción de la ayuda prestada
- **Enlace público** para compartir en LinkedIn
- Opción de imprimir el diploma

**6. Ver estadísticas personales**

- Dashboard muestra:
  - Número total de ayudas prestadas
  - Solicitudes activas actuales
  - Ranking en el leaderboard
  - Últimas actividades

---

#### Gestión de Perfil (Ambos Roles)

**Editar perfil:**
- Click en tu nombre/avatar (esquina superior derecha)
- Seleccionar "Mi Perfil"
- Click en "Editar perfil"
- Modificar:
  - Foto de perfil (imagen JPG/PNG, máx 5MB)
  - Nombre y apellidos
  - Dirección
  - Teléfono
- Guardar cambios

**Cerrar sesión:**
- Click en tu nombre/avatar
- Seleccionar "Cerrar sesión"

---

#### Consejos de Uso

**Para Solicitantes:**
- Sé específico en la descripción del problema
- Incluye detalles: dispositivo, sistema operativo, error exacto
- Ten el dispositivo preparado cuando el voluntario acepte

**Para Voluntarios:**
- Revisa bien la descripción antes de aceptar
- Asegúrate de tener tiempo disponible
- Sé paciente y empático al explicar
- Usa videollamada si es más eficiente que chat

**Buenas prácticas de seguridad:**
- No compartas contraseñas personales
- No solicites información bancaria
- Reporta comportamientos inapropiados (futura funcionalidad)

---