import express from 'express'
import dotenv from 'dotenv'
import consoleStamp from 'console-stamp'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary'

import { connectDB } from './lib/mongodb.js'
import { errorHandler } from './utils/errorHandler.js'

import authRoutes from './router/auth.route.js'
import userRoutes from './router/user.route.js'
import projectRoutes from './router/project.route.js'

dotenv.config()
consoleStamp(console, { format: ':date(mm/dd/yyyy HH:mm:ss) :label' })
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/project', projectRoutes)

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Page not found' })
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is now running on port ${port}`)
  connectDB()
})