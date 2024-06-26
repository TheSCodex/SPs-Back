-- Active: 1711036534663@@127.0.0.1@3306@sps
CREATE DATABASE `sps`;
DROP DATABASE `sps`;
CREATE TABLE `sps`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userName` VARCHAR(15) NOT NULL,
  `email` VARCHAR(60) NOT NULL,
  `password` VARCHAR(60) NOT NULL,
  `recoveryCode` INT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `sps`.`parkingStatuses` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `statusName` ENUM('Available', 'Reserved', 'Occupied', 'Unoccupied', 'Wrong'),
    PRIMARY KEY(`id`) 
);
CREATE TABLE `sps`.`parkingSpots` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `spotCode` VARCHAR(100),
  `statusId` INT,
  PRIMARY KEY(`id`),
  CONSTRAINT `fk_parkingSpots_parkingStatuses`
  FOREIGN KEY (`statusId`) REFERENCES `sps`.`parkingStatuses`(`id`)
);
CREATE TABLE `sps`.`reservations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT,
  `spotId` INT,
  `reservationTime` DATETIME,
  `checkInTime` DATETIME,
  `checkOutTime` DATETIME,
  `initialFee` DECIMAL(5,2),
  `totalCost` DECIMAL(5,2),
  `status` ENUM('Active', 'Cancelled', 'Checked-In', 'Completed'),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `sps`.`users`(`id`),
  FOREIGN KEY (`spotId`) REFERENCES `sps`.`parkingSpots`(`id`)
);

INSERT INTO `sps`.`parkingStatuses` (`statusName`) VALUES ('Available');
INSERT INTO `sps`.`parkingStatuses` (`statusName`) VALUES ('Reserved');
INSERT INTO `sps`.`parkingStatuses` (`statusName`) VALUES ('Occupied');
INSERT INTO `sps`.`parkingStatuses` (`statusName`) VALUES ('Unoccupied');
INSERT INTO `sps`.`parkingStatuses` (`statusName`) VALUES ('Wrong');


INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot1', 1);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot2', 2);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot3', 1);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot4', 2);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot5', 1);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot6', 2);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot7', 1);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot8', 2);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot9', 1);
INSERT INTO `sps`.`parkingSpots` (`spotCode`, `statusId`) VALUES ('Spot10', 2);


SELECT * FROM `sps`.`parkingSpots`;
SELECT * FROM `sps`.`parkingstatuses`;
SELECT * FROM `sps`.`reservations`;
DELETE FROM `sps`.`reservations` WHERE userId = 4;
