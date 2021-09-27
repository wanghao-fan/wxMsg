'use strict';
const Service = require('egg').Service;
const moment = require('moment');
class sendmsg extends Service {
  // 发送模板消息给媳妇儿
  async send() {
    const { ctx, app } = this;
    const token = await this.getToken();
    const data = await this.getTemplateData();
    ctx.logger.info('获取token 结果: %j', token);
    // 模板消息接口文档
    const users = app.config.weChat.users;
    const promise = users.map(id => {
      ctx.logger.info('--------------开始发送每日提醒-----------------------------------------------: %j', id);
      data.touser = id;
      return this.toWechart(token, data);
    });
    const results = await Promise.all(promise);
    ctx.logger.info('--------------结束发送每日提醒->结果-----------------------------------------------: %j', results);
    return results;
  }
  // 通知微信接口
  async toWechart(token, data) {
    // 模板消息接口文档
    const url = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token;
    const result = await this.ctx.curl(url, {
      method: 'POST',
      data,
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return result;
  }
  // 获取token
  async getToken() {
    const { app } = this;
    const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + app.config.weChat.appld + '&secret=' + app.config.weChat.secret;
    const result = await this.ctx.curl(url, {
      method: 'get',
      dataType: 'json',
    });
    if (result.status === 200) {
      return result.data.access_token;
    }
  }
  // 组装模板消息数据
  async getTemplateData() {
    const { app } = this;
    // 判断所需 模板
    // 发工资模板 getWageDay == 0       wageDay
    // 结婚纪念日模板 getMarryDay == 0  marry
    // 生日 模板 getbirthday == 0       birthday
    // 正常模板                         daily

    const wageDay = this.getWageDay();
    const marry = this.getMarryDay();
    const birthday = this.getbirthday();
    const data = {
      topcolor: '#FF0000',
      data: {},
    };
    // 发工资模板
    if (!wageDay) {
      data.template_id = app.config.weChat.wageDay;
      data.data = {
        dateTime: {
          value: this.getDatetime(),
          color: '#cc33cc',
        },
      };
    } else if (!marry) {
      // 结婚纪念日模板
      data.template_id = app.config.weChat.marry;
      data.data = {
        dateTime: {
          value: this.getDatetime(),
          color: '#cc33cc',
        },
        anniversary: {
          value: this.getMarryYear(),
          color: '#ff3399',
        },
        year: {
          value: this.getLoveYear(),
          color: '#ff3399',
        },
      };
    } else if (!birthday) {
      // 生日模板
      data.template_id = app.config.weChat.birthday;
      data.data = {
        dateTime: {
          value: this.getDatetime(),
          color: '#cc33cc',
        },
        individual: {
          value: this.getBirthYear(),
          color: '#ff3399',
        },
      };
    } else {
      // 正常模板
      data.template_id = app.config.weChat.daily;
      // 获取天气
      const getWeather = await this.getWeather();
      // 获取每日一句
      const message = await this.getOneSentence();
      data.data = {
        dateTime: {
          value: this.getDatetime(),
          color: '#cc33cc',
        },
        love: {
          value: this.getLoveDay(),
          color: '#ff3399',
        },
        wage: {
          value: wageDay,
          color: '#66ff00',
        },
        birthday: {
          value: birthday,
          color: '#ff0033',
        },
        marry: {
          value: marry,
          color: '#ff0033',
        },
        wea: {
          value: getWeather.wea,
          color: '#33ff33',
        },
        tem: {
          value: getWeather.tem,
          color: '#0066ff',
        },
        airLevel: {
          value: getWeather.air_level,
          color: '#ff0033',
        },
        tem1: {
          value: getWeather.tem1,
          color: '#ff0000',
        },
        tem2: {
          value: getWeather.tem2,
          color: '#33ff33',
        },
        win: {
          value: getWeather.win,
          color: '#3399ff',
        },
        message: {
          value: message,
          color: '#8C8C8C',
        },
      };
    }
    return data;
  }
  // 获取天气
  async getWeather(city = '深泽') {
    const { app } = this;
    const url = 'https://www.tianqiapi.com/api?unescape=1&version=v6&appid=' + app.config.weather.appid + '&appsecret=' + app.config.weather.appsecret + '&city=' + city;
    const result = await this.ctx.curl(url, {
      method: 'get',
      dataType: 'json',
    });
    console.log(result.status);
    // "wea": "多云",
    // "tem": "27", 实时温度
    // "tem1": "27", 高温
    // "tem2": "17", 低温
    // "win": "西风",
    // "air_level": "优",
    if (result && result.status === 200) {
      return result.data;
    }
    return {
      city,
      wea: '未知',
      tem: '未知',
      tem1: '未知',
      tem2: '未知',
      win: '未知',
      win_speed: '未知',
      air_level: '未知',
    };
  }
  // 获取 下次发工资 还有多少天
  getWageDay() {
    const { app } = this;
    const wage = app.config.time.wageDay;
    // 获取日期 day
    // 如果在 wage号之前或等于wage时 那么就用 wage-day
    // 如果在 wage号之后 那么就用 wage +（当前月总天数-day）
    // 当日 日期day
    const day = moment().date();
    // 当月总天数
    const nowDayTotal = moment().daysInMonth();
    // // 下个月总天数
    // const nextDayTotal = moment().month(moment().month() + 1).daysInMonth();
    let resultDay = 0;
    if (day <= wage) {
      resultDay = wage - day;
    } else {
      resultDay = wage + (nowDayTotal - day);
    }
    return resultDay;
  }
  // 获取距离 下次结婚纪念日还有多少天
  getMarryDay() {
    const { app } = this;
    const marry = app.config.time.marry;
    // 获取当前时间戳
    const now = moment(moment().format('YYYY-MM-DD')).valueOf();
    // 获取纪念日 月-日
    const mmdd = moment(marry).format('-MM-DD');
    // 获取当年
    const y = moment().year();
    // 获取今年结婚纪念日时间戳
    const nowTimeNumber = moment(y + mmdd).valueOf();
    // 判断 今天的结婚纪念日 有没有过，如果已经过去（now>nowTimeNumber），resultMarry日期为明年的结婚纪念日
    // 如果还没到，则 结束日期为今年的结婚纪念日
    let resultMarry = nowTimeNumber;
    if (now > nowTimeNumber) {
      // 获取明年纪念日
      resultMarry = moment((y + 1) + mmdd).valueOf();
    }
    return moment(moment(resultMarry).format()).diff(moment(now).format(), 'day');
  }
  // 获取 距离 下次生日还有多少天
  getbirthday() {
    const { app } = this;
    const birthday = app.config.time.birthday[moment().year()];
    // 获取当前时间戳
    const now = moment(moment().format('YYYY-MM-DD')).valueOf();
    // 获取纪念日 月-日
    const mmdd = moment(birthday).format('-MM-DD');
    // 获取当年
    const y = moment().year();
    // 获取今年生日 时间戳
    const nowTimeNumber = moment(y + mmdd).valueOf();
    // 判断 生日 有没有过，如果已经过去（now>nowTimeNumber），resultBirthday日期为明年的生日 日期
    // 如果还没到，则 结束日期为今年的目标日期
    let resultBirthday = nowTimeNumber;
    if (now > nowTimeNumber) {
      // 获取明年目标日期
      resultBirthday = moment(app.config.time.birthday[y + 1]).valueOf();
    }
    return moment(moment(resultBirthday).format()).diff(moment(now).format(), 'day');
  }
  // 获取 相恋天数
  getLoveDay() {
    const { app } = this;
    const loveDay = app.config.time.love;
    return moment(moment().format('YYYY-MM-DD')).diff(loveDay, 'day');
  }
  // 获取 相恋几年了
  getLoveYear() {
    const { app } = this;
    const loveDay = app.config.time.love;
    return moment().year() - moment(loveDay).year();
  }
  // 获取是第几个生日
  getBirthYear() {
    const { app } = this;
    const birthYear = app.config.time.birthYear;
    return moment().year() - birthYear;
  }
  // 获取是第几个结婚纪念日
  getMarryYear() {
    const { app } = this;
    const marry = app.config.time.marry;
    return moment().year() - moment(marry).year();
  }
  // 获取 每日一句
  async getOneSentence() {
    const url = 'https://v1.hitokoto.cn/';
    const result = await this.ctx.curl(url, {
      method: 'get',
      dataType: 'json',
    });
    if (result && result.status === 200) {
      return result.data.hitokoto;
    }
    return '今日只有我爱你！';
  }
  // 获取时间日期
  getDatetime() {
    console.log('moment().weekday()', moment().weekday());
    const week = {
      1: '星期一',
      2: '星期二',
      3: '星期三',
      4: '星期四',
      5: '星期五',
      6: '星期六',
      0: '星期日',
    };
    return moment().format('YYYY年MM月DD日 ') + week[moment().weekday()];
  }

}
module.exports = sendmsg;
