const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
const http = require('http');
const bodyParser = require('body-parser')

/*
const server = http.createServer((req, res)=>{

});
*/

const app = express();
const port =3000;




const util = require('util')
app.use(express.json());
app.use(express.urlencoded());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.listen(3000, ()=> console.log(`app running on port ${port}`));


app.get('/', (req, res) => {
  res.render('index');
});

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': '',
    'client_secret': ''
});
let typePrice = 10.00;
app.post('/checkout', (req, res)=>{

    
    
   if(req.body.type == "exclusive"){
        typePrice = 300.00;
   }
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/return",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": `${req.body.song}`,
                    "sku": "001",
                    "price": `${typePrice}`,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": `${typePrice}`
            },
            "description": "Best beats in the world"
        }]
    };
   
  
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            //console.log("Create Payment Response");
            //console.log(payment);
                    //res.send("it worked");

                    for(let i=0; i<payment.links.length; i++){
                        if(payment.links[i].rel === 'approval_url'){
                            res.redirect(payment.links[i].href);
                        }
                    }

                    //console.log(util.inspect(create_payment_json, {showHidden: false, depth: null}));
        }
    });


});

app.get('/return', (req, res)=>{
    const payerID= req.query.PayerID;
    const paymentID= req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": typePrice
            }
        }]
    };
    paypal.payment.execute(paymentID, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send('success');
        }
    });

});





/*
app.get('/contact', (req, res) => {
  res.render('contact');
});
*/