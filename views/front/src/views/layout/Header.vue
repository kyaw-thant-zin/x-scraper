<script setup>
import 'quasar/dist/quasar.css'
import { ref, watchEffect, onBeforeMount } from 'vue'
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
    icon: 'mdi-alpha-x',
  },
  {
    label: 'Instagram',
    path: '/insta',
    icon: 'mdi-instagram',
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
                    <q-icon :name="menuItem.icon" />
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