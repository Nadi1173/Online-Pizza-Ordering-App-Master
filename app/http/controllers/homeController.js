const Menu = require('../../models/menu')
// factory function -> which creates and returns an object(object creational pattern)
function homeController(){
    return{
        // index is naming convention for read page(read homePage)
        async index(req,res){
            const pizzas = await Menu.find()
            console.log(pizzas)
            return res.render('home',{pizzas:pizzas})

            // Menu.find().then( function(pizzas) {
            //     console.log(pizzas)
            //     return res.render('home',{pizzas:pizzas})
            // })

            // res.render('home')
        }
    }
}

// export and recieve it in web.js
module.exports = homeController