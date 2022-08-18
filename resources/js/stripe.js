import axios from 'axios'
import Noty from  'noty'
import {loadStripe} from '@stripe/stripe-js';
import { placeOrder } from './apiService';   
import { CardWidget } from './CardWidget';

export async function initStripe() {
    // loadstipe() returns promise
    // parameter of loadStripe fn = api key
    // register on stripe.com, then goto dashboard->developers->API keys-> publishable key is to be placed in browser client side(client js files like stipe.js, app.js) and secret key is to be placed at backend
    // don't place secret key publically in client js files(keep in .env file and use securely)
    // for now, we don't want secret key

    // our stripe account is test account(for developers) to test the working of cards
    // for recieving real payments -> activate your account by providing bank details and all(not required for now)
    // for testing -> stripe provides test card number: 4242 4242 4242 4242
    // and MM/YY/CVC ZIP is any future date(MM/YY) and CVC is any 3 digit number you want
    // we don't want ZIP option -> can disable -> in create function(refer below) along with style object pass 2nd parameter -> hidePostalCode: true

    // NOTE: since loadStipe returns promise and it is await, we need to make initStripe() fn async
    const stripe = await loadStripe('pk_test_51L996nSAv2MZQ1DpkBXDppPPGZvOGudPgL9ti1MAlzghp60KiG5P8Wyv1fF6yWb3cG2foidWZleKJzb9znuzl1Tq003IrzHgnX'); 
    
    // logic of showing card details widget on cart.ejs(call this only when card option is selected else not -> refer this logic below)
    let card = null;    // stores the card element to be shown at cart page
    // function mountWidget() {
    //     // get stripe elements(elements = types of payments)
    //     const elements = stripe.elements()  

    //     // style for our card widget mounted in cart.ejs
    //     let style = {
    //         base: {
    //             color: '#32325d',
    //             fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    //             fontSmoothing: 'antialiased',
    //             fontSize: '16px',
    //             '::placeholder':{
    //                 color: '#aab7c4'
    //             }
    //         },
    //         invalid:{
    //             color: '#fa755a',
    //             iconColor: '#fa755a'
    //         }
    //     };

    //     // create 1st parameter is type of payment to integrate = 'card' in our case
    //     // 2nd arg = object -> to style this widget 'card' -> pass the style object created above
    //     // there is other css also -> rendered directly from app.scss(refer resources->scss->app.scss)
    //     // for more payment types(options) check : https://stripe.com/docs/payments/elements
    //     card = elements.create('card',{style,hidePostalCode:true}) 
    //     card.mount('#card-element');
    //     // mount this element in browser
    //     // location where to mount this element(after address in our cart page)
    //     // create div in cart.ejs after address input tag after div end(to mount this element there)
    // }


    // get the select box(using its id)
    const paymentType = document.querySelector('#paymentType')
    // this is done to avoid adding event listner when we are not on cart page -> then we will get error in console -> addEvent Listner to null
    if(!paymentType){
        return;
    }
    // add event listner, 1st argument = event to be listened
    // 2nd arg = function to be executed if event occurs(which recieves event in input)
    // whenever we select pay with card, 'change' event will occur
    paymentType.addEventListener('change',(e)=>{
        // console.log(e); // can see event in browser console

        // now if option selected is card -> then show inputtext box to enter card number
        // if option selected is cod -> don't show
        // console.log(e.target.value)   // shows value attribute of option selected(check in browser console)

        // logic
        if(e.target.value === 'card'){
            // display inputtext(widget)
            // this widget is provided by stipe module
            // so we need to install stripe client library
            // refer documentation of stipe js(2 options -> add script or install npm module)
            // we will install npm module(using yarn)
            // refer github page for reference: https://github.com/stripe/stripe-js
            // 1) command to install : yarn add @stripe/stripe-js

            // 2) import stripe(done-> see above) 
            // 3) use loadstripe function 1st line in initStripe function(refer github reference for details)
            // mountWidget();

            card = new CardWidget(stripe)
            card.mount()
        }
        else{
            // destroy card widget if already there
            // card widget will be already available if user clicks -> card option first then cash on delivery
            card.destroy()
        }
    })

    // AJAX call - form logic for order now
    const paymentForm = document.querySelector('#payment-form');
    if(paymentForm){
        // whenever the form submitted, arrow function(function in 2nd argument) will be executed
        // arrow function will receive the event occured(= submit)
        paymentForm.addEventListener('submit',async (e) =>{
            // prevent the default behaviour of form submission(don't submit through html file(cart.ejs) instead we will submit through here (AJAX call))
            e.preventDefault();
            // console.log(e); // using this, when you click order now, you can see submit event in console of browser
            
            // get form data here
            let formData = new FormData(paymentForm);    // object of form data in js(FormData is in built class in js)
            // console.log(formData); // using this, when you click order now, you can see form data object in console of browser

            // extract data from form data

            // we want object containing this structure(form data)
            // {
            //     phone: xyz,
            //     address: 'something'
            // }

            let formObject = {}     // empty object to store above object

            // iterates over all the values(entries) in formdata(for phone and address)
            // every elt of formdata is an object of key value pairs
            // thus there are 2 objects in formData.entries() -> phone and address
            // for of loop will iterate objects as array. thus console.log(key) will output array of phone and object of address in browser console 
            // for(let key of formData.entries()){
            //     console.log(key)
            // }

            // to get key and values individually, destructure the array
            // check the browser console
            for(let [key,value] of formData.entries()){
                // console.log(key,value)
                formObject[key] = value;    // set formObject key and value
            }

            // console.log(formObject);    // check browser console


            // if card is not empty -> option is card payment -> we do not do that ajax call, we have submit the form seperately along with card number(will see how)

           // i have placed ajax call for form submission(post request) in seperate file(apiService.js) to keep code clean
            // if card is null -> card option is not selected(cod is selected) then directly do ajax call(submit the form) and stop(return)
            if(!card){
                // AJAX
                placeOrder(formObject);
                // console.log(formObject)
                return;
            } 

            
            // // Verify card before doing post request and get the token(step-1 of flow diagram -> refer in notebook)
            // // createToken() method takes card element(data to be verified) = card
            // // this will return us promise -> to handle that call then() block -> called when verification is successful
            // // arrow function inside then will be executed on successful verification and parameter 'result' will recieve the token from stripe server

            // // check browser console -> you will recieve the token if you submit form successfully via card(order via card) else error if card can't be verified(since console.log)
            // // now we want to send same request to the server formObject
            // // but formObject contains only phone and address data in it
            // // we also want type of payment and token recieved from stripe(after verification) if payment type = card in formObject
            // // 1) type of payment can be included in formObject by setting the name of dropdown(select tag) to 'paymentType'
            // // 2) if payment method is card -> include token recieved from stripe server(after authentication)
            // // for that add object for stripe token in formObject
            // stripe.createToken(card).then((result) =>{
            //     // console.log(result);
            //     // stripeToken is key and result.token.id is value(adding another object to formObject)
            //     formObject.stripeToken = result.token.id;
            //     // now formObject has all 4 parameters. do post request using ajax to node backend(call placeOrder function) step-4 of flow diagram (refer in my notebook)
            //     // node backend is nothing but orderController in app->http->controllers->customers->orderController 
            //     placeOrder(formObject);
            // }).catch((err) =>{
            //     console.log(err);
            // })
             
            const token = await card.createToken()
            // formObject.stripeToken = token.id;
            formObject.stripeToken = token.id;
            placeOrder(formObject)
            
        })
    }
}