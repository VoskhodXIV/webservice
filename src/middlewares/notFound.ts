import { NextFunction, Request, Response } from 'express'

/**
 * notFound middleware
 * @param _req the request object
 * @param res the response object
 * @param _next execute the middleware succeeding the current middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error) // forwards error to next middleware
}
