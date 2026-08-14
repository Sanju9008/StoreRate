USE `storerate_db`;

-- Disable foreign key checks for clean insertion
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `ratings`;
TRUNCATE TABLE `stores`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `jwt_tokens`;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed Users
-- Passwords are encrypted using bcrypt (Cost: 10)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `address`, `role`) VALUES 
('c53db1dc-58b1-4b13-b5f3-c5a0ec7e24b7', 'System Platform Administrator Lead', 'admin@platform.com', '$2b$10$okaBESGZ7JbPTRgQVIhAl.JiEvLTJZ7ZD1cmHw4B.Us0RshQzGPRy', '123 Admin Street, Tech City', 'SYSTEM_ADMIN'),
('f8d2ac2c-7b44-469b-8e17-b715a3a60c85', 'Registered Store Owner Representative', 'owner@platform.com', '$2b$10$zHsynZxEbn/UEbGtRXf7gORI9gl.Y2mcrvTHWMWC4Ud6CEB4yjR5a', '456 Business Blvd, Commerce City', 'STORE_OWNER'),
('a37e588b-2401-4ec9-bf4d-8cfd0d5d71c4', 'Verified Regular Customer Profile', 'user@platform.com', '$2b$10$.9yRy4.DonO1Y2DEewvvEud/QKB86lBly3lK0zj0wdBGpfHTZkQNi', '789 Consumer Ave, Retail City', 'NORMAL_USER');

-- Seed Stores (Linked to Store Owner)
INSERT INTO `stores` (`id`, `name`, `email`, `address`, `owner_id`) VALUES 
('18e95738-f9b1-4c12-8238-d65287f3b890', 'Tech Gadgets Store', 'contact@techgadgets.com', '123 Tech Park, Innovation Valley', 'f8d2ac2c-7b44-469b-8e17-b715a3a60c85'),
('29f45619-a1b2-4d13-9149-e76398f4c912', 'Daily Needs Supermarket', 'hello@dailyneeds.com', '456 Supermarket Lane, Shopping District', 'f8d2ac2c-7b44-469b-8e17-b715a3a60c85');

-- Seed Initial Rating (Rating: 5 by Normal User for Tech Gadgets Store)
INSERT INTO `ratings` (`id`, `rating`, `user_id`, `store_id`) VALUES 
('3b1f5829-b2c3-5e24-a259-f87409f5d123', 5, 'a37e588b-2401-4ec9-bf4d-8cfd0d5d71c4', '18e95738-f9b1-4c12-8238-d65287f3b890');
