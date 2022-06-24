const request = require('request');
const bodyParser = require('body-parser');
const express = require('express');
var app = express();
const http = require('http');
const server = http.createServer(app);
//const uuid = require('uuid);

// replace request with axios
const axios = require('axios');
// add socket.io for websockets so I don't need to refresh page!

const { Server } = require("socket.io");
const io = new Server(server);

// const async = require('async');

const us = new Intl.NumberFormat('en-us');
const os = require('os');


app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Need bodyParser?
// configure body-parser for express
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//TODO: move all this to use .env file, it would be safer than entering passwords in plain text on the app start 
// User and password specified like so: node index.js username password PIN
let username = process.argv.length < 2 ? "default-username" : process.argv[2];
let password = process.argv.length < 3 ? "default-password" : process.argv[3];
let PIN = process.argv.length < 4 ? "default-PIN" : process.argv[4];

// init global vars
let walletInfo;
let zAccounts;
let zUsd;
let systemInfo;
let zInfo;
let miningInfo;
let addresses;

let options = {
    method: 'post',
    url: "http://localhost:8232",
    withCredentials: true,
    responseType: 'json',
    headers:
    { 
     "content-type": "text/plain"
    },
    auth: {
        user: username,
        pass: password
    }
    
};

// AXIOSconfig
    let axiosConfig = {
      method: 'POST',
      url: "http://localhost:8232",
      auth: {
        username: username,
        password: password  
      },
      data: {
        "jsonrpc": "1.0",
        "id": "curltest", 
        "method": "getwalletinfo", 
        "params": []
      }
    };

let optionsCoinGecko = {
       url: "https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd",
    method: "get",
    headers:
    { 
     "content-type": "application/json'"
    }
}

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

// initial page load at localhost:8081
app.get('/', (req, res) => {
   console.log("Got a GET request for the homepage for zcashdxpress");
   
     // Get latest ZEC price from CoinGecko, then returning the page.
     //axios.get(optionsCoinGecko.url).then(function (response) {
        //console.log(response.data)
        //// no need to parse gecko resp.
        //zUsd = response.data.zcash.usd
        //// if we have a user connected, send updates for the price of ZEC
      //}).catch(function (error) {
            //// handle error
            //console.log(error);
          //}).then(function () {
              
              
          //})
   
    // Gather data from RPC calls zcashd. Currently caching responses and then serving that to the webpage.
    // https://axios-http.com/docs/api_intro
    
    if(addresses && walletInfo){
        walletInfo.addresses = addresses;
    }
    
    let sendSuccess = false;
    let loggedIn = false;
    
    //TODO: combine all these objects into one master obj.
   res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, errormsg: null, successmsg: null});
})

app.get('/accountz', (req, res) => {
    console.log('Got a request for the /accountz page, serving json data');
    res.send(JSON.stringify(zAccounts, null, 2));
    //zAccounts.forEach(account => {
      //account.forEach(  
        
    //})
}) 

app.get('/addresses', (req, res) => {
    console.log('Got a request for the /addresses page, serving json data');
    res.send(JSON.stringify(addresses, null, 10));
    // "<br />"));
    //zAccounts.forEach(account => {
      //account.forEach(  
        
    //})
}) 


app.post('/login', (req, res) => {
    let loggedIn = false;
    let sendSuccess = false;
    let errormsg;
    
   // console.log('PIN entered = ' + req.body.userPIN);
        //PIN submission, handle it here.
        let userPIN = req.body.userPIN;

        // if the PIN was entered, check if it's valid. If it is, log them in.
        if(userPIN) {
            if(userPIN == PIN){
                console.log('user PIN entered matches PIN on file');
                loggedIn = true;
            }else{
                console.log('User entered PIN did not match. Re-enter PIN');
                errormsg  = 'User entered PIN did not match. Re-enter PIN';
                loggedIn = false; 
            }
        }
        
        
    res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, errormsg: errormsg, successmsg: null});

})

