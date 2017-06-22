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
