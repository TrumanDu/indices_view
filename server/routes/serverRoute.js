export default function (server, client) {
  server.route({
    path: '/api/indices_view/_stats',
    method: 'GET',
    handler:async (_req)=>{
      const response = await client
        .indices
        .stats({
          human: false,
          level: 'indices',
          metric: ['docs', 'store', 'get', 'search', 'query_cache']
        });
        return response;
    }
  });
}
