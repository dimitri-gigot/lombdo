const mongoose = require('mongoose')
mongoose.Promise = global.Promise

let cachedDb = null;
module.exports = (DB_STRING) => (lombdo) => (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    connectToDatabase(DB_STRING).then(() => {
      lombdo(
        {
          body: JSON.parse(event.body),
          param: event.pathParameters,
          query: event.queryStringParameters
        },
        {json, html},
        {event, context, callback}
      )
    })

   function error(status, message, error) {
     json(status || 500, data || {
       message: 'unexpected error',
       error: error
     })
   }

   function json(status, data){
     callback(null, {
       statusCode: status,
       headers: {
         'Content-type': 'application/json; charset=utf-8'
       },
       body: JSON.stringify({
         data : data
       })
     })
   }

   function html(status, str){
     callback(null, {
       statusCode: status,
       headers: {
         'Content-type': 'text/html; charset=utf-8'
       },
       body: str
     })
   }
}

function connectToDatabase(uri) {
  if (!uri) return Promise.resolve()
  if (cachedDb && cachedDb.serverConfig.isConnected()) return Promise.resolve(cachedDb)
  return mongoose.connect(uri).then(db => { cachedDb = db; return cachedDb; })
}
