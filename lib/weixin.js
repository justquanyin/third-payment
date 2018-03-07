'use strict'
var request = require('request-promise'),
  moment = require('moment'),
  md5 = require('md5'),
  xml = require('xml2js'),
  _ = require('underscore'),
  rand = require('random-gen'),
  debug = require('debug')('third-payment'),
  common = require('../common');

var xmlBuilder = new xml.Builder({
  headless: true,
  rootName: 'xml'
});
var xmlParser = new xml.Parser({
  explicitArray: false
});

function sign(params, key) {
  var temp = common.queryize(params, false) + '&key=' + key;
  return md5(temp).toUpperCase();
}

function isValidSignParam(value, key) {
  return (value && (key !== 'sign'));
}

class Weixin {
  constructor(params){
    if(params){
      this.config = params;
    }else{
      throw new Error("缺少配置参数");
    }
    
  }
  
}

Weixin.prototype.verify = function(params){
  debug('to verify %j with key %s', params, this.config.key);
  var config = this.config;
  var sig = params.sign;
  if (!sig) {
    return {result:false,msg:"verify sig failed"};
  }
  var temp = common.queryize(_.pick(params, isValidSignParam), false) + '&key=' + config.key;

  if( (md5(temp).toUpperCase() === sig ) != true ){
    return {result:false,msg:"verify weixin params"}
  };
  if (params.return_code !== 'SUCCESS') {
    return {result:false,msg:'Unified order failed : ' + params.return_msg};
  }
  if (params.result_code != 'SUCCESS') {
    return {result:false,msg:'Unified order failed: [' + params.err_code + '] : ' + params.err_code_des};
  }
  if (params.appid !== config.appid) {
    return {result:false,msg:'Unified order not matched on appid: ' + params.appid + ' ; ' + config.appid};
  }
  if (params.mch_id !== config.mch_id) {
    return {result:false,msg:'Unified order not matched on mch_id: ' + params.mch_id + ' ; ' + config.mch_id};
  }
  return {result:true};
}

Weixin.prototype.verifyResponse = function(response,format){
  var _this = this;
  if(format == "xml"){ 
    return xmlToJson(response).then(
      res =>{
        return Promise.resolve(_this.verify(res));
      }
    );
  }else{
    return Promise.resolve(_this.verify(response));
  }
}

Weixin.prototype.query = function(data){
  
  if(data.trade_no){
    data.transaction_id = data.trade_no;
    delete data.trade_no;
  }
  var config = this.config;
  var params = {
    appid: config.appid,
    mch_id: config.mch_id,
    nonce_str: rand.alphaNum(10),
  };
  params = _.extend(params,data);
  params.sign = sign(params, config.key);
  var data = xmlBuilder.buildObject(params);

  debug('data to be sent to weixin: %s', data);
  var option = {
    method: 'POST',
    uri: 'https://api.mch.weixin.qq.com/pay/orderquery',
    body: data
  }
  var _this = this;
  return request(option)
    .then(function(res) {
        return xmlToJson(res);
    }).then(function(wx_resp) {
        debug('data received from weixin: %j', wx_resp);
         var verify_code = _this.verify(wx_resp);
        if(!verify_code || verify_code.result != true){
          return Promise.reject(verify_code.msg || "微信支付服务器错误");
        }
        return Promise.resolve(wx_resp);

    });


}

