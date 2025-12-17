# Guía Rápida de Configuración

## ✅ Problema del Crypto Resuelto

El error de `crypto is not defined` ha sido corregido mediante un polyfill en `src/polyfills.ts`.

---

## 🔧 Configuración Necesaria Antes de Iniciar

### 1. Instalar PostgreSQL

Si no tienes PostgreSQL instalado:

**Windows:**
- Descarga desde: https://www.postgresql.org/download/windows/
- Instala con las opciones por defecto
- Recuerda la contraseña que configures para el usuario `postgres`

**O usa Docker:**
```bash
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 2. Crear la Base de Datos

Abre una terminal y ejecuta:

```bash
# Opción 1: Usando createdb
createdb -U postgres web_system_db

# Opción 2: Usando psql
psql -U postgres
CREATE DATABASE web_system_db;
\q
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```bash
# Application
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=mi-clave-secreta-super-segura-cambiar-en-produccion

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=TU_PASSWORD_AQUI
DB_DATABASE=web_system_db
```

> **Importante:** Reemplaza `TU_PASSWORD_AQUI` con la contraseña real de tu PostgreSQL.

---

## 🚀 Iniciar la Aplicación

```bash
# Modo desarrollo (recomendado)
npm run start:dev

# O modo normal
npm start
```

Si todo está configurado correctamente, verás:

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] INFO [InstanceLoader] ConfigModule dependencies initialized
[Nest] INFO [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api
```

---

## 🧪 Probar los Endpoints

### Opción 1: Swagger UI (Recomendado)

1. Abre tu navegador en: **http://localhost:3000/api**
2. Verás la documentación interactiva
3. Prueba el endpoint **POST /auth/register**
4. Luego prueba **POST /auth/login**

### Opción 2: cURL

**Registrar usuario:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@ejemplo.com\",\"password\":\"Password123!\",\"name\":\"Usuario Test\"}"
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@ejemplo.com\",\"password\":\"Password123!\"}"
```

---

## ❌ Solución de Problemas Comunes

### Error: "connect ECONNREFUSED"
- PostgreSQL no está corriendo
- Solución: Inicia el servicio de PostgreSQL

### Error: "password authentication failed"
- La contraseña en `.env` es incorrecta
- Solución: Verifica la contraseña de PostgreSQL

### Error: "database does not exist"
- No has creado la base de datos
- Solución: Ejecuta `createdb -U postgres web_system_db`

### Error: "crypto is not defined"
- El polyfill no se está cargando
- Solución: Verifica que `src/polyfills.ts` exista y esté importado en `main.ts`

---

## 📝 Alternativa: Usar SQLite (Sin PostgreSQL)

Si prefieres no instalar PostgreSQL, puedes usar SQLite:

1. Instala SQLite:
```bash
npm install sqlite3
```

2. Modifica `app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
})
```

3. No necesitas configurar DB_HOST, DB_PORT, etc.
