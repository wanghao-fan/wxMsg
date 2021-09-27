'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // 发送提醒
  router.get('/send', controller.home.send);
};