// HANDLE ALL FORM SUBMISSIONS
app.post('/', (req, res) => {
            console.log('form submitted, determining which form that is - test form or sendZEC form');
        
        // var init - user is not yet logged in, sendSuccess is false, errormsg is null;
        let loggedIn = false;
        let sendSuccess = false;
        let errormsg;
        
        // Validate user entered PIN
        if(req.body.userPIN){ 
            console.log('userPIN form submitted');
            
            //PIN submission, handle it here.
            let userPIN = req.body.userPIN;

            // if the PIN was entered, check if it's valid. If it is, log them in.
            if(userPIN) {
                if(userPIN == PIN){
                    console.log('user PIN entered matches PIN on file');
                    loggedIn = true;
                }else{
                    console.log('User entered PIN did not match. Re-enter PIN');
                    errormsg  = 'User entered PIN did not match. Re-enter PIN';
                    loggedIn = false; 
                }
            }
            
            
        res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, errormsg: errormsg, successmsg: null});

            
        }
        
        if(req.body.fromAddress){
            console.log('submitZEC form submitted');
            
            //user is already logged in if they're submitting this form. Keep user logged in?
            
            // send request, handle it here.
            let fromAddress = req.body.fromAddress.trim();
            let toAddress = req.body.toAddress.trim();
            let amountZEC = req.body.amount;
            let allowRevealedAmountsCheck = req.body.allowRevealedAmounts;
            let errormsg;
            let continu = true;
            let allowRevealedAmounts;
            
            if(allowRevealedAmountsCheck){
                allowRevealedAmounts = true;
            }else{
                allowRevealedAmounts = false;
            }
            
            //TODO: add in MEMO functionality. Take in text from user, trim whitespace, convert to HEX?, then include in z_sendmany RPC call.
            
            let sendObj = {
                "address": toAddress,
                "amount": amountZEC
            }

                // DEBUG
                //console.log('fromAddress - '+ fromAddress);
                //console.log('toAddress - '+ toAddress);
                //console.log('amountZEC - '+ amountZEC);
                //console.log('allowRevealedAmounts - '+ allowRevealedAmounts);

            // SEND ZEC
            // set axiosConfig.data for validating z addr.
        // z_validateaddress
                axiosConfig.data = {
                    "jsonrpc": "1.0",
                    "id": "curltest", 
                    "method": "z_validateaddress", 
                    "params": [fromAddress]
                  }
                // VALIDATE THE 'FROM ADDRESS' - RPC CALL
                axios(axiosConfig).then(function (response) {
                    //console.log(response.data.result);
                    addrValidation = response.data.result;

                    if(addrValidation.isvalid === false){
                        console.log('The "From Address" is not a valid z address');
                        errormsg = 'The "From Address" is not a valid address';
                        // return with errorMsg, stay logged in.
                        loggedIn = true;
                        sendSuccess = false;
                        res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, errormsg: errormsg, successmsg: null});
                        continu = false;
                    }
                   
                }).catch(function (error) {
                    // handle error
                    if(error.response) {
                        console.log(error.response.data);
                        let errormsg = error.response.data;
                    }else{
                        console.log(error);
                        let errormsg = error;
                    }
                                    
                    loggedIn = true;
                    sendSuccess = false;
                    res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, errormsg: errormsg, successmsg: null});
                    continu = false;
                  })
                  .then(function () {
                  // VALIDATE THE 'TO ADDRESS' - RPC CALL
                  
                    if(continu === true) {
                        
                        axiosConfig.data = {
                            "jsonrpc": "1.0",
                            "id": "curltest", 
                            "method": "z_validateaddress", 
                            "params": [toAddress]
                          }
                          
                           axios(axiosConfig).then(function (response) {
                            addrValidation = response.data.result;

                            if(addrValidation.isvalid === false){
                                console.log('The "To Address" is not a valid z or ua address');
                                errormsg = 'The "To Address" is not a valid z or ua address';
                                // return with errorMsg, stay logged in.
                                loggedIn = true;
                                sendSuccess = false;
                                res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, errormsg: errormsg, successmsg: null});
                                return;
                            }
                               
                            }).catch(function (error) {
                                // handle error
                                    if(error.response) {
                                        console.log(error.response.data);
                                        let errormsg = error.response.data;
                                    }else{
                                        console.log(error);
                                        let errormsg = error;
                                    }
                                    
                                loggedIn = true;
                                 sendSuccess = false;
                                res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, errormsg: errormsg, successmsg: null});
                                return;
                              })
                              .then(function () {
                                  
                                if(continu === true) {
                                    // Both addresses have been validated, assume the amount is correct and continue sending.
                                    // if there is an issue with the amount, or other params, it will fail and report the error
                                    // .THEN THE z_sendmany CALL HERE
                                    console.log('Addresses have been validated, continuing to send ZEC');
                                    // Check if we're allowing revealed amounts / migrating pools.
                                    
                                    let sendObjArray = new Array();
                                    sendObjArray.push(sendObj);
                                    
                                    if(allowRevealedAmounts){
                                        axiosConfig.data = {
                                            "jsonrpc": "1.0",
                                            "id": "curltest", 
                                            "method": "z_sendmany", 
                                            "params": [fromAddress, sendObjArray, 1, 0.00001, "AllowRevealedAmounts"]
                                          }
                             
                                    }else{
                                        axiosConfig.data = {
                                            "jsonrpc": "1.0",
                                            "id": "curltest", 
                                            "method": "z_sendmany", 
                                            "params": [fromAddress, sendObjArray]
                                          }
                                    }
                         
                         
                                axios(axiosConfig).then(function (response) {
                                    resp = response.data.result;
                                    // resp = opid-xxxx-xxx-xxxx-xxxx
                                    // can use opid to get status/result but it usually takes about ~25 sec for tx to finish. 
                                    
                                    //response is success, giving back an operation id (tx is submitted but not yet included in a block).
                                    console.log('tx broadcast successfully... ', resp);
                                    opid = resp;

                                }).catch(function (error) {
                                    // handle error elegantly, showing the actual RPC error instead of the axios error.
                                    
                                    if(error.response) {
                                        console.log(error.response.data);
                                        let errormsg = error.response.data;
                                    }else{
                                        console.log(error);
                                        let errormsg = error;
                                    }
                                    
                                    //console.log(response.
                                    loggedIn = true;
                                    sendSuccess = false;
                                    res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, errormsg: errormsg, successmsg: null});
                                
                                  }).then(function() {
                                        let sendObjArray = new Array();
                                        sendObjArray.push(opid);
                                        
                                        // wait for 25 seconds, then check status and respond.
                                        setTimeout(function () {
                                            
                                        let successmsg;
                                            
                                            //check status of opid after waiting for 25 sec
                                        axiosConfig.data = {
                                            "jsonrpc": "1.0",
                                            "id": "curltest", 
                                            "method": "z_getoperationresult", 
                                            "params": [sendObjArray]
                                          }
                                            
                                            axios(axiosConfig).then(function (response) {
                                                resp = response.data.result;
                                                //TODO: save this info somewhere in mem to be able to display later? Otherwise, once this RPC call is executed, the opid & txid are wiped from mem.
                                                // only responding with txid info here then it's gone forever. (it is in the logs though)
                                                // DEBUG
                                                // console.log('response.data - ', response.data);
                                                // console.log('response.data.result - ', response.data.result);
                                                
                                                sendSuccess = true;
                                                
                                                // RESPONSE IS AN ARRAY. WE ARE ONLY looking up ONE TX SO JUST GRAB THE FIRST one [0]
                                                let txResult = response.data.result[0];
                                                
                                                if(txResult){
                                                    console.log('The transaction was '+ txResult.status + ' with txid: ' + txResult.result.txid + '. Execution time was '+ txResult.execution_secs + '. The opid is '+ opid);
                                                    if(txResult.status === 'success'){
                                                        successmsg = 'The send transaction was successful! Txid: ' + txResult.result.txid + '. Execution time: '+ txResult.execution_secs;
                                                    }
                                                }else {
                                                    successmsg = 'Transaction was submitted successfully with '+ opid + ' but it is still pending inclusion in a block (took longer than 35sec). You can search the zecwallet/debug.log with the opid to see the result or use RPC call: ./zcash-cli z_getoperationresult [opid].';
                                                }
         
                                                res.render('index', { wallet: walletInfo, zAccounts: zAccounts, zUsd: zUsd, zInfo: zInfo, systemInfo: systemInfo, sendSuccess: sendSuccess, loggedIn: loggedIn, successmsg: successmsg, errormsg: null});
                                               
                                            }).catch(function (error) {
                                            // handle error elegantly, showing the actual RPC error instead of the axios error.
                                            
                                                if(error.response) {
                                                    console.log(error.response.data);
                                                    let errormsg = error.response.data;
                                                }else{
                                                    console.log(error);
                                                    let errormsg = error;
                                                }
                                            
                                            })    
                                                }, 35000);  
                                  })    
                                }
                              });
                            }
                  });
        }
            
    
})


