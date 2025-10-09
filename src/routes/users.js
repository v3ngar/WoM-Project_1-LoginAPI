const express = require('express')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
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
//login route -------------------------
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
    
    const accessToken = await jwt.sign({
    sub: user.id,
    email: user.email,
    user: user.name, 
    role: user.role
    }, process.env.JWT_SECRET, {expiresIn: '15m'})

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
      /*  await prisma.user.update({
        where: { id: user.id },
        data: {
            token: refreshToken,
            issued_at: new Date(),
            expires_at: expires_at
        }
    });// 7 days
    */

    await prisma.refreshToken.create({
    data: {
        user_id: user.id,  // Link to the user
        token: refreshToken,
        issued_at: new Date(),
        expires_at: expires_at
    }
});

        res.send({
            msg: "Login OK",
            jwt: accessToken,
            //refreshToken: refreshToken
        })
    })


    //Refresh route------------------------

    router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).send({ msg: "Refresh token required" });
    }

    // Find user with this refresh token
    /*
    const user = await prisma.user.findFirst({
        where: { 
            token: refreshToken,
            expires_at: { gt: new Date() } // Token not expired
        }
    });*/

    const tokenRecord = await prisma.refreshToken.findFirst({
    where: { 
        token: refreshToken,
        expires_at: { gt: new Date() } // Token not expired
    },
    include: {
        user: true  // Include the related user data
    }
});



    if (!tokenRecord) {
        return res.status(401).send({ msg: "Invalid or expired refresh token" });
    }


    const user = tokenRecord.user;
    // Generate new access token
    const newAccessToken = await jwt.sign({
        sub: user.id,
        email: user.email,
        user: user.name, 
        role: user.role
    }, process.env.JWT_SECRET, {expiresIn: '15m'});

    res.send({
        msg: "Token refreshed",
        jwt: newAccessToken
    });
});
        
    module.exports = router

