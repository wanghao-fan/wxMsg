'use strict';
const Subscription = require('egg').Subscription;

class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      cron: '0 30 7 * * *', // 每天的7点30分0秒执行
      // interval: '1m', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx } = this;
    const result = await ctx.service.sendmsg.send();
    // const result = cndate.solar2lunar(2021, 9, 22);
    ctx.logger.info('定时任务执行消息提醒 结果: %j', result);
  }
}

module.exports = UpdateCache;
