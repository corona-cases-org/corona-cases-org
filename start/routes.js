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
Route.get('/charts/:location', ({ params, response }) => {
  response.redirect('/' + params.location)
})

// Development helpers
if (use('Env').get('NODE_ENV') === 'development') {
  Route.group(() => {
    Route.get('*', ({ params, response }) => {
      let path = params[0];
      response.redirect('http://localhost:4200/' + params[0])
    })
  }).prefix('assets')
}

Route.get('/:p1', 'ChartController.region')
Route.get('/:p1/:p2', 'ChartController.region')
Route.get('/:p1/:p2/:p3', 'ChartController.region')
Route.get('/:p1/:p2/:p3/:p4', 'ChartController.region')
