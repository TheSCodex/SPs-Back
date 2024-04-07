import express from 'express';
import * as arduinoControllers from '../controllers/arduinoControllers.js'

const arduinoRoutes = express.Router();

arduinoRoutes.get('/status/occupied/:id', arduinoControllers.changeStatusToOccupied);
arduinoRoutes.get('/status/unoccupied/:id', arduinoControllers.changeStatusToUnoccupied);

export default arduinoRoutes;