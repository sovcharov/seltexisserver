import AWSConfig from 'config/awsconfig.js';
const awsConfig = new AWSConfig();
import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: awsConfig.id,
    secretAccessKey: awsConfig.key
});

const s3 = new AWS.S3();


export class MyAWSService {

  constructor() {

  }

  public getPriceUpdateDate(callback: any) {
    s3.headObject({
      Bucket: 'pricelist.seltex.ru',
      Key: 'SeltexPrice.xlsx'
    },function (err: any, data: any) {
      if (err) {
        callback(err);
      }
      if (data) {
        callback(data)
      }
    });
  }

  public uploadPrice(data: any, callback: any) {
    s3.putObject({
      Bucket: 'pricelist.seltex.ru',
      Key: 'SeltexPrice.xlsx',
      Body: data,
      ACL: 'public-read'
    },function (err: any, data: any) {
      if (err) {
        callback(err);
      }
      if (data) {
        callback("OK")
      }
    });
  }

  public uploadCross(data: any, callback: any) {
    s3.putObject({
      Bucket: 'pricelist.seltex.ru',
      Key: 'SeltexCross.xlsx',
      Body: data,
      ACL: 'public-read'
    },function (err: any, data: any) {
      if (err) {
        callback(err);
      }
      if (data) {
        callback("OK")
      }
    });
  }

  public getSiteMapUpdateDate(callback: any) {
    s3.headObject({
      Bucket: 'pricelist.seltex.ru',
      Key: 'sitemap.xml'
    },function (err: any, data: any) {
      if (err) {
        callback(err);
      }
      if (data) {
        callback(data)
      }
    });
  }

  public uploadSiteMap(data: any, callback: any) {
    s3.putObject({
      Bucket: 'pricelist.seltex.ru',
      Key: 'sitemap.xml',
      Body: data,
      ACL: 'public-read'
    },function (err: any, data: any) {
      if (err) {
        callback(err);
      }
      if (data) {
        callback("OK")
      }
    });
  }


}
