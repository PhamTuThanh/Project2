import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import studentModel from '../models/studentModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from './../models/doctorModel.js';
import appoinmentModel from '../models/appoinmentModel.js';
import paypal from 'paypal-rest-sdk';
import { sendAppointmentNotification } from '../utils/emailService.js';

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
      const { email, password } = req.body;

      let user = await userModel.findOne({ email });
      if (user) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
              const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET);
              return res.json({ success: true, token, role: 'user' });
          } else {
              return res.json({ success: false, message: "Invalid credentials" });
          }
      }

      const student = await studentModel.findOne({ email });
      if (student) {
          const isMatch = await bcrypt.compare(password, student.password);
          if (isMatch) {
              const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET);
              return res.json({ success: true, token, role: 'student' });
          } else {
              return res.json({ success: false, message: "Invalid credentials" });
          }
      }

      // Nếu không tìm thấy trong cả hai model
      return res.json({ success: false, message: 'User does not exist' });
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
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

        // Send email notifications
        try {
            const emailResult = await sendAppointmentNotification(appoinmentData);
            if (!emailResult.success) {
                console.error('Failed to send email notifications:', emailResult.error);
            }
        } catch (emailError) {
            console.error('Email notification error:', emailError);
        }

        res.json({ success: true, message: 'Appointment Booked' });
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
paypal.configure({
    mode: 'sandbox', // Use 'live' for production
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
  });

  const createPayPalPayment = async (req, res) => {
    try {
      const { amount, description, appointmentId } = req.body;
  
      const paymentData = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: `http://localhost:9000/api/user/paypal-success?appointmentId=${appointmentId}&redirect_to=http://localhost:5173/my-appoinments`,
          cancel_url: 'http://localhost:9000/api/user/paypal-cancel',
        },
        transactions: [
          {
            amount: {
              total: amount.toFixed(2),
              currency: 'USD',
            },
            description,
          },
        ],
      };
  
      paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
          console.error(error);
          return res.json({ success: false, message: 'Payment creation failed' });
        }
  
        const approvalUrl = payment.links.find((link) => link.rel === 'approval_url').href;
        res.json({ success: true, approvalUrl });
      });
    } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
    }
  };

  const handlePayPalSuccess = async (req, res) => {
    try {
      const { paymentId, PayerID, appointmentId, redirect_to } = req.query;
  
      const executePaymentData = {
        payer_id: PayerID,
      };
  
      paypal.payment.execute(paymentId, executePaymentData, async (error, payment) => {
        if (error) {
          console.error(error);
          return res.json({ success: false, message: 'Payment execution failed' });
        }
  
        try {
          await appoinmentModel.findByIdAndUpdate(appointmentId, { payment: true });
          // Redirect to frontend after successful database update
          res.redirect(redirect_to || 'http://localhost:5173/my-appoinments');
          res.json({success:true, message:'Payment Done'})
        } catch (dbError) {
          console.error('Database update error:', dbError);
          res.redirect('http://localhost:5173/my-appoinments?error=update_failed');
        }
      });
    } catch (error) {
      console.error(error);
      res.redirect('http://localhost:5173/my-appoinments?error=payment_failed');
    }
  };

  const handlePayPalCancel = (req, res) => {
    res.json({ success: false, message: 'Payment cancelled by user' });
  };
  // const refundStatus = async (req, res) =>{
  //   try {
  //     const {userId, appoinmentId} = req.body
  //     const appoinmentData = await appoinmentModel.findById(appoinmentId)
  //     if (appoinmentData.userId.toString() !== userId){
  //       return res.json({success:false, message: 'Unauthorized action'})
  //     }
  //     await appoinmentModel.findByIdAndUpdate(appoinmentId, {refund:true})
  //     return res.json({success:true, message:'Refunded'})
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ success: false, message: error.message });
  //   }
  // }
  const sendEmail = async (req, res) =>{
    try {
      const {to, subject, text} = req.body
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        }
      })
      const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to,
        subject,
        text
      }
      await transporter.sendMail(mailOptions)
      res.json({success:true, message:'Email sent'})
    } catch (error) {
      console.log(error);
      res.json({success:false, message:error.message})
    }
  }

  export { registerUser, loginUser, getProfile, updateProfile, bookAppoinment, listAppoinment, cancelAppoinment,  createPayPalPayment, handlePayPalSuccess, handlePayPalCancel, sendEmail};