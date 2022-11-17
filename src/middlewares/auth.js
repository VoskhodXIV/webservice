const { getUserPasswordAuth, comparePassword } = require('../utils/auth.util')

module.exports = (User, logger) => {
  const authorizeToken = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      logger.warn('Missing authorization header')
      return res.status(401).json({
        message: 'Missing authorization header',
      })
    }
    logger.info('Checking authorization header for the user')
    const { username, password } = getUserPasswordAuth(authHeader)
    logger.info(
      `Checking username and password for user ${username} in Amazon RDS`
    )
    const user = await User.findOne({
      where: {
        username,
      },
    })
    if (!user) {
      logger.error(`User ${username} not found`)
      return res.status(401).json({
        message: 'Unauthorized: Invalid username or password',
      })
    }
    const isPasswordMatch = await comparePassword(password, user.password)
    if (!isPasswordMatch) {
      logger.warn(`User ${username} password mismatch`)
      return res.status(401).json({
        message: 'Unauthorized: Invalid username or password',
      })
    }

    if (!user.verified) {
      logger.warn(`User ${username} is not verified`)
      return res.status(401).json({
        message: 'Unauthorized: User is not verified',
      })
    }

    logger.info(`User ${username} authorized`)
    req.user = user
    global.username = user.username
    next()
  }

  return authorizeToken
}
