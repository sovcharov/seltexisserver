///<reference path="./node_modules/@types/node/index.d.ts"/>
import * as express from 'express';
import { Application } from 'express';
import * as fs from 'fs';
import {MyNodeConfig} from '../seltexisserverconfig/mynodeconfig';
const myNodeConfig = new MyNodeConfig();
import { MySqlService } from './services/mysql.service';
const mySqlService = new MySqlService();
import { MyFileService } from './services/file.service';
const myFileService = new MyFileService();
import { MyFunctions } from './services/functions.service';
const myFunctions = new MyFunctions();
import { MyXLService } from './services/xls.service';
const myXLService = new MyXLService();
import {MyAWSService} from './services/aws.service';
const myAWSService = new MyAWSService();
const app: Application = express();
let bodyParser = require('body-parser');
// import * as request from 'request';
import * as http from 'http';
import * as https from 'https';

//////////////////////////////////////////////////
////////// http/https secure or not block
if (!myNodeConfig.secure) {
  const server = http.createServer(app);
  server.listen(myNodeConfig.serverPort, () => { });
} else {
  let privateKey = fs.readFileSync(`/etc/letsencrypt/live/seltex.ru/privkey.pem`);
  let certificate = fs.readFileSync(`/etc/letsencrypt/live/seltex.ru/fullchain.pem`);
  let credentials = {key: privateKey, cert: certificate};
  const server = https.createServer(credentials, app);
  server.listen(myNodeConfig.serverPort, () => {
    console.info("Run")
  });
}
//////////////////////////////////////////////

app.use(bodyParser.urlencoded({ extended: false },{limit: '5mb'}));
app.use(bodyParser.json({limit: '5mb'}));

app.use(function(req, res, next) {
  let allowedOrigins = myNodeConfig.allowedOrigins;
  let origin : string = String(req.headers.origin);
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  // res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  next();
});

app.get('/api/company/exists/:company', function(req, res) {
  mySqlService.getCompanyAtLogin(req.params.company, (items, error) => {
    if (error) {
      res.send({ status: 'error', error: error });
    } else {
      res.send({ status: 'ok', items: items });
    }
  });
});

app.get('/api/logInUser/:email/:password/:companyId', function(req, res) {
  mySqlService.logIn({
    email: req.params.email,
    password: req.params.password,
    companyId: req.params.companyId
  }, (items, error) => {
    if (error) {
      res.send({ status: 'error', error: error });
    } else {
      res.send({ status: 'ok', items: items });
    }
  });
});

app.get('/api/checkCurrentUser/:userId/:token', function(req, res) {
  mySqlService.getCurrentUser({ id: req.params.userId, token: req.params.token }, (items) => {
    res.send(items);
  });
});

app.get('/api/check/userlogged/user/:userID/email/:email/token/:token/company/:company/', function(req, res) {
  mySqlService.checkUserLoggedIn(req.params.userID, req.params.email, req.params.token, req.params.company, (items, error) => {
    if (error) {
      res.send({ status: 'error', error: error });
    } else {
      res.send({ status: 'ok', items: items });
    }
  });
});

app.get('/api/getmanufacturers/company/:company', function(req, res) {
  mySqlService.getManufacturers(req.params.company, (items) => {
    res.send(items);
  });
});

app.get('/api/getallinventory/company/:company', function(req, res) {
  mySqlService.getAllInventory(req.params.company, (items) => {
    res.send(items);
  });
});

app.get('/api/getLast100inventory/company/:company', function(req, res) {
  mySqlService.getLast100Inventory(req.params.company, (items) => {
    res.send(items);
  });
});

app.get('/api/getinventoryforpermalinks/company/:company', function(req, res) {
  mySqlService.getInventoryForPermalinks(req.params.company, (items) => {
    res.send(items);
  });
});

app.get('/api/getinventory/company/:company/id/:id', function(req, res) {
  mySqlService.getInventory(req.params.company, req.params.id, (items) => {
    res.send(items);
  });
});

app.get('/api/searchinventory/company/:company/search/:search', function(req, res) {
  let search: any = req.params.search;
  search = search.split(' ');
  search = myFunctions.getRidOfEmptyItems(search);
  search = myFunctions.createComplicatedQuery(search);
  mySqlService.searchInventory(search, (items) => {
    res.send(items);
  });
});

app.get('/api/getinventorynumbers/company/:company/id/:id', function(req, res) {
  mySqlService.getInventoryNumbers(req.params.company, req.params.id, (items) => {
    res.send(items);
  });
});

app.get('/api/getinventoryimage/company/:company/id/:id', function(req, res) {
  myFileService.getInventoryImage(req.params.company, req.params.id, (items) => {
    res.send(items);
  });
});

app.put('/api/updateinventorynumber/company/:company/numberid/:numberid/newManufacturer/:newmanufacturer', function(req, res) {
  mySqlService.updateInventoryNumber(req.params.company, req.params.numberid, req.body.newNumber, req.params.newmanufacturer, (items) => {
    res.send(items);
  });
});

app.put('/api/updateinventorymainnumber/company/:company/numberid/:numberid/inventoryid/:inventoryid/', function(req, res) {
  mySqlService.updateInventoryMainNumber(req.params.company, req.params.numberid, req.params.inventoryid, (items) => {
    res.send(items);
  });
});

