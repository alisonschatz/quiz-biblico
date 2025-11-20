import { createApp } from 'vue';
import { Quasar, Notify, Loading, Dialog } from 'quasar';
import router from './router';
import App from './App.vue';

import 'quasar/dist/quasar.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css';
import '@quasar/extras/roboto-font/roboto-font.css';

const app = createApp(App);

app.use(Quasar, {
  plugins: {
    Notify,
    Loading,
    Dialog
  },
  config: {
    notify: {
      position: 'top',
      timeout: 2500,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }]
    }
  }
});

app.use(router);

app.mount('#q-app');