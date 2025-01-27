import jwt from 'jsonwebtoken'
import { AppError } from '../utils/errorHandler.js'

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' })

  res.cookie('jira_session', token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development'
  })
}

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(new AppError(403, 'Unauthorized session'))
      return resolve(decoded)
    })
  })
}
