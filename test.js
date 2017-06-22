var Lib = require('./index');
var obj = new Lib("./params.json.tepm");

obj.getPrePay({
  type : "weixin_mp",
  vendor : "official_account_1",
  body : "test",
  detail : "12222",
  trade_id : "adfasdfasdf1242e2323",
  amount : 100,
  notify_url : "https://pay.qingting.fm/asdf",
  ip : "127.1.1.1",
  openid : "oCLqdwT0fRFKcqKfmIezYOqpEHbk"
}).then(
  res =>console.log(res),
  err =>console.log(err)
);



// obj.verifyResponse({type:"alipay_app",vendor:"app"},{"sign":"kmTOQZg2RURTGQ0DgY+63H6oToCPrLP8oBJoIBVdWIrVaJMvEPaxZYfEmaJjE7cWIQEPC8PA69qBvjwsmVCkHaCAbA8mcKanWcNp5gIoOESEu+nKQAfJDpGI8L+ZDCvkfyyx3a1cmqMA/+t+OVYcuDKlF0iHPSmUKWXS0GM8rCg=","sign_type":"RSA","use_coupon":"N","notify_id":"301ccc1e8ea8897d43077ada0aff016g8e","buyer_id":"2088422520119031","price":"10.00","seller_email":"liuying@qingtingfm.com","gmt_payment":"2017-06-21 18:45:37","total_fee":"10.00","is_total_fee_adjust":"N","trade_status":"TRADE_SUCCESS","body":"2f102db4439b3c9f412b8077ea65e05b_1c2201gg20170621184529149175f82f","notify_time":"2017-06-21 18:45:37","seller_id":"2088801780934505","out_trade_no":"1c2201gg20170621184529149175f82f","quantity":"1","notify_type":"trade_status_sync","gmt_create":"2017-06-21 18:45:37","buyer_email":"18251528994","subject":"黄金瞳","trade_no":"2017062121001004030281612890","payment_type":"1","discount":"0.00"}).then(
//   rs=> {console.log(rs)},
//   er =>{console.log(er)}
// )

// obj.queryTrade({type:"weixin_app",vendor:"app"},{transaction_id:"4003782001201706226868429602"}).then(
//   res=>console.log(res)
// );

// obj.queryTrade({type:"alipay_app",vendor:"app"},{out_trade_no:"1caf0u9j2017062212054465b9a9cb64"}).then(
//   res=>console.log(res)
// );
