const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

//CORS tillåtna origins
const allowedLocal = new Set([
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  'http://localhost:8080',
])

function isAllowedOrigin(origin) {
  if (!origin) return true // t.ex. curl
  try {
    const u = new URL(origin)
    const h = u.hostname
    //Tillåt Arcada-fronten (byt/utöka vid behov)
    if (h === 'people.arcada.fi' || h.endsWith('.arcada.fi')) return true
    //Tillåt lokala dev-origins
    if (allowedLocal.has(origin)) return true
    return false
  } catch { return false }
}

app.use(cors({
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
    credentials: false //true bara om man använder cookies; med JWT räcker false
}))

app.options('*', cors())

app.use(express.json())
app.use(morgan('dev'))

//Endast inloggning/användare
const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

//Hälsa
app.get('/healthz', (req, res) => res.json({ ok: true, service: 'login-api' }))

//404-fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`Login API listening on ${PORT}`)
})
