
> 此模块支持 微信&支付宝 第三方支付相关功能


## 安装

```
$ npm install third-payment
```

## 说明

### 类初始化 : new Payment(params)
* params    配置文件路径 or 配置对象

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
  |type | string | true| weixin_app(微信APP) \| wexin_mp(微信公众号) \| weixin_native(微信扫码) \| weixin_web(h5支付) \| alipay_app(支付宝APP) \| alipay_web(支付宝网页) \| alipay_mp(支付宝移动端) \| alipay_native(支付宝扫码) |
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
      trade_no:"平台交易号",  // 二选一
      out_trade_no:"商户交易号"  // 二选一
    }
  ```

### 退款操作 ： .refund(trade)

* trade    交易号json对象(object)
  ```js 
    { 
      trade_no:"平台交易号",  // 二选一
      out_trade_no:"商户交易号",  // 二选一
      actual_fee : "实际退款金额",
      type:"alipay_app",
      vendor:"app",
      out_request_no : "部分退款唯一ID"  // 可选
    }
  ```


### 支付宝单笔转账 ： .transfer(datas)
* datas      交易详情
  ```js
  {
    out_biz_no : "12233333",   // 商户交易ID
    payee_type : "ALIPAY_USERID",  // 收款方账户类型。可取值： 1、ALIPAY_USERID：支付宝账号对应的支付宝唯一用户号。以2088开头的16位纯数字组成。 2、ALIPAY_LOGONID：支付宝登录号，支持邮箱和手机号格式。
    payee_account : "3333333" , // 收款方账户。与payee_type配合使用。付款方和收款方不能是同一个账户
    amount  : 0.1, //转账金额，单位：元。  只支持2位小数，小数点前最大支持13位，金额必须大于等于0.1元。 最大转账金额以实际签约的限额为准
    payer_show_name  :  "张三",  //  付款方姓名
    remark  :  "备注" // 备注
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
 * @param trade   object     交易ID   示例:{type:"weixin",vendor:"app",trade_id:"23232",actual_fee:10,"out_request_no":"213121"} 
 * @param format    默认 json
 */
obj.refund(trade).then(
  res=>console.log(res)
 );

/**
 * 转账（仅限支付宝）
 *
 * @param datas   object     
 * @param format    默认 json
 */
obj.transfer(datas).then(
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