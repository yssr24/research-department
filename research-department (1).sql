-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 23, 2024 at 07:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `research-department`
--

-- --------------------------------------------------------

--
-- Table structure for table `analytics`
--

CREATE TABLE `analytics` (
  `analytics_id` int(11) NOT NULL,
  `paper_id` int(11) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `downloads` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL,
  `paper_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `co_authors`
--

CREATE TABLE `co_authors` (
  `coauthor_id` int(11) NOT NULL,
  `paper_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `papers`
--

CREATE TABLE `papers` (
  `paper_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `abstract` text DEFAULT NULL,
  `keywords` varchar(100) NOT NULL,
  `category` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `submission_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('submitted','in_review','accepted','rejected','published') DEFAULT 'submitted',
  `researcher_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `publication_history`
--

CREATE TABLE `publication_history` (
  `history_id` int(11) NOT NULL,
  `paper_id` int(11) NOT NULL,
  `publication_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `citation_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviewers`
--

CREATE TABLE `reviewers` (
  `reviewer_id` int(11) NOT NULL,
  `paper_id` int(11) NOT NULL,
  `editor_id` int(11) NOT NULL,
  `review_deadline` date DEFAULT NULL,
  `status` enum('assigned','reviewed','pending') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` int(11) NOT NULL,
  `setting_name` varchar(100) NOT NULL,
  `setting_value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('researcher','editor','administrator') NOT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `password`, `role`, `approval_status`, `created_at`) VALUES
(47, 'admin', 'admin', 'pandapatan.yasser@minsu.edu.ph', '$2b$10$3GIciFZSN5zux38iJbG7huKHejwbeOiVxfIQG7yTLCIMRtsCeFE/e', 'administrator', 'approved', '2024-11-17 13:55:56'),
(53, 'Aldea', 'Mean', 'aldeamean13@gmail.com', '$2b$10$SxW/hfqydKxHNn1XB2P56OYQxA0yVkCDJTk6/92kLa1sqxFeUaHaO', 'researcher', 'approved', '2024-11-18 02:03:14'),
(54, 'Janrey', 'Carpio', 'johnraycarpio1404@gmail.com', '$2b$10$6BsCiX5/HOg4TrjvYw9acer8YfFt06SPK6XursrGeFEQ3keTcygn2', 'researcher', 'approved', '2024-11-18 03:33:33');

-- --------------------------------------------------------

--
-- Table structure for table `user_approvals`
--

CREATE TABLE `user_approvals` (
  `approval_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `token_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_tokens`
--

INSERT INTO `user_tokens` (`token_id`, `user_id`, `token`, `created_at`) VALUES
(31, 47, '2495d3dde99aed9aadb1ab12cd4770595b8451ee', '2024-11-17 13:55:56'),
(36, 53, 'cebb47101a34ff4321728d7436ab470bed7393ef', '2024-11-18 02:03:14'),
(37, 54, 'e2ec873db841b10238b18a0bb064348984e6856b', '2024-11-18 03:33:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `analytics`
--
ALTER TABLE `analytics`
  ADD PRIMARY KEY (`analytics_id`),
  ADD KEY `paper_id` (`paper_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `paper_id` (`paper_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Indexes for table `co_authors`
--
ALTER TABLE `co_authors`
  ADD PRIMARY KEY (`coauthor_id`),
  ADD KEY `paper_id` (`paper_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `papers`
--
ALTER TABLE `papers`
  ADD PRIMARY KEY (`paper_id`),
  ADD KEY `researcher_id` (`researcher_id`);

--
-- Indexes for table `publication_history`
--
ALTER TABLE `publication_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `paper_id` (`paper_id`);

--
-- Indexes for table `reviewers`
--
ALTER TABLE `reviewers`
  ADD PRIMARY KEY (`reviewer_id`),
  ADD KEY `paper_id` (`paper_id`),
  ADD KEY `editor_id` (`editor_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_name` (`setting_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_approvals`
--
ALTER TABLE `user_approvals`
  ADD PRIMARY KEY (`approval_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `analytics`
--
ALTER TABLE `analytics`
  MODIFY `analytics_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `co_authors`
--
ALTER TABLE `co_authors`
  MODIFY `coauthor_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `papers`
--
ALTER TABLE `papers`
  MODIFY `paper_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `publication_history`
--
ALTER TABLE `publication_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviewers`
--
ALTER TABLE `reviewers`
  MODIFY `reviewer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `user_approvals`
--
ALTER TABLE `user_approvals`
  MODIFY `approval_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `analytics`
--
ALTER TABLE `analytics`
  ADD CONSTRAINT `analytics_ibfk_1` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`paper_id`);

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`paper_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `reviewers` (`reviewer_id`) ON DELETE CASCADE;

--
-- Constraints for table `co_authors`
--
ALTER TABLE `co_authors`
  ADD CONSTRAINT `co_authors_ibfk_1` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`paper_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `co_authors_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `papers`
--
ALTER TABLE `papers`
  ADD CONSTRAINT `papers_ibfk_1` FOREIGN KEY (`researcher_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `publication_history`
--
ALTER TABLE `publication_history`
  ADD CONSTRAINT `publication_history_ibfk_1` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`paper_id`) ON DELETE CASCADE;

--
-- Constraints for table `reviewers`
--
ALTER TABLE `reviewers`
  ADD CONSTRAINT `reviewers_ibfk_1` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`paper_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviewers_ibfk_2` FOREIGN KEY (`editor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_approvals`
--
ALTER TABLE `user_approvals`
  ADD CONSTRAINT `user_approvals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
