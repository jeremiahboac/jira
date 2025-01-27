import { v2 as cloudinary } from "cloudinary"

import Project from "../model/project.model.js"
import Ticket from "../model/ticket.model.js"
import User from "../model/user.model.js"

import { AppError } from "../utils/errorHandler.js"
import Comment from "../model/comment.model.js"

export const getProject = async (req, res) => {
  const user = req.user

  const { projectId } = req.params

  const project = await Project.findById(projectId).populate([
    {
      path: 'owner',
      match: { role: { $ne: 'admin' } },
      select: '-password -projects'
    },
    {
      path: 'tickets',
    },
    {
      path: 'members',
      match: { role: { $ne: 'admin' } },
      select: '-password -projects'
    }
  ])

  if (!project) throw new AppError(404, 'Project not found')

  if (!user.projects.includes(project._id)) throw new AppError(400, 'You don\'t have permission to access this project')

  res.status(200).json({ success: true, message: 'Get project successfully', data: { project } })
}

export const createProject = async (req, res) => {
  const userLevel = req.user.role

  const { name, description } = req.body

  if (userLevel !== 'moderator' && userLevel !== 'admin') throw new AppError(400, 'You don\'t have permission to create a project')

  if (!name || !description) throw new AppError(400, 'All fields are required')

  const admins = await User.find({ role: 'admin' }).select('_id')

  const newProject = await Project.create({ name, description, owner: [...admins, req.user._id] })

  const project = await newProject.populate({
    path: 'owner',
    match: { role: { $ne: 'admin' } },
    select: '-password -projects'
  })

  await User.updateMany(
    { $or: [{ role: 'admin' }, { _id: req.user._id }] },
    { $push: { projects: newProject._id } }
  )

  console.log('Project created successfully')

  res.status(201).json({ success: true, message: 'Create project successfully', data: { project } })
}

export const changeProjectStatus = async (req, res) => {
  const userLevel = req.user.role
  const { projectId } = req.params

  if (userLevel !== 'moderator' && userLevel !== 'admin') throw new AppError(400, 'You don\'t have permission to change the status of a project')

  if (!projectId) throw new AppError(400, 'Project id is required')

  const project = await Project.findById(projectId)

  if (!project) throw new AppError(404, 'Project not found')

  project.status = req.body.status

  await project.save()

  res.status(200).json({ success: true, message: 'Change project status successfully', data: { project } })
}

export const addMember = async (req, res) => {
  const userLevel = req.user.role

  const { projectId, userId } = req.params

  if (userLevel !== 'moderator' && userLevel !== 'admin') throw new AppError(400, 'You don\'t have permission to add a member')

  if (!userId) throw new AppError(400, 'Username is required')

  if (!projectId) throw new AppError(400, 'Project id is required')

  const user = await User.findOne({ _id: userId })

  if (!user) throw new AppError(404, 'User not found')

  const project = await Project.findByIdAndUpdate(projectId, { $addToSet: { members: user._id } }, { new: true }).populate([
    {
      path: 'owner',
      match: { role: { $ne: 'admin' } },
      select: '_id'
    },
    {
      path: 'members',
      match: { role: { $ne: 'admin' } },
      select: '-password -projects'
    }
  ])

  user.projects.push(project._id)

  await user.save()

  console.log(`User ${(user.username).green} added to project ${(project.name).green} successfully`)

  res.status(200).json({ success: true, message: 'Add member successfully', data: { project } })
}

