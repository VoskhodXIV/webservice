import 'colors'
import 'dotenv/config'

import app from './app'

// PORT number to host the server on
const PORT = process.env.PORT || 3000

// listen() to the server on PORT number that is defined in the .env file
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`.blue.bold)
})
