const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const router = express.Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

router.post('/', async (req, res) => {
    console.log(req.body)

    const hashedPassword = await bcrypt.hash(req.body.password,10)
// ny användare
    try {
        const newUser = await prisma.user.create({
            data: {
                name: req.body.name,
                role: req.body.role,
                email: req.body.email,
                password: hashedPassword
            }
        })
        //
        //meddelande til lanvändaren
        res.send({msg: "New user created!"})
    } catch (error) {
        console.log(error.message)
        res.status(500).send({msg: "ERROR"})
    }

   

})
//login
router.post('/login', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { email: req.body.email}
    })

    if (user==null){
        console.log("BAD USERNAME")
        return res.status(401).send({ msg: "Authentication failed, BAD USERNAME"})
    }
    //kolla att det skickade lösordet matchar hashen i databaseb
    const match = await bcrypt.compare(req.body.password, user.password) 
    if (!match){
    
        
        console.log("BAD PASSWORD")
        return res.status(401).send({ msg: "Authentication failed"})
    }

    //skapa en JWT
const token = await jwt.sign({
sub: user.id,
email: user.email,
user: user.name, 
role: user.role
}, process.env.JWT_SECRET, {expiresIn: '30d'})

    res.send({msg: "Login OK", jwt: token})
})
    
module.exports = router

