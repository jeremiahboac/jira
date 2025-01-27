import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"

import User from "../model/user.model.js"

import { AppError } from "../utils/errorHandler.js"

export const getUser = async (req, res) => {
  const { username } = req.params
  const userLevel = req.user.role

  if (userLevel !== 'admin' && username.toLowerCase().includes('superadmin')) throw new AppError(400, 'You don\'t have permission to access superadmin details')

  const user = await User.findOne({ username }).select('-password')

  if (!user) throw new AppError(404, 'User not found')

  res.status(200).json({ success: true, message: 'Get user successfully', data: { user } })
}

export const getUsers = async (req, res) => {
  const user = req.user

  if (user.role !== 'admin') throw new AppError(400, 'You don\'t have permission to access this route')

  const users = await User.aggregate([
    { $match: { role: { $ne: 'admin' } } },
    { $project: { password: 0 } },
    { $sort: { createdAt: -1 } }
  ])

  console.log('Admin fetched list of users successfully')

  res.status(200).json({ success: true, message: 'Get users successfully', data: { users } })
}

export const updateProfile = async (req, res) => {
  const userId = req.user._id
  const { oldPassword, newPassword, confirmPassword, profileImage } = req.body

  if (!oldPassword || !newPassword || !confirmPassword) throw new AppError(400, 'All fields are required')

  let user = await User.findById(userId)

  if (!(await bcrypt.compare(oldPassword, user.password))) throw new AppError(400, 'Password is incorrect')

  if (newPassword !== confirmPassword) throw new AppError(400, 'Password does not match')

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  user.password = hashedPassword

  if (profileImage) {
    if (user.profileImage) await cloudinary.uploader.destroy(user.profileImage.split('/').pop().split('.')[0])

    const uploadImage = await cloudinary.uploader.upload(profileImage, { folder: 'jira_profileImg' })

    user.profileImage = uploadImage.secure_url
  }

  await user.save()

  user = user.toObject()

  delete user.password

  console.log(`User ${(user.username).green} profile updated successfully`)

  res.status(200).json({ success: true, message: 'Update profile successfully', data: { user } })
}

export const updateUserRole = async (req, res) => {
  const { username } = req.params
  const { role } = req.body
  const userLevel = req.user.role

  if (!role) throw new AppError(400, 'Role is required')

  if (userLevel !== 'admin') throw new AppError(400, 'You don\'t have permission to update user\'s role')

  const user = await User.findOne({ username }).select('-password')

  if (!user) throw new AppError(404, 'User not found')

  user.role = role

  await user.save()

  console.log(`User ${(user.username).green} role updated successfully`)

  res.status(200).json({ success: true, message: 'Update user role successfully', data: { user } })
}