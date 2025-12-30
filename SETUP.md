
**Docker:**
```bash
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### Crear la Base de Datos

Abre una terminal y ejecuta:

```bash
# Usando createdb
docker exec -it postgres-dev psql -U postgres -d web_system_db

# Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    roles TEXT DEFAULT 'user',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
\q

# Ver tablas
docker exec postgres-dev psql -U postgres -d web_system_db -c "\dt"
```

### Configuración del Proyecto

Este es un proyecto backend desarrollado con NestJS que implementa un sistema de autenticación con JWT y gestión de roles.

## Estructura de Base de Datos

El proyecto utiliza PostgreSQL con dos tablas principales:

### Tabla: ROLES
- `rol_id` (PK, SERIAL)
- `rol_name` (VARCHAR, UNIQUE)
- `rol_description` (VARCHAR)
- `rol_permissions` (JSONB)
- `rol_created_date` (TIMESTAMP)
- `rol_modified_date` (TIMESTAMP)
- `rol_is_active` (BOOLEAN)

### Tabla: USERS
- `user_id` (PK, SERIAL)
- `user_role` (FK → roles.rol_id)
- `user_name` (VARCHAR)
- `user_email` (VARCHAR, UNIQUE)
- `user_password_hash` (VARCHAR)
- `user_dni` (VARCHAR, opcional)
- `user_last_login` (TIMESTAMP)
- `user_created_date` (TIMESTAMP)
- `user_modified_date` (TIMESTAMP)
- `user_is_active` (BOOLEAN)

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (crear archivo `.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=nombre_bd
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
```

4. Crear la base de datos ejecutando el script SQL:
```bash
psql -U tu_usuario -d nombre_bd -f create-tables.sql
```

## Ejecutar el Proyecto

### Modo desarrollo
```bash
npm run start:dev
```

### Modo producción
```bash
npm run build
npm run start:prod
```

## Endpoints Disponibles

### Autenticación (`/auth`)
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión

### Roles (`/roles`)
- `GET /roles` - Listar todos los roles activos
- `GET /roles/:id` - Obtener rol por ID
- `POST /roles` - Crear nuevo rol (requiere autenticación)
- `PATCH /roles/:id` - Actualizar rol (requiere autenticación)
- `DELETE /roles/:id` - Desactivar rol (requiere autenticación)

## Documentación API

La documentación completa de la API está disponible en Swagger:
```
http://localhost:3000/api
```

## Estructura del Proyecto

```
src/
├── auth/           # Módulo de autenticación
│   ├── dto/        # Data Transfer Objects
│   ├── entities/   # Entidad User
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── roles/          # Módulo de roles
│   ├── dto/        # DTOs para roles
│   ├── entities/   # Entidad Role
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   └── roles.module.ts
├── users/          # Módulo de usuarios
│   ├── users.service.ts
│   └── users.module.ts
├── app.module.ts   # Módulo principal
└── main.ts         # Punto de entrada
```

## Roles por Defecto

El sistema incluye tres roles predefinidos:
- **user**: Usuario estándar (solo lectura)
- **admin**: Administrador (todos los permisos)
- **moderator**: Moderador (lectura, creación y edición)

## Notas Importantes

- TypeORM está configurado con `synchronize: true` solo en desarrollo
- Los passwords se hashean automáticamente con bcrypt (10 rounds)
- El JWT expira en 1 hora
- El campo `user_last_login` se actualiza automáticamente en cada login
- Los triggers de PostgreSQL actualizan `modified_date` automáticamente
4. Luego probar **POST /auth/login**
