
> 此模块支持 微信&支付宝 第三方支付相关功能

## 安装

```
$ npm install third-payment
```

## 说明

### 类初始化 : new Payment(params)
* params    配置文件or配置对象

### 获取预支付数据 ： .getPrePay(data)
* data      交易详情
  ```js
  {
    type : "weixin_mp",
    vendor : "official_account_1",
    description : "test",
    detail : "12222",
    trade_id : "adfasdfasdf1242e",
    amount : 100,
    notify_url : "https://callback.server.com/handle",   // 第三方支付回调通知地址
    ip : "127.0.0.1",
    openid : "oCLqdwT0fRFKcqKfmIezYOqpEHbk"           // openid （微信公众号支付获取）
  }

  ```
* 参数说明

  | 参数 | 类型 | 是否必填 | 备注 |
  | --- |:--:| -----:| -----:|
  |type | string | true| weixin_app(微信APP) \| wexin_mp(微信公众号) \| weixin_native(微信扫码) \| weixin_web(h5支付) \| aliapy_app(支付宝APP) \| alipay_web(支付宝网页) \| alipay_mp(支付宝移动端) \| aliapy_native(支付宝扫码) |
  |vendor|string|false|公众号标识(对应微信配置内)|
  |trade_id|string|true|商户订单号| 
  |description|string|true|商品描述| 
  |amount|string|true|金额(元)| 
  |notify_url|string|true|异步通知路径| 
  |detail|string|false|商品详情| 
  |ip|string|false|ip地址| 
  |openid|string|false|公众号获取的openid| 
  |scene_info|string \| object |false|场景信息({"h5_info": //h5支付固定传"h5_info" {"type": "",  //场景类型 "wap_url": "",//WAP网站URL地址 "wap_name": ""  //WAP 网站名} })| 

### 校验第三方回调数据 ： .verifyResponse(datas,response,format)
* data      交易详情
  ```js
  {
    type : "weixin_mp",
    vendor : "official_account_1",
  }
  ```
* response      第三方回调数据 request body
* format    可空  (微信request body 需要传 xml)

### 查询交易状态 ： .queryTrade(datas,trade)
* datas      交易详情
  ```js
  {
    type : "weixin_mp",
    vendor : "official_account_1",
  }
  ```
* trade    交易号json对象(object)
  ```js 
    { 
      trade_no:"平台交易号",
      out_trade_no:"商户交易号"
    }
  ```

## 使用方式

```js

var Lib = require('./index');
var obj = new Lib("./params.json");

// 获取 prepaydata 给 客户端
obj.getPrePay({
  type : "weixin_mp",
  vendor : "official_account_1",
  description : "test",
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

/**
 *第三方服务器回调验证
 *
 * @param datas {type:"alipay",vendor:"app"}
 * @param response  请求body
 * @param format    默认 json
 */
obj.verifyResponse(datas,response,format).then(
   rs => {console.log(rs)},
   er => {console.log(er)}
 )

/**
 * 查询
 *
 * @param datas {type:"alipay",vendor:"app"}
 * @param trade   object     交易ID   示例:{trade_no:"23232",out_trade_no:"1222"}   trade_no 与 out_trade_no 二选一
 * @param format    默认 json
 */
obj.queryTrade(data,trade).then(
  res=>console.log(res)
 );


/**
 * 退款
 *
 * @param trade   object     交易ID   示例:{type:"weixin",vendor:"app",trade_id:"23232",refund_id:"12333"} 
 * @param format    默认 json
 */
obj.refund(trade).then(
  res=>console.log(res)
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
      "it_b_pay": "",  // 支付过期时间
      "client_key" : "" ,   // 微信双向加密密码
      "client_cert" : ""   // 微信双向加密密码
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


## 备注

* 功能持续完善中.....
* 如有需要功能请发送邮件to ```898617222@163.com``` 或者 请在 github 上 open issue  