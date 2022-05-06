module.exports.home = async function(req, res){
    try{
        if(req.user.status != "pending"){
            return res.render("home");
        }else{
            console.log("Pending Account. Please Verify Your Email!");
            return res.redirect("/users/sign-in");
        }
    }catch(err){
        console.log(err);
    }
}