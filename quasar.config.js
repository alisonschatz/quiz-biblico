import { defineConfig } from '#q-app/wrappers'

export default defineConfig((ctx) => {
  return {
    boot: ['pinia', 'firebase'],
    
    css: ['app.scss'],
    
    extras: [
      'roboto-font',
      'material-icons',
      'material-icons-outlined'
    ],
    
    build: {
      target: {
        browser: ['es2022', 'edge88', 'firefox78', 'chrome87', 'safari14'],
        node: 'node18'
      },
      
      vueRouterMode: 'hash',
      
      vitePlugins: []
    },
    
    devServer: {
      open: true
    },
    
    framework: {
      config: {},
      
      plugins: [
        'Notify',
        'Loading',
        'Dialog'
      ]
    },
    
    animations: 'all',
    
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [ctx.prod ? 'compression' : '', 'render']
    },
    
    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false
    },
    
    cordova: {},
    
    capacitor: {
      hideSplashscreen: true
    },
    
    electron: {
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'quiz-biblico'
      }
    },
    
    bex: {
      contentScripts: ['my-content-script']
    }
  }
})