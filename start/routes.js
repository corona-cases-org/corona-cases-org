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

Route.on('/').render('welcome')
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
Route.get('/charts', 'ChartController.index')
Route.get('/charts/:region', 'ChartController.region')
