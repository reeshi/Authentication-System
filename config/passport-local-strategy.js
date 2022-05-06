const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../model/user");

// authentication using passport
passport.use(new LocalStrategy({
        usernameField: "email",
        passReqToCallback: true
    },
    function(req, email, password, done){
        // find the user and establish the identity
        User.findOne({email: email}, function(err, user){
            if(err){
                console.log("Error in fincing the user --> passport");
                return done(err);
            }
            
            if (user && user.status != "pending"){
                // compare the password
                user.comparePassword(password, function(err, isMatch){
                    if(err){
                        console.log("Error in comparing the passport --> bcryptjs");
                        return done(err);
                    }else if(isMatch){
                        // password match
                        return done(null, user);
                    }else{
                        req.flash("error", "Invalid Username and Password")
                        // console.log("Invalid passowrd");
                        return done(null, false);
                    }
                });

            } else if (user && user.status == "pending"){
                req.flash("error", "Your account is not activated");
                return done(null, false);
            }else{
                // if the user is not find then go to sign in page 
                req.flash("error", "Invalid Username and Password")
                // console.log("Invalid user");
                return done(null, false);
            }

        });
    }

));


// serialize to put the user id in session cookie
passport.serializeUser(function(user, done){
    done(null, user.id);
});


// deserializing the user from the key in the session cookie
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        if (err) {
            console.log("Error in fincing the user --> passport");
            return done(err);
        }

        done(null, user);
    });
});


passport.checkAuthentication = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    return res.redirect("/users/sign-in");
}


passport.setAuthenticatedUser = function(req, res, next){
    if(req.isAuthenticated()){
        res.locals.user = req.user;
    }

    return next();
}



module.exports = passport;