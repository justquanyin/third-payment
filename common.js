var _ = require("underscore");

var common = {
  err : ""
};

common.getErr = function(){
  return this.err;
}

common.setErr = function(err){
  this.err = err;
}

common.vefiyConf = function(config){
  
  if(config.weixin){
    for(var key in config.weixin){
      var weixin = config.weixin[key];
      
      if(!weixin.appid){
        this.setErr("微信: appid 配置错误");
        return false;
      }
      if(!weixin.mch_id){
        this.setErr("微信: 商户号 配置错误");
        return false;
      }
      if(!weixin.key){
        this.setErr("微信: 加密串 配置错误");
        return false;
      }
    }
  }

  if(config.alipay){
    
    for(var key in config.alipay){
      var alipay = config.alipay[key];
      if(!alipay.seller_id){
        this.setErr("支付宝: seller_id 配置错误");
        return false;
      }
      if(!alipay.partner){
        this.setErr("支付宝: partner 配置错误");
        return false;
      }
      if(!alipay.app_id){
        this.setErr("支付宝: app_id 配置错误");
        return false;
      }
    } 
  }
  
  return true;
  
}

common.queryize = function(params, quoted) {
  if (!params) {
    return null;
  }
  return Object.keys(params).sort().map(function(k) {
    return k + '=' + (quoted ? ('"' + params[k] + '"') : params[k]);
  }).join('&');
}

module.exports = common;