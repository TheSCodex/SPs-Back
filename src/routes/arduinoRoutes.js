import express from 'express';
import * as arduinoControllers from '../controllers/arduinoControllers.js'

const arduinoRoutes = express.Router();

arduinoRoutes.get('/led/:state', arduinoControllers.ledController);

export default arduinoRoutes;