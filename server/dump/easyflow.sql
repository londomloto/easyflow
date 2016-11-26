/*
Navicat MySQL Data Transfer

Source Server         : mysql@local
Source Server Version : 50626
Source Host           : localhost:3306
Source Database       : easyflow

Target Server Type    : MYSQL
Target Server Version : 50626
File Encoding         : 65001

Date: 2016-11-21 17:41:23
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
INSERT INTO `application` VALUES ('20161118111952-578188', 'www.easyflow.io', 'frontend', 'Easyflow', 'editor diagram aktifitas berbasis web', 'Roso Sasongko', 'roso.sasongko@gmail.com', 'https://github.com/londomloto/easyflow', null, 'http://easyflow.io/', 'ubgQ1Xk81BmhlW2bgRRLYp2vWOkh8BU3cUeezh0e8zOxkrP7KQiI+fmgE4ylJa/NADshDpm6S627cMEjFqHf/g==', '1');
INSERT INTO `application` VALUES ('20161118112004-155692', 'www.easyflow.io/admin', 'backend', 'Admin Easyflow', null, 'Roso Sasongko', 'roso.sasongko@gmail.com', 'https://github.com/londomloto/easyflow', null, 'http://easyflow.io/admin/', 'QnZvBc/dRSycrm5jkgMt+hKhC1IenyGBuyywyZRzn0fcsfEuqOEc4yS9bEEdy5LumxGqvFAFkPhAagWMn9CNvA==', '1');

-- ----------------------------
-- Table structure for capability
-- ----------------------------
DROP TABLE IF EXISTS `capability`;
CREATE TABLE `capability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of capability
-- ----------------------------
INSERT INTO `capability` VALUES ('1', 'manage_app', 'Pengaturan aplikasi', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
INSERT INTO `capability` VALUES ('2', 'create_user', 'Pengaturan pengguna', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
INSERT INTO `capability` VALUES ('3', 'delete_tutorial', 'Hapus tutorial', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
INSERT INTO `capability` VALUES ('22', 'add_tutorial', 'Tambah tutorial', '');
INSERT INTO `capability` VALUES ('23', 'create_tutorial', 'Tambah tutorial', '');
INSERT INTO `capability` VALUES ('24', 'update_user', 'Sunting pengguna', '');
INSERT INTO `capability` VALUES ('25', 'remove_user', 'Hapus pengguna', '');

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
  `description` varchar(500) DEFAULT NULL,
  `removable` int(1) DEFAULT '1',
  `is_default` int(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES ('1', 'admin', 'Adminstrator', null, null, null);
INSERT INTO `role` VALUES ('2', 'user', 'User', null, '1', '1');
INSERT INTO `role` VALUES ('3', 'contributor', 'Contributor', null, '1', null);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', 'naima@yahoo.com', '4be0ad9091cf3a37f6d57b68ac95374c4ce772a8348f38d78a30965638959a85', 'f824c0', 'Naima Sarah Mikayla', 'Perempuan', 'Tukang neneng', 'Gadis gembul yang lucu', '53323204e77f4658167d33f521c5f976a082f810.png', 'avatar5.png', '', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0Nzc0NzYwMTIsImp0aSI6InNxa0tDQTRyTFwvNUhzUEJOQXhkMllXTE1GZXBjaWE5a3dHOXJDR1NSZUpVPSIsImlzcyI6ImRldi5sb2NhbCIsIm5iZiI6MTQ3NzQ3NjAyMiwiZXhwIjoxNDc3NDc2MDgyLCJkYXRhIjp7InVzZXJfaWQiOjEsInVzZXJfZW1haWwiOiJuYWltYUB5YWhvby5jb20ifX0.qoM1VyqFEYXeRvTUW2qqK0_lLSiV9mvDNAbC6-hwNqGXhwj4DNUZUswAoqPJwESqjIWySdFYG0TKwF5bLZHhWg', '2016-11-16 12:34:24', '2016-10-26 12:16:00', '127.0.0.1');
INSERT INTO `user` VALUES ('46', 'roso.sasongko@gmail.com', 'e5aec24b714ca99ac208ac6e2bf64da7b4e9663158e86fa5dce7e1c172c909ba', 'e01fbc', 'Roso Sasongko', 'Laki - Laki', 'Buruh ketik', 'Sedang sibuk bikin TA', '000e15178056fdf3c47fcf56b87513c05b81dbe1.png', '1757649-me_avatar_big.png', null, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0NzkyMjE4MTYsImp0aSI6IjdpZ0JnXC8zNVNwSzFQalhTbWN0VGRxb20yR2xGWXp3MXk0dFYwWXZKR1kwPSIsImlzcyI6ImVhc3lmbG93LmlvIiwibmJmIjoxNDc5MjIxODI2LCJleHAiOjE0NzkyMjE4ODYsImRhdGEiOnsidXNlcl9pZCI6NDYsInVzZXJfZW1haWwiOiJyb3NvLnNhc29uZ2tvQGdtYWlsLmNvbSJ9fQ.aD5_KHRyaQOLCdBXIEXH01UugHrgShdUGYGzyeUKkqH6TRyLT8B7T99nYTDbVaG2nbLL_UgGh-v-FY-est2D5Q', '2016-11-16 12:34:29', '2016-11-15 21:56:56', '127.0.0.1');
INSERT INTO `user` VALUES ('48', 'nurfarid8924@gmail.com', '367061449c46d06fa7140666d5a2781245fc0d599bb32baa02fb509186193c5e', '4470d2', 'Faridha Aridh', 'Perempuan', '', '', '7fe45db3d1d6e44787c6ee3ca1d882bf441592e2.png', 'avatar4.png', 'user', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0Nzk2ODYxNTgsImp0aSI6IjNHMmlHXC9lZWpJNEtvSkVFTURqVFVVdlBlK1d5VzRyYzBQXC9McE9Tcm1mMD0iLCJpc3MiOiJlYXN5Zmxvdy5pbyIsIm5iZiI6MTQ3OTY4NjE1OSwiZXhwIjoxNDc5Njg3NTU5LCJkYXRhIjp7InVzZXJfaWQiOjQ4LCJ1c2VyX2VtYWlsIjoibnVyZmFyaWQ4OTI0QGdtYWlsLmNvbSJ9fQ.SfCKjoSSF5jI9t_CwodLp1XmuteBXdoLfQfJ1MTY4-OZmhOwMEoXBtiJLVW0kAktNwf71EiGgi4z9RuYGWU15g', '2016-11-16 12:34:33', '2016-11-21 06:55:58', '127.0.0.1');
INSERT INTO `user` VALUES ('49', 'adjies4k4@gmail.com', 'e525a6f2bba0fbaa0fed66966268f4f8d81608bb035c7a6b8c4eefc32c549570', 'c627fb', 'Jaka Tingkir', null, null, null, 'abbc2d598c57a60bdd12d2dec68bb34188dc41a7.png', 'avatar1.png', null, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0NzkyMzczMzYsImp0aSI6ImZ1VHJ0dUhPXC95NFEwd0NHRTNJU3d1XC9OK1pxK1RcLzZ4RklUMXpSdklTTDA9IiwiaXNzIjoiZWFzeWZsb3cuaW8iLCJuYmYiOjE0NzkyMzczNDYsImV4cCI6MTQ3OTIzNzQwNiwiZGF0YSI6eyJ1c2VyX2lkIjo0OSwidXNlcl9lbWFpbCI6ImFkamllczRrNEBnbWFpbC5jb20ifX0.hTnFLtghoxYCxillcVKFy1350OGXMX54YkP_gdOm38qBxYRBZ09JGJGrt5H3lniEWwqeY8bvPQC_w2U3V2X1KA', '2016-11-16 12:34:37', '2016-11-16 01:55:53', '127.0.0.1');
INSERT INTO `user` VALUES ('50', null, 'f02da6a53d1020b65f51e9c0109bb5bfd9f46ddf4fbce2bbfced6b909e5e9a06', '7d42f0', null, null, null, null, null, null, null, null, '2016-11-21 14:04:50', null, null);
INSERT INTO `user` VALUES ('51', null, 'a9e564cad0f83484f8d7934ca813728b8feaddd9714442f4b96f570777e93446', 'f11e7a', null, null, null, null, null, null, null, null, '2016-11-21 14:05:14', null, null);
