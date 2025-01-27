import { Schema, model } from "mongoose";

const ticketSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['bugfix', 'feature', 'hotfix', 'service request'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
  },
  status: {
    type: String,
    enum: ['open', 'in progress', 'closed'],
    default: 'open'
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ticketImg: {
    type: String
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, { timestamps: true })

const Ticket = model('Ticket', ticketSchema)

export default Ticket