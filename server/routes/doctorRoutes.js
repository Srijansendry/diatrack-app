import { Router } from 'express'
import { getPatients, getPatientById, getMyDoctor, getMyCode, linkDoctorByCode } from '../controllers/doctorController.js'
import { verifyToken, requireRole } from '../middlewares/auth.js'

const router = Router()

router.get('/patients', verifyToken, requireRole('Doctor'), getPatients)
router.get('/patient/:patientId', verifyToken, getPatientById)
router.get('/my-doctor', verifyToken, getMyDoctor)
router.get('/my-code', verifyToken, requireRole('Doctor'), getMyCode)
router.post('/link-code', verifyToken, linkDoctorByCode)

export default router
