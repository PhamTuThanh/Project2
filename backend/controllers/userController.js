import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from './../models/doctorModel.js';
import appoinmentModel from '../models/appoinmentModel.js';

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a stronger password" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name, email, password: hashedPassword
        }
        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'User does not exist' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to update user profile 
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }
        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if(imageFile){
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image:imageURL})
        }
        res.json({success:true, message:"Profile Updated"})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to book appoinment
const bookAppoinment = async (req, res) => {
    try {
      const { userId, docId, slotDate, slotTime } = req.body;
      const docData = await doctorModel.findById(docId).select('-password');
  
      if (!docData.available) {
        return res.json({ success: false, message: 'Doctor not available' });
      }
  
      let slot_booked = docData.slot_booked || {};
  
      // Checking for slot availability
      if (slot_booked[slotDate]) {
        if (slot_booked[slotDate].includes(slotTime)) {
          return res.json({ success: false, message: 'Slot not available' });
        } else {
          slot_booked[slotDate].push(slotTime);
        }
      } else {
        slot_booked[slotDate] = [slotTime];
      }
  
      const userData = await userModel.findById(userId).select('-password');
      delete docData.slot_booked;
  
      const appoinmentData = {
        userId,
        docId,
        userData,
        docData,
        amount: docData.fees,
        slotTime,
        slotDate,
        date: Date.now(),
      };
  
      const newAppoinment = new appoinmentModel(appoinmentData);
      await newAppoinment.save();
  
      // Save new slots data in docData
      await doctorModel.findByIdAndUpdate(docId, { slot_booked });
      res.json({ success: true, message: 'Appoinment Booked' });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
export { registerUser, loginUser, getProfile, updateProfile, bookAppoinment }