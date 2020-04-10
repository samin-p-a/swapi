const Koa = require('koa')
const json = require('koa-json')
const { print, chalk: { yellow } } = require('@ianwalter/print')
const Router = require('@ianwalter/router')
const pkg = require('./package.json')

// Import the JSON data copied from http://github.com/phalt/swapi.
const people = require('./data/people.json')
const planets = require('./data/planets.json')
const starships = require('./data/transport.json')

// Create the Koa app instance.
const app = new Koa()

// Add error-handling middleware.
app.use(async function errorHandlingMiddleware (ctx, next) {
  try {
    await next()
  } catch (err) {
    print.error(err)
    ctx.status = err.statusCode || err.status || 500
  }
})

// Use middleware that automatically pretty-prints JSON responses.
app.use(json())

// Add the Access-Control-Allow-Origin header that accepts all requests to the
// response.
app.use(async function disableCorsMiddleware (ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*')
  return next()
})

// Create the router instance.
//const specifiedPort = process.env.SWAPI_PORT
//захардкодим левый порт
const specifiedPort = 2000
const router = new Router(`http://localhost:${specifiedPort || 3000}`)

// Add a root route that provides information about the service.
router.add('/', ctx => {
  ctx.body = {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version
  }
})

// Add a route handler that returns 10 people per page.
router.add('/api/people/', (ctx, data) => {
  //возвращаем всех людей
  const { url } = data;
  console.log('/api/people/')
  const page = url.searchParams.get('page') || 1
  ctx.body = {
    count: people.length,
    results: people.slice((page - 1) * 10, page * 10).map((p,i) => {
      return ({ ...p.fields, url:`https://swapi.co/api/people/${i+1}/`})
    })
  }
})
router.add('/api/people/:pid/', (ctx, data) => {
  //возвращаем одного человека
  console.log('/api/people/:pid/')
  const id= data.route.params.pid;
  ctx.body = {
     ...people[id-1].fields,
     url:`https://swapi.co/api/people/${id}/`
  }
})


// Add a route handler that returns 10 people per page.
router.add('/api/planets/', (ctx, data) => {
  //возвращаем все планеты
  const { url } = data;
  console.log('/api/planets/')
  const page = url.searchParams.get('page') || 1
  ctx.body = {
    count: people.length,
    results: planets.slice((page - 1) * 10, page * 10).map((p,i) => {
      return ({ ...p.fields, url:`https://swapi.co/api/planets/${i+1}/`})
    })
  }
})
router.add('/api/planets/:pid/', (ctx, data) => {
  //возвращаем одну планету
  console.log('/api/planets/:pid/')
  const id= data.route.params.pid;
  ctx.body = {
     ...planets[id-1].fields,
     url:`https://swapi.co/api/planets/${id}/`
  }
})


// Add a route handler that returns 10 people per page.
router.add('/api/starships/', (ctx, data) => {
  //возвращаем все корабли
  const { url } = data;
  console.log('/api/starships/')
  const page = url.searchParams.get('page') || 1
  ctx.body = {
    count: people.length,
    results: starships.slice((page - 1) * 10, page * 10).map((p,i) => {
      return ({ ...p.fields, url:`https://swapi.co/api/starships/${i+1}/`})
    })
  }
})
router.add('/api/starships/:pid/', (ctx, data) => {
  //возвращаем однин корабль
  console.log('/api/starships/:pid/')
  const id= data.route.params.pid;
  ctx.body = {
     ...starships[id-1].fields,
     url:`https://swapi.co/api/starships/${id}/`
  }
})


// Add a 404 Not Found handler that is executed when no routes match.
function notFoundHandler (ctx) {
  ctx.status = 404
}

// Handle the request by allowing the router to route it to a handler.
app.use(ctx => router.match(ctx, notFoundHandler))

// Start listening on the specified (or randomized) port.
const server = app.listen(specifiedPort)
const { port } = server.address()
print.log('!!!', yellow(`Let the force be with you: http://localhost:${port}`))

module.exports = server
