require("dotenv").config();
// require the express
const express = require("express");
const db = require("./config/mongoose");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const sassMiddleware = require("node-sass-middleware");
const flash = require("connect-flash");
const customMiddleware = require("./config/middleware");
const path = require("path");
const app = express();
const port = 8000;

// configure body parser
app.use(express.urlencoded({
    extended: true
}));


// setting the sass middle to complie the saas file into css
app.use(sassMiddleware({
    src: path.join(__dirname, "assets", "sass"),
    dest: path.join(__dirname, "assets", "css"),
    debug: true,
    outputStyle: "expanded",
    prefix: "/css"
}));


// set the template engine
app.set("view engine", "ejs");
app.set("views", "./views");

// set the static files
app.use(express.static("assets"));

// express session
app.use(session({
    name: "authentication",
    secret: "something",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: MongoStore.create(
        {
            mongoUrl: "mongodb://localhost/authentication_system_db",
            autoRemove: "disabled"
        },
        function(err){
            console.log(err || "connect-mongoDB ok");
        }
    )
}));

// using the passport for authentication
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

// flash messages
app.use(flash());
app.use(customMiddleware.setFlash);


// set the express layouts
app.use(expressLayouts);
// extract the styles and script from sub-pages into the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);



// routes
app.use("/", require("./routes"));

app.listen(port, function(err){
    if(err){
        console.log("Error in running the server");
        return;
    }

    console.log(`Server is running on ${port}`);
})