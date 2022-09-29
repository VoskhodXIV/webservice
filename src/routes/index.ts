import { Router } from 'express'
import { fetchRoot } from '../controllers/index'

const router = Router()

// GET the 'healthz' route using the fetchRoot controller
router.get('/healthz', fetchRoot)

export default router
