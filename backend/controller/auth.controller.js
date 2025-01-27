import validator from 'validator'
import bcrypt from 'bcrypt'
import colors from 'colors'

import User from "../model/user.model.js"

import { AppError } from "../utils/errorHandler.js"
import { generateToken } from '../lib/jwt.js'

export const getMe = async (req, res) => {
  res.status(200).json({ success: true, message: 'Get user successfully', data: { user: req.user } })
}

export const signup = async (req, res) => {
  const { username, firstName, lastName, email, password, confirmPassword } = req.body

  if (!username || !firstName || !lastName || !email || !password) throw new AppError(400, 'All fields are required')

  if (!validator.isEmail(email)) throw new AppError(400, 'Invalid email')

  if (!validator.isStrongPassword(password)) throw new AppError(400, 'Please enter a strong password')

  const isEmailExist = await User.findOne({ email })

  if (isEmailExist) throw new AppError(400, 'Email already exist')

  const isUsernameExist = await User.findOne({ username })

  if (isUsernameExist) throw new AppError(400, 'Username already exist')

  if (password !== confirmPassword) throw new AppError(400, 'Password does not match')

  const hashedPassword = await bcrypt.hash(password, 10)

  let user = await User.create({ username, firstName, lastName, email, password: hashedPassword })

  if (user) {
    if (user.email.includes('superadmin')) user.role = 'admin'

    console.log('User created successfully')

    await user.save()

    generateToken(user._id, res)
    user = user.toObject()

    delete user.password

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    })
  } else {
    throw new AppError(400, 'Invalid user data')
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) throw new AppError(400, 'All fields are required')

  let user = await User.findOne({
    $or: [
      { email },
      { username: email }
    ]
  })

  if (!user || !(await bcrypt.compare(password, user.password))) throw new AppError(400, 'Email or password is incorrect')

  generateToken(user._id, res)

  user = user.toObject()

  delete user.password

  console.log(`User ${(email).green} logged in successfully`)

  res.status(200).json({
    success: true,
    message: 'Login successfully',
    data: { user }
  })
}

export const logout = async (req, res) => {
  res.clearCookie('jira_session').status(200).json({ success: true, message: 'Logout successfully' })
}
