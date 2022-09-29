import { NextFunction, Request, Response } from 'express'

/**
 * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
 * fetchRoot controller to GET the 'healhtz' endpoint
 * @param _req the request object
 * @param res the response object (returns the response status code OR the error object if caught)
 * @param next forward the error to the next middleware
 * @returns
 */
export const fetchRoot = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({ statusCode: `${res.statusCode}` })
  } catch (error) {
    return next(error)
  }
}
