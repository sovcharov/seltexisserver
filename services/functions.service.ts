let ctt = require('cyrillic-to-translit-js');

export class MyFunctions {

  constructor() {

  }

  public getRidOfEmptyItems (arr) {
    for (let i = 0; i < arr.length; i += 1) {
      if (!arr[i]) {
        arr.splice(i,1);
        i -= 1;
      }
    }
    return arr;
  }

  public getDateString () {
    let date: Date = new Date();
    let minutes: any = date.getMinutes();
    let seconds: any = date.getSeconds();
    if (minutes < 10) {
      minutes = `0${minutes}`
    }
    if (seconds < 10) {
      seconds = `0${seconds}`
    }
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()+3}:${minutes}:${seconds}`;

  }

  public getDateForSiteMap () {
    let date: Date = new Date();
    let month: any = date.getMonth()+1;
    let day: any = date.getDate();
    if (month < 10) {
      month = `0${month}`
    }
    if (day < 10) {
      day = `0${day}`
    }
    return `${date.getFullYear()}-${month}-${day}`;
  }

  public createComplicatedQuery (arr) {
    var i,
      str = '',
      catStr = '',
      getCatPart = function (str) {
        return str.slice(0, str.length-4) + '-' + str.slice(str.length-4);
      },
      checkIfCat = function (str) {
        var regex = /^[A-Za-z0-9]{2,3}[0-9]{4}$/i;
        if (regex.test(str)) {
          return true;
        }
        return false;
      },
      countCatParts = false;

    for (i = 0; i < arr.length; i += 1) {
      //search query with cat style (with'-') or without it
      if (checkIfCat(arr[i])) {
        countCatParts = true;
        if (i === 0) {
          str = "(Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          catStr = "(Description like N'%"+getCatPart(arr[i])+"%' or Numbers like '%"+getCatPart(arr[i])+"%')";
        } else {
          str = str + " AND (Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          catStr = catStr + " AND (Description like N'%"+getCatPart(arr[i])+"%' or Numbers like '%"+getCatPart(arr[i])+"%')";
        }
      } else {
        if (i === 0) {
          str = "(Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          catStr = "(Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
        } else {
          str = str + " AND (Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          catStr = catStr + " AND (Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
        }
      }
    }
    str = "SELECT p.ID as id, p.Description AS description, p.Price as price, p.Numbers AS numbers, p.stock as stock, p.ordered as ordered, p.msk as msk, p.link as link from inventory1s as p where (" + str + ")";
    if (countCatParts) {
      str = str + " or (" + catStr + ")";
    }
    str = str + " and description not like N'я%' order by p.Description";
    return str;
  }

  public addOrRemoveMinusInCatNumber (part: any) {
    let regex = /^[A-Za-z0-9]{2,3}[0-9]{4}$/i;
    let regex2 = /^[A-Za-z0-9]{2,3}\-[0-9]{4}$/i;
    if (regex.test(part)) {
      return `n.number like '%${part}%' or n.number like '%${part.slice(0, part.length-4) + '-' + part.slice(part.length-4)}%'`;
    } else if (regex2.test(part)) {
      return `n.number like '%${part}%' or n.number like '%${part.replace("-", "")}%'`;
    } else return `n.number like '%${part}%'`;
  }

  public createComplicatedQueryForQuote (arr) {
    var i,
      str = '',
      catStr = '',
      getCatPart = function (str) {
        return str.slice(0, str.length-4) + '-' + str.slice(str.length-4);
      },
      checkIfCat = function (str) {
        var regex = /^[A-Za-z0-9]{2,3}[0-9]{4}$/i;
        if (regex.test(str)) {
          return true;
        }
        return false;
      },
      countCatParts = false;

    for (i = 0; i < arr.length; i += 1) {
      //search query with cat style (with'-') or without it
      if (checkIfCat(arr[i])) {
        countCatParts = true;
        if (i === 0) {
          str = "(p.Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          catStr = "(p.Description like N'%"+getCatPart(arr[i])+"%' or Numbers like '%"+getCatPart(arr[i])+"%')";
        } else {
          str = str + " AND (p.Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          catStr = catStr + " AND (p.Description like N'%"+getCatPart(arr[i])+"%' or Numbers like '%"+getCatPart(arr[i])+"%')";
        }
      } else {
        if (i === 0) {
          str = "(p.Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          catStr = "(p.Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
        } else {
          str = str + " AND (p.Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          catStr = catStr + " AND (p.Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
        }
      }
    }
    str = "SELECT p.ID as id, p.Description AS description, i.description as iDescription, i.comment as iComment, p.Price as price, p.Numbers AS numbers, p.stock as stock, p.ordered as ordered, p.msk as msk, p.link as link from inventory1s as p, inventory as i where (" + str + ")";
    if (countCatParts) {
      str = str + " or (" + catStr + ")";
    }
    str = str + " and p.description not like N'я%' and p.id = i.id order by p.Description";
    return str;
  }

  public getRecommendedUrlForItem (row, callback) {
    row.descriptionURL = row.description.text.replace(/\-/g,'');
    row.descriptionURL = ctt().transform(row.descriptionURL, "-");
    row.descriptionURL = row.descriptionURL.toLowerCase();
    row.descriptionURL = row.descriptionURL.replace(/r\/k/g,'remkomplekt');
    row.descriptionURL = row.descriptionURL.replace(/\//g,'-');
    row.descriptionURL = row.descriptionURL.replace(/\\/g,'-');
    row.descriptionURL = row.descriptionURL.replace(/\(|\)|\,|\.|\'/g,'');
    row.descriptionURL = row.descriptionURL.replace(/\-\-/g,'-');
    row.descriptionURL = row.descriptionURL.replace(/\-\-/g,'-');
    row.descriptionURL = row.descriptionURL.replace(/\-kt/g,'-komplekt');

    row.commentURL = row.comment.text.replace(/\-/g,'');
    row.commentURL = ctt().transform(row.commentURL, "-");
    row.commentURL = row.commentURL.replace(/r\/k/g,'remkomplekt');
    row.commentURL = row.commentURL.replace(/\//g,'-');
    row.commentURL = row.commentURL.replace(/\\/g,'-');
    row.commentURL = row.commentURL.replace(/\(|\)|\,|\.|\'/g,'');
    row.commentURL = row.commentURL.replace(/\-\-/g,'-');
    row.commentURL = row.commentURL.replace(/\-\-/g,'-');
    row.commentURL = row.commentURL.replace(/-kt/g,'-komplekt');

    row.url = `${row.descriptionURL}`;
    if (row.commentURL) {
      row.url += `-${row.commentURL}`;
    }

    if(row.numbers.length) {
      row.number = row.numbers[0].number.replace(/\ /g,'-');
      row.mName = row.numbers[0].manufacturerFullName.replace(/\ /g,'-');


      if (row.numbers[0].manufacturerId === 1) {
        row.url += `-${row.number}-caterpillar`;
      }  else if (row.numbers[0].manufacturerId === 5) {
        row.url += `-${row.number}-costex-ctp`;
      } else {
        row.url += `-${row.number}-${row.mName}`;
      }

      for (let i = 1; i < row.numbers.length; i += 1) {
        row.url += `-${row.numbers[i].number}`;
      }
    }

    row.url = row.url.toLowerCase();

    callback(row.url);
  }

  getSiteMapData (data, callback) {
    let date = this.getDateForSiteMap();
    let finalData = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.seltex.ru/</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/equipment/cat/</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/cum</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/dd</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%B2%D0%BA%D0%BB%D0%B0%D0%B4%D1%8B%D1%88%20CAT</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%BF%D1%80%D0%BE%D0%BA%D0%BB%D0%B0%D0%B4%D0%BA%D0%B8%20CAT</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%BA%D0%BE%D0%BB%D1%8C%D1%86+%D0%BF%D0%BE%D1%80%D1%88%D0%BD%D1%8F%20CAT</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%B4%D0%B0%D1%82%D1%87%D0%B8%D0%BA%20CAT</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%9E%D1%85%D0%BB%D0%B0%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%20CAT</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%BF%D0%BE%D0%BC%D0%BF%D0%B0%20CAT</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%B2%D0%BA%D0%BB%D0%B0%D0%B4%D1%8B%D1%88</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%BF%D1%80%D0%BE%D0%BA%D0%BB%D0%B0%D0%B4%D0%BA%D0%B8</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%BA%D0%BE%D0%BB%D1%8C%D1%86%20%D0%BF%D0%BE%D1%80%D1%88%D0%BD%D1%8F</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%B4%D0%B0%D1%82%D1%87%D0%B8%D0%BA</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%9E%D1%85%D0%BB%D0%B0%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%BF%D0%BE%D0%BC%D0%BF%D0%B0</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/equipment/cat/engineparts/</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/equipment/cat/filters/</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/equipment/cat/kits/</loc>
    <lastmod>${date}</lastmod>
  </url>
  <url>
    <loc>https://www.seltex.ru/catalog/%D0%BA%D0%BE%D0%BB%D1%8C%D1%86%20%D0%BF%D0%BE%D1%80%D1%88%D0%BD%D1%8F%20CAT</loc>
    <lastmod>${date}</lastmod>
  </url>`;
    for (let i = 0; i < data.length; i += 1) {
      finalData += `
  <url><loc>${data[i]}</loc></url>`;
    }
    finalData += `
</urlset>`;
    callback(finalData, date);

  }

  getPriceListQuery () {
    let query: string = "";//`SELECT i.id, i.description, i.comment, i.price, i.stock, i.ordered, i.msk, n.number, m.fullName as manufacturerFullName, n.main FROM seltexru.inventory as i, seltexru.inventoryNumbers as n, seltexru.inventoryManufacturers as m where i.id = n.inventoryId and n.manufacturerId = m.id and (i.description like '%cat%' or i.comment like '%cat%' or i.description like '%prodiesel%' or i.comment like '%prodiesel%') and (i.description not like '%core%' and i.comment not like '%core%')`;
    let data: string[] = ['cat', 'prodiesel', 'komatsu', 'perkins', 'john deere'];
    let midQuery: string = "";
    for (let i = 0; i < data.length; i += 1) {
      if (i !== 0) {
        midQuery += ` or `
      }
      midQuery += `i.description like '%${data[i]}%' or i.comment like '%${data[i]}%'`;
    }
    query = `SELECT i.id, i.description, i.comment, i.price, i.stock, i.ordered, i.msk, n.number, m.fullName as manufacturerFullName, n.main FROM seltexru.inventory as i, seltexru.inventoryNumbers as n, seltexru.inventoryManufacturers as m where i.id = n.inventoryId and n.manufacturerId = m.id and (${midQuery}) and (i.description not like '%core%' and i.comment not like '%core%')`
    // query = `SELECT i.id, i.description, i.comment, i.price, i.stock, i.ordered, i.msk, n.number, m.fullName as manufacturerFullName, n.main, CASE WHEN EXISTS (SELECT img.id FROM seltexru.inventoryImages as img WHERE i.id = img.inventoryId) THEN 1 ELSE 0 END as imgId FROM seltexru.inventory as i, seltexru.inventoryNumbers as n, seltexru.inventoryManufacturers as m where i.id = n.inventoryId and n.manufacturerId = m.id and i.id = img.inventoryId and (${midQuery}) and (i.description not like '%core%' and i.comment not like '%core%')`
    return(query);
  }
}
