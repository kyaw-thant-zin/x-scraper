<script setup>
import 'quasar/dist/quasar.css'
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/Auth'


const authStore = useAuthStore()

// sidebar nav menu list
const menuList = [
  // {
  //   label: 'ホーム',
  //   path: '/dashboard',
  //   icon: 'mdi-home-variant-outline',
  // },
  {
    label: 'X',
    path: '/x',
    icon: '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="26px" height="26px"><path d="M10.053,7.988l5.631,8.024h-1.497L8.566,7.988H10.053z M21,6v12	c0,1.657-1.343,3-3,3H6c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h12C19.657,3,21,4.343,21,6z M17.538,17l-4.186-5.99L16.774,7	h-1.311l-2.704,3.16L10.552,7H6.702l3.941,5.633L6.906,17h1.333l3.001-3.516L13.698,17H17.538z"/></svg>',
  },
  {
    label: 'Instagram',
    path: '/ig',
    icon: '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="26px" height="26px">    <path d="M 8 3 C 5.239 3 3 5.239 3 8 L 3 16 C 3 18.761 5.239 21 8 21 L 16 21 C 18.761 21 21 18.761 21 16 L 21 8 C 21 5.239 18.761 3 16 3 L 8 3 z M 18 5 C 18.552 5 19 5.448 19 6 C 19 6.552 18.552 7 18 7 C 17.448 7 17 6.552 17 6 C 17 5.448 17.448 5 18 5 z M 12 7 C 14.761 7 17 9.239 17 12 C 17 14.761 14.761 17 12 17 C 9.239 17 7 14.761 7 12 C 7 9.239 9.239 7 12 7 z M 12 9 A 3 3 0 0 0 9 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 12 A 3 3 0 0 0 12 9 z"/></svg>',
  },
  {
    label: 'TikTok',
    path: '/tt',
    icon: '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="26px" height="26px"><path d="M 6 3 C 4.3550302 3 3 4.3550302 3 6 L 3 18 C 3 19.64497 4.3550302 21 6 21 L 18 21 C 19.64497 21 21 19.64497 21 18 L 21 6 C 21 4.3550302 19.64497 3 18 3 L 6 3 z M 12 7 L 14 7 C 14 8.005 15.471 9 16 9 L 16 11 C 15.395 11 14.668 10.734156 14 10.285156 L 14 14 C 14 15.654 12.654 17 11 17 C 9.346 17 8 15.654 8 14 C 8 12.346 9.346 11 11 11 L 11 13 C 10.448 13 10 13.449 10 14 C 10 14.551 10.448 15 11 15 C 11.552 15 12 14.551 12 14 L 12 7 z"/></svg>',
  },
]

const activeLink = ref('')
const defaultOpenChild = ref({})

function setChildMenuActive(activeLink) {
  for (const menuItem of menuList) {
    const key = menuItem.label
    
    if (menuItem.children && Array.isArray(menuItem.children) && menuItem.children.length > 0) {
      for(let i = 0; i < menuItem.children.length; i++) {
        const mc = menuItem.children[i]
        if(activeLink.includes(mc.path)) {
          defaultOpenChild.value[key] = true
          break
        } else {
          defaultOpenChild.value[key] = false
        }
      }
    }
  }
}

// trigger sidebar open and close
const leftDrawerOpen = ref(false)
const drawer = leftDrawerOpen

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const closeNav = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const handleChildMenuClick = (childPath) => {
  activeLink.value = childPath
  setChildMenuActive(childPath)
}

const signout = async () => {
  const res = await authStore.handleSignOut()
  if(res) {
    authStore.router.replace({ name: 'signinhome' })
  }
}

watchEffect(() => {
  handleChildMenuClick(authStore.router.currentRoute.value.fullPath)
})

</script>

<template>
    <q-header bordered class="p-hd hd">
      <q-toolbar>
        <template v-if="leftDrawerOpen">
          <q-btn dense flat round icon="mdi-close" @click="toggleLeftDrawer" />
        </template>
        <template v-else>
          <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        </template>
        <q-toolbar-title>
          SNS Scraper
        </q-toolbar-title>
        <q-space />
        <q-btn size="md" flat class="q-ml-md" @click="signout()" icon="mdi-logout-variant"></q-btn>
      </q-toolbar>
    </q-header>
  
    <q-drawer class="l-sb" overlay side="left" behavior="desktop" elevated v-model="leftDrawerOpen" :width="245">
      <q-scroll-area class="fit">
        <q-list>
          <template v-for="(menuItem, index) in menuList" :key="index">
            <div v-if="!menuItem?.hasChild">
              <router-link :to="menuItem.path" class="p-menu-color" @click="closeNav">
                <q-item :data-activeLink="activeLink" :data-path="menuItem.path" class="q-mt-md" clickable
                  :active="activeLink.includes(menuItem.path)" @click="handleChildMenuClick(menuItem.path)" active-class="active-sb"
                  v-ripple>
                  <q-item-section avatar>
                    <q-icon>
                      <span v-html="menuItem.icon"></span>
                    </q-icon>
                  </q-item-section>
                  <q-item-section>
                    {{ menuItem.label }}
                  </q-item-section>
                </q-item>
              </router-link>
            </div>
            <div v-else>
              <q-expansion-item class="q-mt-md p-menu-color" :icon="menuItem.icon" :label="menuItem.label"
                v-model="defaultOpenChild[menuItem.label]" :data-linkactive="activeLink" :data-defaultOpenChild="defaultOpenChild">
                <q-list class="q-ml-md">
                  <template v-if="menuItem?.children">
                    <template v-for="(menuChild, index) in menuItem.children">
                      <router-link :to="menuChild.path" class="p-menu-color">
                        <q-item clickable :active="activeLink.includes(menuChild.path)"
                          @click="handleChildMenuClick(menuChild.path)" active-class="active-sb" v-ripple>
                          <q-item-section avatar>
                            <q-icon :name="menuChild.icon" />
                          </q-item-section>
                          <q-item-section>
                            {{ menuChild.label }}
                          </q-item-section>
                        </q-item>
                      </router-link>
                    </template>
                  </template>
                </q-list>
              </q-expansion-item>
            </div>
          </template>
  
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </template>

<style></style>