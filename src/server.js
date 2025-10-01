const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001



const ALLOW = new Set([
  'https://people.arcada.fi',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  'http://localhost:8080',
]);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/server-to-server
    // tillåt exakt listade origins OCH alla subdomäner under arcada.fi vid behov:
    let ok = ALLOW.has(origin);
    if (!ok) {
      try { ok = new URL(origin).hostname.endsWith('.arcada.fi'); } catch {}
    }
    return cb(null, ok);
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight

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