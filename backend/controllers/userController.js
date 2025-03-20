import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from './../models/doctorModel.js';
import appoinmentModel from '../models/appoinmentModel.js';
import crypto from 'crypto';
import querystring from 'querystring';
import axios from 'axios';
import moment from 'moment';
import dotenv from 'dotenv';

const ZALOPAY_APP_ID = process.env.ZALOPAY_APP_ID;
const ZALOPAY_KEY1 = process.env.ZALOPAY_KEY1;
const ZALOPAY_ENDPOINT = 'https://sandbox.zalopay.vn/v001/tpe/createorder';
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

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }
        res.json({ success: true, message: "Profile Updated" })
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
//API to get user appoinments for frontend my-appoinment page
const listAppoinment = async (req, res) => {
    try {
        const {userId} = req.body
        const appoinments = await appoinmentModel.find({userId})
        res.json({success:true, appoinments})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API to cancel appoinment
const cancelAppoinment = async (req, res)=>{
    try {
        const {userId, appoinmentId} = req.body

        const appoinmentData = await appoinmentModel.findById(appoinmentId)

        //verify appoinment user
        if (appoinmentData.userId.toString() !== userId){
            return res.json({success:false, message: 'Unauthorized action'})
        }
        await appoinmentModel.findByIdAndUpdate(appoinmentId, {cancelled:true})
        //releasing doctor slot
        const {docId, slotDate, slotTime} = appoinmentData
        const doctorData = await doctorModel.findById(docId)
        let slot_booked = doctorData.slot_booked
        slot_booked[slotDate] = slot_booked[slotDate].filter(e=> e!== slotTime)
        await doctorModel.findByIdAndUpdate(docId,{slot_booked})
        res.json({success:true, message:'Appoinment Cancelled'})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API to make payment of appoinment using vnpay
const makeVNPayPayment = async (req, res) => {
    try {
      const { userId, docId, slotDate, slotTime } = req.body;
      const docData = await doctorModel.findById(docId).select('-password');
  
      if (!docData.available) {
        return res.json({ success: false, message: 'Doctor not available' });
      }
  
      const tmnCode = process.env.vnp_TmnCode;
      const secretKey = process.env.vnp_HashSecret;
      const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      const returnUrl = 'http://localhost:5173/my-appoinments'; 
  
      const date = new Date();
      const createDate = date.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      const orderId = date.getTime().toString();
      const amount = docData.fees * 25000; 
  
      const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
      const params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Payment for appointment with doctor ${docData.name}`,
        vnp_OrderType: 'billpayment',
        vnp_Amount: amount,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };
  
      const sortedParams = Object.keys(params).sort().reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
  
      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
      sortedParams.vnp_SecureHash = signed;
      const paymentUrl = `${vnpUrl}?${querystring.stringify(sortedParams)}`;
  
      res.json({ success: true, paymentUrl });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
  // API to handle VNPay return URL
  const vnpayReturn = async (req, res) => {
    try {
      const vnpParams = req.query;
      const secureHash = vnpParams['vnp_SecureHash'];
  
      delete vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHashType'];
  
      const sortedParams = Object.keys(vnpParams).sort().reduce((result, key) => {
        result[key] = vnpParams[key];
        return result;
      }, {});
  
      const signData = querystring.stringify(sortedParams, { encode: false });
      const secretKey = process.env.vnp_HashSecret;
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
      if (secureHash === signed) {
        const { vnp_TxnRef, vnp_Amount, vnp_ResponseCode } = vnpParams;
  
        if (vnp_ResponseCode === '00') {
    
          res.json({ success: true, message: 'Payment successful' });
        } else {
          res.json({ success: false, message: 'Payment failed' });
        }
      } else {
        res.json({ success: false, message: 'Invalid signature' });
      }
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
  export { registerUser, loginUser, getProfile, updateProfile, bookAppoinment, listAppoinment, cancelAppoinment, vnpayReturn, makeVNPayPayment };