app.post('/api/saveinventorynewnumber/company/:company/partid/:partid/newManufacturer/:newmanufacturer', function(req, res) {
  mySqlService.saveInventoryNewNumber(req.params.company, req.params.partid, req.body.newNumber, req.params.newmanufacturer, (items) => {
    res.send(items);
  });

});

app.delete('/api/deleteinventorynumber/company/:company/numberid/:numberid', function(req, res) {
  mySqlService.deleteInventoryNumber(req.params.company, req.params.numberid, (items) => {
    res.send(items);
  });

});

app.put('/api/updateinventorydescription/company/:company/inventoryid/:inventoryid', function(req, res) {
  mySqlService.updateInventoryDescription(req.params.company, req.params.inventoryid, req.body.newDescription, (items) => {
    res.send(items);
  });
});

app.put('/api/updateinventorycomment/company/:company/inventoryid/:inventoryid', function(req, res) {
  mySqlService.updateInventoryComment(req.params.company, req.params.inventoryid, req.body.newComment, (items) => {
    res.send(items);
  });
});

app.put('/api/updateinventoryweight/company/:company/inventoryid/:inventoryid', function(req, res) {
  mySqlService.updateInventoryWeight(req.params.company, req.params.inventoryid, req.body.newWeight, (items) => {
    res.send(items);
  });
});

app.put('/api/updateinventoryurl/company/:company/inventoryid/:inventoryid', function(req, res) {
  mySqlService.updateInventoryUrl(req.params.company, req.params.inventoryid, req.body.newUrl, (items) => {
    res.send(items);
  });
});

app.put('/api/updatemanufacturer/company/:company/id/:id', function(req, res) {
  mySqlService.updateManufacturer(req.params.company, req.params.id, req.body.name, req.body.fullName, (items) => {
    res.send(items);
  });
});

app.delete('/api/deletemanufacturer/company/:company/id/:id', function(req, res) {
  mySqlService.deleteManufacturer(req.params.company, req.params.id, (items) => {
    res.send(items);
  });

});

app.post('/api/addmanufacturer/company/:company', function(req, res) {
  mySqlService.addManufacturer(req.params.company, req.body.name, req.body.fullName, (items) => {
    res.send(items);
  });

});

app.post('/api/updateimage/company/:company', function(req, res) {
  myFileService.updateImage(req.params.company, req.body.image, req.body.partId, (items) => {
    res.send(items);
  });

});

// app.get('/api/createxlprice', function(req, res) {
//   // request.get({url: `${myNodeConfig.xlServiceUrl}/api/createxlprice`}, function(err, httpResponse, body){
//   //     if (err) {
//   //     return console.error('upload failed:', err);
//   //   }
//   //   body = JSON.parse(body);
//   //   console.log(body);
//   //   res.send({data: body, res: "OK"});
//   // })
//
//   mySqlService.getPriceListData(req.params.company, (priceListData) => {
//     myXLService.createXLPrice(priceListData, (xlFile)=>{
//         myAWSService.uploadPrice(xlFile, ()=>{
//           myXLService.createXLCross(priceListData, (xlFileCross)=>{
//               myAWSService.uploadCross(xlFileCross, ()=>{
//                 myAWSService.getPriceUpdateDate((data)=>{
//                   res.send({data: data, res: "OK"});
//                 });
//               });
//           });
//         });
//     });
//   });
// });
//
// app.get('/api/getpricelistupdatedate', function(req, res) {
//   // request.get({url: `${myNodeConfig.xlServiceUrl}/api/getpricelistupdatedate`}, function(err, httpResponse, data){
//   //     if (err) {
//   //     return console.error('upload failed:', err);
//   //   }
//   //   data = JSON.parse(data);
//   //   console.log(data);
//   //   res.send(data);
//   // })
//   myAWSService.getPriceUpdateDate((data)=>{
//     res.send(data);
//   });
// });

app.post('/api/getrecommendedurlforitem/company/:company/description/:description', function(req, res) {
  // console.log(req.body.inventory);
  myFunctions.getRecommendedUrlForItem(req.body.inventory, (data) => {
    res.send({text:data});
  });

});
//
// app.get('/api/createsitemap', function(req, res) {
//   let company = 1;
//   mySqlService.getSiteMapData(company, (priceListData) => {
//     myFunctions.getSiteMapData(priceListData, (data)=>{
//       myAWSService.uploadSiteMap(data, ()=>{
//         res.send({data: data, res: "OK"});
//       });
//     });
//   });
// });

//////////////////////////////////////////////////////////
// ALL TEMP FUNCS AND APIs:
//////////////////////////////////////////////////////////
// app.post('/api/test', function(req, res) {
//   console.log(req);
// });
//
// app.get('/api/temp', function(req, res) {
//   console.log('tempFunc')
// });
//
// import { TempService } from './temp/temp.service';
// const tempService = new TempService();
// tempService.createURLs();
//////////////////////////////////////////////////////////
// END ALL TEMP FUNCS AND APIs:
//////////////////////////////////////////////////////////
