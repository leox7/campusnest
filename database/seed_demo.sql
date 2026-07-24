-- ============================================================
-- CampusNest — Demo Seed Data
-- ============================================================
-- Run AFTER database/CAMPUSNEST.sql (which drops/recreates the
-- student_accommodation database and seeds the default admin).
--
--   mysql -u root -p < database/CAMPUSNEST.sql
--   mysql -u root -p < database/seed_demo.sql
--
-- Demo accounts created by this seed (share the same password):
--   Landlord : landlord.demo@campusnest.test / Password123
--   Student  : student.demo@campusnest.test  / Password123
--
-- Admin: use the existing admin account already in your database
-- (campusnestai@gmail.com) with its own password. This seed does NOT
-- touch the admin account.
--
-- The demo hashes below are bcrypt (cost 10) for the plaintext "Password123".
-- Regenerate with:  npm run hash:password "Password123"   (in backend/)
-- ============================================================

USE student_accommodation;

-- ------------------------------------------------------------
-- Reset demo data first so this seed is safe to re-run.
-- Deleting the two demo users cascades (ON DELETE CASCADE) to their
-- hostels, images, bookings, payments, reviews, saved rows, and
-- interactions. The admin account and any real data are untouched.
-- ------------------------------------------------------------
DELETE FROM users
WHERE email IN ('landlord.demo@campusnest.test', 'student.demo@campusnest.test');

-- ------------------------------------------------------------
-- Demo users: one landlord, one student
-- ------------------------------------------------------------
INSERT INTO users (full_name, email, password, user_role, is_active) VALUES
  ('Demo Landlord', 'landlord.demo@campusnest.test', '$2b$10$Rlqt1Nf53VRNUpii8mWr3uxwkwOGVhrefS/Cluie7a1KD6Z4uIu1u', 'landlord', TRUE),
  ('Demo Student',  'student.demo@campusnest.test',  '$2b$10$Rlqt1Nf53VRNUpii8mWr3uxwkwOGVhrefS/Cluie7a1KD6Z4uIu1u', 'student',  TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

SET @landlord_id = (SELECT id FROM users WHERE email = 'landlord.demo@campusnest.test');
SET @student_id  = (SELECT id FROM users WHERE email = 'student.demo@campusnest.test');

-- ------------------------------------------------------------
-- Hostels: 3 verified + 1 pending (verified = FALSE)
-- Prices are in KSH. New listings default to verified = FALSE;
-- we set verified explicitly here for the demo.
-- ------------------------------------------------------------
INSERT INTO hostels
  (landlord_id, name, location, room_type, distance_km, price, description,
   utilities_included, ai_pick, verified, reviews_count, average_rating,
   availability, marker_x, marker_y)
VALUES
  (@landlord_id, 'Acacia Student Lodge', 'Juja', 'Single Room', 0.80, 8500.00,
   'Quiet, secure single rooms a short walk from campus. Water and Wi-Fi included.',
   TRUE, TRUE, TRUE, 0, 0.00, 'available', 42.00, 58.00),
  (@landlord_id, 'Kefinco Court', 'Kefinco', 'Shared', 1.50, 6000.00,
   'Affordable shared rooms with communal kitchen and 24/7 security.',
   TRUE, FALSE, TRUE, 0, 0.00, 'available', 60.00, 40.00),
  (@landlord_id, 'Gate C Studios', 'Gate C', 'Studio', 0.40, 18000.00,
   'Modern self-contained studios with private bathroom and study desk.',
   FALSE, TRUE, TRUE, 0, 0.00, 'available', 30.00, 70.00),
  (@landlord_id, 'Highpoint Apartments', 'Thika Road', 'Apartment', 3.20, 25000.00,
   'Spacious two-room apartment, ideal for sharing. Pending admin verification.',
   TRUE, FALSE, FALSE, 0, 0.00, 'available', 80.00, 20.00);

SET @acacia_id    = (SELECT id FROM hostels WHERE name = 'Acacia Student Lodge' AND landlord_id = @landlord_id);
SET @kefinco_id   = (SELECT id FROM hostels WHERE name = 'Kefinco Court' AND landlord_id = @landlord_id);
SET @gatec_id     = (SELECT id FROM hostels WHERE name = 'Gate C Studios' AND landlord_id = @landlord_id);
SET @highpoint_id = (SELECT id FROM hostels WHERE name = 'Highpoint Apartments' AND landlord_id = @landlord_id);

-- ------------------------------------------------------------
-- Hostel images (URL-based, one primary per hostel)
-- ------------------------------------------------------------
INSERT INTO hostel_images (hostel_id, image_url, alt_text, sort_order, is_primary) VALUES
  (@acacia_id,  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'Acacia Student Lodge exterior', 0, TRUE),
  (@acacia_id,  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'Acacia room interior', 1, FALSE),
  (@kefinco_id, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5', 'Kefinco Court shared room', 0, TRUE),
  (@gatec_id,   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'Gate C studio', 0, TRUE),
  (@highpoint_id, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb', 'Highpoint apartment living area', 0, TRUE);

-- ------------------------------------------------------------
-- Saved hostel (student saved one verified listing)
-- ------------------------------------------------------------
INSERT INTO saved_hostels (student_id, hostel_id) VALUES
  (@student_id, @acacia_id)
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);

-- ------------------------------------------------------------
-- Bookings: one confirmed (paid), one pending
-- ------------------------------------------------------------
INSERT INTO bookings (user_id, hostel_id, booking_date, status) VALUES
  (@student_id, @acacia_id, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'confirmed'),
  (@student_id, @gatec_id,  DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'pending');

SET @confirmed_booking_id = (SELECT id FROM bookings WHERE user_id = @student_id AND hostel_id = @acacia_id LIMIT 1);

-- ------------------------------------------------------------
-- Payment for the confirmed booking (simulated, completed)
-- ------------------------------------------------------------
INSERT INTO payments (booking_id, amount, payment_status) VALUES
  (@confirmed_booking_id, 8500.00, 'completed');

-- ------------------------------------------------------------
-- Review (the student reviews the hostel they have a confirmed booking for)
-- Refresh the hostel's cached aggregates afterwards.
-- ------------------------------------------------------------
INSERT INTO reviews (user_id, hostel_id, rating, comment) VALUES
  (@student_id, @acacia_id, 5, 'Clean, safe, and close to campus. The Wi-Fi is reliable.');

UPDATE hostels h
SET
  h.reviews_count  = (SELECT COUNT(*) FROM reviews WHERE hostel_id = h.id),
  h.average_rating = (SELECT AVG(rating) FROM reviews WHERE hostel_id = h.id)
WHERE h.id = @acacia_id;

-- ------------------------------------------------------------
-- User interactions (analytics / AI signals)
-- ------------------------------------------------------------
INSERT INTO user_interactions (user_id, hostel_id, interaction_type) VALUES
  (@student_id, NULL,       'search'),
  (@student_id, @acacia_id, 'view'),
  (@student_id, @gatec_id,  'view'),
  (@student_id, @acacia_id, 'click');
