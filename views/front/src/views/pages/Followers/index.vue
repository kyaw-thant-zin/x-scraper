<script setup>
import { APP } from '@/config.js'
import { useQuasar } from 'quasar'
import { ref, onMounted, watchEffect } from 'vue'
import { useFollowerStore } from '@/stores/Followers'

const $q = useQuasar()
const followerStore = useFollowerStore()

const filter = ref('')
const columns = [
    { name: 'id', required: false, label: 'ID', sortable: false },
    {
        name: 'account',
        required: true,
        label: 'アカウント',
        align: 'center',
        field: row => row.account,
        format: val => `${val}`,
        sortable: true
    },
    { name: 'followers', required: true, align: 'center', label: 'フォロワー', field: 'followers', sortable: true },
    { name: 'following', required: true, align: 'center', label: 'フォロー中', field: 'following', sortable: true },
    { name: 'media', required: true, align: 'center', label: 'メディア数', field: 'media', sortable: true },
    { name: 'tt_created_at', required: true, align: 'center', label: '作成日', field: 'tt_created_at', sortable: true },
    { name: 'last_detection', required: true, align: 'center', label: '最後の検出', field: 'last_detection', sortable: true },
    { name: 'action', align: 'center', label: 'アクション', field: 'action' },
]
const visibileColumns = ['account', 'followers', 'following', 'tt_created_at', 'last_detection', 'action']
const rows = ref([])
const pagination = ref({
    page: 1,
    rowsPerPage: 10
})
const changePagination = (newPagination) => {
    const pageNumber = newPagination.page
    pagination.value.page = pageNumber
}

// Fetch store
onMounted(async () => {
    rows.value = await followerStore.handleGetAll()
})

// watch the loading
watchEffect(() => {
    // set area rows
    if(followerStore._loading) {
        $q.loading.show()
    } else {
        $q.loading.hide()
    }

}, [followerStore._loading])

function showConfirmDialog(row) {
    $q.dialog({
      title: `消去してもよろしいですか「${row.account}」?`,
      message: 'このアカウントは間もなく削除されます。 この操作は元に戻すことができません。',
      cancel: true,
      persistent: true,
      html: true,
    }).onOk( async () => {
        await followerStore.handleDestroy(row.id)
        if(followerStore._success) {
            rows.value = await followerStore.handleGetAll()
            $q.notify({
                caption: 'アカウントは正常に削除されました。',
                message: '成功！',
                type: 'positive',
                timeout: 1000
            })
            followerStore.storeSuccess(false)
        }

        if(followerStore._error) {
            $q.notify({
                caption: 'エラーが発生しました。後でもう一度お試しください。',
                message: 'エラー！',
                type: 'negative',
                timeout: 1000
            })
            followerStore.storeError(false)
        }
    })
}

console.log('here')

</script>
<template>
    <div class="full-width  q-mb-xl">
        <div class="q-pa-sm row items-start q-gutter-md">
            <q-breadcrumbs>
                <q-breadcrumbs-el label="ホーム" icon="mdi-home-variant-outline" :to="{ name: 'dashboard' }" />
                <q-breadcrumbs-el label="フォロワー" />
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
            <div class="full-width row q-px-md q-mt-sm">
                <div class="col-12">
                    <q-card class="common-card">
                        <q-card-section class="row justify-between items-center q-py-md  q-px-lg">
                            <div class="common-card-ttl">フォロワー一覧</div>
                            <div class="row">
                                <q-btn class="shadow-3 p-common-btn q-mr-md" icon="mdi-refresh" :to="{ name: 'followers.create' }" no-caps />
                                <q-btn class="shadow-3 p-common-btn" label="新規作成" :to="{ name: 'followers.create' }" no-caps />
                            </div>
                        </q-card-section>
                        <q-card-section class="q-px-none">
                            <q-table class="index-table no-shadow" :filter="filter" :rows="rows" :columns="columns"
                                row-key="name" :visible-columns="visibileColumns" :pagination="pagination"
                                @update:pagination="changePagination">
                                <template v-slot:body-cell-action="props">
                                    <q-td :props="props">
                                        <div class="row no-wrap justify-center items-center q-gutter-sm">
                                            <div>
                                                <router-link :to="{ name: 'followers.detail', params: { id: APP.encryptID(props.row.id) } }">
                                                  <q-btn size="sm" padding="sm" round class="p-common-bg" icon="mdi-note-edit-outline"/>
                                                </router-link>
                                            </div>
                                            <div>
                                                <q-btn @click="showConfirmDialog(props.row)" size="sm" padding="sm" round class="p-common-btn" icon="mdi-trash-can-outline" />
                                            </div>
                                        </div>
                                    </q-td>
                                  </template>
                            </q-table>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
</template>
