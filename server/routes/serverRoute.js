export default function (server, client) {
  server.route({
    path: '/api/indices_view/_stats',
    method: 'GET',
    handler(req, reply) {
      client
        .indices
        .stats({
          human: false,
          level: 'indices',
          metric: ['docs', 'store', 'get', 'search', 'query_cache']
        }, function (err, response) {
          reply(response);
        });
    }
  });
}
