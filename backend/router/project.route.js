import express from 'express'

import { protectRoute } from '../middleware/auth.middleware.js'
import { catchAsync } from '../utils/catchAsync.js'
import {
  addMember, createProject, createTicket, getProject,
  getProjects, getTicket, removeMember, updateTicket,
  createComment, deleteComment, updateComment,
  changeProjectStatus
} from '../controller/project.controller.js'

const router = express.Router()

router.get('/', protectRoute, catchAsync(getProjects))
router.post('/create', protectRoute, catchAsync(createProject))
router.post('/:projectId', protectRoute, catchAsync(getProject))
router.patch('/:projectId', protectRoute, catchAsync(changeProjectStatus))
router.patch('/:projectId/add/:username', protectRoute, catchAsync(addMember))
router.patch('/:projectId/remove/:username', protectRoute, catchAsync(removeMember))

router.post('/:projectId/ticket', protectRoute, catchAsync(createTicket))
router.get('/:projectId/ticket/:ticketId', protectRoute, catchAsync(getTicket))
router.patch('/:projectId/ticket/:ticketId', protectRoute, catchAsync(updateTicket))

router.post('/:projectId/ticket/:ticketId/comment', protectRoute, catchAsync(createComment))
router.patch('/:projectId/ticket/:ticketId/comment/:commentId', protectRoute, catchAsync(updateComment))
router.delete('/:projectId/ticket/:ticketId/comment/:commentId', protectRoute, catchAsync(deleteComment))

export default router