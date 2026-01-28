import * as mysql from 'mysql2';
import MySqlConnection from "config/dbconnectmysqlnode.js"; //configs - defined in tsconfig.json
import { MyFunctions } from './functions.service.ts';
const myFunctions = new MyFunctions();
const mySqlConnection = new MySqlConnection();

export class MySqlService {

  constructor() {

  }

  getCompanyAtLogin(companyName: any, callback: any) {
    let items: any = [];
    let error: any = false;
    let query = `SELECT idcompanies as id, name, fullName FROM companies WHERE name = "${companyName}"`;
    // console.log(query);

    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);

    request
      .on('error', function(err) {
        error = err;
        // console.log(query, err);

      })
      .on('result', function(row) {
        items[items.length] = row;
      })
      .on('end', function() {
        if (error) {
          callback(false, error);
        } else if (items.length === 1) {
          callback(items[0]);
        } else callback(false);
      });

    connection.end();
  }

  getCurrentUser(user: any, callback: any) {
    let items: any = [];
    let query = `SELECT users.id as id, usersSecrets.token as token FROM users, usersSecrets WHERE users.id = "${user.id}" and usersSecrets.token = "${user.token}" and users.id = usersSecrets.id`;
    // console.log(query);

    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);

    request
    .on('error', function(err) {
      console.log(query, err);

    })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        if (items.length === 1) {
          this.getUserRights(items[0], callback)
        } else callback(items);
      });

    connection.end();
  }


  getUserRights(user: any, callback: any) {
    let items: any = [];
    let query = `SELECT companyId, rightId FROM usersRights WHERE userId = "${user.id}"`;
    // console.log(query);

    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);

    request
    .on('error', function(err) {
      console.log(query, err);

    })
      .on('result', function(row) {
        items[items.length] = row;
      })
      .on('end', function() {
        user.rights = items;
        callback(user);
      });
    connection.end();
  }

  logIn(data: any, callback: any) {
    let items: any = [];
    let error: any = false;
    let query = `call getUserRights(${data.companyId}, '${data.email}')`;
    // console.log(query);

    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);

    request
      .on('error', function(err) {
        error = err;
        // console.log(query, err);
      })
      .on('result', (row: any) => {
        items[items.length] = row.rightId;

      })
      .on('end', () => {
        if (error) {
          callback(false, error);
        } else {
          //let's get rid of OkPacket that arrives after stored procedure
          items.splice(items.length - 1, 1);

          if (items.length) {
            this.logInUser(data, items, callback);
          } else {
            callback(false);
          }
        }

      });
    connection.end();
  }

  logInUser(data: any, rights: any, callback: any) {
    let items: any = [];
    let token = Math.floor((Math.random() * 10000000) + 1);
    let query = `call logInUser('${data.email}', '${data.password}', ${token})`;
    // console.log(query);
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);

    request
    .on('error', function(err) {
      console.log(query, err);

    })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        //let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        if (items.length) {
          items[0].rights = {};
          items[0].rights[data.companyId] = rights;
          callback(items[0]);
        } else {
          callback(false);
        }
      });
    connection.end();
  }

  checkUserLoggedIn(user: any, email: any, token: any, company: any, callback: any) {
    let items: any = [];
    let error: any = false;
    let query = `call getUserRights(${company}, '${email}')`;
    // console.log(query);

    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);

    request
      .on('error', function(err) {
        error = err;
        // console.log(query, err);

      })
      .on('result', (row: any) => {
        items[items.length] = row.rightId;
      })
      .on('end', () => {
        if (error) {
          callback(false, error);
        } else {
          //let's get rid of OkPacket that arrives after stored procedure
          items.splice(items.length - 1, 1);

          if (items.length) {
            this.checkUserLoggedInNext(user, token, callback);
          } else {
            callback(false);
          }
        }

      });
    connection.end();
  }

  checkUserLoggedInNext(user: any, token: any, callback: any) {
    let items: any = [];
    let query = `call checkUserLoggedIn(${user}, ${token})`;
    // console.log(query);

    let connection = mysql.createConnection(mySqlConnection);


    let request = connection.query(query);


    request
      .on('error',(err)=>{
        // console.log(err);
        items[0] = {'error':err};
        // callback({'error':err});
        return;
      })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items[0]);
      });
    connection.end();
  }

  getManufacturers(company: any, callback: any) {
    let items: any = [];
    let query = `call getManufacturers(${company})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  getAllInventory(company: any, callback: any) {
    let items: any = [];
    let query = `call getAllInventory(${company})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  getLast100Inventory(company: any, callback: any) {
    let items: any = [];
    let query = `SELECT * FROM seltexru.inventory order by id desc limit 500`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        // items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  getInventoryForPermalinks(company: any, callback: any) {
    let items: any = [];
    let currentId = 0;
    let query = `call getInventoryForPermalinks(${company})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row: any) => {
        if (currentId !== row.id) {
          currentId = row.id;
          row.description = {
            text: row.description
          }
          row.comment = {
            text: row.comment
          }
          items[items.length] = row;
          items[items.length-1].numbers = [];
        }
        items[items.length-1].numbers[items[items.length-1].numbers.length] = {
          number: row.number,
          manufacturerFullName: row.manufacturerFullName,
          manufacturerId: row.manufacturerId
        }
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  getInventory(company: any, id: any, callback: any) {
    let items: any = [];
    let query = `call getInventory(${company}, ${id})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  getInventoryNumbers(company: any, id: any, callback: any) {
    // console.log("heyhey")
    let items: any = [];
    let query = `call getInventoryNumbers('${id}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
        // console.log(items);
      });
    connection.end();

  }

  getImagesList(id: any, callback: any) {
    let items: any = [];
    let query: string = `call getImagesList(${id})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error',(err)=>{
        // console.log(err);
        items = {'error':err};
        // callback({'error':err});
      })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  saveNewImage(id: any, callback: any) {
    let items: any = [];
    let query: string = `call saveNewImage(${id})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error',(err)=>{
        // console.log(err);
        items = {'error':err};
        // callback({'error':err});
      })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items[0]);
      });
    connection.end();
  }

  deleteImage(id: any, callback: any) {
    let items: any = [];
    let query: string = `call deleteInventoryImage(${id})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error',(err)=>{
        // console.log(err);
        items = {'error':err};
        // callback({'error':err});
      })
      .on('result', (row) => {
        items[items.length] = row;
        // console.log(items);
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items[0].result);
      });
    connection.end();
  }

  updateInventoryMainImage(id: any, partId: any, callback: any) {
    let items: any = [];
    let query: string = `call updateInventoryMainImage(${id}, ${partId})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error',(err)=>{
        // console.log(err);
        items = {'error':err};
        // callback({'error':err});
      })
      .on('result', (row) => {
        items[items.length] = row;
        // console.log(items);
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items[0].result);
      });
    connection.end();
  }

  searchInventory(query: any, callback: any) {
    let items: any = [];
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error',(err)=>{
        // console.log(err);
        items = {'error':err};
        // callback({'error':err});
      })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        // items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  searchInventoryForQuote(search: any, callback: any) {
    let query: string = `
      SELECT distinct n.inventoryId as id,
      i.description as iDescription,
      i.comment as iComment,
      p.Price as price,
      p.stock as stock, p.ordered as ordered, p.msk as msk 
      from inventoryNumbers as n, inventory as i, inventory1s as p 
      where (${search}) and n.inventoryId = i.id and i.id = p.id`;
    let items: any = [];
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error',(err)=>{
        // console.log(err);
        items = {'error':err};
        // callback({'error':err});
      })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        // items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  updateInventoryNumber(company: any, numberId: any, newNumber: any, newManufacturer: any, callback: any) {
    let items: any = [];
    let query = `call updateInventoryNumber(${numberId},'${newNumber}',${newManufacturer})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  updateInventoryMainNumber(company: any, numberId: any, inventoryId: any, callback: any) {
    let items: any = [];
    let query = `call updateInventoryMainNumber(${numberId},${inventoryId})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  saveInventoryNewNumber(company: any, partId: any, newNumber: any, newManufacturer: any, callback: any) {
    let items: any = [];
    let query = `call addInventoryNewNumber(${partId},'${newNumber}',${newManufacturer})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  deleteInventoryNumber(company: any, numberId: any, callback: any) {
    let items: any = [];
    let query = `call deleteInventoryNumber(${numberId})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  updateInventoryDescription(company: any, inventoryId: any, newDescription: any, callback: any) {
    let items: any = [];
    let query = `call updateInventoryDescription(${inventoryId},'${newDescription}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  updateInventoryComment(company: any, inventoryId: any, newComment: any, callback: any) {
    let items: any = [];
    let query = `call updateInventoryComment(${inventoryId},'${newComment}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  updateInventoryWeight(company: any, inventoryId: any, newWeight: any, callback: any) {
    let items: any = [];
    let query = `call updateInventoryWeight(${inventoryId},${newWeight})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  updateInventoryUrl(company: any, inventoryId: any, newUrl: any, callback: any) {
    let items: any = [];
    let query = `call updateInventoryUrl(${inventoryId},'${newUrl}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  updateManufacturer(company: any, id: any, name: any, fullName: any, callback: any) {
    let items: any = [];
    let query = `call updateManufacturer(${id},'${name}','${fullName}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  deleteManufacturer(company: any, id: any, callback: any) {
    let items: any = [];
    let query = `call deleteManufacturer(${id})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  addManufacturer(company: any, newName: any, newFullName: any, callback: any) {
    let items: any = [];
    let query = `call addManufacturer('${newName}','${newFullName}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error', function(err) {
        console.log(err);
      })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  // updateImage(company, image, callback) {
  //   let items = [];
  //   let query = `call updateImage('${image}')`;
  //   let connection = mysql.createConnection(mySqlConnection);
  //   let request = connection.query(query);
  //   request
  //     .on('error', function(err) {
  //       console.log(err);
  //     })
  //     .on('result', (row) => {
  //       items[items.length] = row;
  //       // console.log(row)
  //     })
  //     .on('end', () => {
  //       // let's get rid of OkPacket that arrives after stored procedure
  //       items.splice(items.length - 1, 1);
  //       var buffer = new Buffer.alloc(items[0].newImage);
  //       var bufferBase64 = buffer.toString('binary');
  //       console.log(items[0].newImage.length);
  //
  //       callback(JSON.stringify(bufferBase64));
  //     });
  //   connection.end();
  // }

  getPriceListData(company: any, callback: any) {
    let items: any = [];
    let query = myFunctions.getPriceListQuery();//`SELECT i.id, i.description, i.comment, i.price, i.stock, i.ordered, i.msk, n.number, m.fullName as manufacturerFullName, n.main FROM seltexru.inventory as i, seltexru.inventoryNumbers as n, seltexru.inventoryManufacturers as m where i.id = n.inventoryId and n.manufacturerId = m.id and (i.description like '%cat%' or i.comment like '%cat%' or i.description like '%prodiesel%' or i.comment like '%prodiesel%') and (i.description not like '%core%' and i.comment not like '%core%')`;
    let connection = mysql.createConnection(mySqlConnection);
    connection.query(query, function (error, results: any, fields) {
      let currentId: number = 0;
      for (let i: number = 0; i < results.length; i += 1) {
        if (currentId !== results[i].id) {

          currentId = results[i].id;
          items[items.length] = results[i];
          items[items.length-1].numbers = [];
          items[items.length-1].numbersString = "";
          items[items.length-1].numberMain = "";
          items[items.length-1].manufacturer = "";
          if (results[i].imgId) {
            items[items.length-1].img = `https://www.seltex.ru/img/db/1-${currentId}-${results[i].imgId}.png`;
          } else {
            items[items.length-1].img = "no";
          }
          if (results[i].url) {
            items[items.length-1].url = `https://www.seltex.ru/cat/${results[i].url}`;
          } else {
            items[items.length-1].url = "no";
          }

        }
        if(results[i].main) {
          items[items.length-1].numbers.unshift({
            number: results[i].number,
            manufacturerFullName: results[i].manufacturerFullName,
            main: results[i].main
          });
          items[items.length-1].numbersString = `${results[i].number} ${items[items.length-1].numbersString}`;
          items[items.length-1].numberMain = results[i].number;
          items[items.length-1].manufacturer = results[i].manufacturerFullName;

        } else {
          items[items.length-1].numbers[items[items.length-1].numbers.length] = {
            number: results[i].number,
            manufacturerFullName: results[i].manufacturerFullName,
            main: results[i].main
          };
          items[items.length-1].numbersString = `${items[items.length-1].numbersString} / ${results[i].number}`;
        }
      }
      callback(items);
    });
    connection.end();
  }

  getSiteMapData(company: any, callback: any) {
    let items: any = [];
    // let currentId = 0;
    let query = `call getSiteMapData(${company})`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error', (err)=>{
        console.log(err);
      })
      .on('result', (row: any) => {
        row.url = `https://www.seltex.ru/cat/${row.url}`;
        items[items.length] = row.url;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  }

  // public priceListCreateStart(company, callback) {
  //   let query = `call priceListCreateStart('${company}')`;
  //   let connection = mysql.createConnection(mySqlConnection);
  //   let request = connection.query(query);
  //   request
  //     .on('error', function(err) {
  //       console.log(err);
  //     })
  //     // .on('result', (row) => {
  //     //   items[items.length] = row;
  //     // })
  //     .on('end', () => {
  //       // let's get rid of OkPacket that arrives after stored procedure
  //       // items.splice(items.length - 1, 1);
  //       callback();
  //     });
  //   connection.end();
  // };
  //
  // public priceListCreateFinish(company, callback) {
  //   let query = `call priceListCreateFinish('${company}')`;
  //   let connection = mysql.createConnection(mySqlConnection);
  //   let request = connection.query(query);
  //   request
  //     .on('error', function(err) {
  //       console.log(err);
  //     })
  //     // .on('result', (row) => {
  //     //   items[items.length] = row;
  //     // })
  //     .on('end', () => {
  //       // let's get rid of OkPacket that arrives after stored procedure
  //       // items.splice(items.length - 1, 1);
  //       callback();
  //     });
  //   connection.end();
  // };
  //
  // public priceListCreateGetStatus(company, callback) {
  //   let items = [];
  //   let query = `call priceListCreateGetStatus('${company}')`;
  //   let connection = mysql.createConnection(mySqlConnection);
  //   let request = connection.query(query);
  //   request
  //     .on('error', function(err) {
  //       console.log(err);
  //     })
  //     .on('result', (row) => {
  //       items[items.length] = row;
  //     })
  //     .on('end', () => {
  //       // let's get rid of OkPacket that arrives after stored procedure
  //       items.splice(items.length - 1, 1);
  //       callback(items);
  //     });
  //   connection.end();
  // };

}
