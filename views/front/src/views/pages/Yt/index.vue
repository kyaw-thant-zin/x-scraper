<script setup>
import dayjs from "dayjs"
import { APP } from '@/config.js'
import { useQuasar } from 'quasar'
import { ref, onMounted, watchEffect, watch } from 'vue'
import { useYtStore } from '@/stores/Yt'

const $q = useQuasar()
const ytStore = useYtStore()

const filter = ref('')
const columns = [
    { name: 'id', required: false, label: 'ID', sortable: false },
    { name: 'refresh', required: false, align: 'center', label: '', field: 'refresh', sortable: false },
    {
        name: 'account',
        required: true,
        label: 'アカウント',
        align: 'center',
        field: row => row.account,
        format: val => `${val}`,
        sortable: true
    },
    { name: 'followers', align: 'center', label: '購読者', field: 'followers', sortable: true },
    { name: 'following', align: 'center', label: '再生回数', field: 'following', sortable: true },
    { name: 'media', align: 'center', label: 'メディア数', field: 'media', sortable: true },
    { name: 'last_detection', align: 'center', label: '最後の検出', field: 'last_detection', sortable: true },
    { name: 'create', required: false, align: 'center', label: 'create', field: 'creation_time'},
    { name: 'action', align: 'center', label: 'アクション', field: 'action' },
]
const visibileColumns = ['refresh', 'account', 'followers', 'following', 'media', 'tt_created_at', 'last_detection', 'action']
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
    rows.value = await ytStore.handleGetAll()
})


function showConfirmDialog(row) {
    $q.dialog({
        title: `消去してもよろしいですか「${row.account}」?`,
        message: 'このアカウントは間もなく削除されます。 この操作は元に戻すことができません。',
        cancel: true,
        persistent: true,
        html: true,
    }).onOk(async () => {
        await ytStore.handleDestroy(row.id)
        if (ytStore._success) {
            rows.value = await ytStore.handleGetAll()
            $q.notify({
                caption: 'アカウントは正常に削除されました。',
                message: '成功！',
                type: 'positive',
                timeout: 1000
            })
            ytStore.storeSuccess(false)
        }

        if (ytStore._error) {
            $q.notify({
                caption: 'エラーが発生しました。後でもう一度お試しください。',
                message: 'エラー！',
                type: 'negative',
                timeout: 1000
            })
            ytStore.storeError(false)
        }
    })
}

const customSort = (rows, sortBy, descending) => {
    
    if(sortBy == 'last_detection') {
        return rows.sort((a, b) => {
            const getARealTime = dayjs(a['creation_time'])
            const getBRealTime = dayjs(b['creation_time'])
            console.log(descending ? getBRealTime - getARealTime : getARealTime - getBRealTime)
            return descending ? getBRealTime - getARealTime : getARealTime - getBRealTime
        })
    } else if(sortBy == 'tt_created_at') {
        return rows.sort((a, b) => {
            const getARealTime = dayjs(a[sortBy])
            const getBRealTime = dayjs(b[sortBy])
            console.log(descending ? getBRealTime - getARealTime : getARealTime - getBRealTime)
            return descending ? getBRealTime - getARealTime : getARealTime - getBRealTime
        })
    } else if(sortBy == 'account' || sortBy == 'name') {
        return rows.sort((a, b) => {
            const getA = a[sortBy].toLowerCase()
            const getB = b[sortBy].toLowerCase()
            return descending ? getB.localeCompare(getA) : getA.localeCompare(getB)
        })
    } 

    return rows.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        return descending ? bValue - aValue : aValue - bValue;
    })
}

const refreshAll = async () => {

    // set table disable
    if(rows.value && rows.value.length > 0) {
        rows.value.forEach(item => {
            item.refresh = true;
        })
    }

    await ytStore.handleRefreshAll()

    setTimeout( async () => {

        // set table disable
        if(rows.value && rows.value.length > 0) {
            rows.value.forEach(item => {
                item.refresh = false;
            })
        }
        if (ytStore._success) {
            $q.notify({
                caption: 'アカウントは正常に削除されました。',
                message: '成功！',
                type: 'positive',
                timeout: 1000
            })
            ytStore.storeSuccess(false)
        }

        if (ytStore._error) {
            $q.notify({
                caption: 'エラーが発生しました。後でもう一度お試しください。',
                message: 'エラー！',
                type: 'negative',
                timeout: 1000
            })
            ytStore.storeError(false)
        }
    }, 2000)

}

const refreshOne = async (row) => {
    row.refresh = true
    const index = rows.value.findIndex(r => r.id === row.id)
    await ytStore.handleRefresh(row.account)

    setTimeout( async () => {

        // set table disable
        rows.value[index].refresh = false
        if (ytStore._success) {
            $q.notify({
                caption: 'アカウントは正常に削除されました。',
                message: '成功！',
                type: 'positive',
                timeout: 1000
            })
            ytStore.storeSuccess(false)
        }

        if (ytStore._error) {
            $q.notify({
                caption: 'エラーが発生しました。後でもう一度お試しください。',
                message: 'エラー！',
                type: 'negative',
                timeout: 1000
            })
            ytStore.storeError(false)
        }
    }, 2000)

}

