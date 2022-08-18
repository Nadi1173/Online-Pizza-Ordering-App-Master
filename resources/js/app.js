import axios from 'axios'
import Noty from  'noty'
import { initAdmin } from './admin'
import moment from 'moment'
import {initStripe} from './stripe'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(pizza){
    axios.post('/update-cart',pizza).then(res =>{
        // console.log(res)
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item added to cart',
            progressBar:false,
            // layout: 'bottomLeft',    // by default -> topRight
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false,
            // layout: 'bottomLeft',    // by default -> topRight
        }).show();
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click',(e) => {
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
        // console.log(pizza)
    })
})


// remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    },2000)
}




// Change order status
let statuses = document.querySelectorAll('.status_line')
// console.log(statuses)
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
// console.log(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    }) 

}

updateStatus(order);

initStripe()

// socket
let socket = io()
// join 
if(order){
    socket.emit('join',`order_${order._id}`)
}

let adminAreaPath = window.location.pathname;
// console.log(adminAreaPath)
if(adminAreaPath.includes('admin')){
    initAdmin(socket)
    socket.emit('join','adminRoom')
}
// order_(id)   -> name of a private room(unique room for each order will be created)

socket.on('orderUpdated',(data) =>{
    const updatedOrder = {...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    // console.log(data)
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order Updated',
        progressBar:false,
        // layout: 'bottomLeft',    // by default -> topRight
    }).show();
})