export const removeMember = async (req, res) => {
  const userLevel = req.user.role

  const { projectId, userId } = req.params

  if (userLevel !== 'moderator' && userLevel !== 'admin') throw new AppError(400, 'You don\'t have permission to remove a member')

  if (!userId) throw new AppError(400, 'Username is required')

  if (!projectId) throw new AppError(400, 'Project id is required')

  const user = await User.findOne({ _id: userId })

  if (!user) throw new AppError(404, 'User not found')

  if (!user.projects.includes(projectId)) throw new AppError(400, 'User is not a member of this project')

  const project = await Project.findByIdAndUpdate(projectId, { $pull: { members: user._id } }, { new: true }).populate([
    {
      path: 'owner',
      match: { role: { $ne: 'admin' } },
      select: '_id'
    }
  ])

  user.projects = user.projects.filter((project) => project._id.toString() !== projectId)

  await user.save()

  console.log(`User ${(user.username).green} removed from project ${(project.name).green} successfully`)

  res.status(200).json({ success: true, message: 'Remove member successfully', data: { project } })
}

export const getProjects = async (req, res) => {
  const user = req.user

  const projects = await User.findById(user._id).select('projects -_id').populate({
    path: 'projects',
    match: { role: { $ne: 'admin' } },
    select: '-password -owner -tickets -members'
  })

  res.status(200).json({ success: true, message: 'Get projects successfully', data: projects })
}

export const createTicket = async (req, res) => {
  const user = req.user

  const { projectId } = req.params

  const { title, description, type, ticketImg, priority } = req.body

  if (!projectId) throw new AppError(400, 'Project id is required')

  if (!title || !description || !priority || !type) throw new AppError(400, 'All fields are required')

  if (!user.projects.includes(projectId)) throw new AppError(400, 'You don\'t have permission to raise a ticket in this project')

  const ticket = await Ticket.create({ title, description, type, priority, reportedBy: user._id })

  if (ticketImg) {
    const uploadImg = await cloudinary.uploader.upload(ticketImg, { folder: 'jira_ticketImg' })

    ticket.ticketImg = uploadImg.secure_url
  }

  await ticket.save()

  await Project.findByIdAndUpdate(projectId, { $addToSet: { tickets: ticket._id } }, { new: true })

  res.status(201).json({ success: true, message: 'Create ticket successfully', data: { ticket } })
}

export const getTicket = async (req, res) => {
  const user = req.user

  const { projectId, ticketId } = req.params

  if (!projectId) throw new AppError(400, 'Project id is required')

  if (!ticketId) throw new AppError(400, 'Ticket id is required')

  if (!user.projects.includes(projectId)) throw new AppError(400, 'You don\'t have permission to access this project')

  const data = await Project.findById(projectId).populate({
    path: 'tickets',
    match: { _id: ticketId },
  })

  const ticket = await data.tickets[0].populate([
    {
      path: 'reportedBy',
      match: { role: { $ne: 'admin' } },
      select: 'firstName lastName username email profileImage'
    },
    {
      path: 'assignedTo',
      match: { role: { $ne: 'admin' } },
      select: 'firstName lastName username email profileImage'
    },
    {
      path: 'comments',
      populate: {
        path: 'commentBy',
        select: 'firstName lastName username email profileImage'
      }
    }
  ])

  res.status(200).json({ success: true, message: 'Get ticket successfully', data: { ticket } })
}

export const updateTicket = async (req, res) => {
  const user = req.user

  const { projectId, ticketId } = req.params

  if (!projectId) throw new AppError(400, 'Project id is required')

  if (!ticketId) throw new AppError(400, 'Ticket id is required')

  const allowedFields = ['title', 'description', 'type', 'priority', 'ticketImg', 'status', 'assignedTo']

  let updatedData = {}

  const { tickets, members, owner } = await Project.findById(projectId)
    .populate({
      path: 'members',
      match: { _id: user._id },
      select: '-password'
    }).populate({
      path: 'tickets',
      match: { _id: ticketId }
    })

  if (!tickets.length) throw new AppError(404, 'Ticket not found')

  if (!owner.includes(user._id) && !members.length) throw new AppError(403, 'You don\'t have permission to update this ticket')

  if (tickets[0].reportedBy.toString() === user._id.toString()) {
    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field]
      }
    }

    if (req.body.ticketImg) {
      if (tickets[0].ticketImg) await cloudinary.uploader.destroy(tickets[0].ticketImg.split('/').pop().split('.')[0])

      const uploadImg = await cloudinary.uploader.upload(req.body.ticketImg, { folder: 'jira_ticketImg' })

      updatedData.ticketImg = uploadImg.secure_url
    }

    tickets[0].set(updatedData)

  } else if (('assignedTo' in tickets[0]) && tickets[0]?.assignedTo?.toString() === user?._id?.toString()) {
    const { status } = req.body

    if (!status) throw new AppError(400, 'Status is required')

    tickets[0].status = status
  } else {
    const { assignedTo } = req.body

    if (!assignedTo) throw new AppError(400, 'You need to assign this ticket to yourself before updating the status')

    tickets[0].assignedTo = assignedTo
  }

  await tickets[0].save()

  res.status(200).json({ success: true, message: 'Update ticket successfully', data: { tickets } })
}

