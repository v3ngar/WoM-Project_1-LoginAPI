const express = require('express')
//const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 3001 //test comment

//app.use((req,res,next)=>{ if(req.headers.origin) console.log('Origin:', 
//  req.headers.origin); next(); }); //debug

//app.use(cors())
//app.options('*', cors()) // preflight

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


//curl.exe -i -X OPTIONS "https://wo-m-project- -login-api-webbtjanster-och-molnteknologi.2.rahtiapp.fi/users/login" -H "Origin: https://people.arcada.fi" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,authorization"
