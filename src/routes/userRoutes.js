import express from 'express';
import * as userController from '../controllers/userControllers.js';

const userRoutes = express.Router();

//Las rutas de usuario
userRoutes.get('/users', userController.getAllUsers);
userRoutes.get('/users/:id', userController.getUserById);
userRoutes.post('/users', userController.createUser);
userRoutes.put('/users/:id', userController.updateUser);
userRoutes.delete('/users/:id', userController.deleteUser);
userRoutes.post('/users/login', userController.loginUser);
userRoutes.post('/users/recover', userController.sendPasswordRecoveryCode);
userRoutes.patch('/users/restablish', userController.resetPassword);
userRoutes.post('/users/verify', userController.validateRecoveryCode);

export default userRoutes;
