const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    boot: ['firebase'],

    css: ['app.scss'],

    extras: [
      'roboto-font',
      'material-icons',
      'material-icons-outlined'
    ],

    build: {
      target: {
        browser: ['es2019'],
        node: 'node18'
      },

      vueRouterMode: 'hash',
      vitePlugins: []
    },

    devServer: {
      open: true,      
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Dialog', 'Loading']
    },

    animations: 'all',

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json'
    },

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      inspectPort: 5858,
      bundler: 'builder',
      builder: {
        appId: 'quiz-biblico'
      }
    }
  };
});
