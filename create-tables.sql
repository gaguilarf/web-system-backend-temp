-- =====================================================
-- Script de creación de tablas: ROLES y USERS
-- =====================================================

-- Eliminar tablas existentes si existen (cuidado en producción)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =====================================================
-- Tabla: ROLES
-- =====================================================
CREATE TABLE roles (
    rol_id SERIAL PRIMARY KEY,
    rol_name VARCHAR(255) UNIQUE NOT NULL,
    rol_description VARCHAR(500),
    rol_permissions JSONB,
    rol_created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol_is_active BOOLEAN DEFAULT TRUE
);

-- Índice para búsquedas por nombre de rol
CREATE INDEX idx_roles_name ON roles(rol_name);

-- =====================================================
-- Tabla: USERS
-- =====================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    clerk_user_id VARCHAR(255) UNIQUE,
    user_role INTEGER REFERENCES roles(rol_id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    user_password_hash VARCHAR(255),
    user_dni VARCHAR(20),
    user_last_login TIMESTAMP,
    user_created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_is_active BOOLEAN DEFAULT TRUE
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_users_email ON users(user_email);
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_role ON users(user_role);
CREATE INDEX idx_users_active ON users(user_is_active);

-- =====================================================
-- Datos iniciales: ROLES
-- =====================================================
INSERT INTO roles (rol_name, rol_description, rol_permissions) VALUES
('user', 'Usuario estándar del sistema', '{"canRead": true, "canCreate": false, "canEdit": false, "canDelete": false}'::jsonb),
('admin', 'Administrador del sistema', '{"canRead": true, "canCreate": true, "canEdit": true, "canDelete": true}'::jsonb),
('moderator', 'Moderador del sistema', '{"canRead": true, "canCreate": true, "canEdit": true, "canDelete": false}'::jsonb);

-- =====================================================
-- Trigger para actualizar modified_date automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.rol_modified_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_modified_date
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_date();

CREATE OR REPLACE FUNCTION update_user_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_modified_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modified_date
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_modified_date();
