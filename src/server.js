const express = require('express')
//const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001


app.use((req, res, next) => {
  const allowed = new Set([
    'https://people.arcada.fi',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://localhost:8080'
  ])
  const origin = req.headers.origin
  if (!origin || allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
    res.setHeader('Vary', 'Origin') // korrekt caching
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    // res.setHeader('Access-Control-Allow-Credentials', 'true') // bara om du använder cookies
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204) // preflight-svar
  next()
})

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