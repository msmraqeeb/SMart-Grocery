-- SMart Grocery MySQL Database Schema for cPanel
-- Import this SQL script into phpMyAdmin

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Profiles / Users Table
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NULL,
  `full_name` VARCHAR(255) NULL,
  `role` VARCHAR(50) DEFAULT 'customer',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NULL,
  `image_url` TEXT NULL,
  `parent_id` BIGINT DEFAULT NULL,
  `item_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) NULL,
  `category` VARCHAR(255) NULL,
  `brand` VARCHAR(255) NULL,
  `unit` VARCHAR(50) NULL,
  `sku` VARCHAR(100) NULL,
  `images` JSON NULL,
  `image_url` TEXT NULL,
  `short_description` TEXT NULL,
  `description` LONGTEXT NULL,
  `badge` VARCHAR(100) NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `variants` JSON NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NULL,
  `customer_phone` VARCHAR(50) NULL,
  `customer_address` TEXT NULL,
  `customer_district` VARCHAR(100) NULL,
  `customer_area` VARCHAR(100) NULL,
  `subtotal` DECIMAL(10,2) DEFAULT 0,
  `shipping_cost` DECIMAL(10,2) DEFAULT 0,
  `discount` DECIMAL(10,2) DEFAULT 0,
  `total` DECIMAL(10,2) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `items` JSON NULL,
  `coupon_code` VARCHAR(50) NULL,
  `user_id` VARCHAR(36) NULL,
  `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` JSON NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Wishlist Table
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `product_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Addresses Table
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `full_name` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `address_line` TEXT NULL,
  `district` VARCHAR(100) NULL,
  `area` VARCHAR(100) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Pages Table
CREATE TABLE IF NOT EXISTS `pages` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `content` LONGTEXT NULL,
  `is_published` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Brands Table
CREATE TABLE IF NOT EXISTS `brands` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NULL,
  `logo_url` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Attributes Table
CREATE TABLE IF NOT EXISTS `attributes` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `values` JSON NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Coupons Table
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) NOT NULL UNIQUE,
  `discount_type` VARCHAR(50) NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `minimum_spend` DECIMAL(10,2) DEFAULT 0,
  `expiry_date` DATE NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `auto_apply` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NULL,
  `product_name` VARCHAR(255) NULL,
  `author_name` VARCHAR(255) NULL,
  `rating` INT CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT NULL,
  `reply` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Banners Table
CREATE TABLE IF NOT EXISTS `banners` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(100) NOT NULL,
  `image_url` TEXT NOT NULL,
  `title` VARCHAR(255) NULL,
  `subtitle` VARCHAR(255) NULL,
  `link` TEXT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Blog Posts Table
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NULL,
  `image_url` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
