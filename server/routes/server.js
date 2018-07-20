const elasticsearch = require('elasticsearch');
export default function (server) {
  const config = server.config();
  const client = new elasticsearch.Client({
    host: config.get('elasticsearch.url'),
    //log: 'trace'
    requestTimeout:120000
  });
  server.route({
    path: '/api/indices_view/_stats',
    method: 'GET',
    handler(req, reply) {
      client.indices.stats({ human:true,fields:['docs','store','get','search','query_cache'] }, function (err,response) {
        reply(
               response
              );
      });
    }
  });
}
