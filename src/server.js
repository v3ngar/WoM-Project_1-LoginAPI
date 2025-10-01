const express = require('express')
//const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 3001


// ---- CORS: tillåt allt, hantera preflight TIDIGT ----
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin'); // korrekt caching per origin
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
  );
  // Om du använder cookies: avkommentera raden nedan OCH använd fetch(...,{credentials:'include'})
  // res.setHeader('Access-Control-Allow-Credentials','true');

  if (req.method === 'OPTIONS') return res.sendStatus(204); // preflight-svar direkt
  next();
});
// ---- /CORS ----


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
