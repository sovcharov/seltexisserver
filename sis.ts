///<reference path="./node_modules/@types/node/index.d.ts"/>
// import * as express from 'express';
// import { Application } from 'express';
import express from 'express';
const app = express();
// let bodyParser = require('body-parser');
import bodyParser from 'body-parser';
// const fs = require('fs');
import * as fs from 'fs';
import MyNodeConfig from 'configs/mynodeconfig.js';
const myNodeConfig = new MyNodeConfig();
import { MySqlService } from './services/mysql.service.ts';
const mySqlService = new MySqlService();
import { MyFileService } from './services/file.service.ts';
const myFileService = new MyFileService();
import { MyFunctions } from './services/functions.service.ts';
const myFunctions = new MyFunctions();
import { MyXLService } from './services/xls.service.ts';
const myXLService = new MyXLService();
import { MyAWSService } from './services/aws.service.ts';
const myAWSService = new MyAWSService();
// const app: Application = express();
// import * as request from 'request';
import * as http from 'http';
import * as https from 'https';
import { isAbsolute } from 'path';
import { isArray } from 'util';

//////////////////////////////////////////////////
////////// http/https secure or not block
if (!myNodeConfig.secure) {
  const server = http.createServer(app);
  server.listen(myNodeConfig.serverPort, () => { console.log("runs on HTTP " + myNodeConfig.serverPort)});
} else {
  let privateKey = fs.readFileSync(`/etc/letsencrypt/live/seltex.ru/privkey.pem`);
  let certificate = fs.readFileSync(`/etc/letsencrypt/live/seltex.ru/fullchain.pem`);
  let credentials = {key: privateKey, cert: certificate};
  const server = https.createServer(credentials, app);
  server.listen(myNodeConfig.serverPort, () => { console.log("runs on HTTPS " + myNodeConfig.serverPort) });
}
//////////////////////////////////////////////

// app.use(bodyParser.urlencoded({ extended: false },{limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '5mb'}));