Weixin.prototype.create = function(datas){
  
  var config = this.config;
  var now = moment(),
    span = config.it_b_pay || "1d",
    expire = moment().add(span.slice(0, -1), span[span.length - 1]);


  var params = {
    appid: config.appid,
    mch_id: config.mch_id,
    nonce_str: rand.alphaNum(10),
    body: datas.description ,
    detail: datas.detail || "",
    out_trade_no: datas.trade_id,
    fee_type : "CNY",
    total_fee: Math.round(datas.amount * 100), 
    time_start: now.format('YYYYMMDDHHmmss'),
    time_expire: expire.format('YYYYMMDDHHmmss'),
    notify_url : datas.notify_url,
    spbill_create_ip : datas.ip
  };

  switch(datas.type){
    case "weixin_app" : 
      params.trade_type = "APP";
      break;
    case "weixin_mp" : 
      params.trade_type = "JSAPI";
      if(!datas.openid){
        return Promise.reject("缺少openid");
      }
      params.openid = datas.openid;
      break;
    case "weixin_native" : 
      params.trade_type = "NATIVE";
      if(!datas.product_id){
        return Promise.reject("缺少product_id");
      }
      params.product_id = datas.product_id
      break;
    case "weixin_web" :
      
      params.trade_type = "MWEB";
      if(!datas.openid){
        return Promise.reject("缺少openid");
      }
      params.openid = datas.openid
      if(!datas.scene_info){
        return Promise.reject("缺少scene_info");
      }
      if(typeof datas.scene_info == "object"){
        params.scene_info = JSON.stringify(datas.scene_info);
      }else{
        params.scene_info = datas.scene_info;
      }   
      break;
      
  }

  
  params.sign = sign(params, config.key);
  var data = xmlBuilder.buildObject(params);
  debug('data to be sent to weixin: %s', data);
  var option = {
    method: 'POST',
    uri: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    body: data
  }
  var _this = this;
  return request(option)
    .then(function(res) {
        
        return xmlToJson(res);
    }).then(function(wx_resp) {
        debug('data received from weixin: %j', wx_resp);
         var verify_code = _this.verify(wx_resp);
        if(!verify_code || verify_code.result != true){
          return Promise.reject(verify_code.msg || "微信支付服务器错误");
        }

        var prepaydata ;
        var timestamp = parseInt(new Date().getTime() / 1000);
        switch (wx_resp.trade_type){
          case 'APP' :
            prepaydata = {
              appid: wx_resp.appid,
              partnerid: wx_resp.mch_id,
              prepayid: wx_resp.prepay_id,
              package: 'Sign=WXPay',
              noncestr: rand.alphaNum(10),
              timestamp: timestamp
            };
            break;
          case "JSAPI" :
            prepaydata = {
              appId: wx_resp.appid,
              timeStamp: timestamp,
              nonceStr: rand.alphaNum(10),
              package: 'prepay_id=' + wx_resp.prepay_id,
              signType: 'MD5'
            }
            break;
          case "NATIVE" :
            prepaydata = {
              appid: wx_resp.appid,
              mch_id: wx_resp.mch_id,
              nonce_str: rand.alphaNum(10),
              prepay_id: wx_resp.prepay_id,
              code_url : wx_resp.code_url
            }
            break;
          default:
            prepaydata = null;
            break;

        }
        
        return Promise.resolve(prepaydata);

    });
 
}


Weixin.prototype.refund = function(data){

  var config = this.config;

  var params = {
    appid: config.appid,
    mch_id: config.mch_id,
    nonce_str: rand.alphaNum(10),
    out_trade_no : data.trade_id,
    out_refund_no : data.refund_id,
    total_fee : data.amount * 100 ,
    refund_fee : data.actual_fee * 100
  };
  params.sign = sign(params, config.key);
  var data = xmlBuilder.buildObject(params);

  debug('data to be sent to weixin: %s', data);
  var options = {
    url: "https://api.mch.weixin.qq.com/secapi/pay/refund",
    body: data,
    key: config.client_key,
    cert: config.client_cert,
    timeout: 3000,
  };
  var _this = this;
  return request(option)
    .then(function(res) {
        return xmlToJson(res);
    }).then(function(wx_resp) {
        debug('data received from weixin: %j', wx_resp);
         var verify_code = _this.verify(wx_resp);
        if(!verify_code || verify_code.result != true){
          return Promise.reject(verify_code.msg || "微信支付服务器错误");
        }
        return Promise.resolve(wx_resp);

    });


}


Weixin.prototype.formatOut = function(err){
  return err ? xmlBuilder.buildObject({
          return_code: 'FAIL',
          return_msg: err.toString()
        }) : xmlBuilder.buildObject({
          return_code: 'SUCCESS',
          return_msg: 'OK'
        }) ;
}

function xmlToJson (data) {
  return new Promise(function(resolve, reject){
    xmlParser.parseString(data, function (err, result) {
      if (err) {
        debug('xml parser wx_resp err : %j', err);
        resolve(false);
      }
      var wx_resp = result.xml;
      resolve(wx_resp);
    });
  });
}

module.exports = Weixin ;