export const createComment = async (req, res) => {
  const user = req.user

  const { projectId, ticketId } = req.params

  if (!projectId) throw new AppError(400, 'Project id is required')

  if (!ticketId) throw new AppError(400, 'Ticket id is required')

  const { content, commentImg } = req.body

  const { tickets } = await Project.findById(projectId).populate({
    path: 'tickets',
    match: { _id: ticketId }
  })

  if (!tickets.length) throw new AppError(404, 'Ticket not found')

  const comment = await Comment.create({ content, commentBy: user._id })

  if (commentImg) {
    const uploadImg = await cloudinary.uploader.upload(commentImg, { folder: 'jira_commentImg' })

    comment.commentImg = uploadImg.secure_url
  }
  tickets[0].comments.push(comment._id)

  await comment.save()

  await tickets[0].save()

  res.status(201).json({ success: true, message: 'Create comment successfully', data: { tickets } })
}

export const updateComment = async (req, res) => {
  const user = req.user;
  const { projectId, ticketId, commentId } = req.params;
  const { content, commentImg } = req.body;

  if (!content) throw new AppError(400, 'Content is required');
  if (!projectId) throw new AppError(400, 'Project id is required');
  if (!ticketId) throw new AppError(400, 'Ticket id is required');
  if (!commentId) throw new AppError(400, 'Comment id is required');

  const project = await Project.findById(projectId)
    .populate({
      path: 'tickets',
      match: { _id: ticketId },
      populate: {
        path: 'comments',
        match: { _id: commentId, commentBy: user._id }
      }
    });

  if (!project || !project.tickets.length) {
    throw new AppError(404, 'Ticket not found');
  }

  const ticket = project.tickets[0];
  const comment = ticket.comments[0];

  if (!comment) {
    throw new AppError(404, 'You\'re not allowed to update this comment');
  }

  comment.content = content;

  if (commentImg) {
    if (comment.commentImg) {
      const publicId = comment.commentImg.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const uploadImg = await cloudinary.uploader.upload(commentImg, { folder: 'jira_commentImg' });
    comment.commentImg = uploadImg.secure_url;
  }

  await comment.save();

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    data: { ticket }
  });
}

export const deleteComment = async (req, res) => {
  const user = req.user

  const { projectId, ticketId, commentId } = req.params

  if (!projectId) throw new AppError(400, 'Project id is required')

  if (!ticketId) throw new AppError(400, 'Ticket id is required')

  if (!commentId) throw new AppError(400, 'Comment id is required')

  const { tickets } = await Project.findById(projectId).populate({
    path: 'tickets',
    match: { _id: ticketId }
  })

  if (!tickets.length) throw new AppError(404, 'Ticket not found')

  const comment = await Comment.findByIdAndDelete({ commentBy: user._id, _id: commentId })

  if (comment) {
    tickets[0].comments = tickets[0].comments.filter((id) => id.toString() !== commentId)
    await tickets[0].save()
  } else {
    throw new AppError(404, 'Comment not found')
  }

  res.status(200).json({ success: true, message: 'Delete comment successfully', data: { tickets } })
}