// watch the refresh
watch(
    () => ytStore._yt,
    (newValue, oldValue) => {
        if(newValue != null) {
            const updatedFollower = newValue
            const indexToUpdate = rows.value.findIndex(row => row.id === updatedFollower.id)
            if (indexToUpdate !== -1) {
                rows.value[indexToUpdate] = {
                    ...rows[indexToUpdate],  // Preserve other properties
                    ...updatedFollower       // Update with new properties
                }
            }
        }
    },
    { deep: true }
)


// watch the loading
watchEffect(() => {
    // set area rows
    if (ytStore._loading) {
        $q.loading.show()
    } else {
        $q.loading.hide()
    }

}, [ytStore._loading])

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
                                <q-btn class="shadow-3 p-common-btn q-mr-md" icon="mdi-refresh" @click="refreshAll"
                                    no-caps />
                                <q-btn class="shadow-3 p-common-btn" label="新規作成" :to="{ name: 'tt.create' }"
                                    no-caps />
                            </div>
                        </q-card-section>
                        <q-card-section class="q-px-none">
                            <q-table class="index-table no-shadow follower-tbl" 
                                :filter="filter" 
                                :rows="rows"
                                :columns="columns" 
                                row-key="account" 
                                :visible-columns="visibileColumns"
                                :pagination="pagination" 
                                :sort-method="customSort"
                            >
                                <template v-slot:top-right>
                                    <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                                      <template v-slot:append>
                                        <q-icon name="search" />
                                      </template>
                                    </q-input>
                                  </template>

                                <template v-slot:body-cell-account="props">
                                    <q-td>
                                        <div :class="props.row.refresh == true ? 'loading-opacity':''">
                                            <a :href="'https://tiktok.com/@'+props.row.account" target="_blank">@{{ props.row.account }}</a>
                                        </div>
                                    </q-td>
                                </template>

                                <template v-slot:body-cell-followers="props">
                                    <q-td>
                                        <div :class="props.row.refresh == true ? 'loading-opacity text-center':' text-center'">{{ props.row.followers }}</div>
                                    </q-td>
                                </template>

                                <template v-slot:body-cell-following="props">
                                    <q-td>
                                        <div :class="props.row.refresh == true ? 'loading-opacity text-center':' text-center'">{{ props.row.following }}</div>
                                    </q-td>
                                </template>

                                <template v-slot:body-cell-media="props">
                                    <q-td>
                                        <div :class="props.row.refresh == true ? 'loading-opacity text-center':' text-center'">{{ props.row.media }}</div>
                                    </q-td>
                                </template>

                                <template v-slot:body-cell-tt_created_at="props">
                                    <q-td>
                                        <div :class="props.row.refresh == true ? 'loading-opacity':''">{{ props.row.tt_created_at }}</div>
                                    </q-td>
                                </template>

                                <template v-slot:body-cell-last_detection="props">
                                    <q-td>
                                        <div :class="props.row.refresh == true ? 'loading-opacity':''">{{ props.row.last_detection }}</div>
                                    </q-td>
                                </template>

                                <template v-slot:body-cell-refresh="props">
                                    <q-td :props="props">
                                        <div class="row no-wrap justify-center items-center q-gutter-sm"
                                            style="font-size: 2em">
                                            <div v-if="props.row.refresh == true">
                                                <q-spinner-hourglass color="black" />
                                            </div>
                                            <div v-else-if="props.row.refresh == -1">
                                                <q-icon name="mdi-check-circle-outline" color="positive" />
                                            </div>
                                            <div v-else></div>
                                        </div>
                                    </q-td>
                                </template>

                                <template v-slot:body-cell-action="props">
                                    <q-td :props="props">
                                        <div :class="props.row.refresh == true ? 'loading-opacity':''">
                                            <div class="row no-wrap justify-center items-center q-gutter-sm">
                                                <div>
                                                    <q-btn @click="refreshOne(props.row)" size="sm" padding="sm" round :disable="props.row.refresh == false ? false:true"
                                                        icon="mdi-refresh" />
                                                </div>
                                                <div>
                                                    <router-link
                                                        :to="{ name: 'tt.detail', params: { id: APP.encryptID(props.row.id) } }">
                                                        <q-btn size="sm" padding="sm" round class="p-common-bg" :disable="props.row.refresh == false ? false:true"
                                                            icon="mdi-note-edit-outline" />
                                                    </router-link>
                                                </div>
                                                <div>
                                                    <q-btn @click="showConfirmDialog(props.row)" size="sm" padding="sm" round :disable="props.row.refresh == false ? false:true"
                                                        class="p-common-btn" icon="mdi-trash-can-outline" />
                                                </div>
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

<style lang="scss">

.loading-opacity {
    opacity: 0.3;
}

.truncate {
    width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;  
}

</style>