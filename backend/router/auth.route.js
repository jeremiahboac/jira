import express from 'express'

import { catchAsync } from '../utils/catchAsync.js'
import { getMe, login, logout, signup } from '../controller/auth.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/signup', catchAsync(signup))
router.post('/login', catchAsync(login))
router.post('/logout', catchAsync(logout))
router.get('/me', protectRoute, catchAsync(getMe))

export default router