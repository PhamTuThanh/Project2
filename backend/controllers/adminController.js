import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken'
import appoinmentModel from './../models/appoinmentModel.js';
import userModel from './../models/userModel.js';

//API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "You are missing details" });
        }
        // Validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        // Validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a stronger password" });
        }
        // Hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Upload image to cloudinary
        if (!imageFile) {
            return res.json({ success: false, message: "Image file is missing" });
        }
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image" });
        const imageUrl = imageUpload.secure_url;
        

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        };
        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API For admin login
    const loginAdmin = async (req, res) =>{
        try{

            const {email, password} = req.body
            if(email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD){
                const token = jwt.sign(email+password, process.env.JWT_SECRET)
                res.json({success:true, token})
            }

        }catch (error){
            console.log(error)
            res.json({success:false, message:error.message})
        }
    }
//API to get all doctor list for admin panel
    const allDoctors = async(req, res) => {
        try{
            const doctors = await doctorModel.find({}).select('-password')
            res.json({success:true, doctors})
        }catch(error){
            console.log(error)
            res.json({success:false, message:error.message})
        }
    }
//API to get all appoinment list
    const appoinmentsAdmin = async (req, res)=>{
        try {
            const appoinments = await appoinmentModel.find({})
            res.json({success:true, appoinments})
        } catch (error) {
            console.log(error)
            res.json({success:false, message:error.message})
        }
    }
//api for appoinment cancellaion
const appoinmentCancel = async (req, res)=>{
    try {
        const {appoinmentId} = req.body

        const appoinmentData = await appoinmentModel.findById(appoinmentId)

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
//API to get dashboard data for admin panel
const adminDashboard = async (req, res)=>{
    try {
        
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appoinments = await appoinmentModel.find({})

        const dashData ={
            doctors: doctors.length,
            appoinments: appoinments.length,
            patients: users.length,
            lastestAppoinments: appoinments.reverse().slice(0,5)
        }
        res.json({success:true, dashData})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addDoctor, loginAdmin, allDoctors, appoinmentsAdmin, appoinmentCancel, adminDashboard };