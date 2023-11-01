import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/Auth'

import SignIn from "@/views/pages/Auth/sign-in.vue";
import Dashboard from "@/views/pages/Dashboard/index.vue";
import XIndex from "@/views/pages/X/index.vue";
import XCreate from "@/views/pages/X/create.vue";
import XDetail from "@/views/pages/X/detail.vue";

import InstaIndex from "@/views/pages/Insta/index.vue";
import InstaCreate from "@/views/pages/Insta/create.vue";
import InstaDetail from "@/views/pages/Insta/detail.vue";

import TtIndex from "@/views/pages/Tt/index.vue";
import TtCreate from "@/views/pages/Tt/create.vue";
import TtDetail from "@/views/pages/Tt/detail.vue";

import YtIndex from "@/views/pages/Yt/index.vue";

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
      path: "/ig",
      name: "insta",
      children: [
        {
          path: "",
          name: "insta.index",
          component: InstaIndex,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: "create",
          name: "insta.create",
          component: InstaCreate,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: ":id/detail",
          name: "insta.detail",
          component: InstaDetail,
          meta: { requiresAuth: true, authLayout: true },
        },
      ],
    },
    {
      path: "/tt",
      name: "tt",
      children: [
        {
          path: "",
          name: "tt.index",
          component: TtIndex,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: "create",
          name: "tt.create",
          component: TtCreate,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: ":id/detail",
          name: "tt.detail",
          component: TtDetail,
          meta: { requiresAuth: true, authLayout: true },
        },
      ],
    },
    {
      path: "/yt",
      name: "yt",
      children: [
        {
          path: "",
          name: "yt.index",
          component: YtIndex,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: "create",
          name: "tt.create",
          component: TtCreate,
          meta: { requiresAuth: true, authLayout: true },
        },
        {
          path: ":id/detail",
          name: "tt.detail",
          component: TtDetail,
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