////SOCKETio new socket connection
//io.on('connection', async (socket) => {
    //// Generate a v4 (random) id
   //// let userId = uuid.v4();
     //userConnected = true;
     //console.log('a new user connected');
     //// console.log('user id: '+ userId);
   ////   setInterval(getZusd, 25000, socket);
      //let x = 0;
      //while(userConnected){
          ////setInterval(getZusd, 25000, socket);
          //console.log("we're at # " + x);
          
          //await waitFor(5000);
          
          //x++;
      //}
     
     
    //socket.on('disconnect', function () {
      //console.log('A user disconnected');
      //userConnected = false;
   //});
     
//})


// SOCKETio docs - https://socket.io/docs/v4/server-socket-instance/


function getWalletInfo(){
    
  //options.body = JSON.stringify( {"jsonrpc": "1.0", "id": "curltest", "method": "getwalletinfo", "params": [] })
  //options.data = {"jsonrpc": "1.0", "id": "curltest", "method": "getwalletinfo", "params": [] }

    axiosConfig.data = {
        "jsonrpc": "1.0",
        "id": "curltest", 
        "method": "getwalletinfo", 
        "params": []
      }


    axios(axiosConfig).then(function (response) {
            //console.log(response.data.result);
            walletInfo = response.data.result;
            // JSON.parse(walletInfo);
           // console.log(walletInfo)
           
        }).catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // always executed
            
          });

}


