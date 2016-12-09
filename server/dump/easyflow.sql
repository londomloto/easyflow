/*
Navicat MySQL Data Transfer

Source Server         : mysql@ubuntuvm
Source Server Version : 50549
Source Host           : 192.168.164.128:3306
Source Database       : easyflow

Target Server Type    : MYSQL
Target Server Version : 50549
File Encoding         : 65001

Date: 2016-12-05 18:04:02
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for diagram
-- ----------------------------
DROP TABLE IF EXISTS `diagram`;
CREATE TABLE `diagram` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `user_contrib` varchar(30) DEFAULT 'CREATE',
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `cover` varchar(255) DEFAULT 'diagram.jpg',
  `created_date` datetime DEFAULT NULL,
  `updated_date` datetime DEFAULT NULL,
  `published` int(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of diagram
-- ----------------------------
INSERT INTO `diagram` VALUES ('4', '55', 'CREATE', 'Diagram Bisnis Proses', 'diagram-bisnis-proses', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'd74a7fa1e6cd26c1761d2471079a90a4532111ff.jpg', '2016-12-04 21:22:43', '2016-12-04 04:22:43', '1');
INSERT INTO `diagram` VALUES ('5', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-13', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '1272d46629d07fe7c8475a7c4c4eb372729cbde7.jpg', '2016-11-16 04:24:51', '2016-11-16 04:24:51', '1');
INSERT INTO `diagram` VALUES ('6', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-2', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'af3b3ae6880169d5344054b5b018599430904ce2.jpg', '2016-11-16 04:25:26', '2016-11-16 04:25:26', '1');
INSERT INTO `diagram` VALUES ('7', '65', 'CREATE', 'Contoh diagram', 'contoh-diagram-3', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'f43d24277eae3f87131110f027f18249e9a49e14.jpg', '2016-11-16 04:45:21', '2016-11-16 04:45:21', '1');
INSERT INTO `diagram` VALUES ('8', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-4', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '45207820df7f0c77f72b5ef1407474125ecf6fcd.jpg', '2016-11-16 04:46:15', '2016-11-16 04:46:15', '1');
INSERT INTO `diagram` VALUES ('9', '55', 'CREATE', 'Bisnis proses', 'bisnis-proses', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:46:30', '2016-11-16 04:46:30', '1');
INSERT INTO `diagram` VALUES ('10', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-5', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\r\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\r\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\r\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\r\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\r\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'e0ea8bc92f29a3f568a9ad6d5207ae5b75de23e0.jpg', '2016-11-16 04:46:51', '2016-11-16 04:46:51', '1');
INSERT INTO `diagram` VALUES ('11', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-13', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\nquis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\nconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\ncillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\nproident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:46:59', '2016-11-16 04:46:59', '1');
INSERT INTO `diagram` VALUES ('12', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-12', 'Keterangan tentang diagram', '0e1a18cea70cc583ee5d1bbcf9a0c4a0c168a921.jpg', '2016-11-16 04:46:59', '2016-11-16 04:46:59', '1');
INSERT INTO `diagram` VALUES ('13', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-6', 'Keterangan tentang diagram', '8b3c6731580d3c1d70b1ffc945d91579d78c09e7.jpg', '2016-11-16 04:47:04', '2016-11-16 04:47:04', '1');
INSERT INTO `diagram` VALUES ('14', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-11', 'Keterangan tentang diagram', '06a60ea7b3f057bb6806038a73f1027fda1c510e.jpg', '2016-11-16 04:50:27', '2016-11-16 04:50:27', '1');
INSERT INTO `diagram` VALUES ('27', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-10', 'Keterangan tentang diagram', 'c634a932e16bce075537907a53b23704d5bb9017.jpg', '2016-11-16 19:29:17', '2016-11-16 19:39:56', '1');
INSERT INTO `diagram` VALUES ('28', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-9', 'Keterangan tentang diagram', 'd54d8675c5b01a35a50c948ab43749414bbb9c5c.jpg', '2016-11-16 19:36:34', '2016-11-16 19:40:24', '1');
INSERT INTO `diagram` VALUES ('29', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-8', 'Keterangan tentang diagram', '2a20c30c512b3dc5ca2f6466f64aa8befac48d9c.jpg', '2016-11-16 19:36:48', '2016-11-16 19:40:29', '1');
INSERT INTO `diagram` VALUES ('30', '55', 'CREATE', 'Contoh diagram', 'contoh-diagram-7', 'Keterangan tentang diagram', 'diagram.jpg', '2016-11-28 00:59:24', '2016-11-28 00:59:24', '1');

-- ----------------------------
-- Table structure for inbox
-- ----------------------------
DROP TABLE IF EXISTS `inbox`;
CREATE TABLE `inbox` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `subject` varchar(300) DEFAULT NULL,
  `message` varchar(1000) DEFAULT NULL,
  `message_date` datetime DEFAULT NULL,
  `deleted` int(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of inbox
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
  `permission` int(11) DEFAULT NULL,
  `removable` int(1) DEFAULT '1',
  `is_default` int(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES ('1', 'admin', 'Adminstrator', '', '65534', '0', '0');
INSERT INTO `role` VALUES ('2', 'user', 'User', '', '65534', '1', '1');
INSERT INTO `role` VALUES ('3', 'contributor', 'Contributor', '', '65534', '1', '0');
INSERT INTO `role` VALUES ('10', 'guest', 'Tamu', null, '65534', '1', '0');

-- ----------------------------
-- Table structure for setting
-- ----------------------------
DROP TABLE IF EXISTS `setting`;
CREATE TABLE `setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `section` varchar(30) DEFAULT 'site',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of setting
-- ----------------------------
INSERT INTO `setting` VALUES ('1', 'name', 'easyflow.io', 'site');
INSERT INTO `setting` VALUES ('2', 'url', 'http://easyflow.io/', 'site');
INSERT INTO `setting` VALUES ('3', 'author', 'Roso Sasongko', 'site');
INSERT INTO `setting` VALUES ('4', 'email', 'roso.sasongko@gmail.com', 'site');
INSERT INTO `setting` VALUES ('5', 'title', 'Easyflow', 'site');
INSERT INTO `setting` VALUES ('6', 'description', 'editor diagram aktifitas berbasis web', 'site');
INSERT INTO `setting` VALUES ('7', 'comp_name', 'Easyflow Foundation', 'site');
INSERT INTO `setting` VALUES ('8', 'comp_addr', 'Jl. H. Kimah No. 212, Pancoran Mas', 'site');
INSERT INTO `setting` VALUES ('9', 'comp_city', 'Depok', 'site');
INSERT INTO `setting` VALUES ('10', 'comp_state', 'Jawa Barat', 'site');
INSERT INTO `setting` VALUES ('11', 'comp_country', 'Indonesia', 'site');
INSERT INTO `setting` VALUES ('12', 'facebook_page', '', 'site');
INSERT INTO `setting` VALUES ('13', 'twitter_page', '', 'site');
INSERT INTO `setting` VALUES ('14', 'google_page', '', 'site');
INSERT INTO `setting` VALUES ('15', 'comp_zipcode', '16434', 'site');
INSERT INTO `setting` VALUES ('16', 'smtp_server', 'smtp.gmail.com', 'smtp');
INSERT INTO `setting` VALUES ('17', 'smtp_user', 'roso.sasongko@gmail.com', 'smtp');
INSERT INTO `setting` VALUES ('18', 'smtp_pass', 'xperia123', 'smtp');
INSERT INTO `setting` VALUES ('19', 'smtp_secure', 'tls', 'smtp');
INSERT INTO `setting` VALUES ('20', 'smtp_port', '587', 'smtp');
INSERT INTO `setting` VALUES ('21', 'secret_key', 'Lv4dmEWEWAjEyLaJkXz+BGvypPYcH/aSO3LMOCloAuM=', 'security');

-- ----------------------------
-- Table structure for site
-- ----------------------------
DROP TABLE IF EXISTS `site`;
CREATE TABLE `site` (
  `id` varchar(64) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `type` varchar(30) DEFAULT 'frontend',
  `title` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `company_address` varchar(100) DEFAULT NULL,
  `company_city` varchar(50) DEFAULT NULL,
  `company_state` varchar(50) DEFAULT NULL,
  `company_country` varchar(50) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `author_email` varchar(100) DEFAULT NULL,
  `github_page` varchar(255) DEFAULT NULL,
  `facebook_page` varchar(255) DEFAULT NULL,
  `twitter_page` varchar(255) DEFAULT NULL,
  `google_page` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `key` varchar(255) DEFAULT NULL,
  `active` int(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of site
-- ----------------------------
INSERT INTO `site` VALUES ('20161123181803-308496', 'easyflow.io', 'frontend', 'Easyflow', 'editor diagram aktifitas berbasis web', 'Easyflow Software', 'Jl. H. Kimah No. 212, Pancoran Mas', 'Depok', 'Jawa Barat', 'Indonesia', 'Roso Sasongko', 'roso.sasongko@gmail.com', 'https://github.com/londomloto/easyflow', '', '', '', 'http://easyflow.io/', 'Op0v7NpMTqnVoESxOQtLuwQzYy6q/3tP8mWdERqRdZ8=', '1');
INSERT INTO `site` VALUES ('20161118112004-155692', 'easyflow.io/admin', 'backend', 'Admin Easyflow', null, 'Easyflow Software', 'Jl. H. Kimah No. 212, Pancoran Mas', 'Depok', 'Jawa Barat', 'Indonesia', 'Roso Sasongko', 'roso.sasongko@gmail.com', 'https://github.com/londomloto/easyflow', null, null, null, 'http://easyflow.io/admin/', 'jNszjuKlunyxzaiMQGzfxhbv3ja22We6vsxgUDBt94o=', '1');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tutorial
-- ----------------------------
INSERT INTO `tutorial` VALUES ('1', 'Spiderman #1', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', 'tutorial_poster.jpg', '5fcd083fd54b48c5a7869c61d83637e1f60032e9.mp4', 'video/mp4', '2016-11-16 08:46:09', 'SYSTEM');
INSERT INTO `tutorial` VALUES ('2', 'Spiderman #2', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', 'tutorial_poster.jpg', '40d9b2f3443ea9baebaf203da2773f92e85c24af.mp4', 'video/mp4', '2016-11-16 09:23:50', 'SYSTEM');
INSERT INTO `tutorial` VALUES ('3', 'Spiderman #3', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', null, '5970a76271cc91b22a9283dcec50c5dd3f3d8f2d.mp4', 'video/mp4', null, 'SYSTEM');
INSERT INTO `tutorial` VALUES ('4', 'Spiderman #4', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', null, '91f213d40bf123cc36414f17c432ac09378395f3.mp4', 'video/mp4', null, 'SYSTEM');
INSERT INTO `tutorial` VALUES ('5', 'Spiderman #5', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', null, '61a8c0c081a3bb9f969a2f318feddb7d2b005cf8.mp4', 'video/mp4', null, 'SYSTEM');
INSERT INTO `tutorial` VALUES ('6', 'Spiderman #6', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', null, '352ea9e86b237ccbef54424f223cd701181b5cfe.mp4', 'video/mp4', null, 'SYSTEM');
INSERT INTO `tutorial` VALUES ('7', 'Spiderman #7', 'Tutorial ini menjelaskan bagaimana cara mudah untuk menambahkan sebuah diagram', null, 'da50d8bb1b6da4a85e5df4d86862a3a3942df1d9.mp4', 'video/mp4', null, 'SYSTEM');

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
  `role` varchar(50) DEFAULT NULL,
  `active` int(1) DEFAULT '1',
  `register_date` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `last_ip` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('55', 'nurfarid8924@gmail.com', '42f46e2a644200bf7b3088511aedd71e5d8b3d301a55ce2587cfc1411a1ed1ed', '7c23a2', 'Faridha Aridh', 'wanita', '', '', '90bc161643c1372b3e9a67abc5b80b2b599245ef.jpeg', 'contributor', '1', '2016-11-23 00:23:17', '2016-12-05 02:25:04', '192.168.164.1');
INSERT INTO `user` VALUES ('65', 'roso.sasongko@gmail.com', '27df4849de145cdf68757cde615a14657d6d6e86cd051c5f84fcc4c66b80e9de', '463412', 'Roso Sasongko', 'pria', '', '', '99f5e201a2e6f8473c279a07d9b9ae58999f0d0b.jpeg', 'admin', '1', '2016-11-23 02:50:54', '2016-12-05 17:14:30', '192.168.164.1');
INSERT INTO `user` VALUES ('71', 'londomloto.io@gmail.com', 'a5b0686abd608b23c69a431033bb7d23fb1bfaf097aba17aa9ce0d4ca6eab624', '0', 'Londomloto', 'pria', '', '', '22897e9d8a09f9e7d7b643fc74114994b7a825b2.jpg', 'user', '1', '2016-11-27 19:45:34', '0000-00-00 00:00:00', '');
INSERT INTO `user` VALUES ('72', 'julia.ann@easyflow.io', 'ae32dff538983b16d525b309b076c1b1114fd773cc802775a89027c93700edf3', '97ccef', 'Julia Ann', 'wanita', '', '', '53323204e77f4658167d33f521c5f976a082f810.png', 'user', '1', '2016-11-27 19:55:05', '0000-00-00 00:00:00', '');
INSERT INTO `user` VALUES ('73', 'jenny.tusabe@easyflow.io', 'a740ca0abdb9f58bc1b72d163f685fd62cf5cd27eea702c166f81838d910f169', '864c0b', 'Jenny Tusabe', 'wanita', '', '', '7fe45db3d1d6e44787c6ee3ca1d882bf441592e2.png', 'user', '1', '2016-11-27 20:07:31', '0000-00-00 00:00:00', '');
INSERT INTO `user` VALUES ('74', 'charlie.james@easyflow.io', '1b05d9523fd2012572aefdf9444676546b9fc5e9a019713d163e9f82702a2ff6', '9a7824', 'Charlie James', 'wanita', '', '', '47e0a1c91592962c6bd0905f572c4b339fb6cce5.png', 'user', '1', '2016-11-27 20:07:50', '0000-00-00 00:00:00', '');
INSERT INTO `user` VALUES ('75', 'mae.victoria@easyflow.io', '29f313b528b6414735ba8d26f2aa5c874086d98fac641673efc9c437699277d7', '37a42e', 'Mae Victoria', 'wanita', '', '', 'abbc2d598c57a60bdd12d2dec68bb34188dc41a7.png', 'user', '1', '2016-11-27 20:08:05', '0000-00-00 00:00:00', '');
INSERT INTO `user` VALUES ('76', 'marley.mason@easyflow.io', 'c43530c853a871a2704ac66f15bd7d1d70f5e770b0802ca873cbde45c5faf7ad', '81a835', 'Marley Mason', 'pria', null, null, '47e0a1c91592962c6bd0905f572c4b339fb6cce5.png', 'user', '1', '2016-11-27 20:08:22', null, null);
INSERT INTO `user` VALUES ('77', 'valentina.nappy@easyflow.io', '086fcd8bbf092d7cec1fc22b82bc16e562154acff59e0f64fdcdc81b808c6717', 'db286c', 'Valentina Nappi', 'pria', null, null, '53323204e77f4658167d33f521c5f976a082f810.png', 'user', '1', '2016-11-27 20:08:39', null, null);
INSERT INTO `user` VALUES ('78', 'a@a.com', '3711aedf7866846a0eca9ee2b81d4a2469f4f2e4ce7945d466d994ef26dabaf3', 'bdeb0d', 'A', 'pria', '', '', '06d2ad533ffa9d7564418180d78409927da101ed.jpeg', 'user', '1', '2016-11-28 00:51:52', '0000-00-00 00:00:00', '');
INSERT INTO `user` VALUES ('79', 'b@b.com', 'e366f3a7f70f61ebf55d0ba23bec796cb208489b75455536a60a548e8d7b1280', '705e0d', 'B', 'pria', null, null, '20db189d63cb071fb59da9c12598a4707484e581.png', 'user', '1', '2016-11-28 00:52:14', null, null);
