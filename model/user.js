const mongoose = require("mongoose");
// importing the bcryptjs for hashing the password
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "active"],
        default: "pending"
    }
}, {
    timestamps: true
});


// add the pre middleware function to the user model
userSchema.pre("save", function(next){
    const user = this;
    if(this.isModified("password") || this.isNew){

        bcrypt.genSalt(10, function(saltError, salt){
            if(saltError){
                console.log("Error in generating the salt to encrypt the password");
            }else{

                bcrypt.hash(user.password, salt, function(hashError, hash){
                    if(hashError){
                        return next(hashError);
                    }

                    user.password = hash;
                    next();
                });

            }
        });

    }else{
        return next();
    }
});

// add the compareMethod which compares the password
userSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err, false);
        }
        return cb(null, isMatch);
    });
};


// creating the model of the schema
const User = mongoose.model("User", userSchema);

module.exports = User;