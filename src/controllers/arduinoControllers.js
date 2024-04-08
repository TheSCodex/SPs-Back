import connection from "../db.js";

export const getParkingStatus = (req, res) => {
  connection.query("SELECT * FROM parkingSpots", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error Interno" });
    }
    res.status(200).json(results);
  });
};

export const getAvailableParkingSpots = (req, res) => {
  connection.query(
    "SELECT * FROM parkingSpots WHERE statusID = 1",
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }
      res.status(200).json(results);
    }
  );
};

export const changeStatusToOccupied = (req, res) => {
  const  spotId  = req.params.id;
  console.log(spotId);
  connection.query(
    "UPDATE parkingSpots SET statusId = (SELECT id FROM parkingStatuses WHERE statusName = 'Occupied') WHERE `id` = ?",
    [spotId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Error" });
      }
      res
        .status(200)
        .json({ message: "Parking spot status changed to Occupied" });
    }
  );
};

export const changeStatusToUnoccupied = (req, res) => {
  const  spotId  = req.params.id;
  console.log(spotId);
  connection.query(
    "UPDATE parkingSpots SET statusId = (SELECT id FROM parkingStatuses WHERE statusName = 'Unoccupied') WHERE id = ?",
    [spotId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Error" });
      }
      res
        .status(200)
        .json({ message: "Parking spot status changed to Unoccupied" });
    }
  );
};
