import connection from "../db.js";

export const changeStatusToOccupied = (req, res) => {
  const { spotId } = req.params;
  connection.query("UPDATE `sps`.`parkingSpots` SET `statusId` = (SELECT `id` FROM `sps`.`parkingStatuses` WHERE `statusName` = 'Occupied') WHERE `id` = ?", [spotId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Error" });
    }
    res.status(200).json({ message: "Parking spot status changed to Occupied" });
  });
};

export const changeStatusToUnoccupied = (req, res) => {
  const { spotId } = req.params;
  connection.query("UPDATE `sps`.`parkingSpots` SET `statusId` = (SELECT `id` FROM `sps`.`parkingStatuses` WHERE `statusName` = 'Unoccupied') WHERE `id` = ?", [spotId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Error" });
    }
    res.status(200).json({ message: "Parking spot status changed to Unoccupied" });
  });
};
