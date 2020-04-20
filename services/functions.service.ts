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
  </url>
  `;
    for (let i = 0; i < 3; i += 1) {
      finalData += `<url>
    <loc>${data[i]}</loc>
    <lastmod>${date}</lastmod>
  </url>
    `;
    }
    finalData += `</urlset>`;
    callback(finalData);

  }

}