// fetches all accounts associated with wallet
// then fetches all addresses associated with each account.
// then fetches all unspent utxos associated with each address.
// If there is a large number of Accounts & addresses, this will take some time. We are caching responses to serve when homepage is hit.
function getAccounts(){
      console.log('getting accounts');
    axiosConfig.data = {
        "jsonrpc": "1.0",
        "id": "curltest", 
        "method": "z_listaccounts", 
        "params": []
      }
      
    axios(axiosConfig).then(function (response) {
            console.log(response.data.result);
            zAccounts = response.data.result;
            
            if(zAccounts){
                zAccounts.forEach(zacnt => {
                    // console.log('zacnt - ', zacnt);
                  //  console.log(zacnt.addresses);
                        // RPC call with zAccounts to get balances for each account - z_getbalanceforaccount
                        axiosConfig.data = {
                            "jsonrpc": "1.0",
                            "id": "curltest", 
                            "method": "z_getbalanceforaccount", 
                            "params": [zacnt.account, 1]
                          }
                          
                        axios(axiosConfig).then(function (response) {
                            //set response within each zacnt cached in the system
                            zacnt.pools = response.data.result;
                            
                        }).catch(function (error) {
                        // handle error
                        console.log(error);
                      }).then(function () {
                              
                              
                         //zacnt.addresses.forEach(addr => {
                                  
                            //// zcash-cli z_getbalance "address"
                            //axiosConfig.data = {
                                //"jsonrpc": "1.0",
                                //"id": "curltest", 
                                //"method": "z_getbalance", 
                                //"params": [addr.ua]
                         //}
                                  
                            //axios(axiosConfig).then(function (response) {
                                //// console.log(response.data);
                                //// add response to the zAccount
                                //addr.bal = response.data.result;
                                   //}).catch(function (error) {
                                       //console.log(error);
                                   //})
                                  
                              //})

                      }) // end of then() func.  
                      
                            //create address array to use in rpc call to find all unspent utxo's for each Zaccount
                            // for some reason with z_listunspent, using one of the accounts ua's pulls info for all of them.
                            // will probably have to fix this later.
                              let addressList = new Array();
                             
                                  addressList.push(zacnt.addresses[0].ua);
                              
                              
                            //  console.log('addressList - ', addressList);
                              
                              // RPC call with zacnt.addresses[] using z_listunspent (returns all unspent tx for addr) - https://zcash.github.io/rpc/z_listunspent.html
                              // RPC call with zAccounts to get balances for each account - z_getbalanceforaccount
                            axiosConfig.data = {
                                "jsonrpc": "1.0",
                                "id": "curltest", 
                                "method": "z_listunspent", 
                                "params": [1, 99999999, false, addressList]
                              }
                              
                            axios(axiosConfig).then(function (response) {
                                // console.log(response.data);
                                // add response to the zAccount
                                zacnt.unspentList = response.data.result;
                                
                                //var txids = new Array();
                                //var result = response.data.result;
                                //var uniqueResult = new Array();
                                //let x = 0;
                                //let y = 0;

                                //result.forEach(unspent => {
                                    //if(txids.indexOf(unspent.txid) == -1){
                                     //uniqueResult.push(unspent);
                                     //txids.push(unspent.txid);   
                                     //y++;
                                    //}
                                    //x++;
                                //})
                                
                                //console.log('total length of unspent list  = '+x);
                                //console.log('total length of unspent list unique  = '+y);
                                 //zacnt.unspentList = uniqueResult;
                               
                                //Result (output indices for only one value pool will be present):
                                 //(array of json object)
                                  //{
                                    //"txid" : "txid",                   (string) the transaction id 
                                    //"pool" : "sprout|sapling|orchard",   (string) The shielded value pool
                                    //"jsindex" (sprout) : n,            (numeric) the joinsplit index
                                    //"jsoutindex" (sprout) : n,         (numeric) the output index of the joinsplit
                                    //"outindex" (sapling, orchard) : n, (numeric) the Sapling output or Orchard action index
                                    //"confirmations" : n,               (numeric) the number of confirmations
                                    //"spendable" : true|false,          (boolean) true if note can be spent by wallet, false if address is watchonly
                                    //"account" : n,                     (numeric, optional) the unified account ID, if applicable
                                    //"address" : "address",             (string, optional) the shielded address, omitted if this note was sent to an internal receiver
                                    //"amount": xxxxx,                   (numeric) the amount of value in the note
                                    //"memo": xxxxx,                     (string) hexadecimal string representation of memo field
                                    //"change": true|false,              (boolean) true if the address that received the note is also one of the sending addresses
                                  //}

                            // try converting hex to readable so I can "de-code" the memos
                           //  hex.toString('utf-8')

                       }).catch(function (error) {
                        // handle error
                           console.log(error);
                           }) //end catch err
                }) // end zAccounts.forEach(zacnt)
            }
        }).catch(function (error) {
        // handle error
        console.log(error);
        })

}


