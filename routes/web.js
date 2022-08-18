// import home controller module
const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const AdminOrderController = require('../app/http/controllers/admin/orderController')
const statusController = require('../app/http/controllers/admin/statusController')

// middlewares
const guest = require('../app/http/middlewares/guest')  
const auth = require('../app/http/middlewares/auth')  
const admin = require('../app/http/middlewares/admin')  
// app is a express() object
// we will recieve from server.js when this module(file) will be imported there
// and we want same instance of express object created in server.js and objects are always pass by reference in js
function initRoutes(app){
    // rendering html
    // when request comes to / render home.ejs
    // app.get('/',(req,res) => {
    //     res.render('home')
    // })

    // 2nd arg recieves 2 arg -> req and res -> send it to index method of homeController
    // we got homeController function from homeController.js
    // when we call it, it returns an object, so we can do object.(its content) 
    // object has index method
    // so do object.index -> homeController().index -> function reference/name
    // just recieve 2 arg req and res in index method in homeController.js
    app.get('/',homeController().index)

    // when request comes to /login render login.ejs from auth folder
    // app.get('/login',(req,res) => {
    //     res.render('auth/login.ejs')
    // })
    app.get('/login',guest,authController().login)
    app.post('/login',authController().postLogin)
    // when request comes to /register render register.ejs from auth folder
    // app.get('/register',(req,res) => {
    //     res.render('auth/register.ejs')
    // })
    app.get('/register',guest,authController().register)
    app.post('/register',authController().postRegister)
    app.post('/logout',authController().logout)
    
    // when request comes to /cart render cart.ejs from customers folder
    // app.get('/cart',(req,res) => {
    //     res.render('customers/cart.ejs')
    // })
    app.get('/cart',cartController().index)
    app.post('/update-cart',cartController().update)

    app.post('/orders',orderController().store)

    // customer routes
    app.post('/orders',auth, orderController().store)
    app.get('/customer/orders', auth,orderController().index)
    app.get('/customer/orders/:id', auth,orderController().show)

    // admin routes
    app.get('/admin/orders',admin,AdminOrderController().index)
    app.post('/admin/order/status',admin,statusController().update)
}

// exporting module(web.js) to import and call the function initRoutes from server.js
// only function initRoutes will be exported
module.exports = initRoutes