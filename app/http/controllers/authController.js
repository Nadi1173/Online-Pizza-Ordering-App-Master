const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')

// factory function -> which creates and returns an object(object creational pattern)
function authController(){
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin'?'/admin/orders' : '/customer/orders'
    }
    
    return{
        login(req,res){
            res.render('auth/login')
        },
        postLogin(req,res,next){
            passport.authenticate('local',(err,user,info) =>{
                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }

                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }
                req.logIn(user,(err) =>{
                    if(err){
                        req.flash('error',info.message)
                        return next(err)
                    }


                    return res.redirect(_getRedirectUrl(req))
                })
            })(req,res,next)
        },
        register(req,res){
            res.render('auth/register')
        },
        async postRegister(req,res){
            const { name,email,password } = req.body
            // // validate request
            // if(!name || !email || !password){
            //     req.flash('error','All fields are required')
            //     return res.redirect('/register')
            // }

            // check if email already exists
            User.exists({email:email},(err,result)=>{
                if(result){
                    req.flash('error','Email already taken')
                    req.flash('name',name)
                    req.flash('email',email)
                    return res.redirect('/register')    // we need to always send response(else page will keep loading)
                }
            })

            // hash password
            const hashedPassword = await bcrypt.hash(password,10)
            // create a user 
            const user = new User({
                name,
                email,
                password: hashedPassword
            })

            user.save().then((user) =>{
                // redirect to login page
                // as of now redirect to home page(since no login page)
                return res.redirect('/')
            }).catch(err =>{
                req.flash('error','Something went wrong')
                return res.redirect('/register')
            })
            console.log(req.body)
        },
        logout(req,res){
            req.logout()
            return res.redirect('/login')
        }
    }
}

// export and recieve it in web.js
module.exports = authController