import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/Auth'

import SignIn from "@/views/pages/Auth/sign-in.vue";
import Dashboard from "@/views/pages/Dashboard/index.vue";
import Followers from "@/views/pages/Followers/index.vue";
import FollowersCreate from "@/views/pages/Followers/create.vue";
import FollowersDetail from "@/views/pages/Followers/detail.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "signinhome",
      component: SignIn,
      meta: { requiresAuth: false, authLayout: false },
    },
    {
      path: "/sign-in",
      name: "signinpage",
      component: SignIn,
      meta: { requiresAuth: false, authLayout: false },
    },
    // {
    //     path: '/dashboard',
    //     name: 'dashboard',
    //     component: Dashboard,
    //     meta: { requiresAuth: true, authLayout: true }
    // },
    {
      path: "/followers",
      name: "followers",
      children: [
        {
          path: "",
          name: "followers.index",
          component: Followers,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: "create",
          name: "followers.create",
          component: FollowersCreate,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: ":id/detail",
          name: "followers.detail",
          component: FollowersDetail,
          meta: { requiresAuth: true, authLayout: true },
        },
      ],
    },

    // {
    //     path: '/:catchAll(.*)',
    //     name: 'notfound',
    //     component: SignIn,
    //     meta: { requiresAuth: false, authLayout: false }
    // },
  ],
});

router.beforeEach( async (to, from, next) => {
  
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const authStore = useAuthStore()
        const res = await authStore.handleCheck()
        if(res?.error && res.error) {
            next({
                name: 'signinpage'
            })
        } else {
            next()
        }

    } else {
        next()
    }

})

export default router;
