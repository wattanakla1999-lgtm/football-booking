-- 1. สร้าง Organization เริ่มต้น
INSERT INTO "organizations" ("id", "name", "slug", "timezone", "isActive", "createdAt", "updatedAt")
VALUES (
    'org_default_01', 
    'Football Booking', 
    'default', 
    'Asia/Bangkok', 
    true, 
    NOW(), 
    NOW()
) ON CONFLICT ("slug") DO NOTHING;

-- 2. สร้าง Operating Hours (เปิด 08:00 - 23:00 ทุกวัน)
INSERT INTO "operating_hours" ("id", "organizationId", "dayOfWeek", "openTime", "closeTime", "isClosed", "createdAt", "updatedAt")
VALUES 
    ('oh_0', 'org_default_01', 0, '08:00', '23:00', false, NOW(), NOW()),
    ('oh_1', 'org_default_01', 1, '08:00', '23:00', false, NOW(), NOW()),
    ('oh_2', 'org_default_01', 2, '08:00', '23:00', false, NOW(), NOW()),
    ('oh_3', 'org_default_01', 3, '08:00', '23:00', false, NOW(), NOW()),
    ('oh_4', 'org_default_01', 4, '08:00', '23:00', false, NOW(), NOW()),
    ('oh_5', 'org_default_01', 5, '08:00', '23:00', false, NOW(), NOW()),
    ('oh_6', 'org_default_01', 6, '08:00', '23:00', false, NOW(), NOW())
ON CONFLICT ("organizationId", "dayOfWeek") DO NOTHING;

-- 3. สร้างข้อมูลสนาม (Courts)
INSERT INTO "courts" ("id", "organizationId", "name", "description", "surface", "maxPlayers", "pricePerHour", "isActive", "createdAt", "updatedAt")
VALUES 
    (
        'court_1', 
        'org_default_01', 
        'Pitch 1 (Standard)', 
        'สนามหญ้าเทียม 7 คน มาตรฐาน', 
        'Artificial Grass', 
        14, 
        1000.00, 
        true, 
        NOW(), 
        NOW()
    ),
    (
        'court_2', 
        'org_default_01', 
        'Pitch 2 (VIP)', 
        'สนามหญ้าเทียม 7 คน ในร่ม (VIP)', 
        'Artificial Grass', 
        14, 
        1500.00, 
        true, 
        NOW(), 
        NOW()
    )
ON CONFLICT ("id") DO NOTHING;

-- 4. ใส่รูปภาพให้สนาม (Court Images)
INSERT INTO "court_images" ("id", "courtId", "url", "isPrimary", "createdAt", "updatedAt")
VALUES 
    (
        'img_c1', 
        'court_1', 
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop', 
        true, 
        NOW(), 
        NOW()
    ),
    (
        'img_c2', 
        'court_2', 
        'https://images.unsplash.com/photo-1518605368461-1ee7c532082d?q=80&w=600&auto=format&fit=crop', 
        true, 
        NOW(), 
        NOW()
    )
ON CONFLICT ("id") DO NOTHING;
