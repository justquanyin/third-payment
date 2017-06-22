'use strict'
var Common = require("./common"),
    Alipay = require("./lib/alipay"),
    Weixin = require("./lib/weixin"),
    fs = require('fs'),
    path = require('path'),
    debug  = require("debug")("third-payment");


class Lib {

  constructor(config){
    
    if(typeof config === "string"){
      try{
        if(!fs.existsSync(path.join(__dirname , config))){
          throw new Error("配置文件不存在");
        }
        var conf = fs.readFileSync(path.join(__dirname , config)).toString();
        conf = JSON.parse(conf);
        this.conf = conf;
      } catch(e) {
        debug(e);
        throw e;
      }
      
    }
    if(typeof config === "object"){
      this.conf = conf;
    }

    if(!config){
      throw new Error("缺少支付参数配置")
    }


  };
  set conf(value){
    
    var verify = Common.vefiyConf(value)
    
    if(!verify){
      var err = Common.getErr();
      throw new Error(err);
    }
    this._conf =  value;
  };

  get conf(){
    return this._conf;
  }

  getChannel(type,vendor){
    switch(type){
      case "weixin_app" : 
      case "weixin_mp" : 
      case "weixin_native" : 
        var temp = this.conf["weixin"];
        return  new Weixin(temp[vendor]);
        
      case "alipay_app" : 
      case "alipay_mp" : 
      case "alipay_web" :
        var temp = this.conf["alipay"];
        return new Alipay(temp[vendor]);

      default : 
        debug("支付类型错误: type");
        return false;
    }
  }

  getPrePay(datas){
    var Channel = this.getChannel(datas.type,datas.vendor);
    if(!Channel){
      debug("支付类型错误: type");
      return Promise.reject("支付类型错误: type");
    }
    return Channel.create(datas);
  };

  verifyResponse(datas,response,format){
    var Channel = this.getChannel(datas.type,datas.vendor);
    Channel.type = datas.type;
    return Channel.verifyResponse(response,format).then(
      res=>{
        if(res && res.result == true){
          return Channel.formatOut();
        }else{
          debug("verify response fail , ",res);
          return Channel.formatOut(res.msg || "数据校验错误");
        }
      }
    ).catch(err=>{
      debug("verify fail !",err);
      return Channel.formatOut(err);
    });
  }


}
module.exports = Lib;