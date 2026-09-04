-- ============================================================
-- CampusNest — AI Demo Seed Data (recommendations / sentiment / fraud)
-- ============================================================
-- Purpose: give the presentation enough data to SHOW the three ML
-- models working:
--   * 15 realistic hostels (varied room type / price / location / distance)
--   * 5 UNREALISTIC hostels (bad price or location) for the fraud model
--   * a mix of positive, negative and neutral reviews for the sentiment model
--   * viewing history so the recommender produces "AI Pick" badges
--
-- Run AFTER database/CAMPUSNEST.sql:
--   mysql -u root -p < database/CAMPUSNEST.sql
--   mysql -u root -p < database/seed_ai_demo.sql
--
-- This file is self-contained and safe to re-run: it first deletes its
-- own demo users (ON DELETE CASCADE removes their hostels, reviews and
-- interactions). It does NOT touch the admin account or other data.
--
-- Demo accounts (all share the plaintext password "Password123"):
--   Landlord : ai.landlord@campusnest.test
--   Students : ai.student1@campusnest.test ... ai.student4@campusnest.test
--
-- IMPORTANT — how to demo each model live:
--   * FRAUD: the fraud model runs in the Node backend when a landlord
--     CREATES/UPDATES a listing, not when reading seeded rows. The 5 bad
--     hostels below are seeded as verified = FALSE so they already appear
--     in the admin "pending" list. To show the MODEL flagging in real time,
--     log in as ai.landlord and CREATE a listing using one of the bad
--     value sets noted beside each row; the API response returns flagged:true.
--   * SENTIMENT: sentiment runs when a student SUBMITS a review (POST
--     /api/reviews) and is returned in the response (not stored). Seeded
--     reviews below give visible good/bad content and realistic ratings;
--     to show the model classify live, submit one of the sample texts at
--     the bottom of this file through the student UI.
--   * RECOMMENDATIONS: the viewing history seeded at the end makes the
--     recommender surface similar hostels with an "AI Pick" badge on the
--     student dashboard.
-- ============================================================

USE student_accommodation;

-- ------------------------------------------------------------
-- Reset (safe re-run): remove this seed's own demo users.
-- ------------------------------------------------------------
DELETE FROM users
WHERE email IN (
  'ai.landlord@campusnest.test',
  'ai.student1@campusnest.test',
  'ai.student2@campusnest.test',
  'ai.student3@campusnest.test',
  'ai.student4@campusnest.test'
);

-- ------------------------------------------------------------
-- Demo users: one landlord + four students (for varied reviews)
-- All passwords are bcrypt(cost 10) for "Password123".
-- ------------------------------------------------------------
INSERT INTO users (full_name, email, password, user_role, is_active) VALUES
  ('AI Demo Landlord', 'ai.landlord@campusnest.test', '$2b$10$Rlqt1Nf53VRNUpii8mWr3uxwkwOGVhrefS/Cluie7a1KD6Z4uIu1u', 'landlord', TRUE),
  ('Amina Yusuf',      'ai.student1@campusnest.test', '$2b$10$Rlqt1Nf53VRNUpii8mWr3uxwkwOGVhrefS/Cluie7a1KD6Z4uIu1u', 'student',  TRUE),
  ('Brian Otieno',     'ai.student2@campusnest.test', '$2b$10$Rlqt1Nf53VRNUpii8mWr3uxwkwOGVhrefS/Cluie7a1KD6Z4uIu1u', 'student',  TRUE),
  ('Cynthia Wanjiru',  'ai.student3@campusnest.test', '$2b$10$Rlqt1Nf53VRNUpii8mWr3uxwkwOGVhrefS/Cluie7a1KD6Z4uIu1u', 'student',  TRUE),
  ('Dennis Kiptoo',    'ai.student4@campusnest.test', '$2b$10$Rlqt1Nf53VRNUpii8mWr3uxwkwOGVhrefS/Cluie7a1KD6Z4uIu1u', 'student',  TRUE);

SET @landlord_id = (SELECT id FROM users WHERE email = 'ai.landlord@campusnest.test');
SET @s1 = (SELECT id FROM users WHERE email = 'ai.student1@campusnest.test');
SET @s2 = (SELECT id FROM users WHERE email = 'ai.student2@campusnest.test');
SET @s3 = (SELECT id FROM users WHERE email = 'ai.student3@campusnest.test');
SET @s4 = (SELECT id FROM users WHERE email = 'ai.student4@campusnest.test');

