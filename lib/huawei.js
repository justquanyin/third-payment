'use strict'
var moment = require('moment'),
  crypto = require('crypto'),
  utf8 = require('utf8'),
  _ = require('underscore'),
  common = require('../common'),
  debug = require('debug')('third-payment'),
  request = require('request-promise');

class HWpay {
  constructor(params) {
    if (!params) {
      throw new Error("配置参数错误");
    }
    this.hw_public = params.public_key;
    this.hw_private = params.private_key;
    this.config = params;
  }
}

HWpay.prototype.sign = function (params, quote) {
  var raw = common.queryize(params, quote);
  var sign = crypto.createSign('RSA-SHA256');
  sign.update(utf8.encode(raw));
  return _.extend(params, {
    sign: sign.sign(hw_private, 'base64')
  });
}

HWpay.prototype.verify_async = function (params) {
  var origin = _.omit(params, ['sign', 'signType']);
  var raw = common.queryize(origin, false);
  var verify = crypto.createVerify('RSA-SHA256');
  verify.update(utf8.encode(raw));
  return verify.verify(hw_public, params.sign, 'base64');
}


HWpay.prototype.create = function (datas) {
  debug('to create huawei prepay, payObject = %j', datas);
  var huawei_config = this.config;
    var params = {
      applicationID: huawei_config.app_id,
      merchantId:huawei_config.merchantId,
      url: datas.notify_url,
      requestId: datas.trade_id,
      productName: datas.description || "支付",
      sdkChannel : 1,
      amount: new Number(datas.amount).toFixed(2),
      urlver: 2,
      productDesc: datas.productDesc || datas.trade_id
    };
    params = sign(params);
    
    params.serviceCatalog = huawei_config.serviceCatalog;
    params.merchantName = huawei_config.merchantName;
    delete params.urlver;
    params.urlVer = "2";
    debug('prepay_data is ready: %j', params);
    return params;
}

HWpay.prototype.verifyResponse = function (response) {
  debug('try to verfiy response: %j', response);
  if (!this.verify_async(response)){
    return { result: false, msg: 'Sign verification failed for notification' };
  }
  return { result: true}
  
}

HWpay.prototype.formatOut = function (err) {
  return err ? err : 0;
}

module.exports = HWpay;