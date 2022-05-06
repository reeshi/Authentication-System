const express = require("express");

const router = express.Router();
const userController = require("../controllers/users_controller");
const  passport = require("passport");

router.get("/sign-in", userController.signIn);

router.get("/sign-up", userController.signUp);

router.post("/create", userController.create);

// used passport as middleware to authenticate
router.post("/create-session", passport.authenticate(
    "local",
    {failureRedirect: "/users/sign-in"}
),userController.createSession);

router.get("/sign-out", userController.signOut);

// confirmation of email
router.get("/confirm/:confirmationCode", userController.verifyUser);

// render the forget page
router.get("/forget", userController.forget);

// send the password reset link to the user email
router.post("/send-reset-link", userController.sendResetLink);

// render the reset the passowrd page
router.get("/reset-page/:token", userController.renderReset);

// update the password in db
router.post("/reset-password", userController.updatePasswordDb);

router.get("/reset-page", (req, res) => res.render("reset"));

module.exports = router;