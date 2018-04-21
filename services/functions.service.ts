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
<<<<<<< HEAD
    str = "SELECT p.ID as id, p.Description AS description, p.Price as price, p.Numbers AS numbers, p.stock as stock, p.ordered as ordered, p.link as link from inventory1s as p where (" + str + ")";
=======
    str = "SELECT p.ID as id, p.Description AS description, p.Price as price, p.Numbers AS numbers, p.stock as stock, p.ordered as ordered, p.link as link from inventory as p where (" + str + ")";
>>>>>>> origin/master
    if (countCatParts) {
      str = str + " or (" + catStr + ")";
    }
    str = str + " and description not like N'я%' order by p.Description";
    return str;
  }

}
