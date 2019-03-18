import serverRoute from './server/routes/serverRoute';
const elasticsearch = require('elasticsearch');
export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'indices_view',
    uiExports: {
      app: {
        title: 'Indices View',
        description: 'An awesome kibana plugin for view indies!',
        main: 'plugins/indices_view/app',
        icon: 'plugins/indices_view/icon.svg',
        styleSheetPath: require('path').resolve(__dirname, 'public/app.scss'),
      },
      injectDefaultVars: function (server) {
        const config = server.config();
        const pattern = config.get('indices_view.mergePattern');
        return {
          mergePattern: pattern,
        };
      }
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        mergePattern: Joi.string().default('[^a-z]+$'),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
      // Add server routes and initialize the plugin here
      const config = server.config();
      const client = new elasticsearch.Client({
        host: config.get('elasticsearch.hosts'),
        //log: 'trace'
        requestTimeout: 120000
      });
      serverRoute(server, client);
    }
  });
}