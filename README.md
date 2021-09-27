## 环境准备
操作系统：支持 macOS，Linux，Windows

运行环境：建议选择 node LTS 版本，最低要求 8.x。
## 运行

### 本地开发

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### 部署生产

```bash
$ npm start
$ npm stop
```
### 定时任务和主动触发

#### 定时任务

[配置规则 请参考文档](https://eggjs.org/zh-cn/basics/schedule.html#定时方式)

```
└── app
     └── schedule
          └── update_cache.js

{
  cron: '0 30 7 * * *', // 每天的7点30分0秒执行
  // interval: '1m', // 1 分钟间隔
  type: 'all', // 指定所有的 worker 都需要执行
}
```

#### 主动发送

![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ea318a4a6954c2ab76d58755be4b034~tplv-k3u1fbpfcp-watermark.image)

请求或浏览器访问 http://localhost:7001/send

## 配置文件说明

### 天气秘钥
[注册地址]( https://www.tianqiapi.com/) 
```
// 天气接口配置
config.weather = {
  appid: '*******',
  appsecret: '*******',
};
```
### 微信公众号 配置
因个人只能申请订阅号，而订阅号不支持发送模板消息，所以在此使用的测试的微信公众号，有微信号都可以申请，免注册，扫码登录

无需公众帐号、快速申请接口测试号

直接体验和测试公众平台所有高级接口

[申请地址](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)

```
// 测试 微信公众号
config.weChat = {
  appld: '**********',
  secret: '**********',
  // 用户的openid
  users: [
    '**********************',
    '**********************',
    '**********************',
    '**********************'
  ],
  daily: '************', // 普通模板
  marry: ''************',', // 结婚纪念日模板
  wageDay: ''************',', // 工资日模板
  birthday: ''************',', // 生日模板
};
```
### 特殊 时间点设置
下方是 birthday生日，因老家都是过阴历生日，不好处理，暂时写死的
```
// 时间
config.time = {
  wageDay: 15, // 工资日
  love: '2017-06-09', // 相爱日期
  marry: '2021-11-27', // 结婚纪念日
  birthday: {
    2021: '2021-04-17',
    2022: '2022-04-06',
    2023: '2023-04-25',
    2024: '2024-04-14',
    2025: '2025-04-03',
    2026: '2026-04-22',
  }, // 每年生日 阳历
  birthYear: '1995-03-06',
};
```
### 微信消息模板

这个需要在 上文提到的 微信公众平台测试账号 单独设置

以下是 我用的模板

#### 正常模板

```
{{dateTime.DATA}}
今天是 我们相恋的第{{love.DATA}}天 
距离上交工资还有{{wage.DATA}}天 
距离你的生日还有{{birthday.DATA}}天 
距离我们结婚纪念日还有{{marry.DATA}}天 
今日天气 {{wea.DATA}} 
当前温度 {{tem.DATA}}度 
最高温度 {{tem1.DATA}}度 
最低温度 {{tem2.DATA}}度 
空气质量 {{airLevel.DATA}} 
风向 {{win.DATA}} 
每日一句 
{{message.DATA}}
```
#### 发工资模板


```
{{dateTime.DATA}}
老婆大人，今天要发工资了，预计晚九点前会准时上交，记得查收呦！
```
#### 生日 模板

```   
{{dateTime.DATA}}
听说今天是你人生当中第 {{individual.DATA}} 个生日？天呐，我差点忘记！因为岁月没有在你脸上留下任何痕迹。尽管，日历告诉我：你又涨了一岁，但你还是那个天真可爱的小妖女，生日快乐!
```  
#### 结婚纪念日
* 结婚纪念日
```
{{dateTime.DATA}}
今天是结婚{{anniversary.DATA}}周年纪念日,在一起{{year.DATA}}年了,经历了风风雨雨,最终依然走在一起,很幸运,很幸福!我们的小家庭要一直幸福下去。
```





