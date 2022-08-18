export class CardWidget{
    // variables in class are not declared using let/const
    stripe = null
    card = null
    // style for our card widget mounted in cart.ejs
    style = {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder':{
                color: '#aab7c4'
            }
        },
        invalid:{
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }

    // constructor
    constructor(stripe){
        this.stripe = stripe
    }

    mount(){
        // get stripe elements(elements = types of payments)
        const elements = this.stripe.elements()  

        
        // create 1st parameter is type of payment to integrate = 'card' in our case
        // 2nd arg = object -> to style this widget 'card' -> pass the style object created above
        // there is other css also -> rendered directly from app.scss(refer resources->scss->app.scss)
        // for more payment types(options) check : https://stripe.com/docs/payments/elements
        this.card = elements.create('card',{style: this.style,hidePostalCode:true}) 
        this.card.mount('#card-element');
        // mount this element in browser
        // location where to mount this element(after address in our cart page)
        // create div in cart.ejs after address input tag after div end(to mount this element there)
    }

    destroy(){
        this.card.destroy();
    }

    async createToken(){
        // Verify card before doing post request and get the token(step-1 of flow diagram -> refer in notebook)
        // createToken() method takes card element(data to be verified) = card
        // this will return us promise -> to handle that call then() block -> called when verification is successful
        // arrow function inside then will be executed on successful verification and parameter 'result' will recieve the token from stripe server

        // check browser console -> you will recieve the token if you submit form successfully via card(order via card) else error if card can't be verified(since console.log)
        // now we want to send same request to the server formObject
        // but formObject contains only phone and address data in it
        // we also want type of payment and token recieved from stripe(after verification) if payment type = card in formObject
        // 1) type of payment can be included in formObject by setting the name of dropdown(select tag) to 'paymentType'
        // 2) if payment method is card -> include token recieved from stripe server(after authentication)
        // for that add object for stripe token in formObject
        try{
            const result = await this.stripe.createToken(this.card)
            // console.log(result)
            return result.token
        }catch(err){
            console.log(err);
        }
        
        // this.stripe.createToken(this.card).then((result) =>{
        //     // console.log(result);
        //     // stripeToken is key and result.token.id is value(adding another object to formObject)
        //     formObject.stripeToken = result.token.id;
        //     // now formObject has all 4 parameters. do post request using ajax to node backend(call placeOrder function) step-4 of flow diagram (refer in my notebook)
        //     // node backend is nothing but orderController in app->http->controllers->customers->orderController 
        //     placeOrder(formObject);
        // }).catch((err) =>{
        //     console.log(err);
        // })
    }
}