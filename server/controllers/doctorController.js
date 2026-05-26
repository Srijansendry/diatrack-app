import pool from '../config/db.js'

export async function getPatients(req, res) {
  const doctorId = req.user.userId
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.created_at
      FROM patients p JOIN users u ON p.patient_id = u.user_id
      WHERE p.doctor_id = $1 OR p.caretaker_id = $1 ORDER BY u.name`,
      [doctorId]
    )
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch patients' })
  }
}

export async function getPatientById(req, res) {
  const { patientId } = req.params
  try {
    const result = await pool.query(
      'SELECT u.user_id, u.name, u.email, u.role FROM users u WHERE u.user_id = $1 AND u.role = $2',
      [patientId, 'Patient']
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' })
    }
    res.json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'Failed to fetch patient' })
  }
}

export async function getMyDoctor(req, res) {
  const patientId = req.user.userId
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email 
       FROM patients p JOIN users u ON p.doctor_id = u.user_id 
       WHERE p.patient_id = $1`,
      [patientId]
    )
    if (result.rows.length === 0) {
      return res.json({ doctor: null })
    }
    const doctor = result.rows[0]
    const code = `DR-${doctor.name.split(' ').pop().toUpperCase()}-${doctor.user_id.slice(0, 4).toUpperCase()}`
    res.json({ doctor: { ...doctor, code } })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch linked doctor' })
  }
}

export async function getMyCode(req, res) {
  const doctorId = req.user.userId
  try {
    const result = await pool.query('SELECT name, user_id FROM users WHERE user_id = $1', [doctorId])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' })
    }
    const doc = result.rows[0]
    const code = `DR-${doc.name.split(' ').pop().toUpperCase()}-${doc.user_id.slice(0, 4).toUpperCase()}`
    res.json({ code })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate invite code' })
  }
}

export async function linkDoctorByCode(req, res) {
  const { code } = req.body
  const patientId = req.user.userId
  if (!code) {
    return res.status(400).json({ error: 'Doctor link code required' })
  }
  try {
    // Query all doctors in database
    const result = await pool.query("SELECT user_id, name, role FROM users WHERE role = $1", ['Doctor'])
    const doctors = result.rows

    // Match code
    const matchedDoc = doctors.find(doc => {
      const calculatedCode = `DR-${doc.name.split(' ').pop().toUpperCase()}-${doc.user_id.slice(0, 4).toUpperCase()}`
      return calculatedCode === code.trim().toUpperCase()
    })

    if (!matchedDoc) {
      return res.status(404).json({ error: 'Invalid doctor invite code or doctor not found' })
    }

    // Link patient to the doctor
    await pool.query(
      'UPDATE patients SET doctor_id = $1 WHERE patient_id = $2',
      [matchedDoc.user_id, patientId]
    )

    res.json({ success: true, doctor: { id: matchedDoc.user_id, name: matchedDoc.name } })
  } catch (err) {
    res.status(500).json({ error: 'Failed to link doctor' })
  }
}
