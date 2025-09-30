module.exports = (req, res, next) => {
    if(req.params.userid != "Jakob"){
        //req.params.name += ' (I know you)'
        return res.send("You're not welcome")
    }
    next()
}