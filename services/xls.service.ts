import * as xl from 'node-xlsx';
import { MyFunctions } from './functions.service.ts';
const myFunctions = new MyFunctions();
// const xl = new XL();

export class MyXLService {

  constructor(
  ) {
  }

  public createXLPrice(data: any, callback: any) {

    // let workbook = new xl.Workbook();
    // let workbook2 = new xl.Workbook();
    // workbook.views = [
    //   {
    //     x: 0, y: 0, width: 10000, height: 20000,
    //     firstSheet: 0, activeTab: 1, visibility: 'visible'
    //   }
    // ]

    // let worksheet = workbook.addWorksheet('SeltexPrice');
    // let worksheet2 = workbook2.addWorksheet('SeltexPrice');
    let priceUpdatedOnInfo: string = `Updated: ${myFunctions.getDateString()}`;
    let xlData = [["id","name","manufacturer", "main number", "all numbers", "price", "stock msk", "stock spb", "transit", "picref", "url", priceUpdatedOnInfo]];

    for (let i: number = 0; i < data.length; i += 1) {
      if (data[i].stock > 24) {
        if(data[i].description.indexOf("Сухарь")===0) {
          if (data[i].stock > 48) {
            data[i].stock = "48";
          } data[i].stock = `${data[i].stock}`;
        } else data[i].stock = "24";
      } else {
        data[i].stock = `${data[i].stock}`;
      }

      if (data[i].msk > 24) {
        if(data[i].description.indexOf("Сухарь")===0) {
          if (data[i].msk > 48) {
            data[i].msk = "48";
          } data[i].msk = `${data[i].msk}`;
        } else data[i].msk = "24";
      } else {
        data[i].msk = `${data[i].msk}`;
      }

      if (data[i].ordered > 24) {
        if(data[i].description.indexOf("Сухарь")===0) {
          if (data[i].ordered > 48) {
            data[i].ordered = "48";
          } data[i].ordered = `${data[i].ordered}`;
        } else data[i].ordered = "24";
      } else {
        data[i].ordered = `${data[i].ordered}`;
      }

      xlData[xlData.length] = [data[i].id,`${data[i].description} ${data[i].comment}`,`${data[i].manufacturer}`, `${data[i].numberMain}`, `${data[i].numbersString}`, data[i].price, `${data[i].msk}`, `${data[i].stock}`, `${data[i].ordered}`, `${data[i].img}`, `${data[i].url}`];

    }

    callback(xl.build([{name: "SeltexPrice", data: xlData}]));



  }

  public createXLCross(data: any, callback: any) {
    let priceUpdatedOnInfo: string = `Updated: ${myFunctions.getDateString()}`;


    let xlData = [["manufacturer","number","crossmanufacturer", "crossnumber", priceUpdatedOnInfo]];


    for (let i: number = 0; i < data.length; i += 1) {
      for(let j: number = 1; j < data[i].numbers.length; j += 1) {
        xlData[xlData.length] = [`${data[i].numbers[0].manufacturerFullName}`, `${data[i].numbers[0].number}`, `${data[i].numbers[j].manufacturerFullName}`, `${data[i].numbers[j].number}`];
      }
    }
    callback(xl.build([{name: "SeltexPrice", data: xlData}]));

  }

}
