/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


import serverRoute from './server/routes/serverRoute';
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
      serverRoute(server);
    }

  });
}
