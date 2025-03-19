import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, bookAppoinment, listAppoinment, cancelAppoinment} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from './../middlewares/multer.js';

const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser)
userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-appoinment', authUser, bookAppoinment)
userRouter.get('/appoinments', authUser, listAppoinment)
userRouter.post('/cancel-appoinment', authUser, cancelAppoinment)

export default userRouter;