# Guía Completa: Clerk Authentication Setup

Esta guía te mostrará paso a paso cómo configurar Clerk, ver registros en la base de datos PostgreSQL (Docker), y entender cómo funciona el sistema de roles automático.

---

## 📋 Tabla de Contenidos

1. [Configuración de Clerk](#1-configuración-de-clerk)
2. [Configuración de Variables de Entorno](#2-configuración-de-variables-de-entorno)
3. [Configuración de Webhooks](#3-configuración-de-webhooks)
4. [Inicializar Base de Datos y Roles](#4-inicializar-base-de-datos-y-roles)
5. [Ver Registros en PostgreSQL](#5-ver-registros-en-postgresql)
6. [Sistema de Roles Automático](#6-sistema-de-roles-automático)
7. [Probar la Integración](#7-probar-la-integración)
8. [Comandos Útiles](#8-comandos-útiles)

---

## 1. Configuración de Clerk

### Paso 1.1: Crear Cuenta en Clerk

1. Ve a [https://clerk.com](https://clerk.com)
2. Crea una cuenta gratuita
3. Crea una nueva aplicación

### Paso 1.2: Obtener API Keys

1. En el Dashboard de Clerk, ve a **API Keys**
2. Copia las siguientes keys:
   - **Publishable Key** (comienza con `pk_test_...`)
   - **Secret Key** (comienza con `sk_test_...`)

---

## 2. Configuración de Variables de Entorno

Edita tu archivo `.env` y agrega las siguientes variables:

```env
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_test_tu_publishable_key_aqui
CLERK_SECRET_KEY=sk_test_tu_secret_key_aqui
CLERK_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Database Configuration (ya existentes)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=web_system_db
NODE_ENV=development
```

> **Nota**: El `CLERK_WEBHOOK_SECRET` lo obtendrás en el siguiente paso.

---

## 3. Configuración de Webhooks

Los webhooks permiten que Clerk notifique a tu backend cuando se crea, actualiza o elimina un usuario.

### Paso 3.1: Crear Endpoint Webhook en Clerk

1. En el Dashboard de Clerk, ve a **Webhooks**
2. Click en **Add Endpoint**
3. Configura:
   - **Endpoint URL**: `https://tu-dominio.com/auth/webhook`
     - Para desarrollo local con ngrok: `https://abc123.ngrok.io/auth/webhook`
   - **Subscribe to events**:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
4. Click en **Create**

### Paso 3.2: Obtener Webhook Secret

1. Después de crear el webhook, verás el **Signing Secret**
2. Copia este valor (comienza con `whsec_...`)
3. Agrégalo a tu `.env` como `CLERK_WEBHOOK_SECRET`

### Paso 3.3: Desarrollo Local con ngrok (Opcional)

Si estás desarrollando localmente, necesitas exponer tu servidor:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3000
ngrok http 3000

# Usa la URL generada (ej: https://abc123.ngrok.io) en Clerk
```

---

## 4. Inicializar Base de Datos y Roles

### Paso 4.1: Crear Contenedor Docker de PostgreSQL

Si aún no tienes PostgreSQL corriendo:

```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_DB=web_system_db \
  -p 5432:5432 \
  -d postgres:14
```

### Paso 4.2: Ejecutar Script SQL

El script `create-tables.sql` ya incluye los roles por defecto. Ejecútalo:

```bash
# Opción 1: Desde archivo
docker exec -i postgres-dev psql -U postgres -d web_system_db < create-tables.sql

# Opción 2: Conectarse y pegar manualmente
docker exec -it postgres-dev psql -U postgres -d web_system_db
# Luego pega el contenido del archivo create-tables.sql
```

### Paso 4.3: Verificar que los Roles se Crearon

```bash
docker exec -it postgres-dev psql -U postgres -d web_system_db -c "SELECT * FROM roles;"
```

**Salida esperada:**

```
 rol_id | rol_name  |      rol_description       |           rol_permissions            | rol_created_date | rol_modified_date | rol_is_active 
--------+-----------+----------------------------+--------------------------------------+------------------+-------------------+---------------
      1 | user      | Usuario estándar del sistema | {"canRead": true, "canCreate": false, ...} | 2024-...  | 2024-...          | t
      2 | admin     | Administrador del sistema    | {"canRead": true, "canCreate": true, ...}  | 2024-...  | 2024-...          | t
      3 | moderator | Moderador del sistema        | {"canRead": true, "canCreate": true, ...}  | 2024-...  | 2024-...          | t
```

---

## 5. Ver Registros en PostgreSQL

### 5.1 Conectarse a PostgreSQL (Docker)

```bash
# Conectarse a la base de datos
docker exec -it postgres-dev psql -U postgres -d web_system_db
```

### 5.2 Ver Todos los Usuarios

```sql
-- Ver usuarios con su rol
SELECT 
    u.user_id,
    u.clerk_user_id,
    u.user_name,
    u.user_email,
    r.rol_name,
    u.user_last_login,
    u.user_is_active
FROM users u
LEFT JOIN roles r ON u.user_role = r.rol_id
ORDER BY u.user_created_date DESC;
```

### 5.3 Ver Detalles de un Usuario Específico

```sql
-- Por email
SELECT * FROM users WHERE user_email = 'usuario@ejemplo.com';

-- Por Clerk ID
SELECT * FROM users WHERE clerk_user_id = 'user_2abc123def';

-- Por ID
SELECT * FROM users WHERE user_id = 1;
```

### 5.4 Ver Todos los Roles

```sql
SELECT * FROM roles WHERE rol_is_active = true;
```

### 5.5 Contar Usuarios por Rol

```sql
SELECT 
    r.rol_name,
    COUNT(u.user_id) as total_usuarios
FROM roles r
LEFT JOIN users u ON r.rol_id = u.user_role
GROUP BY r.rol_name;
```

### 5.6 Salir de psql

```sql
\q
```

---

## 6. Sistema de Roles Automático

### ¿Cómo Funciona?

El sistema está diseñado para asignar roles automáticamente cuando un usuario se registra:

#### 1. **Usuario se Registra en Clerk**
   - El usuario completa el formulario de registro en tu frontend (usando Clerk UI)
   - Clerk crea el usuario en su sistema

#### 2. **Clerk Envía Webhook**
   - Clerk envía un evento `user.created` a tu endpoint `/auth/webhook`
   - El payload incluye toda la información del usuario

#### 3. **Backend Procesa el Webhook**
   - El `AuthService.handleWebhook()` verifica la firma del webhook
   - Llama a `handleUserCreated()` que a su vez llama a `UsersService.createFromClerk()`

#### 4. **Asignación Automática de Rol**
   - El servicio busca el rol con nombre `'user'` en la base de datos
   - Si el rol existe, lo asigna al nuevo usuario
   - Si NO existe, lanza un error `NotFoundException`

#### 5. **Usuario Creado en DB**
   - Se crea el registro en la tabla `users` con:
     - `clerk_user_id`: ID del usuario en Clerk
     - `user_email`: Email del usuario
     - `user_name`: Nombre completo
     - `user_role`: ID del rol "user" (por defecto)
     - `user_is_active`: `true`

### ¿Qué Pasa si No Hay Roles?

**⚠️ IMPORTANTE**: Si la tabla `roles` está vacía, el sistema **NO PODRÁ** crear usuarios.

**Solución**: Siempre ejecuta el script `create-tables.sql` que incluye los 3 roles por defecto:
- `user` (rol por defecto)
- `admin`
- `moderator`

### Cambiar el Rol de un Usuario

Los roles se asignan automáticamente como "user", pero puedes cambiarlos manualmente:

```sql
-- Cambiar usuario a admin
UPDATE users 
SET user_role = (SELECT rol_id FROM roles WHERE rol_name = 'admin')
WHERE user_email = 'usuario@ejemplo.com';

-- Verificar el cambio
SELECT u.user_email, r.rol_name 
FROM users u 
JOIN roles r ON u.user_role = r.rol_id 
WHERE u.user_email = 'usuario@ejemplo.com';
```

### Crear Roles Personalizados

```sql
-- Crear un nuevo rol
INSERT INTO roles (rol_name, rol_description, rol_permissions) 
VALUES (
    'editor',
    'Editor de contenido',
    '{"canRead": true, "canCreate": true, "canEdit": true, "canDelete": false}'::jsonb
);

-- Ver el nuevo rol
SELECT * FROM roles WHERE rol_name = 'editor';
```

---

## 7. Probar la Integración

### 7.1 Iniciar el Servidor

```bash
npm run start:dev
```

### 7.2 Registrar un Usuario en Clerk

1. Ve a tu aplicación frontend
2. Usa el componente de Clerk para registrarte
3. Completa el formulario de registro

### 7.3 Verificar en la Base de Datos

```bash
# Conectarse a PostgreSQL
docker exec -it postgres-dev psql -U postgres -d web_system_db

# Ver el usuario recién creado
SELECT u.*, r.rol_name 
FROM users u 
LEFT JOIN roles r ON u.user_role = r.rol_id 
ORDER BY u.user_created_date DESC 
LIMIT 1;
```

**Deberías ver**:
- El usuario con su `clerk_user_id`
- `rol_name` = `'user'`
- `user_is_active` = `true`

### 7.4 Probar Endpoint Protegido

```bash
# Obtener token de Clerk (desde tu frontend)
# Luego hacer request:

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <tu_token_de_clerk>"
```

**Respuesta esperada**:
```json
{
  "user_id": 1,
  "clerk_user_id": "user_2abc123def",
  "user_name": "Juan Pérez",
  "user_email": "juan@ejemplo.com",
  "user_role": 1,
  "role": {
    "rol_id": 1,
    "rol_name": "user",
    "rol_permissions": { "canRead": true, ... }
  }
}
```

---

## 8. Comandos Útiles

### PostgreSQL (Docker)

```bash
# Ver contenedores corriendo
docker ps

# Detener PostgreSQL
docker stop postgres-dev

# Iniciar PostgreSQL
docker start postgres-dev

# Ver logs de PostgreSQL
docker logs postgres-dev

# Eliminar contenedor (¡CUIDADO! Perderás todos los datos)
docker rm -f postgres-dev

# Backup de la base de datos
docker exec postgres-dev pg_dump -U postgres web_system_db > backup.sql

# Restaurar backup
docker exec -i postgres-dev psql -U postgres -d web_system_db < backup.sql
```

### Consultas SQL Útiles

```sql
-- Ver estructura de tabla users
\d users

-- Ver estructura de tabla roles
\d roles

-- Contar total de usuarios
SELECT COUNT(*) FROM users;

-- Ver usuarios creados hoy
SELECT * FROM users 
WHERE DATE(user_created_date) = CURRENT_DATE;

-- Desactivar un usuario
UPDATE users SET user_is_active = false WHERE user_email = 'usuario@ejemplo.com';

-- Reactivar un usuario
UPDATE users SET user_is_active = true WHERE user_email = 'usuario@ejemplo.com';

-- Ver usuarios inactivos
SELECT * FROM users WHERE user_is_active = false;

-- Eliminar un usuario (¡CUIDADO!)
DELETE FROM users WHERE user_email = 'usuario@ejemplo.com';

-- Ver último login de usuarios
SELECT user_email, user_last_login 
FROM users 
ORDER BY user_last_login DESC NULLS LAST;
```

### NestJS

```bash
# Compilar proyecto
npm run build

# Iniciar en desarrollo
npm run start:dev

# Ver logs en tiempo real
# (los logs aparecen en la consola donde ejecutaste start:dev)

# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 🔧 Troubleshooting

### Problema: "Rol por defecto no encontrado"

**Causa**: La tabla `roles` está vacía.

**Solución**:
```bash
docker exec -i postgres-dev psql -U postgres -d web_system_db < create-tables.sql
```

### Problema: "Webhook signature invalid"

**Causa**: El `CLERK_WEBHOOK_SECRET` es incorrecto.

**Solución**:
1. Ve a Clerk Dashboard → Webhooks
2. Copia el **Signing Secret**
3. Actualiza `.env` con el valor correcto
4. Reinicia el servidor

### Problema: No se crean usuarios automáticamente

**Verificar**:
1. ¿El webhook está configurado en Clerk?
2. ¿La URL del webhook es correcta?
3. ¿El servidor está corriendo y accesible?
4. ¿Los logs muestran algún error?

**Debug**:
```bash
# Ver logs del servidor NestJS
# (aparecen en la terminal donde ejecutaste npm run start:dev)

# Ver si el webhook llegó
# Clerk Dashboard → Webhooks → Ver eventos
```

### Problema: "Cannot connect to database"

**Verificar**:
```bash
# ¿PostgreSQL está corriendo?
docker ps | grep postgres

# ¿Las credenciales son correctas?
docker exec -it postgres-dev psql -U postgres -d web_system_db
```

---

## 📚 Recursos Adicionales

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)

---

## ✅ Checklist de Configuración

- [ ] Cuenta de Clerk creada
- [ ] API Keys copiadas a `.env`
- [ ] Webhook configurado en Clerk Dashboard
- [ ] Webhook Secret copiado a `.env`
- [ ] PostgreSQL corriendo en Docker
- [ ] Script `create-tables.sql` ejecutado
- [ ] Roles verificados en la base de datos
- [ ] Servidor NestJS iniciado
- [ ] Usuario de prueba registrado
- [ ] Usuario verificado en la base de datos
- [ ] Endpoint `/auth/me` probado exitosamente

---

¡Listo! Ahora tu sistema de autenticación con Clerk está completamente configurado y funcionando. 🎉
