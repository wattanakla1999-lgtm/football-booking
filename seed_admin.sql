-- ================================================================
-- Admin User Seed (สำหรับรันใน Supabase SQL Editor)
-- Email: admin@footballbooking.local
-- Password: admin1234
-- ================================================================

INSERT INTO "admins" ("id", "email", "passwordHash", "displayName", "role", "isActive", "organizationId", "createdAt", "updatedAt")
SELECT 
    'admin_default_01',
    'admin@footballbooking.local',
    '$2b$10$39H/mfvBRr7/mU3uvf1zRuKG/lLPRnYW2qwrCBpQoH3KtvSB8C1HS',
    'System Admin',
    'SUPER_ADMIN',
    true,
    id,
    NOW(),
    NOW()
FROM "organizations" WHERE "slug" = 'default'
ON CONFLICT ("email") DO NOTHING;
