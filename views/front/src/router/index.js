import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/Auth'

import SignIn from "@/views/pages/Auth/sign-in.vue";
import Dashboard from "@/views/pages/Dashboard/index.vue";
import XIndex from "@/views/pages/X/index.vue";
import XCreate from "@/views/pages/X/create.vue";
import XDetail from "@/views/pages/X/detail.vue";

import InstaIndex from "@/views/pages/Insta/index.vue";

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
      path: "/x",
      name: "x",
      children: [
        {
          path: "",
          name: "x.index",
          component: XIndex,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: "create",
          name: "x.create",
          component: XCreate,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: ":id/detail",
          name: "x.detail",
          component: XDetail,
          meta: { requiresAuth: true, authLayout: true },
        },
      ],
    },
    {
      path: "/insta",
      name: "insta",
      children: [
        {
          path: "",
          name: "insta.index",
          component: InstaIndex,
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
