<script setup>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ref, watchEffect } from 'vue'

dayjs.extend(relativeTime)

const filter = ref('')
const columns = [
    { name: 'id', required: false, label: 'ID', sortable: false },
    { name: 'row', required: true, align: 'center', label: '#', field: 'row', sortable: true },
    {
        name: 'account',
        required: true,
        label: 'アカウント',
        align: 'center',
        field: row => row.account,
        format: val => `${val}`,
        sortable: true
    },
    { name: 'following', required: true, align: 'center', label: 'フォロー中', field: 'following', sortable: true },
    { name: 'followers', required: true, align: 'center', label: 'フォロワー', field: 'followers', sortable: true },
    { name: 'date', required: true, align: 'center', label: '日付', field: 'date', sortable: true },
    { name: 'action', align: 'center', label: 'アクション', field: 'action' },
]
const visibileColumns = ['row', 'company', 'action']
const rows = ref([])
const pagination = ref({
    page: 1,
    rowsPerPage: 1
})
const changePagination = (newPagination) => {
    const pageNumber = newPagination.page
    pagination.value.page = pageNumber
}

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
                            <q-btn class="shadow-3 p-common-btn" label="新規作成" :to="{ name: 'followers.create' }" no-caps />
                        </q-card-section>
                        <q-card-section class="q-px-none">
                            <q-table class="index-table no-shadow" :filter="filter" :rows="rows" :columns="columns"
                                row-key="name" :visible-columns="visibileColumns" :pagination="pagination"
                                @update:pagination="changePagination">

                            </q-table>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
</template>
