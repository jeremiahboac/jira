import { Schema, model } from "mongoose";

const projectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tickets: [{
    type: Schema.Types.ObjectId,
    ref: 'Ticket'
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  owner: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled'],
    default: 'ongoing',
  }
}, { timestamps: true })

const Project = model('Project', projectSchema)

export default Project