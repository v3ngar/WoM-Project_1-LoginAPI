const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

//CORS tillåtna origins
const ALLOW = new Set([
  'https://people.arcada.fi',   //live-frontend
  'http://127.0.0.1:5501',      //lokalt
  'http://localhost:5501',
  'http://localhost:8080'
])

//Samma policy för både vanliga requests och preflight (OPTIONS)
const corsOptions = {
  origin: (origin, cb) => cb(null, !origin || ALLOW.has(origin)),
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) //preflight för alla rutter

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