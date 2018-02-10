
import serverRoute from './server/routes/server';
export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'indices_view',
    uiExports: {

      app: {
        title: 'Indices View',
        description: 'An awesome kibana plugin for view indices!',
        icon: 'plugins/indices_view/icon.svg',
        main: 'plugins/indices_view/app'
      },
    },


    init(server) {
      // Add server routes and initialize the plugin here
      serverRoute(server);
    }


  });
}
