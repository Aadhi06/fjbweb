-- MySQL dump 10.13  Distrib 9.3.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: fjbweb
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blogs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'General',
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `author_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogs_slug_unique` (`slug`),
  KEY `blogs_author_id_foreign` (`author_id`),
  CONSTRAINT `blogs_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_settings`
--

DROP TABLE IF EXISTS `booking_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `day_of_week` tinyint NOT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT '1',
  `open_time` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '10:00',
  `close_time` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '18:00',
  `slot_duration_minutes` int NOT NULL DEFAULT '30',
  `max_bookings_per_slot` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_settings_day_of_week_unique` (`day_of_week`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_settings`
--

LOCK TABLES `booking_settings` WRITE;
/*!40000 ALTER TABLE `booking_settings` DISABLE KEYS */;
INSERT INTO `booking_settings` VALUES (1,0,0,'10:00','18:00',30,1,'2026-07-04 09:00:33','2026-07-04 09:00:33'),(2,1,1,'10:00','18:00',30,1,'2026-07-04 09:00:33','2026-07-04 09:00:33'),(3,2,1,'10:00','18:00',30,1,'2026-07-04 09:00:33','2026-07-04 09:00:33'),(4,3,1,'10:00','18:00',30,1,'2026-07-04 09:00:33','2026-07-04 09:00:33'),(5,4,1,'10:00','18:00',30,1,'2026-07-04 09:00:33','2026-07-04 09:00:33'),(6,5,1,'10:00','18:00',30,1,'2026-07-04 09:00:33','2026-07-04 09:00:33'),(7,6,1,'10:00','18:00',30,1,'2026-07-04 09:00:33','2026-07-04 09:00:33');
/*!40000 ALTER TABLE `booking_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookings_booking_date_booking_time_index` (`booking_date`,`booking_time`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'Aadhil Nazeer','aadhilnazeer07@gmail.com','+94774145195','Sell Gold','2026-07-06','10:00',NULL,'completed','2026-07-04 09:21:44','2026-07-04 09:22:13');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-google_reviews','a:6:{s:10:\"place_name\";s:21:\"Fine Jewellery Buyers\";s:6:\"rating\";d:4.9;s:13:\"total_reviews\";i:1000;s:7:\"reviews\";a:0:{}s:19:\"google_review_count\";i:0;s:19:\"manual_review_count\";i:0;}',1783319913),('laravel-cache-metal_rates','a:2:{s:4:\"data\";a:5:{i:0;a:7:{s:5:\"metal\";s:8:\"Gold 9ct\";s:14:\"price_per_gram\";d:37.7084;s:21:\"buying_price_per_gram\";d:32.05;s:12:\"price_per_oz\";d:1172.864;s:10:\"change_24h\";d:0;s:8:\"currency\";s:3:\"GBP\";s:10:\"updated_at\";s:25:\"2026-07-05T07:05:06+00:00\";}i:1;a:7:{s:5:\"metal\";s:9:\"Gold 18ct\";s:14:\"price_per_gram\";d:75.4169;s:21:\"buying_price_per_gram\";d:64.1;s:12:\"price_per_oz\";d:2345.7281;s:10:\"change_24h\";d:0;s:8:\"currency\";s:3:\"GBP\";s:10:\"updated_at\";s:25:\"2026-07-05T07:05:06+00:00\";}i:2;a:7:{s:5:\"metal\";s:9:\"Gold 22ct\";s:14:\"price_per_gram\";d:92.1795;s:21:\"buying_price_per_gram\";d:78.35;s:12:\"price_per_oz\";d:2867.1052;s:10:\"change_24h\";d:0;s:8:\"currency\";s:3:\"GBP\";s:10:\"updated_at\";s:25:\"2026-07-05T07:05:06+00:00\";}i:3;a:7:{s:5:\"metal\";s:9:\"Gold 24ct\";s:14:\"price_per_gram\";d:100.4552;s:21:\"buying_price_per_gram\";d:85.39;s:12:\"price_per_oz\";d:3124.5098;s:10:\"change_24h\";d:0;s:8:\"currency\";s:3:\"GBP\";s:10:\"updated_at\";s:25:\"2026-07-05T07:05:06+00:00\";}i:4;a:7:{s:5:\"metal\";s:6:\"Silver\";s:14:\"price_per_gram\";d:1.5018;s:21:\"buying_price_per_gram\";d:1.28;s:12:\"price_per_oz\";d:46.7115;s:10:\"change_24h\";d:0;s:8:\"currency\";s:3:\"GBP\";s:10:\"updated_at\";s:25:\"2026-07-05T07:05:06+00:00\";}}s:11:\"gold_carats\";a:4:{i:0;a:5:{s:5:\"carat\";s:3:\"9ct\";s:5:\"label\";s:8:\"Gold 9ct\";s:6:\"purity\";d:0.375;s:14:\"price_per_gram\";d:37.7084;s:21:\"buying_price_per_gram\";d:32.05;}i:1;a:5:{s:5:\"carat\";s:4:\"18ct\";s:5:\"label\";s:9:\"Gold 18ct\";s:6:\"purity\";d:0.75;s:14:\"price_per_gram\";d:75.4169;s:21:\"buying_price_per_gram\";d:64.1;}i:2;a:5:{s:5:\"carat\";s:4:\"22ct\";s:5:\"label\";s:9:\"Gold 22ct\";s:6:\"purity\";d:0.9167;s:14:\"price_per_gram\";d:92.1795;s:21:\"buying_price_per_gram\";d:78.35;}i:3;a:5:{s:5:\"carat\";s:4:\"24ct\";s:5:\"label\";s:9:\"Gold 24ct\";s:6:\"purity\";d:0.999;s:14:\"price_per_gram\";d:100.4552;s:21:\"buying_price_per_gram\";d:85.39;}}}',1783235131),('laravel-cache-setting.about_description','s:0:\"\";',1783237113),('laravel-cache-setting.about_mission','s:0:\"\";',1783237113),('laravel-cache-setting.about_title','s:27:\"About Fine Jewellery Buyers\";',1783237113),('laravel-cache-setting.about_values','s:2:\"[]\";',1783237113),('laravel-cache-setting.about_vision','s:0:\"\";',1783237113),('laravel-cache-setting.address','s:45:\"Suite 39 88-90 Hatton Garden London \nEC1N 8PN\";',1783237998),('laravel-cache-setting.admin_email','s:0:\"\";',1783237998),('laravel-cache-setting.business_name','s:21:\"Fine Jewellery Buyers\";',1783237998),('laravel-cache-setting.buying_percentage','d:85;',1783237051),('laravel-cache-setting.email','s:33:\"contact@finejewellerybuyers.co.uk\";',1783237998),('laravel-cache-setting.ga_id','s:0:\"\";',1783237113),('laravel-cache-setting.google_place_id','s:27:\"ChIJo6TwHKkbdkgRCfYK2s1HUxk\";',1783237113),('laravel-cache-setting.google_rating','d:4.9;',1783237113),('laravel-cache-setting.google_review_url','s:0:\"\";',1783237113),('laravel-cache-setting.gtm_id','s:0:\"\";',1783237113),('laravel-cache-setting.happy_customers','s:7:\"10,000+\";',1783237113),('laravel-cache-setting.logo_size','d:76;',1783237998),('laravel-cache-setting.logo_url','s:49:\"http://localhost:8002/uploads/logo_1783175925.png\";',1783237998),('laravel-cache-setting.meta_pixel_id','s:0:\"\";',1783237113),('laravel-cache-setting.metal_api_key','s:32:\"23a2ee45912395f11128fd93f0a7842d\";',1783237051),('laravel-cache-setting.metal_api_provider','s:0:\"\";',1783237051),('laravel-cache-setting.newsletter_popup_button_text','s:9:\"Subscribe\";',1783237627),('laravel-cache-setting.newsletter_popup_cookie_days','i:14;',1783237627),('laravel-cache-setting.newsletter_popup_delay_seconds','i:8;',1783237627),('laravel-cache-setting.newsletter_popup_enabled','b:1;',1783237627),('laravel-cache-setting.newsletter_popup_message','s:90:\"Join our list for gold price alerts, selling tips and exclusive offers from Hatton Garden.\";',1783237627),('laravel-cache-setting.newsletter_popup_show_name','b:0;',1783237627),('laravel-cache-setting.newsletter_popup_success_message','s:50:\"Thank you! We look forward to keeping you updated.\";',1783237627),('laravel-cache-setting.newsletter_popup_title','s:13:\"Stay in Touch\";',1783237627),('laravel-cache-setting.opening_hours','s:26:\"Mon - Friday 10.00 - 18.00\";',1783237998),('laravel-cache-setting.phone','s:13:\"020 3411 1438\";',1783237998),('laravel-cache-setting.tagline','s:0:\"\";',1783237998),('laravel-cache-setting.top_bar_ticker','a:4:{i:0;a:3:{s:4:\"text\";s:20:\"Sell Your Gold Today\";s:3:\"url\";s:11:\"/live-rates\";s:7:\"enabled\";b:1;}i:1;a:3:{s:4:\"text\";s:50:\"We Buy Cartier, Tiffany & Boodles — Instant Cash\";s:3:\"url\";s:24:\"/services/sell-jewellery\";s:7:\"enabled\";b:1;}i:2;a:3:{s:4:\"text\";s:32:\"Free Valuation — No Obligation\";s:3:\"url\";s:15:\"/free-valuation\";s:7:\"enabled\";b:1;}i:3;a:3:{s:4:\"text\";s:33:\"Visit Us at Hatton Garden, London\";s:3:\"url\";s:17:\"/book-appointment\";s:7:\"enabled\";b:1;}}',1783237369),('laravel-cache-setting.top_bar_ticker_speed','i:35;',1783237369),('laravel-cache-setting.total_reviews','i:1000;',1783237113),('laravel-cache-setting.total_sales','s:5:\"£5M+\";',1783237113),('laravel-cache-setting.trustpilot_url','s:0:\"\";',1783237113),('laravel-cache-setting.whatsapp','s:13:\"+447378254305\";',1783237998),('laravel-cache-setting.years_in_business','i:15;',1783237113);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_fields`
--

DROP TABLE IF EXISTS `form_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_fields` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `form_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `placeholder` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `options` json DEFAULT NULL,
  `validation_rules` json DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `form_fields_form_id_foreign` (`form_id`),
  CONSTRAINT `form_fields_form_id_foreign` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_fields`
--

LOCK TABLES `form_fields` WRITE;
/*!40000 ALTER TABLE `form_fields` DISABLE KEYS */;
INSERT INTO `form_fields` VALUES (1,1,'name','Full Name','text','John Smith',1,NULL,NULL,1,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(2,1,'email','Email Address','email','john@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(3,1,'phone','Phone Number','phone','07XXX XXXXXX',1,NULL,NULL,3,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(4,1,'item_type','What are you selling?','select',NULL,1,'[\"Gold Jewellery\", \"Diamonds\", \"Luxury Watch\", \"Silver\", \"Platinum\", \"Branded Jewellery\", \"Gemstones\", \"Other\"]',NULL,4,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(5,1,'description','Item Description','textarea','Describe your item(s) - carat, weight, brand, condition...',1,NULL,NULL,5,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(6,1,'photos','Upload Photos','file',NULL,0,NULL,NULL,6,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(7,1,'preferred_contact','Preferred Contact Method','radio',NULL,1,'[\"Phone\", \"Email\", \"WhatsApp\"]',NULL,7,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(8,1,'consent','I agree to the privacy policy','checkbox',NULL,1,NULL,NULL,8,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(9,2,'name','Full Name','text','Your name',1,NULL,NULL,1,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(10,2,'email','Email Address','email','you@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(11,2,'phone','Phone Number','phone','07XXX XXXXXX',0,NULL,NULL,3,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(12,2,'subject','Subject','select',NULL,1,'[\"Selling Gold\", \"Selling Diamonds\", \"Selling Watches\", \"General Enquiry\", \"Complaint\", \"Other\"]',NULL,4,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(13,2,'message','Your Message','textarea','Tell us how we can help...',1,NULL,NULL,5,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(14,3,'name','Full Name','text','John Smith',1,NULL,NULL,1,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(15,3,'email','Email Address','email','john@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(16,3,'phone','Phone Number','phone','07XXX XXXXXX',1,NULL,NULL,3,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(17,3,'gold_type','Gold Type','select',NULL,1,'[\"Jewellery\", \"Scrap Gold\", \"Coins\", \"Bars/Bullion\", \"Dental Gold\", \"Other\"]',NULL,4,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(18,3,'carat','Carat (if known)','select',NULL,0,'[\"9ct\", \"14ct\", \"18ct\", \"22ct\", \"24ct\", \"Unknown\"]',NULL,5,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(19,3,'weight','Approximate Weight (grams)','text','e.g. 15g',0,NULL,NULL,6,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(20,3,'description','Item Description','textarea','Describe your gold items...',1,NULL,NULL,7,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(21,3,'photos','Upload Photos','file',NULL,0,NULL,NULL,8,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(22,4,'name','Full Name','text','John Smith',1,NULL,NULL,1,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(23,4,'email','Email Address','email','john@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(24,4,'phone','Phone Number','phone','07XXX XXXXXX',1,NULL,NULL,3,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(25,4,'diamond_type','Diamond Type','select',NULL,1,'[\"Loose Diamond\", \"Diamond Ring\", \"Diamond Earrings\", \"Diamond Necklace\", \"Diamond Bracelet\", \"Other\"]',NULL,4,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(26,4,'certification','Certification','select',NULL,0,'[\"GIA Certified\", \"IGI Certified\", \"HRD Certified\", \"Other Certificate\", \"Uncertified\"]',NULL,5,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(27,4,'description','Item Description','textarea','Size, shape, clarity, colour if known...',1,NULL,NULL,6,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(28,4,'photos','Upload Photos','file',NULL,0,NULL,NULL,7,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(29,5,'name','Full Name','text','John Smith',1,NULL,NULL,1,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(30,5,'email','Email Address','email','john@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(31,5,'phone','Phone Number','phone','07XXX XXXXXX',1,NULL,NULL,3,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(32,5,'brand','Watch Brand','select',NULL,1,'[\"Rolex\", \"Omega\", \"Cartier\", \"Patek Philippe\", \"Audemars Piguet\", \"Breitling\", \"IWC\", \"TAG Heuer\", \"Other\"]',NULL,4,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(33,5,'model','Model Name/Number','text','e.g. Submariner, Speedmaster...',0,NULL,NULL,5,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(34,5,'condition','Condition','select',NULL,1,'[\"Excellent\", \"Good\", \"Fair\", \"Poor\", \"Not Working\"]',NULL,6,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(35,5,'box_papers','Box & Papers','select',NULL,0,'[\"Full Set (Box + Papers)\", \"Box Only\", \"Papers Only\", \"Neither\"]',NULL,7,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(36,5,'description','Additional Details','textarea','Year, service history, any damage...',0,NULL,NULL,8,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(37,5,'photos','Upload Photos','file',NULL,0,NULL,NULL,9,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(38,6,'name','Full Name','text','John Smith',1,NULL,NULL,1,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(39,6,'email','Email Address','email','john@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(40,6,'phone','Phone Number','phone','07XXX XXXXXX',1,NULL,NULL,3,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(41,6,'jewellery_type','Jewellery Type','select',NULL,1,'[\"Ring\", \"Necklace\", \"Bracelet\", \"Earrings\", \"Brooch\", \"Set\", \"Other\"]',NULL,4,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(42,6,'brand','Brand (if applicable)','text','e.g. Cartier, Tiffany...',0,NULL,NULL,5,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(43,6,'description','Item Description','textarea','Materials, gemstones, condition...',1,NULL,NULL,6,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(44,6,'photos','Upload Photos','file',NULL,0,NULL,NULL,7,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(45,7,'name','Full Name','text','John Smith',1,NULL,NULL,1,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(46,7,'email','Email Address','email','john@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(47,7,'phone','Phone Number','phone','07XXX XXXXXX',1,NULL,NULL,3,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(48,7,'silver_type','Silver Type','select',NULL,1,'[\"Jewellery\", \"Silverware/Cutlery\", \"Coins\", \"Bars\", \"Antique Silver\", \"Other\"]',NULL,4,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(49,7,'weight','Approximate Weight (grams)','text','e.g. 500g',0,NULL,NULL,5,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(50,7,'description','Item Description','textarea','Describe your silver items...',1,NULL,NULL,6,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(51,7,'photos','Upload Photos','file',NULL,0,NULL,NULL,7,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(52,8,'name','Full Name','text','John Smith',1,NULL,NULL,1,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(53,8,'email','Email Address','email','john@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(54,8,'phone','Phone Number','phone','07XXX XXXXXX',1,NULL,NULL,3,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(55,8,'gemstone_type','Gemstone Type','select',NULL,1,'[\"Ruby\", \"Sapphire\", \"Emerald\", \"Tanzanite\", \"Aquamarine\", \"Tourmaline\", \"Other\"]',NULL,4,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(56,8,'setting','Setting','select',NULL,1,'[\"Loose Stone\", \"Set in Ring\", \"Set in Necklace\", \"Set in Earrings\", \"Other Setting\"]',NULL,5,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(57,8,'description','Item Description','textarea','Size, colour, certification if any...',1,NULL,NULL,6,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(58,8,'photos','Upload Photos','file',NULL,0,NULL,NULL,7,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(59,9,'name','Full Name','text','John Smith',1,NULL,NULL,1,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(60,9,'email','Email Address','email','john@example.com',1,NULL,NULL,2,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(61,9,'phone','Phone Number','phone','07XXX XXXXXX',1,NULL,NULL,3,1,'2026-07-04 09:46:15','2026-07-04 09:46:15');
/*!40000 ALTER TABLE `form_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_submission_files`
--

DROP TABLE IF EXISTS `form_submission_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_submission_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `form_submission_id` bigint unsigned NOT NULL,
  `field_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `form_submission_files_form_submission_id_foreign` (`form_submission_id`),
  CONSTRAINT `form_submission_files_form_submission_id_foreign` FOREIGN KEY (`form_submission_id`) REFERENCES `form_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_submission_files`
--

LOCK TABLES `form_submission_files` WRITE;
/*!40000 ALTER TABLE `form_submission_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `form_submission_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_submissions`
--

DROP TABLE IF EXISTS `form_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_submissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `form_id` bigint unsigned NOT NULL,
  `data` json NOT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `form_submissions_form_id_foreign` (`form_id`),
  CONSTRAINT `form_submissions_form_id_foreign` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_submissions`
--

LOCK TABLES `form_submissions` WRITE;
/*!40000 ALTER TABLE `form_submissions` DISABLE KEYS */;
INSERT INTO `form_submissions` VALUES (1,2,'{\"name\": \"Test User\", \"email\": \"test@example.com\", \"phone\": \"07123456789\", \"message\": \"This is a test message\", \"subject\": \"General Enquiry\"}','127.0.0.1','curl/8.7.1','new',NULL,'2026-07-04 09:47:38','2026-07-04 09:47:38'),(2,9,'{\"name\": \"Gold Seller\", \"email\": \"gold@example.com\", \"phone\": \"07987654321\", \"gold_items\": \"Gold 18ct: 10g @ £75.37/g = £753.70\", \"items_count\": \"1\", \"estimated_total\": \"£753.70\"}','127.0.0.1','curl/8.7.1','new',NULL,'2026-07-04 09:47:44','2026-07-04 09:47:44'),(3,1,'{\"name\": \"Jane Doe\", \"email\": \"jane@example.com\", \"phone\": \"07111222333\", \"consent\": \"on\", \"item_type\": \"Gold Jewellery\", \"description\": \"18ct gold necklace, about 25g\", \"preferred_contact\": \"Email\"}','127.0.0.1','curl/8.7.1','new',NULL,'2026-07-04 09:48:16','2026-07-04 09:48:16'),(4,9,'{\"name\": \"Aadhil Nazeer\", \"email\": \"aadhilnazeer07@gmail.com\", \"phone\": \"+94774145195\", \"gold_items\": \"Gold 9ct: 10g @ £33.94/g = £339.40\\r\\nGold 18ct: 10g @ £67.87/g = £678.70\", \"items_count\": \"2\", \"estimated_total\": \"£1,018.10\"}','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','new',NULL,'2026-07-04 09:50:47','2026-07-04 09:50:47'),(5,1,'{\"name\": \"Aadhil Nazeer\", \"email\": \"vsofttuk@gmail.com\", \"phone\": \"+94774145195\", \"consent\": \"on\", \"item_type\": \"Gold Jewellery\", \"description\": \"fgh\", \"preferred_contact\": \"Phone\"}','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','new',NULL,'2026-07-04 19:54:27','2026-07-04 19:54:27');
/*!40000 ALTER TABLE `form_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forms` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `success_message` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Thank you! We will be in touch.',
  `notification_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `forms_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forms`
--

LOCK TABLES `forms` WRITE;
/*!40000 ALTER TABLE `forms` DISABLE KEYS */;
INSERT INTO `forms` VALUES (1,'Free Valuation','free-valuation','Fill in the form below and our experts will provide a free valuation within 24 hours.','Thank you! We will contact you within 24 hours with a valuation.',NULL,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(2,'Contact Us','contact','Get in touch with our team. We\'ll respond within 24 hours.','Thank you for contacting us. We\'ll be in touch shortly!',NULL,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(3,'Sell Gold','sell-gold','Tell us about your gold items for a quick valuation.','Thank you! We\'ll send you a gold valuation within 24 hours.',NULL,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(4,'Sell Diamonds','sell-diamonds','Tell us about your diamonds for an expert valuation.','Thank you! Our gemologists will review your submission and respond within 24 hours.',NULL,1,'2026-07-04 09:46:14','2026-07-04 09:46:14'),(5,'Sell Watches','sell-watches','Tell us about your luxury watch for a valuation.','Thank you! Our watch specialists will respond within 24 hours.',NULL,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(6,'Sell Jewellery','sell-jewellery','Tell us about your fine jewellery for a valuation.','Thank you! We\'ll review your jewellery details and respond within 24 hours.',NULL,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(7,'Sell Silver','sell-silver','Tell us about your silver items for a valuation.','Thank you! We\'ll provide a silver valuation within 24 hours.',NULL,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(8,'Sell Gemstones','sell-gemstones','Tell us about your precious gemstones for an expert valuation.','Thank you! Our gemologists will assess your submission and respond within 24 hours.',NULL,1,'2026-07-04 09:46:15','2026-07-04 09:46:15'),(9,'Gold Calculator Valuation','gold-valuation','Request an exact valuation based on your gold calculator estimate.','Thank you! We\'ll review your gold estimate and contact you within 24 hours with an exact valuation.',NULL,1,'2026-07-04 09:46:15','2026-07-04 09:46:15');
/*!40000 ALTER TABLE `forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `google_reviews_cache`
--

DROP TABLE IF EXISTS `google_reviews_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `google_reviews_cache` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `place_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `place_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `total_reviews` int NOT NULL DEFAULT '0',
  `reviews` json DEFAULT NULL,
  `fetched_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `google_reviews_cache`
--

LOCK TABLES `google_reviews_cache` WRITE;
/*!40000 ALTER TABLE `google_reviews_cache` DISABLE KEYS */;
INSERT INTO `google_reviews_cache` VALUES (1,'ChIJo6TwHKkbdkgRCfYK2s1HUxk','Fine Jewellery Buyers',0.00,0,'[]','2026-07-04 10:21:03','2026-07-04 10:20:12','2026-07-04 10:21:03');
/*!40000 ALTER TABLE `google_reviews_cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manual_reviews`
--

DROP TABLE IF EXISTS `manual_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manual_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint unsigned NOT NULL DEFAULT '5',
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_date` date DEFAULT NULL,
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manual_reviews`
--

LOCK TABLES `manual_reviews` WRITE;
/*!40000 ALTER TABLE `manual_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `manual_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketing_campaign_recipients`
--

DROP TABLE IF EXISTS `marketing_campaign_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketing_campaign_recipients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `campaign_id` bigint unsigned NOT NULL,
  `contact_id` bigint unsigned DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `marketing_campaign_recipients_campaign_id_email_unique` (`campaign_id`,`email`),
  KEY `marketing_campaign_recipients_contact_id_foreign` (`contact_id`),
  CONSTRAINT `marketing_campaign_recipients_campaign_id_foreign` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `marketing_campaign_recipients_contact_id_foreign` FOREIGN KEY (`contact_id`) REFERENCES `marketing_contacts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketing_campaign_recipients`
--

LOCK TABLES `marketing_campaign_recipients` WRITE;
/*!40000 ALTER TABLE `marketing_campaign_recipients` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketing_campaign_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketing_campaigns`
--

DROP TABLE IF EXISTS `marketing_campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketing_campaigns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_html` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `audience` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'subscribed',
  `filter_tags` json DEFAULT NULL,
  `total_recipients` int unsigned NOT NULL DEFAULT '0',
  `sent_count` int unsigned NOT NULL DEFAULT '0',
  `failed_count` int unsigned NOT NULL DEFAULT '0',
  `created_by` bigint unsigned DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `marketing_campaigns_created_by_foreign` (`created_by`),
  CONSTRAINT `marketing_campaigns_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketing_campaigns`
--

LOCK TABLES `marketing_campaigns` WRITE;
/*!40000 ALTER TABLE `marketing_campaigns` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketing_campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketing_contacts`
--

DROP TABLE IF EXISTS `marketing_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketing_contacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `sources` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `is_subscribed` tinyint(1) NOT NULL DEFAULT '1',
  `consent_at` timestamp NULL DEFAULT NULL,
  `first_seen_at` timestamp NULL DEFAULT NULL,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `last_contacted_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `marketing_contacts_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketing_contacts`
--

LOCK TABLES `marketing_contacts` WRITE;
/*!40000 ALTER TABLE `marketing_contacts` DISABLE KEYS */;
INSERT INTO `marketing_contacts` VALUES (1,'test@example.com','Test User','07123456789','[\"form:contact\", \"General Enquiry\"]','[{\"at\": \"2026-07-04T15:17:38+00:00\", \"id\": 1, \"slug\": \"contact\", \"type\": \"form\", \"label\": \"Contact Us\"}]','{\"name\": \"Test User\", \"email\": \"test@example.com\", \"phone\": \"07123456789\", \"message\": \"This is a test message\", \"subject\": \"General Enquiry\"}',1,'2026-07-04 09:47:38','2026-07-04 09:47:38','2026-07-04 09:47:38',NULL,NULL,'2026-07-04 20:17:31','2026-07-04 20:17:31'),(2,'gold@example.com','Gold Seller','07987654321','[\"form:gold-valuation\"]','[{\"at\": \"2026-07-04T15:17:44+00:00\", \"id\": 2, \"slug\": \"gold-valuation\", \"type\": \"form\", \"label\": \"Gold Calculator Valuation\"}]','{\"name\": \"Gold Seller\", \"email\": \"gold@example.com\", \"phone\": \"07987654321\", \"gold_items\": \"Gold 18ct: 10g @ £75.37/g = £753.70\", \"items_count\": \"1\", \"estimated_total\": \"£753.70\"}',1,'2026-07-04 09:47:44','2026-07-04 09:47:44','2026-07-04 09:47:44',NULL,NULL,'2026-07-04 20:17:31','2026-07-04 20:17:31'),(3,'jane@example.com','Jane Doe','07111222333','[\"form:free-valuation\", \"Gold Jewellery\"]','[{\"at\": \"2026-07-04T15:18:16+00:00\", \"id\": 3, \"slug\": \"free-valuation\", \"type\": \"form\", \"label\": \"Free Valuation\"}]','{\"name\": \"Jane Doe\", \"email\": \"jane@example.com\", \"phone\": \"07111222333\", \"consent\": \"on\", \"item_type\": \"Gold Jewellery\", \"description\": \"18ct gold necklace, about 25g\", \"preferred_contact\": \"Email\"}',1,'2026-07-04 09:48:16','2026-07-04 09:48:16','2026-07-04 09:48:16',NULL,NULL,'2026-07-04 20:17:31','2026-07-04 20:17:31'),(4,'aadhilnazeer07@gmail.com','Aadhil Nazeer','+94774145195','[\"form:gold-valuation\", \"booking\", \"service:Sell Gold\"]','[{\"at\": \"2026-07-04T15:20:47+00:00\", \"id\": 4, \"slug\": \"gold-valuation\", \"type\": \"form\", \"label\": \"Gold Calculator Valuation\"}, {\"at\": \"2026-07-04T14:51:44+00:00\", \"id\": 1, \"type\": \"booking\", \"label\": \"Appointment — Sell Gold\"}]','{\"name\": \"Aadhil Nazeer\", \"email\": \"aadhilnazeer07@gmail.com\", \"notes\": null, \"phone\": \"+94774145195\", \"gold_items\": \"Gold 9ct: 10g @ £33.94/g = £339.40\\r\\nGold 18ct: 10g @ £67.87/g = £678.70\", \"items_count\": \"2\", \"booking_date\": \"2026-07-06\", \"booking_time\": \"10:00\", \"service_type\": \"Sell Gold\", \"estimated_total\": \"£1,018.10\"}',1,'2026-07-04 09:50:47','2026-07-04 09:50:47','2026-07-04 09:21:44',NULL,NULL,'2026-07-04 20:17:31','2026-07-05 01:22:03'),(5,'vsofttuk@gmail.com','Aadhil Nazeer','+94774145195','[\"form:free-valuation\", \"Gold Jewellery\"]','[{\"at\": \"2026-07-05T01:24:27+00:00\", \"id\": 5, \"slug\": \"free-valuation\", \"type\": \"form\", \"label\": \"Free Valuation\"}]','{\"name\": \"Aadhil Nazeer\", \"email\": \"vsofttuk@gmail.com\", \"phone\": \"+94774145195\", \"consent\": \"on\", \"item_type\": \"Gold Jewellery\", \"description\": \"fgh\", \"preferred_contact\": \"Phone\"}',1,'2026-07-04 19:54:27','2026-07-04 19:54:27','2026-07-04 19:54:27',NULL,NULL,'2026-07-04 20:17:31','2026-07-04 20:17:31');
/*!40000 ALTER TABLE `marketing_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metal_rates`
--

DROP TABLE IF EXISTS `metal_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metal_rates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `metal` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purity` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `market_price_per_gram` decimal(12,4) NOT NULL,
  `market_price_per_oz` decimal(12,4) DEFAULT NULL,
  `buying_percentage` decimal(5,2) NOT NULL DEFAULT '92.00',
  `change_24h` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GBP',
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `rate_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metal_rates`
--

LOCK TABLES `metal_rates` WRITE;
/*!40000 ALTER TABLE `metal_rates` DISABLE KEYS */;
INSERT INTO `metal_rates` VALUES (1,'gold','9ct','Gold 9ct',37.7084,1172.8640,85.00,0.0000,'GBP',0,1,'2026-07-05 01:35:06','2026-07-04 09:24:56','2026-07-05 01:35:06'),(2,'gold','18ct','Gold 18ct',75.4169,2345.7281,85.00,0.0000,'GBP',1,1,'2026-07-05 01:35:06','2026-07-04 09:24:56','2026-07-05 01:35:06'),(3,'gold','22ct','Gold 22ct',92.1795,2867.1052,85.00,0.0000,'GBP',2,1,'2026-07-05 01:35:06','2026-07-04 09:24:56','2026-07-05 01:35:06'),(4,'gold','24ct','Gold 24ct',100.4552,3124.5098,85.00,0.0000,'GBP',3,1,'2026-07-05 01:35:06','2026-07-04 09:24:56','2026-07-05 01:35:06'),(5,'silver','999','Silver',1.5018,46.7115,85.00,0.0000,'GBP',10,1,'2026-07-05 01:35:06','2026-07-04 09:24:56','2026-07-05 01:35:06');
/*!40000 ALTER TABLE `metal_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2025_01_01_000003_create_settings_table',1),(5,'2025_01_01_000004_create_metal_rates_table',1),(6,'2025_01_01_000005_create_forms_table',1),(7,'2025_01_01_000006_create_services_table',1),(8,'2025_01_01_000007_create_blogs_table',1),(9,'2025_01_01_000008_create_google_reviews_cache_table',1),(10,'2025_01_01_000009_create_bookings_table',1),(11,'2025_01_01_000010_create_booking_settings_table',1),(12,'2026_07_04_141704_create_personal_access_tokens_table',1),(13,'2026_07_04_200000_add_author_id_to_blogs_table',2),(14,'2026_07_04_210000_create_team_members_table',2),(15,'2026_07_04_210000_create_manual_reviews_table',3),(16,'2026_07_05_000001_create_marketing_tables',4);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'admin-token','e448a044b4c27b90dc963c8077a48db390190fc4bc50e5a13a22a36448b5ffe4','[\"*\"]',NULL,NULL,'2026-07-04 09:00:49','2026-07-04 09:00:49'),(2,'App\\Models\\User',1,'admin-token','095215777aa7817edeaeba93dbb9e56cfee99cec042399fe452eac44b4dd6ebe','[\"*\"]','2026-07-04 09:24:07',NULL,'2026-07-04 09:01:50','2026-07-04 09:24:07'),(3,'App\\Models\\User',1,'admin-token','551c0b294ae04f4e6b01eb4ba2c9e8c6f496d9602eeac65f08c02626aff1cc2a','[\"*\"]',NULL,NULL,'2026-07-04 09:28:56','2026-07-04 09:28:56'),(4,'App\\Models\\User',1,'admin-token','a7ffeef19461683341a0e60c0bc406f302a3b703173ed544574d30ff5098b458','[\"*\"]',NULL,NULL,'2026-07-04 09:29:17','2026-07-04 09:29:17'),(5,'App\\Models\\User',1,'admin-token','01228dc04062ad2204fbc00b771ef160fbe86b1ae6af510065140748b7342508','[\"*\"]',NULL,NULL,'2026-07-04 09:29:38','2026-07-04 09:29:38'),(6,'App\\Models\\User',1,'admin-token','721eb31ffda096d474fe8af087c19d5cfdf9ceb0f52463756789494e02b3d412','[\"*\"]',NULL,NULL,'2026-07-04 09:29:55','2026-07-04 09:29:55'),(7,'App\\Models\\User',1,'admin-token','017f1e6afcbf4899f8eeeed9e2863abfef90d5865be92b3387a98acdab84f04f','[\"*\"]',NULL,NULL,'2026-07-04 09:30:22','2026-07-04 09:30:22'),(8,'App\\Models\\User',1,'admin-token','285eccc17319d6c8bbe83c58b3242da4048da6c97803dda5601ada5be3ef2878','[\"*\"]',NULL,NULL,'2026-07-04 09:30:40','2026-07-04 09:30:40'),(9,'App\\Models\\User',1,'admin-token','862c8808fcba0dfa15dd3bce25e6279adb3df8016cc1573f9632bfd9f31ec3f2','[\"*\"]',NULL,NULL,'2026-07-04 09:31:01','2026-07-04 09:31:01'),(10,'App\\Models\\User',1,'admin-token','1f653b8887ce04387b205b6fbe86000601d7232ece6c60295bbe5414d3b95a80','[\"*\"]',NULL,NULL,'2026-07-04 09:32:57','2026-07-04 09:32:57'),(11,'App\\Models\\User',1,'admin-token','d542a1c3a05fdadf5b68c1674d6c5d223f6cc02fe41a5f6e176a51f28f244be3','[\"*\"]',NULL,NULL,'2026-07-04 09:33:37','2026-07-04 09:33:37'),(12,'App\\Models\\User',1,'admin-token','9fde3b81985d35e48d491a9be5bd944145094d25cb71d026fefcae377792a380','[\"*\"]','2026-07-04 09:34:50',NULL,'2026-07-04 09:34:50','2026-07-04 09:34:50'),(13,'App\\Models\\User',1,'admin-token','11c5efa90b53c399256fdf2788dd60a59fef3ebe6ba0afb1a4b34348479cec96','[\"*\"]','2026-07-04 09:52:44',NULL,'2026-07-04 09:35:28','2026-07-04 09:52:44'),(14,'App\\Models\\User',1,'admin-token','0e02ee4520c0eef82a47b99f56118b2361fe35d606bdd7d2acaaa544728b0907','[\"*\"]','2026-07-04 10:11:32',NULL,'2026-07-04 10:09:53','2026-07-04 10:11:32'),(15,'App\\Models\\User',1,'admin-token','e78aaf63a21cb088129f95b789c85c007730049aea3cb78434b36c52e2ee03c7','[\"*\"]','2026-07-05 01:32:43',NULL,'2026-07-04 10:19:09','2026-07-05 01:32:43');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Get Free Valuation',
  `items` json DEFAULT NULL,
  `benefits` json DEFAULT NULL,
  `faqs` json DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `services_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `group` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'business_name','Fine Jewellery Buyers','text','general','Business Name','2026-07-04 09:02:11','2026-07-04 09:02:11'),(2,'tagline','','text','general','Tagline','2026-07-04 09:02:11','2026-07-04 09:02:11'),(3,'phone','020 3411 1438','text','general','Phone','2026-07-04 09:02:11','2026-07-04 09:02:11'),(4,'email','contact@finejewellerybuyers.co.uk','text','general','Email','2026-07-04 09:02:11','2026-07-04 09:05:55'),(5,'address','Suite 39 88-90 Hatton Garden London \nEC1N 8PN','text','general','Address','2026-07-04 09:02:11','2026-07-04 09:06:21'),(6,'opening_hours','Mon - Friday 10.00 - 18.00','text','general','Opening Hours','2026-07-04 09:02:11','2026-07-04 09:06:42'),(7,'logo_url','http://localhost:8002/uploads/logo_1783175925.png','text','general','Logo Url','2026-07-04 09:02:11','2026-07-04 09:08:48'),(8,'whatsapp','+447378254305','text','general','Whatsapp','2026-07-04 09:02:11','2026-07-04 09:05:55'),(9,'metal_api_provider','','text','api','Metal Api Provider','2026-07-04 09:23:47','2026-07-04 09:23:47'),(10,'metal_api_key','23a2ee45912395f11128fd93f0a7842d','text','api','Metal Api Key','2026-07-04 09:23:47','2026-07-04 09:23:47'),(11,'buying_percentage','85','number','api','Buying Percentage','2026-07-04 09:23:47','2026-07-04 19:43:34'),(12,'admin_email','','text','email','Admin Email','2026-07-04 09:35:35','2026-07-04 09:35:35'),(13,'google_place_id','ChIJo6TwHKkbdkgRCfYK2s1HUxk','text','google','Google Place Id','2026-07-04 10:19:18','2026-07-04 10:20:11'),(14,'google_api_key','AIzaSyA7Ac7iMS_jxeZSBl7GZT81Yyws919xEyw','text','google','Google Api Key','2026-07-04 10:19:18','2026-07-04 10:28:26'),(15,'logo_size','76','number','general','Logo Size','2026-07-05 01:23:06','2026-07-05 01:23:06');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@finejewellerybuyers.co.uk',NULL,'$2y$12$Q3tkb1YRJ2Bq0T5bA5e5ZeceUNIe29urd2qWNGjfCk4P.Ai1n/6n6',NULL,'2026-07-04 09:00:33','2026-07-04 09:00:33');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-05 12:35:16
