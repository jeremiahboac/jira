import { Schema, model } from "mongoose";

const commentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  commentImg: {
    type: String
  },
  commentBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

const Comment = model('Comment', commentSchema)

export default Comment