app.use(function(req: any, res: any, next: any) {
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

app.get('/api/company/exists/:company', function(req: any, res: any) {
  mySqlService.getCompanyAtLogin(req.params.company, (items: any, error: any) => {
    if (error) {
      res.send({ status: 'error', error: error });
    } else {
      res.send({ status: 'ok', items: items });
    }
  });
});

app.get('/api/logInUser/:email/:password/:captcha/:companyId', function(req: any, res: any) {
  // const data = JSON.stringify({
  //   secret: myNodeConfig.recaptchaSecretKey,
  //   response: req.params.captcha
  // })
  const data: string = `secret=${myNodeConfig.recaptchaSecretKey}&response=${req.params.captcha}`;
  const options = {
    hostname: 'www.google.com',
    port: 443,
    path: '/recaptcha/api/siteverify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // 'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  const req2 = https.request(options, res2 => {
    // console.log(`statusCode: ${res2.statusCode}`);
    res2.on('data', d => {
      // process.stdout.write(d);
      let answer = JSON.parse(d.toString());
      // console.log(a);
      if (answer.success) {
        mySqlService.logIn({
          email: req.params.email,
          password: req.params.password,
          companyId: req.params.companyId
        }, (items: any, error: any) => {
          if (error) {
            res.send({ status: 'error', error: error });
          } else {
            res.send({ status: 'ok', items: items });
          }
        });
      } else {
        // console.error("my-error ", wrong captcha);
        res.send({ status: 'error', error: 'wrong input' });
      }
    })
  })
  req2.on('error', error => {
    // console.error("error in https post request: ", error);
    res.send({ status: 'error', error: "wrong input" });
  })
  req2.write(data)
  req2.end()
});

app.get('/api/checkCurrentUser/:userId/:token', function(req: any, res: any) {
  mySqlService.getCurrentUser({ id: req.params.userId, token: req.params.token }, (items: any) => {
    res.send(items);
  });
});

app.get('/api/check/userlogged/user/:userID/email/:email/token/:token/company/:company/', function(req: any, res: any) {
  mySqlService.checkUserLoggedIn(req.params.userID, req.params.email, req.params.token, req.params.company, (items: any, error: any) => {
    if (error) {
      res.send({ status: 'error', error: error });
    } else {
      res.send({ status: 'ok', items: items });
    }
  });
});

app.get('/api/getmanufacturers/company/:company', function(req: any, res: any) {
  mySqlService.getManufacturers(req.params.company, (items: any) => {
    res.send(items);
  });
});

app.get('/api/getallinventory/company/:company', function(req: any, res: any) {
  mySqlService.getAllInventory(req.params.company, (items: any) => {
    res.send(items);
  });
});

app.get('/api/getLast100inventory/company/:company', function(req: any, res: any) {
  mySqlService.getLast100Inventory(req.params.company, (items: any) => {
    res.send(items);
  });
});

app.get('/api/getinventoryforpermalinks/company/:company', function(req: any, res: any) {
  mySqlService.getInventoryForPermalinks(req.params.company, (items: any) => {
    res.send(items);
  });
});

app.get('/api/getinventory/company/:company/id/:id', function(req: any, res: any) {
  mySqlService.getInventory(req.params.company, req.params.id, (items: any) => {
    res.send(items);
  });
});

app.get('/api/searchinventory/company/:company/search/:search', function(req: any, res: any) {
  let search: any = req.params.search;
  search = search.split(' ');
  search = myFunctions.getRidOfEmptyItems(search);
  search = myFunctions.createComplicatedQuery(search);
  mySqlService.searchInventory(search, (items: any) => {
    res.send(items);
  });
});

app.get('/api/searchinventoryforquote/company/:company/search/:search', function(req: any, res: any) {
  let search: any = req.params.search;
  mySqlService.searchInventoryForQuote(myFunctions.addOrRemoveMinusInCatNumber(search), (items: any) => {
    res.send(items);
  });
});

app.get('/api/getinventorynumbers/company/:company/id/:id', function(req: any, res: any) {
  mySqlService.getInventoryNumbers(req.params.company, req.params.id, (items: any) => {
    res.send(items);
  });
});

//////////////////////
/// IMAGES APIs
//////////////////////
app.get('/api/getinventoryimage/company/:company/id/:id', function(req: any, res: any) {
  myFileService.getInventoryImage(req.params.company, req.params.id, (items: any) => {
    res.send(items);
  });
});

app.get('/api/getinventoryimages/:company/:id', function(req: any, res: any) {
  mySqlService.getImagesList(req.params.id, (images: any) => {
    if (images.length) {
      let count = 0;
      for (let i = 0; i < images.length; i += 1) {
        // console.log(images[i]);
        let fileName = `${req.params.company}-${req.params.id}-${images[i].id}`;
        // console.log(fileName);
        myFileService.getInventoryImage(fileName, i, (items: any, index: any) => {
          images[index].image = items.image;
          images[index].fileName = fileName;
          count += 1;
          if (count === images.length) {
            res.send(images);
          }
        });
      }
    } else {
      res.send(images);
      // images[0] = {};
      // let fileName = `nophoto`;
      // myFileService.getInventoryImage(fileName, 0, (items, index) => {
      //   images[index].image = items.image;
      //   images[index].fileName = fileName;
      //   res.send(images);
      // });
    }

  });

});

app.post('/api/updateimage/company/:company', function(req: any, res: any) {
  myFileService.updateImage(req.params.company, req.body.image, req.body.partId, (items: any) => {
    res.send(items);
  });
});

app.put('/api/savenewimage/company/:company', function(req: any, res: any) {
  // console.log(req.body.image);
  // res.send({res: "OK"});
  
  mySqlService.saveNewImage(req.body.partId, (items: any) => {
    let fileName = `${req.params.company}-${req.body.partId}-${items.id}`;
    // console.log(fileName);
    // res.send({res: "OK"});
    myFileService.saveImage(fileName, req.body.image, (fsRes: any) => {
      if (fsRes.error) {
        res.send(fsRes);
      } else {
        res.send({id: items.id, fileName: fileName, inventoryId: req.body.partId, main: items.main});
      }
    });
  });
});

app.delete('/api/deleteimage/:company/:partid/:imageid', function(req: any, res: any) {
  let fileName = `${req.params.company}-${req.params.partid}-${req.params.imageid}`;
  let count: number = 0;
  myFileService.deleteImage(fileName,(response: any) => {
      if(response.error) {
        res.send({error: "coul'd not delete file"});
      } else {
        if(count) {
          res.send({result: "ok"});
        } else {
          count += 1;
        }
      }
  });
  mySqlService.deleteImage(req.params.imageid, (items: any) => {
    if(count) {
      res.send({result: "okay"});
    } else {
      count += 1;
    }
  });  
});

app.post('/api/updateinventorymainimage/:company/:partid/:imageid', function(req: any, res: any) {
    // res.send({res: "OK"});
  mySqlService.updateInventoryMainImage(req.params.imageid, req.params.partid, (items: any) => {
    // console.log(fileName);
    res.send({res: "OK", items:items});
  });
});

//////////////////////
/// END - IMAGES APIs
//////////////////////


app.put('/api/updateinventorynumber/company/:company/numberid/:numberid/newManufacturer/:newmanufacturer', function(req: any, res: any) {
  mySqlService.updateInventoryNumber(req.params.company, req.params.numberid, req.body.newNumber, req.params.newmanufacturer, (items: any) => {
    res.send(items);
  });
});

app.put('/api/updateinventorymainnumber/company/:company/numberid/:numberid/inventoryid/:inventoryid/', function(req: any, res: any) {
  mySqlService.updateInventoryMainNumber(req.params.company, req.params.numberid, req.params.inventoryid, (items: any) => {
    res.send(items);
  });
});

app.post('/api/saveinventorynewnumber/company/:company/partid/:partid/newManufacturer/:newmanufacturer', function(req: any, res: any) {
  mySqlService.saveInventoryNewNumber(req.params.company, req.params.partid, req.body.newNumber, req.params.newmanufacturer, (items: any) => {
    res.send(items);
  });

});

app.delete('/api/deleteinventorynumber/company/:company/numberid/:numberid', function(req: any, res: any) {
  mySqlService.deleteInventoryNumber(req.params.company, req.params.numberid, (items: any) => {
    res.send(items);
  });

});

app.put('/api/updateinventorydescription/company/:company/inventoryid/:inventoryid', function(req: any, res: any) {
  mySqlService.updateInventoryDescription(req.params.company, req.params.inventoryid, req.body.newDescription, (items: any) => {
    res.send(items);
  });
});

app.put('/api/updateinventorycomment/company/:company/inventoryid/:inventoryid', function(req: any, res: any) {
  mySqlService.updateInventoryComment(req.params.company, req.params.inventoryid, req.body.newComment, (items: any) => {
    res.send(items);
  });
});

app.put('/api/updateinventoryweight/company/:company/inventoryid/:inventoryid', function(req: any, res: any) {
  mySqlService.updateInventoryWeight(req.params.company, req.params.inventoryid, req.body.newWeight, (items: any) => {
    res.send(items);
  });
});

app.put('/api/updateinventoryurl/company/:company/inventoryid/:inventoryid', function(req: any, res: any) {
  mySqlService.updateInventoryUrl(req.params.company, req.params.inventoryid, req.body.newUrl, (items: any) => {
    res.send(items);
  });
});

app.put('/api/updatemanufacturer/company/:company/id/:id', function(req: any, res: any) {
  mySqlService.updateManufacturer(req.params.company, req.params.id, req.body.name, req.body.fullName, (items: any) => {
    res.send(items);
  });
});

app.delete('/api/deletemanufacturer/company/:company/id/:id', function(req: any, res: any) {
  mySqlService.deleteManufacturer(req.params.company, req.params.id, (items: any) => {
    res.send(items);
  });

});

app.post('/api/addmanufacturer/company/:company', function(req: any, res: any) {
  mySqlService.addManufacturer(req.params.company, req.body.name, req.body.fullName, (items: any) => {
    res.send(items);
  });
});

app.post('/api/getrecommendedurlforitem/company/:company/description/:description', function(req: any, res: any) {
  myFunctions.getRecommendedUrlForItem(req.body.inventory, (data: any) => {
    res.send({text:data});
  });
});

app.get('/api/createxlprice', function(req: any, res: any) {
  mySqlService.getPriceListData(req.params.company, (priceListData: any) => {
    myXLService.createXLPrice(priceListData, (xlFile: any)=>{
        myAWSService.uploadPrice(xlFile, ()=>{
          myXLService.createXLCross(priceListData, (xlFileCross: any)=>{
              myAWSService.uploadCross(xlFileCross, ()=>{
                myAWSService.getPriceUpdateDate((data: any)=>{
                  res.send({data: data, res: "OK"});
                });
              });
          });
        });
    });
  });
});

app.get('/api/getpricelistupdatedate', function(req: any, res: any) {
  myAWSService.getPriceUpdateDate((data: any)=>{
    res.send(data);
  });
});

app.get('/api/getsitemapupdatedate', function(req: any, res: any) {
  myAWSService.getSiteMapUpdateDate((data: any)=>{
    res.send(data);
  });
});

app.get('/api/createsitemap', function(req: any, res: any) {
  let company = 1;
  mySqlService.getSiteMapData(company, (priceListData: any) => {
    myFunctions.getSiteMapData(priceListData, (data: any, date: any)=>{
      // console.log(data);
      myAWSService.uploadSiteMap(data, ()=>{
        res.send({data: date, res: "OK"});
      });
    });
  });
});



//////////////////////////////////////////////////////////
// ALL TEMP FUNCS AND APIs:
//////////////////////////////////////////////////////////
// app.post('/api/test', function(req: any, res: any) {
//   console.log(req);
// });
//
app.get('/api/temp', function(req: any, res: any) {
  console.log('Temp WORKS!!!')
});
//
// import { TempService } from './temp/temp.service';
// const tempService = new TempService();
// tempService.createURLs();
//////////////////////////////////////////////////////////
// END ALL TEMP FUNCS AND APIs:
//////////////////////////////////////////////////////////
