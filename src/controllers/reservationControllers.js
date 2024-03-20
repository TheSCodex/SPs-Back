import connection from "../db.js";
import dotenv from "dotenv";

dotenv.config();

export const getAllReservations = (req, res) => {
  connection.query("SELECT * FROM reservations", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error Interno" });
    }
    res.status(200).json(results);
  });
};

export const getReservationById = (req, res) => {
  const id = req.params.id;
  connection.query(
    "SELECT * FROM reservations WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }
      res.status(200).json(results);
    }
  );
};

export const createReservation = (req, res) => {
  const { userId, spotId, reservationTime, initialFee } = req.body;
  const query =
    "INSERT INTO reservations (userId, spotId, reservationTime, initialFee, status) VALUES (?, ?, ?, ?, 'Active')";
  connection.query(
    query,
    [userId, spotId, reservationTime, initialFee],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }
      res.status(201).json({
        message: "Reservation created",
        reservationId: results.insertId,
      });
    }
  );
};

export const cancelReservation = (req, res) => {
  const id = req.params.id;
  connection.query(
    "UPDATE reservations SET status = 'Cancelled' WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }
      res.status(200).json({ message: "Reservation cancelled" });
    }
  );
};

export const checkInReservation = (req, res) => {
  const id = req.params.id;
  const checkInTime = new Date();
  connection.query(
    "UPDATE reservations SET checkInTime = ?, status = 'Occupied' WHERE id = ?",
    [checkInTime, id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }
      res.status(200).json({ message: "Checked in" });
    }
  );
};

export const checkOutReservation = (req, res) => {
  const id = req.params.id;
  const checkOutTime = new Date();
  connection.query(
    "SELECT checkInTime FROM reservations WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }
      const checkInTime = new Date(results[0].checkInTime);
      const hours = Math.ceil((checkOutTime - checkInTime) / 1000 / 60 / 60);
      const totalCost = hours * hourlyRate;
      connection.query(
        "UPDATE reservations SET checkOutTime = ?, totalCost = ?, status = 'Completed' WHERE id = ?",
        [checkOutTime, totalCost, id],
        (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error Interno" });
          }
          res
            .status(200)
            .json({ message: "Checked out", totalCost: totalCost });
        }
      );
    }
  );
};