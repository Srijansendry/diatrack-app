import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import readingRoutes from './routes/readingRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

dotenv.config()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000'
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST']
  }
})

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/readings', readingRoutes)
app.use('/api/doctor', doctorRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const onlineUsers = new Map()

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id)
  })

  socket.on('sendMessage', (data) => {
    const rId = data.receiverId || data.receiver_id
    const receiverSocket = onlineUsers.get(rId)
    if (receiverSocket) {
      io.to(receiverSocket).emit('newMessage', data)
    }
  })

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId)
        break
      }
    }
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
