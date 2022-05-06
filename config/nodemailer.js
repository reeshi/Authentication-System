const nodemailer = require("nodemailer");

// define the transporter
const transport = nodemailer.createTransport(
    {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS
        }
    },
);



module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log("Check");
    transport.sendMail({
        from: "yadavrishikesh53@gmail.com",
        to: email,
        subject: "Please confirm your account",
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=http://localhost:8000/users/confirm/${confirmationCode}> Click here</a>
        <p> Note : This link is only valid for 30 minutes <p>
        </div>`,
    }).catch(err => console.log(err));
};


module.exports.transport = transport;