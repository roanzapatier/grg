-- phpMyAdmin SQL Dump
-- version 3.4.11.1deb2+deb7u8
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Sep 03, 2017 at 07:45 PM
-- Server version: 5.5.54
-- PHP Version: 5.4.45-0+deb7u7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `project`
--

-- --------------------------------------------------------

--
-- Table structure for table `bets`
--

CREATE TABLE IF NOT EXISTS `bets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(17) NOT NULL,
  `color` text NOT NULL,
  `amount` int(11) NOT NULL,
  `won` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `codes`
--

CREATE TABLE IF NOT EXISTS `codes` (
  `id` int(11) NOT NULL,
  `creator` varchar(17) NOT NULL,
  `code` varchar(17) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trade` bigint(20) NOT NULL,
  `assetid` text NOT NULL,
  `exterior` text NOT NULL,
  `market_hash_name` varchar(512) NOT NULL,
  `name` varchar(512) NOT NULL,
  `status` int(11) NOT NULL,
  `img` text NOT NULL,
  `botid` int(11) NOT NULL,
  `time` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf32 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `referrals`
--

CREATE TABLE IF NOT EXISTS `referrals` (
  `id` int(11) NOT NULL,
  `creator` varchar(17) CHARACTER SET utf8 NOT NULL,
  `referral` varchar(17) CHARACTER SET utf8 NOT NULL,
  `deposits` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rolls`
--

CREATE TABLE IF NOT EXISTS `rolls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cifra` int(11) NOT NULL,
  `hash` text NOT NULL,
  `lottery` text NOT NULL,
  `secret` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `trades`
--

CREATE TABLE IF NOT EXISTS `trades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(17) NOT NULL,
  `tid` text NOT NULL,
  `type` text NOT NULL,
  `amount` int(11) NOT NULL,
  `names` text CHARACTER SET utf8 NOT NULL,
  `code` text NOT NULL,
  `status` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `steamid` varchar(17) NOT NULL,
  `mute` bigint(11) NOT NULL,
  `name` varchar(512) NOT NULL,
  `rank` varchar(16) DEFAULT '0',
  `balance` int(11) NOT NULL DEFAULT '2500000',
  `dailyGift` int(11) NOT NULL,
  `depositsGot` int(11) NOT NULL,
  `avatar` text NOT NULL,
  `tradeurl` text NOT NULL,
  `hash` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
