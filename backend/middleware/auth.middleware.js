import { verifyToken } from "../lib/jwt.js"
import { AppError } from "../utils/errorHandler.js"

import User from "../model/user.model.js"

export const protectRoute = async (req, res, next) => {
  try {
    const session = req.cookies['jira_session']

    if (!session) throw new AppError(401, 'Authorized session is required')

    const { userId } = await verifyToken(session)

    const user = await User.findById(userId).select('-password')

    if (!user) throw new AppError(404, 'User not found')

    req.user = user

    next()
  } catch (error) {
    console.log('Error in middleware')
    next(error)
  }
}