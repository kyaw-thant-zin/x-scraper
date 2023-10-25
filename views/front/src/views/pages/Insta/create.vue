<script setup>
import { useQuasar } from 'quasar'
import { ref, watchEffect } from 'vue'
import { useInstaStore } from '@/stores/Insta'

const $q = useQuasar()
const instaStore = useInstaStore()

const tab = ref('account')
const formData = ref({
  account: '',
  userId: 1,
  file: null
})

const resetForm = () => {
  formData.value.account = ''
}


// create new area
const onSubmit = async () => {
  await instaStore.handleStore(formData.value)

  if (instaStore._success) {
    if(!instaStore._unique) {
      $q.notify({
        caption: 'アカウントが正常に作成されました。',
        message: '成功！',
        type: 'positive',
        timeout: 1000
      })
      instaStore.storeSuccess(false)
      resetForm()
      instaStore.router.replace({ name: 'insta.index' })
    } else {
      $q.notify({
        caption: 'この名前ですでに存在します。',
        message: 'エラー！',
        type: 'negative',
        timeout: 1000
      })
      instaStore.storeError(false)
    }
  }

  if (instaStore._error) {
    $q.notify({
      caption: 'エラーが発生しました。後でもう一度お試しください。',
      message: 'エラー！',
      type: 'negative',
      timeout: 1000
    })
    instaStore.storeError(false)
  }

}

// watch the loading
watchEffect(() => {
  // set area rows
  if (instaStore._loading) {
    $q.loading.show({
      message: instaStore._createMessage
    })
  } else {
    $q.loading.hide()
  }

}, [instaStore._loading, instaStore._createMessage])

</script>
<template>
  <div class="full-width  q-mb-xl">
    <div class="q-pa-sm row items-start q-gutter-md">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="ホーム" icon="mdi-home-variant-outline" :to="{ name: 'dashboard' }" />
        <q-breadcrumbs-el label="フォロワー" :to="{ name: 'followers.index' }" />
      </q-breadcrumbs>
    </div>
    <div class="full-width row wrap justify-start items-start content-start">
      <div class="q-px-md row">
        <q-toolbar>
          <q-toolbar-title class="page-ttl">
            フォロワー
          </q-toolbar-title>
        </q-toolbar>
      </div>
      <div class="full-width row q-px-md q-mt-md">
        <div class="col-12">
          <q-card class="common-card">
            <q-card-section class="row justify-between items-center q-py-md  q-px-lg">
              <div class="common-card-ttl"></div>
            </q-card-section>
            <q-card-section class="q-px-none">
              <q-tabs
                v-model="tab"
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
              >
                <q-tab name="account" label="口座" />
                <q-tab name="file" label="ファイルアップロー" />
              </q-tabs>
              <q-separator />

              <q-tab-panels v-model="tab" animated>
                <q-tab-panel name="account">
                  <q-form @submit="onSubmit" class="q-gutter-md q-py-xl">
                    <div class="row q-px-lg q-mt-none">
                      <div class="col-12">
                        <div class="row items-top">
                          <div class="col-12 col-sm-12 col-md-3 col-lg-3">
                            <label class="">アカウント</label>
                          </div>
                          <div class="col-12 col-sm-12 col-md-8 col-lg-8 form-input">
                            <q-input name="account" outlined class="common-input-text" v-model="formData.account" lazy-rules placeholder="口座ID" hint="複数のアカウントには「,」を使用します (Ex: account1,account2)"
                              :rules="[
                                val => !!val.replace(/\s/g, '') || 'フィールドは必須項目です',
                              ]" />
                          </div>
                        </div>
                        <div class="row items-top q-mt-lg">
                          <div class="col-12 col-sm-12 col-md-3 col-lg-3">
                          </div>
                          <div class="col-12 col-sm-12 col-md-8 col-lg-8 form-input">
                            <q-btn type="submit" class="p-common-btn" label="新規作成" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-form>
                </q-tab-panel>

                <q-tab-panel name="file">
                  <q-form @submit="onSubmit" class="q-gutter-md q-py-xl">
                    <div class="row q-px-lg q-mt-none">
                      <div  class="col-12">
                        <label>アップロードファイルを選択してください</label>
                      </div>
                      <div class="col-12 col-sm-12 col-md-4 col-lg-4">
                        <q-file 
                          name="account" 
                          dense
                          outlined 
                          class="common-input-text q-mt-md" 
                          v-model="formData.file" 
                          accept=".csv,.xlsx"
                          hint="" />
                      </div>
                      <div class="col-12 q-mt-lg form-input">
                        <q-btn type="submit" class="p-common-btn" label="新規作成" />
                      </div>
                    </div>
                  </q-form>
                </q-tab-panel>
              </q-tab-panels>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.form-input {
  .q-field__control {
    height: 40px !important;
  }

  .q-field__marginal {
    height: 40px !important;
  }

  input {
    padding: 0px 5px;
    font-size: 16px;
  }

  .q-field--auto-height .q-field__control,
  .q-field--auto-height .q-field__native {
    min-height: 40px !important;
  }
}

.form-select {
  margin-bottom: 20px;
}
</style>