
> 此模块支持 微信&支付宝 第三方支付相关功能

## 安装

```
$ npm install third-payment
```

## 使用方式

```js

var Lib = require('./index');
var obj = new Lib("./params.json");
obj.getPrePay({
  type : "weixin_mp",
  vendor : "official_account_1",
  body : "test",
  detail : "12222",
  trade_id : "adfasdfasdf1242e",
  amount : 100,
  notify_url : "https://callback.server.com/handle",   // 第三方支付回调通知地址
  ip : "127.0.0.1",
  openid : "oCLqdwT0fRFKcqKfmIezYOqpEHbk"           // openid （微信公众号支付获取）
}).then(
  res => console.log(res),
  err => console.log(err)
);

```

## 配置文件

```json
{
  "weixin": {
    "app": { // APP
      "appid": "",
      "mch_id": "",
      "key": "",
      "it_b_pay": ""  // 支付过期时间
    },
    "official_account_1": { // 公众号
      "appid": "",
      "appsecret": "",
      "mch_id": "",
      "key": "",
      "it_b_pay": ""  // 支付过期时间
    }
  },
  "alipay": {
    "app": {
      "partner": "",
      "app_id": "",
      "seller_id": "",
      "it_b_pay": "",  // 支付过期时间
      "public_key": "", // 公钥
      "private_key": "",   // 私钥
      "openali_public_key": ""  // openapi 公钥
    }
  }
}

```