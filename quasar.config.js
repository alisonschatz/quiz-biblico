const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    // Arquivos boot
    boot: ['firebase'],

    // CSS global
    css: ['app.scss'],

    // Quasar Extras
    extras: [
      'roboto-font',
      'material-icons',
      'material-icons-outlined'
    ],

    // Build
    build: {
      target: {
        browser: ['es2019', 'chrome87', 'firefox78', 'safari13.1'],
        node: 'node18'
      },

      vueRouterMode: 'hash',

      vitePlugins: []
    },

    // Dev server
    devServer: {
      open: true,
      port: 9000
    },

    // Config do Quasar Framework
    framework: {
      config: {},
      plugins: ['Notify', 'Loading', 'Dialog']
    },

    animations: 'all',

    // PWA
    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json'
    },

    // Capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Electron
    electron: {
      bundler: 'builder',
      inspectPort: 5858,
      builder: {
        appId: 'quiz-biblico'
      }
    }
  };
});
