-- Estructura de base de datos para Sistema de Préstamos (PostgreSQL)

-- 1. Usuarios
CREATE TYPE rol_usuario AS ENUM ('admin', 'empleado');

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol rol_usuario DEFAULT 'empleado',
    estado INTEGER DEFAULT 1,
    foto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Configuración Global
CREATE TABLE IF NOT EXISTS configuracion (
    id INTEGER PRIMARY KEY,
    nombre_empresa VARCHAR(100) DEFAULT 'Mi Financiera',
    ruc VARCHAR(20),
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    email_contacto VARCHAR(100),
    logo VARCHAR(255),
    moneda VARCHAR(5) DEFAULT '$',
    tasa_mora_diaria DECIMAL(5,2) DEFAULT 1.00,
    dias_gracia_mora INTEGER DEFAULT 0
);

-- 3. Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    email VARCHAR(100),
    foto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Préstamos
CREATE TYPE frecuencia_pago AS ENUM ('diario', 'semanal', 'quincenal', 'mensual');
CREATE TYPE estado_prestamo AS ENUM ('pendiente', 'pagado', 'vencido');

CREATE TABLE IF NOT EXISTS prestamos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    monto_prestado DECIMAL(12,2) NOT NULL,
    tasa_interes DECIMAL(5,2) NOT NULL,
    monto_total DECIMAL(12,2) NOT NULL,
    cuotas INTEGER NOT NULL,
    frecuencia frecuencia_pago DEFAULT 'mensual',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado estado_prestamo DEFAULT 'pendiente',
    monto_mora DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    prestamo_id INTEGER NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
    monto DECIMAL(12,2) NOT NULL,
    monto_mora DECIMAL(12,2) DEFAULT 0.00,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50) NOT NULL,
    nro_cuota INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
);

-- 6. Empeños
CREATE TYPE estado_empeno AS ENUM ('en_custodia', 'retirado', 'perdido', 'vendido');

CREATE TABLE IF NOT EXISTS empenos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    nombre_articulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor_tasacion DECIMAL(12,2) NOT NULL,
    monto_prestado DECIMAL(12,2) NOT NULL,
    fecha_limite DATE NOT NULL,
    estado estado_empeno DEFAULT 'en_custodia',
    imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Cuentas de Ahorro
CREATE TABLE IF NOT EXISTS cuentas_ahorro (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER UNIQUE NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    saldo_actual DECIMAL(12,2) DEFAULT 0.00,
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Movimientos de Ahorro
CREATE TYPE tipo_movimiento_ahorro AS ENUM ('deposito', 'retiro', 'interes_ganado');

CREATE TABLE IF NOT EXISTS movimientos_ahorro (
    id SERIAL PRIMARY KEY,
    cuenta_id INTEGER NOT NULL REFERENCES cuentas_ahorro(id) ON DELETE CASCADE,
    tipo_movimiento tipo_movimiento_ahorro NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT
);

-- 9. Gastos Operativos
CREATE TABLE IF NOT EXISTS gastos (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    fecha_gasto DATE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    registrado_por VARCHAR(100) DEFAULT 'Sistema',
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Bitácora de Auditoría
CREATE TABLE IF NOT EXISTS bitacora (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(50) NOT NULL,
    detalle TEXT NOT NULL,
    ip VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices básicos para optimización
CREATE INDEX idx_prestamos_cliente ON prestamos(cliente_id);
CREATE INDEX idx_pagos_prestamo ON pagos(prestamo_id);
CREATE INDEX idx_ahorros_cliente ON cuentas_ahorro(cliente_id);
CREATE INDEX idx_movimientos_cuenta ON movimientos_ahorro(cuenta_id);
