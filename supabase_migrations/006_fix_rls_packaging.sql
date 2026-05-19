-- =====================================================
-- TraceRoo Phase 6: Fix RLS for Packaging Tables
-- Run this in Supabase SQL Editor
-- =====================================================
-- The packaging_hierarchy and packaging_level tables
-- were missing RLS policies, which caused UPDATE/INSERT/DELETE
-- operations to silently fail (no rows affected, no error).
-- =====================================================

-- =====================================================
-- 1. PACKAGING_HIERARCHY - Enable RLS + Policies
-- =====================================================
ALTER TABLE packaging_hierarchy ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON packaging_hierarchy
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all operations for anon users (app uses anon key)
CREATE POLICY "Enable all access for anon" ON packaging_hierarchy
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 2. PACKAGING_LEVEL - Enable RLS + Policies
-- =====================================================
ALTER TABLE packaging_level ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON packaging_level
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all operations for anon users (app uses anon key)
CREATE POLICY "Enable all access for anon" ON packaging_level
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 3. LABEL_TEMPLATES - Enable RLS + Policies (also missing)
-- =====================================================
ALTER TABLE label_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON label_templates
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for anon" ON label_templates
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
