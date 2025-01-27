export class AppError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

export const errorHandler = (err, req, res, next) => {
  console.log(err.message)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    })
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong'
  })
}