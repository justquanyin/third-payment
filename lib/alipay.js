'use strict'
var moment = require('moment'),
  crypto = require('crypto'),
  utf8 = require('utf8'),
  _ = require('underscore'),
  common = require('../common'),
  debug = require('debug')('third-payment'),
  request = require('request-promise');

const ALIPAY_SERVICE = {
  alipay_app: 'mobile.securitypay.pay',
  alipay_mp: 'alipay.trade.wap.pay',
  alipay_web: 'create_direct_pay_by_user',
  alipay_native: 'alipay.trade.precreate'
};

class Alipay {
  constructor(params) {
    if (!params) {
      throw new Error("配置参数错误");
    }
    this.ali_public = params.public_key;
    this.app_private = params.private_key;
    this.openali_public = params.openali_public_key;
    this.config = params;
  }
}

Alipay.prototype.sign = function (params, quote) {
  var raw = common.queryize(params, quote);
  var sign = crypto.createSign('RSA-SHA1');
  sign.update(utf8.encode(raw), 'binary');
  return _.extend(params, {
    sign: encodeURIComponent(sign.sign(this.app_private, 'base64')),
    sign_type: 'RSA'
  });
}

Alipay.prototype.verify_async = function (params) {
  var origin = _.omit(params, ['sign', 'sign_type']);
  var raw = common.queryize(origin, false);
  var verify = crypto.createVerify('RSA-SHA1');
  verify.update(utf8.encode(raw));
  return verify.verify(this.ali_public, params.sign, 'base64');
}

Alipay.prototype.verify_async_openapi = function (params) {
  var origin = _.omit(params, ['sign', 'sign_type']);
  var raw = common.queryize(origin, false);
  var verify = crypto.createVerify('RSA-SHA1');
  verify.update(utf8.encode(raw), 'binary');
  return verify.verify(this.openali_public, params.sign, 'base64');
}

Alipay.prototype.verify_sync = function (params,sign) {
  var raw = JSON.stringify(params);
  var verify = crypto.createVerify('RSA-SHA1');
  verify.update(utf8.encode(raw), 'binary');
  return verify.verify(this.openali_public, sign, 'base64');
}

Alipay.prototype.verify_notify = function (notify_id) {

  var options = {
    uri: 'https://mapi.alipay.com/gateway.do?service=notify_verify&partner=PARTNER_ID&notify_id=NOTIFY_ID'.replace('PARTNER_ID', this.config.partner).replace('NOTIFY_ID', notify_id)
  }
  return request(options).then(function (res) {

    return res.body;
  })
}


Alipay.prototype.create = function (datas) {
  debug('to create alipay prepay, payObject = %j', datas);
  var config = this.config;
  switch (datas.type) {
    case 'alipay_app':
      var params = {
        app_id: config.app_id,
        service: ALIPAY_SERVICE[datas.type],
        partner: config.partner,
        _input_charset: "utf-8",
        notify_url: datas.notify_url,
        out_trade_no: datas.trade_id,
        subject: datas.description || "购买商品",
        seller_id: config.seller_id,
        total_fee: datas.amount,
        payment_type: "1",
        body: datas.detail || "",
        it_b_pay: config.it_b_pay || "1d",
      };

      params = this.sign(params, true);

      debug('prepay_data is ready: %j', params);
      params = common.queryize(params, false);

      return Promise.resolve(params);

    case 'alipay_web':
      var params = {
        "service": ALIPAY_SERVICE[datas.type],
        "partner": config.partner,
        "seller_id": config.partner,
        "payment_type": 1,
        "notify_url": datas.notify_url,
        "return_url": datas.return_url,
        "out_trade_no": datas.trade_id,
        "subject": datas.description || "购买商品",
        "total_fee": datas.amount,
        "body": datas.detail || "",
        "_input_charset": "utf-8",
        "it_b_pay": config.it_b_pay || "1d",
      }
      params = this.sign(params, false);
      return Promise.resolve(params);

    case 'alipay_mp':

      var params = {
        app_id: config.app_id,
        version: "1.0",
        format: "json",
        method: ALIPAY_SERVICE[datas.type],
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        notify_url: datas.notify_url,
        return_url: datas.return_url,
        charset: "UTF-8",
        sign_type: 'RSA'
      };

      var biz_conent = {
        product_code: "QUICK_WAP_PAY",
        body: datas.detail || "",
        subject: datas.description || "购买商品",
        out_trade_no: datas.trade_id,
        total_amount: datas.amount,
        timeout_express: config.it_b_pay || "1d",
      };

      params.biz_content = JSON.stringify(biz_conent);

      params = this.sign(params, false);
      debug('prepay_data is ready: %j', params);

      return Promise.resolve(params);

    case 'alipay_native':

      var params = {
        app_id: config.app_id,
        version: "1.0",
        format: "json",
        method: ALIPAY_SERVICE[datas.type],
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        notify_url: datas.notify_url,
        charset: "UTF-8",
        sign_type: 'RSA'
      };

      var biz_conent = {
        body: datas.detail || "",
        subject: datas.description || "购买商品",
        out_trade_no: datas.trade_id,
        total_amount: datas.amount,
        timeout_express: config.it_b_pay || "1d",
      };

      params.biz_content = JSON.stringify(biz_conent);

      params = this.sign(params, false);
      debug('prepay_data is ready: %j', params);

      var options = {
        method: 'POST',
        uri: "https://openapi.alipay.com/gateway.do",
        form: common.queryize(params)
      }
      
      return request(options).then(
        res=>{
        debug("alipay prepay_data trade , return data ",res)
        var response = JSON.parse(res)
        
        // if (!this.verify_sync(response.alipay_trade_precreate_response,response.sign)){
        //   return Promise.reject('Sign verification failed for alipay notification');
        // }
            
        return Promise.resolve(response);
      })

    default:
      return Promise.reject("类型错误");
  }
}

Alipay.prototype.verifyResponse = function (response) {
  debug('try to verfiy response: %j', response);
  switch (this.type) {
    case "alipay_mp":
      if (!this.verify_async_openapi(response))
        return { result: false, msg: 'Sign verification failed for alipay notification' };
      break;
    default:
      if (!this.verify_async(response))
        return { result: false, msg: 'Sign verification failed for alipay notification' };
      break;
  }
  return this.verify_notify(response.notify_id).then(
    res => {
      if (res != true) {
        return { result: false, msg: 'verify notify id failed' };
      }
      if (response.trade_status == 'TRADE_SUCCESS') {
        return { result: true };
      } else {
        return { result: false, msg: response.trade_status }
      }

    }
  )
}

Alipay.prototype.query = function (data) {
  var params = {
    app_id: this.config.app_id,
    method: "alipay.trade.query",
    format: "json",
    version: "1.0", 
    charset: "UTF-8",
    sign_type: 'RSA',
    timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  var biz_conent = data;

  params.biz_content = JSON.stringify(biz_conent);

  params = this.sign(params, false);
  debug('query data is ready: %j', params);
  
  var options = {
    method: 'POST',
    uri: "https://openapi.alipay.com/gateway.do",
    form: common.queryize(params)
  }
  return request(options).then(
    res=>{
    debug("alipay query trade , return data ",res)
    var response = JSON.parse(res)
    
    if (!this.verify_sync(response.alipay_trade_query_response,response.sign)){
      return Promise.reject('Sign verification failed for alipay notification');
    }
        
    return Promise.resolve(response);
  })
  
}

Alipay.prototype.formatOut = function (err) {
  return err ? err : 'success';
}

module.exports = Alipay;