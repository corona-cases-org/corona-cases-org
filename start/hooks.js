const { hooks } = require('@adonisjs/ignitor')

hooks.after.providersRegistered(() => {
    const View = use('View')

    View.global('NODE_ENV', use('Env').get('NODE_ENV'))
})
