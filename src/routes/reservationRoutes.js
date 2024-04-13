import express from 'express';
import * as reservationControllers from '../controllers/reservationControllers.js'

const reservationRoutes = express.Router();

reservationRoutes.get('/reservations', reservationControllers.getAllReservations);
reservationRoutes.get('/reservations/:id', reservationControllers.getReservationById);
reservationRoutes.get('/reservations/user/:userId', reservationControllers.getReservationByUserID);
reservationRoutes.post('/reservation', reservationControllers.createReservation);
reservationRoutes.put('/reservations/cancel/:id', reservationControllers.cancelReservation);
reservationRoutes.put('/reservations/check-in/:id', reservationControllers.checkInReservation);
reservationRoutes.put('/reservations/check-out/:id', reservationControllers.checkOutReservation);
reservationRoutes.put('/reservations/occupied/:id', reservationControllers.occupiedReservationSpot);
reservationRoutes.delete('/reservations/:id', reservationControllers.deleteReservation);

export default reservationRoutes;