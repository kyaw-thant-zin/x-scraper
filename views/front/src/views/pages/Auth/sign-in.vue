<script setup>
import { useQuasar } from 'quasar'
import { ref, watchEffect } from 'vue' 
import { useAuthStore } from '@/stores/Auth'

const $q = useQuasar()
const authStore = useAuthStore()

const formData = ref({
    email: '',
    password: ''
})

// watch the loading
watchEffect(() => {
    // set area rows
    if(authStore._loading) {
        $q.loading.show()
    } else {
        $q.loading.hide()
    }

}, [authStore._loading])

const resetForm = () => {
  formData.value.email = ''
  formData.value.password = ''
}

// sign in
const onSubmit = async () => {
  await authStore.handleSignIn(formData.value)
  if(authStore._success) {
    authStore.storeSuccess(false)
    resetForm()
    authStore.router.replace({ name: 'followers.index' })
  }

  if(authStore._error) {
    $q.notify({
      caption: '無効なメールアドレスまたはパスワード。',
      message: 'エラー！',
      type: 'negative',
      timeout: 1000
    })
    authStore.storeError(false)
  }
}

</script>

<template>
    <div class="fullscreen">
        <div class="fixed-center">
            <div class="row justify-center" style="min-width: 400px;">
                <div class="col-12">
                    <q-card class="my-card q-px-md">
                        <q-card-section>
                            <div class="text-h5 text-center">X Scraper</div>
                            <q-form class="q-mt-xl q-pb-xl" @submit="onSubmit">
                                <q-input 
                                    type="text" 
                                    v-model="formData.email" 
                                    label="Email or Username" 
                                    lazy-rules
                                    :rules="[
                                        val => !!val.replace(/\s/g, '') || 'フィールドは必須項目です', 
                                    ]"
                                />
                                <q-input 
                                    type="password" 
                                    v-model="formData.password" 
                                    class="q-mt-md"
                                    label="Password" 
                                    lazy-rules
                                    :rules="[
                                        val => !!val.replace(/\s/g, '') || 'フィールドは必須項目です', 
                                    ]"
                                />
                                <div class="q-mt-xl text-center">
                                    <q-btn type="submit" class="p-common-btn" label="サインイン" />
                                </div>
                            </q-form>
                        </q-card-section>
                      </q-card>
                </div>
            </div>
        </div>
    </div><!-- #main -->
</template>

<style scoped>
</style>