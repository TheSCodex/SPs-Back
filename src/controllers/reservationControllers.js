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

export const getReservationByUserID = (req, res) => {
  const userId = req.params.userId;
  connection.query(
    "SELECT * FROM reservations WHERE userId = ?",
    [userId],
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
  const { userId, reservationTime, initialFee } = req.body;

  //Transacción para que si algo falla no se nos haga un desastre así grandote
  connection.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error Interno" });
    }

    const findSpotQuery =
      "SELECT id FROM parkingSpots WHERE statusId IN (SELECT id FROM parkingStatuses WHERE statusName = 'Available' OR statusName = 'Unoccupied') LIMIT 1";
    connection.query(findSpotQuery, (err, results) => {
      if (err) {
        return connection.rollback(() => {
          console.error(err);
          res.status(500).json({ message: "Error Interno" });
        });
      }

      if (results.length === 0) {
        return res
          .status(400)
          .json({ message: "No hay lugares de estacionamiento disponibles" });
      }

      const spotId = results[0].id;
      const createReservationQuery =
        "INSERT INTO reservations (userId, spotId, reservationTime, initialFee, status) VALUES (?, ?, ?, ?, 'Active')";
      connection.query(
        createReservationQuery,
        [userId, spotId, reservationTime, initialFee],
        (err, results) => {
          if (err) {
            return connection.rollback(() => {
              console.error(err);
              res.status(500).json({ message: "Error Interno" });
            });
          }
          const updateSpotStatusQuery =
            "UPDATE parkingSpots SET statusId = (SELECT id FROM parkingStatuses WHERE statusName = 'Reserved') WHERE id = ?";
          connection.query(updateSpotStatusQuery, [spotId], (err, results) => {
            if (err) {
              return connection.rollback(() => {
                console.error(err);
                res.status(500).json({ message: "Error Interno" });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error(err);
                  res.status(500).json({ message: "Error Interno" });
                });
              }

              res.status(201).json({
                message: "Reservación creada",
                reservationId: results.insertId,
              });
            });
          });
        }
      );
    });
  });
};

export const cancelReservation = (req, res) => {
  const id = req.params.id;

  connection.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error Interno" });
    }

    connection.query(
      "SELECT spotId FROM reservations WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          return connection.rollback(() => {
            console.error(err);
            res.status(500).json({ message: "Error Interno" });
          });
        }

        const spotId = results[0].spotId;

        connection.query(
          "DELETE FROM reservations WHERE id = ?",
          [id],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                console.error(err);
                res.status(500).json({ message: "Error Interno" });
              });
            }

            connection.query(
              "UPDATE parkingSpots SET statusId = (SELECT id FROM parkingStatuses WHERE statusName = 'Available') WHERE id = ?",
              [spotId],
              (err) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error(err);
                    res.status(500).json({ message: "Error Interno" });
                  });
                }

                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      console.error(err);
                      res.status(500).json({ message: "Error Interno" });
                    });
                  }

                  res.status(200).json({
                    message:
                      "Reservación Cancelada y Estatus cambiado exitosamente",
                  });
                });
              }
            );
          }
        );
      }
    );
  });
};

export const checkInReservation = (req, res) => {
  const id = req.params.id;
  const checkInTime = new Date();
  connection.query(
    "UPDATE reservations SET checkInTime = ?, status = 'Checked-In' WHERE id = ?",
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
