import { NextFunction, Request, Response } from 'express'
import { PROD } from '../constants'

/**
 * errorHandler middleware
 * @param error the error object
 * @param _req the request object
 * @param res the response object
 * @param _next execute the middleware succeeding the current middleware
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    statusCode: res.statusCode,
    message: error.message,
    // avoid error stack in prod mode
    stack: PROD ? 'pancake' : error.stack,
  })
}
