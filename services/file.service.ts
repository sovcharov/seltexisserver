import * as fs from 'fs';
import { FsConfig } from '../../seltexisserverconfig/fsconfig.ts';
const fsConfig = new FsConfig();

export class MyFileService {

  constructor() {

  }

  public updateImage(company: any, image: any, partId: any, callback: any) {

    let file = `${__dirname}/${fsConfig.workDir}${company}-${partId}.png`;
    image = image.replace(/^data:;base64,/, "");
    image = Buffer.from(image, 'base64')
    // console.log('img: ',image);
    fs.writeFile(file, image, (err) => {
      if (err) {
        callback({ error: true });
      } else {
        callback({ done: true });
      }
    });
  }

  public saveImage(file: any, image: any, callback: any) {
    file = `${__dirname}/${fsConfig.workDir}${file}.png`;
    image = image.replace(/^data:;base64,/, "");
    image = image.replace(/^data:application\/octet-stream;base64,/, "");
    image = image.replace(/^data:image\/png;base64,/, "");
    image = image.replace(/^data:image\/jpeg;base64,/, "");
    image = Buffer.from(image, 'base64')
    // console.log('img: ',image);
    fs.writeFile(file, image, (err) => {
      if (err) {
        callback({ error: true });
      } else {
        callback({ done: true });
      }
    });
  }

  public deleteImage(file: any, callback: any) {
    file = `${__dirname}/${fsConfig.workDir}${file}.png`;
    // console.log(file);
    fs.unlink(file, (err) => {
      if (err) {
        console.log(err);
        callback({ error: true });
      } else {
        callback({ done: true });
      }
    });
  }


  public getInventoryImage(fileName: any, index: any, callback: any) {

    let file = `${__dirname}/${fsConfig.workDir}${fileName}.png`;
    let readFile = function (file: any) {
      fs.readFile(file, (err, data) => {
        if (err) {
          callback({ error: true });
        }
        let image = Buffer.from(data).toString('base64');
        image = `data:;base64,${image}`;
        callback({ image: image }, index);
      })
    }

    if (!fs.existsSync(file)) {
      let file = `${__dirname}/${fsConfig.workDir}nophoto.png`;
      readFile(file);
    } else {
      readFile(file);
    }




    // console.log(file)
    // if (fs.existsSync(file)) {
    //   callback({exists:true});/etc/letsencrypt/live/seltex.ru/privkey.pem
    // }
  }

  public getCertificates() {
    let privateKey = fs.readFileSync('/etc/letsencrypt/live/seltex.ru/privkey.pem');
    let certificate = fs.readFileSync('/etc/letsencrypt/live/seltex.ru/fullchain.pem');
    return { key: privateKey, cert: certificate };
  }

}
