import axios from 'axios'
import Noty from  'noty'

export function placeOrder(formObject){
    // place ajax call here


    // now we can post form object on server (using axios)
    // post() method-> 1st arg = where to send post request('/orders' is action of form(in cart.ejs))
    // 2nd argument = data to be sent
    // post() method returns promise 
    // -> so whenever post request successful, function in then() block will execute, it will recieve response from server
    // if there is some error, then catch() block will be executed (which will recieve error message)
    axios.post('/orders',formObject).then((res) =>{
        // console.log(res.data);
        new Noty({
            type: 'success',
            timeout: 1000,
            text: res.data.message,
            progressBar:false,
        }).show();

        setTimeout(() =>{
            window.location.href = '/customer/orders';
        },1000);

    }).catch((err)=>{
        console.log(err);
        new Noty({
            type: 'error',
            timeout: 1000,
            text: err.res.data.message,
            progressBar:false,
        }).show();
    })
}