//  GET USD for ZEC from coinGecko and display
function getZusd(){
    
  // options.body = JSON.stringify( {"jsonrpc": "1.0", "id": "curltest", "method": "z_listaccounts", "params": [] })
  

      axios.get(optionsCoinGecko.url).then(function (response) {
        console.log(response.data)
        // no need to parse gecko resp.
        zUsd = response.data.zcash.usd
        // if we have a user connected, send updates for the price of ZEC
      }).catch(function (error) {
            // handle error
            console.log(error);
          })

    
// messari API ?
// curl --compressed "https://data.messari.io/api/v1/assets?fields=id,slug,symbol,metrics/market_data/price_usd"
}

// 
function getZinfo(){
     
    axiosConfig.data = {
        "jsonrpc": "1.0",
        "id": "curltest", 
        "method": "getinfo", 
        "params": []
      }
 
        axios(axiosConfig).then(function (response) {
                //console.log(response.data);
                zInfo = response.data.result;
            }).catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // always executed
          });

}

function getSystemInfo(){
    
    let arch = os.arch();
    let freemem = os.freemem();
    let loadavg = os.loadavg();
    let release = os.release();
    let totalmem = os.totalmem();
    
    systemInfo = {'cpu': (arch.length - 1)};
    
    console.log(' // SYSTEM INFO // ');
    console.log('Free Memory: ' + freemem);
    console.log('Load Avg: ' + loadavg);
    console.log((arch.length - 1) + ' CPUs in system');
    console.log('Release: ' + release);
    console.log('Total Mem: ' + totalmem);
    
    
    //console.log('os.arch() - ' + arch);

    //options.body = JSON.stringify( {"jsonrpc": "1.0", "id": "curltest", "method": "getmininginfo", "params": [] })
  //request(options, (error, response, body) => {
    //if (error) {
        //console.error('An error has occurred -  getinfo: ', error);
    //} else {
        //console.log('Post successful - getinfo');
         //// res.send(body);
         //// parse the response json
        //res = JSON.parse(body);
        //miningInfo = res.result;
        //console.log('miningInfo - ', miningInfo);
        //systemInfo.miningInfo = miningInfo;
    //}
//}) 
    
}

