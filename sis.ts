///<reference path="./node_modules/@types/node/index.d.ts"/>
import * as express from 'express';
import { Application } from 'express';
import * as http from 'http';
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
var bodyParser = require('body-parser');

const httpServer = http.createServer(app);
httpServer.listen(myNodeConfig.serverPort, () => { });

app.use(bodyParser.urlencoded({ extended: false },{limit: '5mb'}));
app.use(bodyParser.json({limit: '5mb'}));

app.use(function(req, res, next) {
  var allowedOrigins = ['http://1.local', 'https://fvolchek.net', 'https://www.fvolchek.net', 'http://localhost:4200', 'http://seltex.ru', 'http://www.seltex.ru'],
  origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  // res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT");
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

app.get('/api/getinventory/company/:company/id/:id', function(req, res) {
  mySqlService.getInventory(req.params.company, req.params.id, (items) => {
    res.send(items);
  });
});

app.get('/api/searchinventory/company/:company/search/:search', function(req, res) {
  let search = req.params.search;
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

app.get('/api/createxlprice', function(req, res) {
  mySqlService.getPriceListData(req.params.company, (priceListData) => {
    if(priceListData === "OK") {
      res.send({res: "OK"});
    } else {
      myXLService.createXLPrice(priceListData, (xlFile)=>{
        myAWSService.uploadPrice(xlFile, (data)=>{
        });
      });
    }
  });
});

// app.get('/api/tempfunc', function(req, res) {
//   console.log('tempFunc')
//   mySqlService.tempFunc((items) => {
//     res.send(items);
//   });
// });
