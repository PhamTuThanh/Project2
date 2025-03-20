import express from 'express';
import { addDoctor, allDoctors, loginAdmin, appoinmentsAdmin, appoinmentCancel, adminDashboard, deleteDoctor } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import {changeAvailability } from '../controllers/doctorController.js';


const adminRouter = express.Router();

adminRouter.post('/add-doctor',authAdmin,upload.single('image'), addDoctor);
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailability )
adminRouter.get('/appoinments', authAdmin, appoinmentsAdmin)
adminRouter.post('/cancel-appoinment', authAdmin, appoinmentCancel)
adminRouter.get('/dashboard', authAdmin, adminDashboard)
adminRouter.post('/delete-doctor', authAdmin, deleteDoctor)

export default adminRouter;