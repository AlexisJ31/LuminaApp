-- SQL DDL Migration: Habilitación de PostgreSQL Row Level Security (RLS)
-- Proyecto: LuminaApp - Cumplimiento de Aislamiento Estricto por Usuario (Multitenancy)

-- 1. Habilitar RLS en todas las tablas relacionales de la base de datos
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Seguridad RLS para Cuentas Bancarias
CREATE POLICY "Los usuarios solo ven y modifican sus propias cuentas"
ON accounts
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 3. Políticas de Seguridad RLS para Categorías (Particulares o Globales)
CREATE POLICY "Los usuarios leen sus categorias y categorias globales"
ON categories
FOR SELECT
USING (user_id IS NULL OR auth.uid()::text = user_id);

CREATE POLICY "Los usuarios solo crean o modifican sus categorias propias"
ON categories
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 4. Políticas de Seguridad RLS para Transacciones
CREATE POLICY "Aislamiento estricto de transacciones por usuario"
ON transactions
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 5. Políticas de Seguridad RLS para Presupuestos (Budgets)
CREATE POLICY "Los usuarios solo administran sus propios presupuestos"
ON budgets
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);
