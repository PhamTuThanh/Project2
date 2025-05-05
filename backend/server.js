import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js"
import adminRouter from './routes/adminRoute.js';
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import reminderRouter from "./routes/reminderRoute.js";
import cron from 'node-cron';
import { checkAndSendReminders } from './controllers/reminderController.js';

//app config
const app = express()
const port = process.env.PORT || 9000
connectDB();
connectCloudinary();

//middleware
app.use(cors())
app.use(express.json())

//api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter);
app.use('/api/reminder', reminderRouter);

// Schedule reminder check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log('Running reminder check...');
    await checkAndSendReminders();
});

app.get("/", (req, res) => res.status(200).send("Hello World!"))

//listen
app.listen(port, () => console.log(`Listening on localhost:${port}`))