-- ------------------------------------------------------------
-- 15 REALISTIC hostels (verified = TRUE)
-- Prices sit within a normal range for each room type
-- (baseline used by fraud.py: Single 10000, Shared 6000,
--  Studio 18000, Apartment 25000, spread 4000).
-- ------------------------------------------------------------
INSERT INTO hostels
  (landlord_id, name, location, room_type, distance_km, price, description,
   utilities_included, ai_pick, verified, reviews_count, average_rating,
   availability, marker_x, marker_y)
VALUES
  (@landlord_id, 'Acacia Student Lodge',  'Juja',        'Single Room', 0.80,  9500.00, 'Quiet, secure single rooms a short walk from campus. Water and Wi-Fi included.', TRUE,  FALSE, TRUE, 0, 0.00, 'available', 42.00, 58.00),
  (@landlord_id, 'Gate A Residences',     'Gate A',      'Single Room', 1.20, 11000.00, 'Well-kept single rooms with reliable water and a study desk in every room.',    TRUE,  FALSE, TRUE, 0, 0.00, 'available', 48.00, 52.00),
  (@landlord_id, 'Kalimoni Corner',       'Kalimoni',    'Single Room', 2.00,  8000.00, 'Budget-friendly single rooms in a calm neighbourhood near shops.',              TRUE,  FALSE, TRUE, 0, 0.00, 'available', 35.00, 64.00),
  (@landlord_id, 'Gate D Singles',        'Gate D',      'Single Room', 0.60, 10500.00, 'Bright single rooms with tiled floors, minutes from the main gate.',            TRUE,  FALSE, TRUE, 0, 0.00, 'available', 55.00, 60.00),
  (@landlord_id, 'Kefinco Court',         'Kefinco',     'Shared',      1.50,  6000.00, 'Affordable shared rooms with communal kitchen and 24/7 security.',              TRUE,  FALSE, TRUE, 0, 0.00, 'available', 60.00, 40.00),
  (@landlord_id, 'Juja Shared Homes',     'Juja',        'Shared',      0.90,  5500.00, 'Clean shared rooms with free water, ideal for first-year students.',            TRUE,  FALSE, TRUE, 0, 0.00, 'available', 44.00, 46.00),
  (@landlord_id, 'Gate B Sharers',        'Gate B',      'Shared',      1.80,  7000.00, 'Spacious shared rooms with a large common area and laundry space.',             TRUE,  FALSE, TRUE, 0, 0.00, 'available', 62.00, 48.00),
  (@landlord_id, 'Kalimoni Shared Point', 'Kalimoni',    'Shared',      2.30,  6500.00, 'Quiet shared accommodation with backup water and secure parking.',              TRUE,  FALSE, TRUE, 0, 0.00, 'available', 33.00, 70.00),
  (@landlord_id, 'Gate C Studios',        'Gate C',      'Studio',      0.40, 18000.00, 'Modern self-contained studios with private bathroom and study desk.',           FALSE, FALSE, TRUE, 0, 0.00, 'available', 30.00, 72.00),
  (@landlord_id, 'Thika Road Studios',    'Thika Road',  'Studio',      2.50, 20000.00, 'Spacious studios along Thika Road with fast fibre internet.',                   FALSE, FALSE, TRUE, 0, 0.00, 'available', 82.00, 22.00),
  (@landlord_id, 'Juja Town Studios',     'Juja Town',   'Studio',      1.00, 16500.00, 'Compact, affordable studios in the heart of Juja town.',                        TRUE,  FALSE, TRUE, 0, 0.00, 'available', 46.00, 50.00),
  (@landlord_id, 'Gate A Studio Suites',  'Gate A',      'Studio',      0.70, 17500.00, 'Self-contained studio suites with a kitchenette and private balcony.',          FALSE, FALSE, TRUE, 0, 0.00, 'available', 50.00, 54.00),
  (@landlord_id, 'Highpoint Apartments',  'Thika Road',  'Apartment',   3.20, 25000.00, 'Spacious two-room apartment, ideal for sharing among friends.',                 TRUE,  FALSE, TRUE, 0, 0.00, 'available', 80.00, 20.00),
  (@landlord_id, 'Membley Heights',       'Membley',     'Apartment',   4.00, 27000.00, 'Modern apartment with ample parking and a quiet, gated compound.',              TRUE,  FALSE, TRUE, 0, 0.00, 'available', 88.00, 18.00),
  (@landlord_id, 'Juja Family Apartments','Juja',        'Apartment',   2.20, 23000.00, 'Comfortable apartment close to campus, suitable for small groups.',             TRUE,  FALSE, TRUE, 0, 0.00, 'available', 43.00, 44.00);

