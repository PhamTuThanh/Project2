import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, bookAppoinment, listAppoinment, 
cancelAppoinment,  createPayPalPayment,handlePayPalSuccess,handlePayPalCancel, sendEmail} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile);
userRouter.post('/book-appoinment', authUser, bookAppoinment);
userRouter.post('/list-appoinment', authUser, listAppoinment);
userRouter.post('/cancel-appoinmen  t', authUser, cancelAppoinment);
//userRouter.post('/refund-status', authUser, refundStatus)
userRouter.post('/paypal-payment', authUser, createPayPalPayment);
userRouter.get('/paypal-success', handlePayPalSuccess);
userRouter.get('/paypal-cancel', handlePayPalCancel);
userRouter.post('/send-Email', sendEmail)

export default userRouter;