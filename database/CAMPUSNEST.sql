-- ==========================================
-- CampusNest AI (Improved Student-Friendly Schema)
-- ==========================================

DROP DATABASE IF EXISTS student_accommodation;
CREATE DATABASE student_accommodation;
USE student_accommodation;

-- ==========================================
-- 1) USERS
-- ==========================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_role ENUM('student', 'landlord', 'admin') DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2) HOSTELS
-- ==========================================
CREATE TABLE hostels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  landlord_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  room_type ENUM('Single Room', 'Shared', 'Studio', 'Apartment') DEFAULT 'Single Room',
  distance_km DECIMAL(5,2) DEFAULT 0.00,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  utilities_included BOOLEAN DEFAULT TRUE,
  ai_pick BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  reviews_count INT DEFAULT 0,
  marker_x DECIMAL(5,2) DEFAULT 50.00,
  marker_y DECIMAL(5,2) DEFAULT 50.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 3) HOSTEL IMAGES
-- ==========================================
CREATE TABLE hostel_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- ==========================================
-- 4) SAVED HOSTELS
-- ==========================================
CREATE TABLE saved_hostels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  hostel_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_saved (student_id, hostel_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- ==========================================
-- 5) REVIEWS
-- ==========================================
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hostel_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (rating BETWEEN 1 AND 5),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- ==========================================
-- 6) BOOKINGS
-- ==========================================
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hostel_id INT NOT NULL,
  booking_date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_booking (user_id, hostel_id, booking_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- ==========================================
-- 7) PAYMENTS
-- ==========================================
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ==========================================
-- 8) USER INTERACTIONS (Analytics / AI Ready)
-- ==========================================
CREATE TABLE user_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hostel_id INT NULL, -- allows search interactions without specific hostel
  interaction_type ENUM('view', 'click', 'search') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- ==========================================
-- DEFAULT ADMIN ACCOUNT
-- ==========================================
INSERT INTO users (full_name, email, password, user_role)
VALUES (
  'System Admin',
  'campusnestai@gmail.com',
  '$2b$10$TZ58pBrGMxWBoZ77dvW9rur5fairCs2M/HCLY9rd.e7oc2yEHnlTG',
  'admin'
)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  user_role = VALUES(user_role);
  
  -- changes to table 
  ALTER TABLE hostels
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00;

ALTER TABLE hostels
ADD COLUMN availability ENUM('available','full') DEFAULT 'available';




  