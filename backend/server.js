import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
// import adminRoute from "./routes/adminRoute.js";
import adminRouter from "./routes/adminRoute.js";

//app config
const app = express()
const port = process.env.PORT || 9000
connectDB();
connectCloudinary();

//middleware
app.use(cors())
app.use(express.json())

//api endpoints
app.use('/api/admin', adminRouter)
//local:9000/api/admin/add-doctor


app.get("/", (req, res) => res.status(200).send("Hello World!"))


//listen
app.listen(port, () => console.log(`Listening on localhost:${port}`))
