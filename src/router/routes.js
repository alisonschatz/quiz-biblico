const routes = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'auth',
        component: () => import('pages/auth/Auth.vue') 
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'home',
        component: () => import('pages/Home.vue') 
      },
      { 
        path: '/quiz', 
        name: 'quiz',
        component: () => import('pages/Quiz.vue') 
      },
      { 
        path: '/achievements', 
        name: 'achievements',
        component: () => import('pages/Achievements.vue') 
      },
      { 
        path: '/ranking', 
        name: 'ranking',
        component: () => import('pages/Ranking.vue') 
      },
      { 
        path: '/profile', 
        name: 'profile',
        component: () => import('pages/Profile.vue') 
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
];

export default routes;