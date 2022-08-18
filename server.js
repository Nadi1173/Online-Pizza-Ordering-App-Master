// to get access of dotenv(.env) file in server.js just include the below line and whatever variables are there in .env file we can access it here
require('dotenv').config()


const express = require('express')
const app = express()
// configure template engine(ejs)
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
// to generate path wherver needed
const path = require('path')
// import mongoose module(for interection with mongodb)
const mongoose = require('mongoose')

const MongoDbStore = require('connect-mongo')

// import express-session(for handling sessions)
const session = require('express-session')
const flash = require('express-flash')  

const passport = require('passport')
// database connection
// where to connect to(specify in url variable)
// pizza = db name in our mongodb
const url = process.env.MONGO_CONNECTION_URL;
const Emitter = require('events')

// connect to above url
// connect() method -> 1st arg = url and 2nd arg = mongodb configuration
mongoose.connect(url,
{
    useNewUrlParser: true,
    // useCreateIndex:true,
    // useFindAndModify: true,
    useUnifiedTopology: true,
});
// store connection in some variable to use it later
const connection = mongoose.connection;
// once() method is kind of event listener and 1st arg = 'open' is an event 
// 2nd arg = function to be executed when event occures
// 'open' event means the connection to mongodb is successful
// if 'open' event occurs print connected else catch the error and print connection failed
// connection.once('open', () =>{
//     console.log('Database connected...');
// }).catch(err =>{
//     console.log('connection failed...');
// });
// connection.on("error", console.error.bind(console, "connection error: "));
// connection.once("open", function () {
//   console.log("Connected successfully");
// });
connection.once('open', () =>{
    console.log('Database connected...');
})
// connection.on('error',() =>{
//     console.log('connection failed...');
// });

// // sending plain text to /
// app.get('/',(req,res) => {
//     res.send('Hello from server')
// })

app.use(flash())
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)

// Session config
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  store: MongoDbStore.create({
    mongoUrl: url
  }),
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
}))


// passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

// global middleware
app.use((req,res,next) =>{
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})

// set template engine
app.use(expressLayout)
// specifying views/template path
app.set('views',path.join(__dirname,'/resources/views'))
// specify express which template engine we'll use
app.set('view engine','ejs')


//  importing module(file)  web.js 
// require will return a function(since only function was exported from web.js)
// will just call that function by passing app(express object) to define paths there
require('./routes/web.js')(app)
//  specify assets(where our css and js files are stored to get response in css and js from server for css and js files)
app.use(express.static('public'))
 
const PORT = process.env.PORT || 3000
const server = app.listen(PORT,() =>{
    console.log(`Listening on port ${PORT}`)
}) 


// socket
const io= require('socket.io')(server)
io.on('connection',(socket) =>{
  // join

  // console.log(socket.id)
  socket.on('join',(orderId) =>{
  // console.log(orderId)
    socket.join(orderId)
  })
})

eventEmitter.on('orderUpdated',(data) =>{
  io.to( `order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data) =>{
  io.to('adminRoom').emit('orderPlaced',data)
})

// 404 page
app.use((req,res) =>{
  // res.status(404).send('<h1> 404, Page not found</h1>')
  res.status(404).render('errors/404')
})