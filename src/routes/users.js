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
    }, process.env.JWT_SECRET, {expiresIn: '40s'})

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
   /* await prisma.user.update({ //här breaker det sannolikt
        where: { id: user.id },
        data: {
            token: refreshToken,
            issued_at: new Date(),
            expires_at: expires_at
        }
    });// 30 dagar*/
    
    //-----vvvv good code
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
        refreshToken: refreshToken // detta var tidigare utkommenterat
    })
    //-------------^¨¨^^^
    


    /*
    //token exists start
    const existingToken = await prisma.refreshToken.findFirst({
    where: {
        user_id: user.id,
        expires_at: { gt: new Date() } // Still valid
    }
    });

   if (existingToken) {
       console.log("Existing refresh token found:", existingToken.token);
   } else {
       console.log("No valid refresh token found.");
   }

   if (existingToken) {
    // Update the existing token's expiration
    await prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: {
            issued_at: new Date(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        
    });
    console.log("Refresh token updated successfully!");
    
    // Use the existing token
    //refreshToken = existingToken.token;
} else {
    // Create new token only if none exists
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    await prisma.refreshToken.create({
        data: {
            user_id: user.id,
            token: newRefreshToken,
            issued_at: new Date(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });
    refreshToken = newRefreshToken;
    console.log("New refresh token created:", refreshToken);
}


   res.send({
        msg: "Login OK",
        jwt: accessToken,
        refreshToken: refreshToken // detta var tidigare utkommenterat
    });

*/ ///token exists stop

}); 


    //Refresh route------------------------

    router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    console.log("Refresh token received OK:", refreshToken);
    // om ingen token, ge 401 unauthorized<z<z<
    if (!refreshToken) {
        console.log("No refresh token provided");
        return res.status(401).send({ msg: "Refresh token required" });
    }

    const will_expire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const tokenRecord = await prisma.refreshToken.findFirst({
    where: { 
        token: refreshToken,
        expires_at: { gt: new Date() } 
    },
    include: {
        user: true  // inkludera user data
    }
});

        // om ingen token, ge 401 unauthorized
    if (!tokenRecord) {
        console.log("Invalid or expired refresh token");
        return res.status(401).send({ msg: "Invalid or expired refresh token" });
    }


    const user = tokenRecord.user;
    // Skapa access token
    const newAccessToken = await jwt.sign({
        sub: user.id,
        email: user.email,
        user: user.name, 
        role: user.role
    }, process.env.JWT_SECRET, {expiresIn: '40s'}); //15 minuter Detta var tidigare utkommenterat
    
    

    /*
    await prisma.refreshToken.update({
    where: { id: tokenRecord.id }, // Use the refresh token's ID, not user's ID
    data: {
        issued_at: new Date(),
        expires_at: will_expire
    }
    });*/
    try {
    console.log("Attempting to update refresh token with ID:", tokenRecord.id);
    
    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
            issued_at: new Date(),
            expires_at: will_expire
        }
    });

    console.log("Refresh token updated successfully!");
} catch (error) {
    console.log("Error updating refresh token:", error.message);
    return res.status(500).send({ msg: "Error updating refresh token" });
}

    res.send({
        msg: "Token refreshed",
        jwt: newAccessToken
    });
});
        
    module.exports = router