-- ------------------------------------------------------------
-- 5 UNREALISTIC hostels (verified = FALSE -> appear in admin pending).
-- Each row's values are chosen to also trip the fraud model / hard rules
-- if you re-create them through the landlord form during the demo:
--
--   'Palm Luxury Suites'  price 95000  -> hard rule "price above realistic maximum" (>60000)
--   'Budget Bunk Deal'    price   900  -> hard rule "price below realistic minimum" (<1500)
--   'Faraway Homes'       distance 45  -> hard rule "distance implausibly large" (>30 km)
--   'Shared Palace'       Shared @ 42000 -> ML outlier (Shared baseline ~6000) -> model flag
--   'Ghost Studio'        price 500 + distance 50 -> multiple reasons at once
-- ------------------------------------------------------------
INSERT INTO hostels
  (landlord_id, name, location, room_type, distance_km, price, description,
   utilities_included, ai_pick, verified, reviews_count, average_rating,
   availability, marker_x, marker_y)
VALUES
  (@landlord_id, 'Palm Luxury Suites', 'Juja',        'Single Room', 0.50, 95000.00, 'Single room listed at a luxury-suite price. Suspicious pricing.',           TRUE,  FALSE, FALSE, 0, 0.00, 'available', 40.00, 55.00),
  (@landlord_id, 'Budget Bunk Deal',   'Gate C',      'Studio',      0.80,   900.00, 'Studio advertised far below any realistic rent. Likely a scam bait price.', TRUE,  FALSE, FALSE, 0, 0.00, 'available', 31.00, 68.00),
  (@landlord_id, 'Faraway Homes',      'Nairobi CBD', 'Apartment',  45.00, 24000.00, 'Listed 45 km from campus, implausible for a campus hostel.',                TRUE,  FALSE, FALSE, 0, 0.00, 'available', 90.00, 90.00),
  (@landlord_id, 'Shared Palace',      'Juja',        'Shared',      1.00, 42000.00, 'A shared room priced like a luxury apartment. Price/room-type mismatch.',   TRUE,  FALSE, FALSE, 0, 0.00, 'available', 45.00, 47.00),
  (@landlord_id, 'Ghost Studio',       'Unknown',     'Studio',     50.00,   500.00, 'Almost-free studio 50 km away. Multiple red flags at once.',                TRUE,  FALSE, FALSE, 0, 0.00, 'available', 95.00, 95.00);

