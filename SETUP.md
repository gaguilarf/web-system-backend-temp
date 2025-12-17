
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

### Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```bash
# Application
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=mi-clave-secreta-super-segura-cambiar-en-produccion-xd

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=PASSWORD
DB_DATABASE=web_system_db
```

---

## 🚀 Iniciar la Aplicación

```bash
# Modo desarrollo (recomendado)
npm run start:dev

# O modo normal
npm start
```


## 🧪 Probar los Endpoints

### Swagger UI (Recomendado)

1. Abrir navegador en: **http://localhost:3000/api**
2. Verás la documentación interactiva
3. Probar el endpoint **POST /auth/register**
4. Luego probar **POST /auth/login**

