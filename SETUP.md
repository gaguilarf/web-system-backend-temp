
**Docker:**
```bash
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### Crear la Base de Datos

Abre una terminal y ejecuta:

```bash
# Usando createdb
docker exec -it postgres-dev psql -U postgres -d web_system_db
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

