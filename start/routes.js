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

let redirects = require('../redirects')

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', 'HomeController.home')
Route.get('/charts/:location', ({ params, response }) => {
  response.redirect('/' + params.location, false, 301)
})

// Development helpers
if (use('Env').get('NODE_ENV') === 'development') {
  Route.group(() => {
    Route.get('*', ({ request, params, response }) => {
      let path = params[0];
      response.redirect(`http://${request.hostname()}:4200/${params[0]}`)
    })
  }).prefix('assets')
}

for (let [src, dest] of redirects) {
  if (dest != null) {
    Route.get(src, ({ request, response }) => {
      response.redirect(dest, false, 301)
    })
  }
}

Route.get('/li/:p1.json', 'ChartController.json')
Route.get('/li/:p1/:p2.json', 'ChartController.json')
Route.get('/li/:p1/:p2/:p3.json', 'ChartController.json')
Route.get('/li/:p1/:p2/:p3/:p4.json', 'ChartController.json')
Route.get('/:p1.json', 'ChartController.json')
Route.get('/:p1/:p2.json', 'ChartController.json')
Route.get('/:p1/:p2/:p3.json', 'ChartController.json')
Route.get('/:p1/:p2/:p3/:p4.json', 'ChartController.json')

Route.get('/li', 'HomeController.li')

Route.get('/li/:p1', 'ChartController.li')
Route.get('/li/:p1/:p2', 'ChartController.li')
Route.get('/li/:p1/:p2/:p3', 'ChartController.li')
Route.get('/li/:p1/:p2/:p3/:p4', 'ChartController.li')

Route.get('/:p1', 'ChartController.region')
Route.get('/:p1/:p2', 'ChartController.region')
Route.get('/:p1/:p2/:p3', 'ChartController.region')
Route.get('/:p1/:p2/:p3/:p4', 'ChartController.region')
