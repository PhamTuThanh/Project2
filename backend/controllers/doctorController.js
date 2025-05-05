import doctorModel from '../models/doctorModel.js'; 
import bcrypt from 'bcrypt'
import jwt  from 'jsonwebtoken';
import appoinmentModel from './../models/appoinmentModel.js';

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
        res.json({ success: true, message: 'Availability Changed' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
const doctorList = async (req, res)=>{
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({success:true, doctors})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//api for doctor login
const loginDoctor = async (req, res)=>{
    try {
        const { email, password} = req. body
        const doctor = await doctorModel.findOne({email})

        if(!doctor){
            return res.json ({ success: false, message:'Invalid credentials'})
        }
        const isMatch = await bcrypt.compare(password, doctor.password)
        if(isMatch){
            const token = jwt.sign({id:doctor._id}, process.env.JWT_SECRET)
            res.json({success:true, token})
        }else{
            res.json ({ success: false, message:'Invalid credentials'})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//api to get doctor appoinments for dpoctor panel
const appoinmentsDoctor = async (req,res)=>{
    try {
        const {docId} = req.body
        const appoinments = await appoinmentModel.find({docId})
        res.json({success:true, appoinments})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//api to mark appoinment completed 
const appoinmentComplete = async(req, res) =>{
    try {
        const {docId, appoinmentId} = req.body
        const appoinmentData = await appoinmentModel.findById(appoinmentId)
        if(appoinmentData && appoinmentData.docId == docId){
            await appoinmentModel.findByIdAndUpdate(appoinmentId, {isCompleted:true})
            return res.json({success:true, message:'Appoinment Completed'})

        }else{
            return res.json({success:false, message:'Mark failed'})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//api to cancel appoinment for doctor panel 
const appoinmentCancel = async(req, res) =>{
    try {
        const {docId, appoinmentId} = req.body
        const appoinmentData = await appoinmentModel.findById(appoinmentId)
        if(appoinmentData && appoinmentData.docId == docId){
            await appoinmentModel.findByIdAndUpdate(appoinmentId, {cancelled:true})
            return res.json({success:true, message:'Appoinment Cancelled'})

        }else{
            return res.json({success:false, message:'cancellation failed'})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const refundStatus = async(req, res) =>{
    try {
        const {docId, appoinmentId} = req.body
        const appoinmentData = await appoinmentModel.findById(appoinmentId)
        if(appoinmentData && appoinmentData.docId == docId){
            await appoinmentModel.findByIdAndUpdate(appoinmentId, {refund:true})
            return res.json({success:true, message:'Refunded'})
        }else{
            return res.json({success:false, message:'Refund failed'})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//api to get dashboard data for doctor panel
const doctorDashboard = async (req,res)=>{
    try {
        const {docId} = req.body
        const appoinments = await appoinmentModel.find({docId})
        let earnings = 0

        appoinments.map((item)=>{

            if(item.isCompleted || item.payment){
                earnings += item.amount
            }
        })
        let patients =[]
        appoinments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })
        const dashData ={
            earnings,
            appoinments:appoinments.length,
            patients: patients.length,
            lastestAppoinments: appoinments.reverse().slice(0,5)
        }
        res.json({success : true, dashData})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//api to get doctor profile for doctor panel
const doctorProfile = async (req,res)=>{
    try {
        const {docId} = req.body
        const profileData = await doctorModel.findById(docId).select('-password')
        res.json({success:true, profileData})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const updateDoctorProfile = async(req, res) =>{
    try {
        const {docId, fees, address, available} = req.body
        await doctorModel.findByIdAndUpdate(docId, {fees, address, available})  
        res.json({success:true, message:'Profile Updated'})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
export { changeAvailability, doctorList, loginDoctor, appoinmentsDoctor, appoinmentComplete, appoinmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile, refundStatus };