// listaddresses - gets all addresses known to wallet and how they were derived (source)
function listAddresses(){
     
    axiosConfig.data = {
        "jsonrpc": "1.0",
        "id": "curltest", 
        "method": "listaddresses", 
        "params": []
      }
 
        axios(axiosConfig).then(function (response) {
                //console.log(response.data);
                addresses = response.data.result;
            }).catch(function (error) {
            // handle error
            console.log(error);
          }) // always executed
          .then(function () {
            
            // filter the addresses and check for balances.
            if(walletInfo.balance){
                 
                
            }
            // get balances of each address
            
            
          });

}


// TODO: enable z_sendmany directly from an address
// TODO: get address balances and populate page
// Function to sendZEC
function zSendMany(fromAddress, toAddress, amount, allowRevealedAmounts) {
        
        // send zec => z_sendmany
        // '{"jsonrpc": "1.0", "id":"curltest", "method": "z_sendmany", "params": ["t1M72Sfpbz1BPpXFHz9m3CdqATR44Jvaydd", [{"address": "ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf", "amount": 5.0}]] }' -H 'content-type: text/plain;' http://127.0.0.1:8232/
        
        // check status/result of opid and update.
        // ./zcash-cli z_getoperationresult '["opid..."]'
        
        
    
}

// run once on app start and then run every n hours. 
    getWalletInfo();
    getAccounts();
    getZusd();
    getSystemInfo();
    getZinfo();
    listAddresses();

    // 1000ms is 1 sec
    setInterval(getWalletInfo, 10000); // run every 10 sec to cache recent main balances
    setInterval(getZusd, 150000); // run every 150 sec to cach ZEC price from coingecko
    setInterval(getAccounts, 300000); // run every 300 sec to cache any new accounts created (these shouldn't change often unless creating new accounts/addresses
    setInterval(getZinfo, 19000); // cache new zcash blockchain info every 19 sec
    setInterval(listAddresses, 21600000);

function timeout(ms) { //pass a time in milliseconds to this function
    return new Promise(resolve => setTimeout(resolve, ms));
  }

server.listen(8081, () => {
   var port = server.address().port;
   
   console.log("zcashd-fullnodejs is available at http://localhost:"+port);
   console.log("Any RPC errors will be logged here.");
})
