'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', 'HomeController.home')
Route.get('/charts/:region', ({ params, response }) => {
  response.redirect('/' + params.region)
})

// Development helpers
Route.get('/data', async ({ response }) => {
  response.send(require('../data.json'))
})
Route.get('/static_data', async ({ response }) => {
  let staticData = require('../static_data.js')
  response.send({
    errors: staticData.errors,
    regions: [...staticData.regions] // convert Map to JSONifiable array
  })
})
if (use('Env').get('NODE_ENV') === 'development') {
  Route.group(() => {
    Route.get('*', ({ params, response }) => {
      let path = params[0];
      response.redirect('http://localhost:4200/' + params[0])
    })
  }).prefix('assets')
}

Route.get('/:region', 'ChartController.region')