-- ------------------------------------------------------------
-- Reviews: a spread of POSITIVE, NEGATIVE and NEUTRAL comments
-- (for the sentiment model) with ratings that match the tone.
-- Attached to verified hostels, authored by the four students.
-- ------------------------------------------------------------
INSERT INTO reviews (user_id, hostel_id, rating, comment) VALUES
  -- Acacia Student Lodge — mostly positive
  (@s1, (SELECT id FROM hostels WHERE name = 'Acacia Student Lodge' AND landlord_id = @landlord_id), 5, 'Absolutely loved this place. Clean, secure, and the Wi-Fi is fast and reliable. Highly recommend!'),
  (@s2, (SELECT id FROM hostels WHERE name = 'Acacia Student Lodge' AND landlord_id = @landlord_id), 4, 'Very comfortable and close to campus. Water never runs out and the caretaker is helpful.'),
  (@s3, (SELECT id FROM hostels WHERE name = 'Acacia Student Lodge' AND landlord_id = @landlord_id), 3, 'It is okay. Nothing special but it does the job for the price.'),

  -- Gate A Residences — positive
  (@s2, (SELECT id FROM hostels WHERE name = 'Gate A Residences' AND landlord_id = @landlord_id), 5, 'Great value for money. The rooms are spotless and the landlord responds quickly.'),
  (@s4, (SELECT id FROM hostels WHERE name = 'Gate A Residences' AND landlord_id = @landlord_id), 4, 'Really good experience overall. Quiet at night and safe.'),

  -- Kefinco Court — mixed / negative
  (@s1, (SELECT id FROM hostels WHERE name = 'Kefinco Court' AND landlord_id = @landlord_id), 2, 'Overpriced and noisy. Security is poor and I often felt unsafe walking in at night.'),
  (@s3, (SELECT id FROM hostels WHERE name = 'Kefinco Court' AND landlord_id = @landlord_id), 3, 'Average rooms. The location is fine but the shared kitchen is small and crowded.'),

  -- Kalimoni Corner — negative
  (@s4, (SELECT id FROM hostels WHERE name = 'Kalimoni Corner' AND landlord_id = @landlord_id), 1, 'Terrible experience. The room was dirty and the water was always off. Would not recommend.'),
  (@s2, (SELECT id FROM hostels WHERE name = 'Kalimoni Corner' AND landlord_id = @landlord_id), 2, 'Wi-Fi never works and the landlord ignores every complaint. Very disappointing.'),

  -- Gate C Studios — positive
  (@s3, (SELECT id FROM hostels WHERE name = 'Gate C Studios' AND landlord_id = @landlord_id), 5, 'Fantastic modern studio. Private bathroom is a huge plus and everything is well maintained.'),
  (@s1, (SELECT id FROM hostels WHERE name = 'Gate C Studios' AND landlord_id = @landlord_id), 4, 'Comfortable and clean. A little pricey but worth it for the privacy.'),

  -- Highpoint Apartments — mixed
  (@s4, (SELECT id FROM hostels WHERE name = 'Highpoint Apartments' AND landlord_id = @landlord_id), 4, 'Spacious and bright. Good for sharing with friends, though it is a bit far from campus.'),
  (@s2, (SELECT id FROM hostels WHERE name = 'Highpoint Apartments' AND landlord_id = @landlord_id), 3, 'Decent apartment but the walls are thin and you can hear the neighbours.'),

  -- Juja Shared Homes — positive
  (@s3, (SELECT id FROM hostels WHERE name = 'Juja Shared Homes' AND landlord_id = @landlord_id), 5, 'Best budget option near campus. Friendly roommates and free water. Loved it.'),

  -- Membley Heights — negative
  (@s1, (SELECT id FROM hostels WHERE name = 'Membley Heights' AND landlord_id = @landlord_id), 2, 'Too far and the transport is expensive. The compound is nice but not worth the hassle.');

-- ------------------------------------------------------------
-- Refresh cached aggregates for every hostel owned by this landlord.
-- ------------------------------------------------------------
UPDATE hostels h
SET
  h.reviews_count  = (SELECT COUNT(*)  FROM reviews WHERE hostel_id = h.id),
  h.average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE hostel_id = h.id), 0.00)
WHERE h.landlord_id = @landlord_id;

-- ------------------------------------------------------------
-- Viewing history for one student, so the recommender has a
-- preference profile and produces "AI Pick" badges.
-- This student mostly views SINGLE ROOMS, so the recommender
-- should surface other single rooms as recommendations.
-- ------------------------------------------------------------
INSERT INTO user_interactions (user_id, hostel_id, interaction_type) VALUES
  (@s1, NULL, 'search'),
  (@s1, (SELECT id FROM hostels WHERE name = 'Acacia Student Lodge' AND landlord_id = @landlord_id), 'view'),
  (@s1, (SELECT id FROM hostels WHERE name = 'Gate A Residences'    AND landlord_id = @landlord_id), 'view'),
  (@s1, (SELECT id FROM hostels WHERE name = 'Gate D Singles'       AND landlord_id = @landlord_id), 'view'),
  (@s1, (SELECT id FROM hostels WHERE name = 'Acacia Student Lodge' AND landlord_id = @landlord_id), 'click');

-- ============================================================
-- PASTE-READY TEXTS FOR THE LIVE DEMO
-- ============================================================
-- Sentiment model (submit as a new review via the student UI; the
-- API response contains the sentiment classification):
--   POSITIVE : "This hostel is amazing! Super clean, safe, and the staff are very helpful."
--   NEGATIVE : "Awful place. Dirty rooms, no water, and the landlord is rude and unhelpful."
--   NEUTRAL  : "The room is fine. It is close to campus but fairly basic."
--
-- Fraud model (log in as ai.landlord and CREATE a new listing with any
-- of these; the create response returns flagged:true with reasons):
--   Price too high : Single Room, price 95000  -> "price above realistic maximum"
--   Price too low  : Studio,      price 900    -> "price below realistic minimum"
--   Too far        : Apartment,   distance 45  -> "distance from campus is implausibly large"
--   Mismatch       : Shared,      price 42000  -> model: "attributes are unusual versus typical listings"
-- ============================================================
