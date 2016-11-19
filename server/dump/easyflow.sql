/*
Navicat MySQL Data Transfer

Source Server         : mysql@local
Source Server Version : 50626
Source Host           : localhost:3306
Source Database       : easyflow

Target Server Type    : MYSQL
Target Server Version : 50626
File Encoding         : 65001

Date: 2016-11-19 13:56:53
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for application
-- ----------------------------
DROP TABLE IF EXISTS `application`;
CREATE TABLE `application` (
  `id` varchar(64) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `type` varchar(30) DEFAULT 'frontend',
  `title` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `author_email` varchar(255) DEFAULT NULL,
  `github_page` varchar(255) DEFAULT NULL,
  `facebook_page` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `key` varchar(255) DEFAULT NULL,
  `active` int(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of application
-- ----------------------------
INSERT INTO `application` VALUES ('20161118111952-578188', 'es-frontend', 'frontend', 'Easyflow', 'editor diagram aktifitas berbasis web', 'Roso Sasongko', 'roso.sasongko@gmail.com', 'https://github.com/londomloto/easyflow', null, 'http://easyflow.io/', 'ubgQ1Xk81BmhlW2bgRRLYp2vWOkh8BU3cUeezh0e8zOxkrP7KQiI+fmgE4ylJa/NADshDpm6S627cMEjFqHf/g==', '1');
INSERT INTO `application` VALUES ('20161118112004-155692', 'es-backend', 'backend', 'Admin Easyflow', null, 'Roso Sasongko', 'roso.sasongko@gmail.com', 'https://github.com/londomloto/easyflow', null, 'http://easyflow.io/admin/', 'QnZvBc/dRSycrm5jkgMt+hKhC1IenyGBuyywyZRzn0fcsfEuqOEc4yS9bEEdy5LumxGqvFAFkPhAagWMn9CNvA==', '1');

-- ----------------------------
-- Table structure for capability
-- ----------------------------
DROP TABLE IF EXISTS `capability`;
CREATE TABLE `capability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of capability
-- ----------------------------
INSERT INTO `capability` VALUES ('1', 'manage_site');
INSERT INTO `capability` VALUES ('2', 'manage_user');
INSERT INTO `capability` VALUES ('3', 'delete_tutorial');

-- ----------------------------
-- Table structure for diagram
-- ----------------------------
DROP TABLE IF EXISTS `diagram`;
CREATE TABLE `diagram` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `user_contrib` varchar(30) DEFAULT 'CREATE',
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `cover` varchar(255) DEFAULT 'diagram.jpg',
  `created_date` datetime DEFAULT NULL,
  `updated_date` datetime DEFAULT NULL,
  `published` int(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of diagram
-- ----------------------------
INSERT INTO `diagram` VALUES ('4', '49', 'CREATE', 'Example diagram', 'Just for example only', '38eaa2e2fdf0c96d2e7e2442cb1f8459a877ddd7.jpg', '2016-11-16 04:22:43', '2016-11-16 04:22:43', '1');
INSERT INTO `diagram` VALUES ('5', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', 'c1f92ecff5aa9fa75d18486a5de084b563bd1715.png', '2016-11-16 04:24:51', '2016-11-16 04:24:51', '1');
INSERT INTO `diagram` VALUES ('6', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', 'f21608de2c27f3f57a634ddc62f980522bf8ef35.png', '2016-11-16 04:25:26', '2016-11-16 04:25:26', '1');
INSERT INTO `diagram` VALUES ('7', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '1d9c84d86bbf6df51e3e697bc0bc4838a4a167a9.png', '2016-11-16 04:45:21', '2016-11-16 04:45:21', '1');
INSERT INTO `diagram` VALUES ('8', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:46:15', '2016-11-16 04:46:15', '1');
INSERT INTO `diagram` VALUES ('9', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:46:30', '2016-11-16 04:46:30', '1');
INSERT INTO `diagram` VALUES ('10', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:46:51', '2016-11-16 04:46:51', '1');
INSERT INTO `diagram` VALUES ('11', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:46:59', '2016-11-16 04:46:59', '1');
INSERT INTO `diagram` VALUES ('12', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:46:59', '2016-11-16 04:46:59', '1');
INSERT INTO `diagram` VALUES ('13', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:47:04', '2016-11-16 04:47:04', '1');
INSERT INTO `diagram` VALUES ('14', '49', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', 'd6ce910cf52971b976415f5ff5a73c7fb0cac251.jpg', '2016-11-16 04:50:27', '2016-11-16 04:50:27', '1');
INSERT INTO `diagram` VALUES ('27', '48', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '555012e138d99a7aed8ddc7caa18145f08e1caf2.jpg', '2016-11-16 19:29:17', '2016-11-16 19:39:56', '1');
INSERT INTO `diagram` VALUES ('28', '48', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', 'd54d8675c5b01a35a50c948ab43749414bbb9c5c.jpg', '2016-11-16 19:36:34', '2016-11-16 19:40:24', '1');
INSERT INTO `diagram` VALUES ('29', '48', 'CREATE', 'Contoh diagram', 'Keterangan tentang diagram', '2a20c30c512b3dc5ca2f6466f64aa8befac48d9c.jpg', '2016-11-16 19:36:48', '2016-11-16 19:40:29', '1');

-- ----------------------------
-- Table structure for inbox
-- ----------------------------
DROP TABLE IF EXISTS `inbox`;
CREATE TABLE `inbox` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `message` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of inbox
-- ----------------------------

-- ----------------------------
-- Table structure for permission
-- ----------------------------
DROP TABLE IF EXISTS `permission`;
CREATE TABLE `permission` (
  `role_id` int(11) DEFAULT NULL,
  `capability_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of permission
-- ----------------------------

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `removable` int(1) DEFAULT '1',
  `is_default` int(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES ('1', 'admin', 'Adminstrator', '0', '0');
INSERT INTO `role` VALUES ('2', 'user', 'User', '1', '1');
INSERT INTO `role` VALUES ('3', 'contributor', 'Contributor', '1', '0');

-- ----------------------------
-- Table structure for site
-- ----------------------------
DROP TABLE IF EXISTS `site`;
CREATE TABLE `site` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `author_email` varchar(255) DEFAULT NULL,
  `github_page` varchar(255) DEFAULT NULL,
  `facebook_page` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of site
-- ----------------------------
INSERT INTO `site` VALUES ('1', 'easyflow', 'Easyflow', 'editor diagram aktifitas berbasis web', 'Roso Sasongko', 'roso.sasongko@gmail.com', 'https://github.com/londomloto/easyflow', null);

-- ----------------------------
-- Table structure for tutorial
-- ----------------------------
DROP TABLE IF EXISTS `tutorial`;
CREATE TABLE `tutorial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `poster` varchar(255) DEFAULT NULL,
  `video` varchar(255) DEFAULT NULL,
  `video_type` varchar(20) DEFAULT 'video/mp4',
  `created_date` datetime DEFAULT NULL,
  `created_by` varchar(100) DEFAULT 'SYSTEM',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tutorial
-- ----------------------------
INSERT INTO `tutorial` VALUES ('1', 'Tutorial membuat kue donat dengan teknik pengasapan', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', 'tutorial_poster.jpg', 'ebc2616e9d6ff9bb27755b216aaad2c357ed4dc1.mp4', 'video/mp4', '2016-11-16 08:46:09', 'SYSTEM');
INSERT INTO `tutorial` VALUES ('2', 'Membuat diagram', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', 'tutorial_poster.jpg', 'tutorial.mp4', 'video/mp4', '2016-11-16 09:23:50', 'SYSTEM');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `passwd` varchar(100) DEFAULT NULL,
  `passwd_salt` varchar(20) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `sex` varchar(20) DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `avatar_name` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `token` varchar(500) DEFAULT NULL,
  `register_date` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `last_ip` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', 'naima@yahoo.com', '4be0ad9091cf3a37f6d57b68ac95374c4ce772a8348f38d78a30965638959a85', 'f824c0', 'Naima Sarah Mikayla', 'Perempuan', 'Tukang neneng', 'Gadis gembul yang lucu', '55d72550a296f070057b89545f09600ddebf05cd.jpg', '01_160328045758.jpg', '', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0Nzc0NzYwMTIsImp0aSI6InNxa0tDQTRyTFwvNUhzUEJOQXhkMllXTE1GZXBjaWE5a3dHOXJDR1NSZUpVPSIsImlzcyI6ImRldi5sb2NhbCIsIm5iZiI6MTQ3NzQ3NjAyMiwiZXhwIjoxNDc3NDc2MDgyLCJkYXRhIjp7InVzZXJfaWQiOjEsInVzZXJfZW1haWwiOiJuYWltYUB5YWhvby5jb20ifX0.qoM1VyqFEYXeRvTUW2qqK0_lLSiV9mvDNAbC6-hwNqGXhwj4DNUZUswAoqPJwESqjIWySdFYG0TKwF5bLZHhWg', '2016-11-16 12:34:24', '2016-10-26 12:16:00', '127.0.0.1');
INSERT INTO `user` VALUES ('46', 'roso.sasongko@gmail.com', 'e5aec24b714ca99ac208ac6e2bf64da7b4e9663158e86fa5dce7e1c172c909ba', 'e01fbc', 'Roso Sasongko', 'Laki - Laki', 'Buruh ketik', 'Sedang sibuk bikin TA', 'a347c327f0848cb7b43a53ba092af9b6fa6e52ae.jpg', '11987195_682208611913900_6376520968472438491_n.jpg', null, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0NzkyMjE4MTYsImp0aSI6IjdpZ0JnXC8zNVNwSzFQalhTbWN0VGRxb20yR2xGWXp3MXk0dFYwWXZKR1kwPSIsImlzcyI6ImVhc3lmbG93LmlvIiwibmJmIjoxNDc5MjIxODI2LCJleHAiOjE0NzkyMjE4ODYsImRhdGEiOnsidXNlcl9pZCI6NDYsInVzZXJfZW1haWwiOiJyb3NvLnNhc29uZ2tvQGdtYWlsLmNvbSJ9fQ.aD5_KHRyaQOLCdBXIEXH01UugHrgShdUGYGzyeUKkqH6TRyLT8B7T99nYTDbVaG2nbLL_UgGh-v-FY-est2D5Q', '2016-11-16 12:34:29', '2016-11-15 21:56:56', '127.0.0.1');
INSERT INTO `user` VALUES ('48', 'nurfarid8924@gmail.com', '367061449c46d06fa7140666d5a2781245fc0d599bb32baa02fb509186193c5e', '4470d2', 'Faridha Aridh', 'Perempuan', '', '', '8d1f701462f6a8dc2cb89948f15de7bb2a30de17.jpg', 'photo.jpg', 'user', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0Nzk1MDg3NDIsImp0aSI6IkRkdVRaVlRxcHZQNVNXZ2NmZWlUdlYwMmVkNFwvVkQrMVVlXC9NMk52bTVydz0iLCJpc3MiOiJlYXN5Zmxvdy5pbyIsIm5iZiI6MTQ3OTUwODc0MywiZXhwIjoxNDc5NTEwMTQzLCJkYXRhIjp7InVzZXJfaWQiOjQ4LCJ1c2VyX2VtYWlsIjoibnVyZmFyaWQ4OTI0QGdtYWlsLmNvbSJ9fQ.OBWMQ2ZOuN8JvcrnPa7l9Cgrd0Dd6GHd2Mkx4YDgNG4WTTfpNxznYDhesjkBxv0-SmVN1F5WVU10euLMvXOKhA', '2016-11-16 12:34:33', '2016-11-19 05:39:02', '127.0.0.1');
INSERT INTO `user` VALUES ('49', 'adjies4k4@gmail.com', 'e525a6f2bba0fbaa0fed66966268f4f8d81608bb035c7a6b8c4eefc32c549570', 'c627fb', 'Jaka Tingkir', null, null, null, '41f28638033febd356a3d55b920072af01d306c4.jpg', '12376830_993932100698647_3521195658288418292_n.jpg', null, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0NzkyMzczMzYsImp0aSI6ImZ1VHJ0dUhPXC95NFEwd0NHRTNJU3d1XC9OK1pxK1RcLzZ4RklUMXpSdklTTDA9IiwiaXNzIjoiZWFzeWZsb3cuaW8iLCJuYmYiOjE0NzkyMzczNDYsImV4cCI6MTQ3OTIzNzQwNiwiZGF0YSI6eyJ1c2VyX2lkIjo0OSwidXNlcl9lbWFpbCI6ImFkamllczRrNEBnbWFpbC5jb20ifX0.hTnFLtghoxYCxillcVKFy1350OGXMX54YkP_gdOm38qBxYRBZ09JGJGrt5H3lniEWwqeY8bvPQC_w2U3V2X1KA', '2016-11-16 12:34:37', '2016-11-16 01:55:53', '127.0.0.1');
