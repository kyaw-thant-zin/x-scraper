<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'


// ADMIN
import CpHeader from '@/views/layout/Header.vue'
import CpFooter from '@/views/layout/Footer.vue'

const route = useRoute()
const authLayout = ref(true)

watchEffect(() => {
  if(route.meta?.authLayout != undefined) {
    authLayout.value = route.meta?.authLayout
  } else {
    authLayout.value = true
  }
}, [route.meta])

</script>

<template>
  <q-layout no-header no-footer class="l" view="hHh LpR lff">
          <CpHeader v-if="authLayout"></CpHeader>
          <q-page-container class="row fit min-height-fit">
            <RouterView v-slot="{ Component }">
              <template v-if="Component">
                  <Transition name="fade">
                    <div class="fit row min-height-fit">
                      <Suspense>
                          <!-- main content -->
                          <component :is="Component"></component>

                          <!-- loading state -->
                          <template #fallback>
                            Loading...
                          </template>
                        </Suspense>
                    </div>
                  </Transition>
              </template>
            </RouterView>
          </q-page-container>
          <CpFooter v-if="authLayout"></CpFooter>
        </q-layout>
</template>

<style scoped>
</style>
