const User = require("../model/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("../config/nodemailer");

// render the sign in page
module.exports.signIn = function(req, res){
    if(req.isAuthenticated()){
        return res.redirect("/");
    }
    // req.flash("error", "Your account is not activated");
    return res.render("user_sign_in");
}

// render the sign up page
module.exports.signUp = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    return res.render("user_sign_up");
}

// to get sign up date
module.exports.create = async function(req, res){
    try{

        // check password and confirm_password
        if (req.body.password != req.body.confirm_password){
            // back to the sign up page
            req.flash("error", "Password and confirm password should be same")
            return res.redirect("back");
        }

        // email should be unique
        const user = await User.findOne({email: req.body.email});

        if(!user){

            const token = jwt.sign({email: req.body.email}, "secret");

            // create the user
            await User.create({
                email: req.body.email,
                password: req.body.password,
                name: req.body.name,
            });

            // seding the confirmation email to the user
            nodemailer.sendConfirmationEmail(
                req.body.name,
                req.body.email,
                token
            );

            req.flash("success", "Account activation link is sent to your email");

            return res.redirect("/users/sign-in");
        }else{
            // if user is already created
            // redirect to the sign up page again
            req.flash("error", "This email is already exists");
            return res.redirect("/users/sign-up");
        }


    }catch(err){
        console.log(err);
    }
}


// verify the email
module.exports.verifyUser = function(req, res){
    try{

        jwt.verify(req.params.confirmationCode, "secret", function(err, decoded){
            if(err){
                req.flash("error", "Incorrect or expired link! Please register again");
                return res.redirect("/users/sign-up");
            }else{
                User.findOne({email: decoded.email}, function(err, user){
                    if(err){
                        console.log(err);
                        return;
                    }

                    user.status = "active";
                    user.save();

                    req.flash("success", "Account activated. You can now log in");

                    return res.redirect("/users/sign-in");
                });
            }
        });

    }catch(err){
        console.log(err);
    }
}


// render the page where user enter the email to get the reset passowrd link 
module.exports.forget = function(req, res){
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    return res.render("forget");
}

// send the passowrd reset link
module.exports.sendResetLink = function(req, res){

    User.findOne({email: req.body.email}, function(err, user){
        if(err){
            console.log(err);
            return;
        }

        if(user && user.status != "pending"){
            const token = jwt.sign({ email: req.body.email }, "secret", { expiresIn: "30m" });
            // seding the reset passowrd link to email
            nodemailer.transport.sendMail({
                from: "yadavrishikesh53@gmail.com",
                to: req.body.email,
                subject: "Reset Passowrd link",
                html: `<h1> Update Your Password </h1>
                <p>Please Update your password by clicking on the following link</p>
                <a href=http://localhost:8000/users/reset-page/${token}> Click here</a>
                <p> Note : This link is only valid for 30 minutes <p>
                `
            }).catch(err => console.log(err));

            req.flash("success", "Reset password link send to your email id");

            return res.redirect("/users/sign-in");
        }else if(user && user.status == "pending"){
            req.flash("error", "Your account is not activated. first activate your account!");
            return res.redirect("/users/sign-in");
        }else{
            req.flash("error", "We can't find any user for this email id!");
            return res.redirect("/users/sign-in");
        }
    });
}

// render the reset password page
module.exports.renderReset = function(req, res){
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    jwt.verify(req.params.token, "secret", function (err, decoded) {
        if (err) {
            req.flash("error", "Incorrect or expired link!");
            return res.redirect("/users/sign-in");
        } else {
            return res.render("reset", {
                userEmail: decoded.email
            });
        }
    });
}

// update the new password in database
module.exports.updatePasswordDb = function(req, res){
    User.findOne({email: req.body.email}, function(err, user){
        if(err){
            console.log(err);
            return;
        }

        user.password = req.body.password;
        user.save();
        req.flash("success", "Password updated successfully");

        if(req.isAuthenticated()){
            return res.redirect("/");
        }else{
            return res.redirect("/users/sign-in");
        }
    });
}


// sign in and creating a session
module.exports.createSession = function(req, res){
    req.flash("success", "Logged in Successfully");
    return res.redirect("/");
}


// signing out
module.exports.signOut = function(req, res){
    req.logout();
    req.flash("success", "You Have Logged Out");
    return res.redirect("/users/sign-in");
}

