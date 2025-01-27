import express from 'express'

import { catchAsync } from '../utils/catchAsync.js'
import { protectRoute } from '../middleware/auth.middleware.js'
import { getUser, getUsers, updateProfile, updateUserRole } from '../controller/user.controller.js'

const router = express.Router()

router.get('/admin', protectRoute, catchAsync(getUsers))
router.patch('/admin/:username', protectRoute, catchAsync(updateUserRole))
router.get('/:username', protectRoute, catchAsync(getUser))
router.patch('/profile', protectRoute, catchAsync(updateProfile))

export default router