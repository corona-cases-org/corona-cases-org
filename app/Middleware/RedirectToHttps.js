'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class RedirectToHttps {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response }, next) {
    if (use('Env').get('NODE_ENV') === 'production' && request.protocol() === 'http') {
      response.redirect('https://' + request.hostname() + request.url())
    } else {
      await next()
    }
  }
}

module.exports = RedirectToHttps
