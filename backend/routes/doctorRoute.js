import express from 'express';
import { doctorList } from '../controllers/doctorController.js'; // Corrected import path

const doctorRouter = express.Router();

doctorRouter.get('/list', doctorList);


export default doctorRouter;