<script setup>
import { APP } from '@/config.js'
import { useQuasar } from 'quasar'
import { ref, computed, onMounted } from 'vue'
import { useFollowerStore } from '@/stores/Followers'

const $q = useQuasar()
const followerStore = useFollowerStore()
const id = computed(() => APP.decryptID(followerStore.router.currentRoute._value.params.id.toString()))

const profile = ref({
    bg: '',
    img: '',
    name: '',
    account: '',
    desc: '',
    following: '',
    followers: '',
    friends: '',
    media: '',
    statuses: '',
    joined: ''
})

onMounted( async () => {
    profile.value = await followerStore.handleGet(id.value)
})

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
                            <div class="common-card-ttl">アカウントの詳細</div>
                            <a :href="'https://twitter.com/'+profile.account" target="_blank" rel="noopener noreferrer">
                                <q-btn rounded class="shadow-3 p-common-btn" label="訪問" no-caps />
                            </a>
                        </q-card-section>
                        <q-card-section class="q-px-none">
                            <div class="row">
                                <div class="col-12 q-mb-lg">
                                    <q-img class="profile-bg" :src="profile.bg"  no-native-menu>
                                        <img class="absolute-bottom-left q-circle profile-img" :src="profile.img">
                                    </q-img>
                                </div>
                                <div class="col-12 q-px-md q-mt-lg">
                                    <div class="text-h6 text-weight-bolder">{{ profile.name }}</div>
                                    <p class="text-caption">@{{ profile.account }}</p>
                                    <p class="text-body2">{{ profile.desc }}</p>
                                </div>
                                <div class="col-12 q-px-md q-mt-lg">
                                    <q-list bordered class="rounded-borders" style="max-width: 350px">
                                        <q-item>
                                            <q-item-section>
                                                <q-item-label lines="1">Following</q-item-label>
                                            </q-item-section>

                                            <q-item-section side>{{ profile.following }}</q-item-section>
                                        </q-item>
                                        <q-separator spaced />
                                        <q-item>
                                            <q-item-section>
                                                <q-item-label lines="1">Followers</q-item-label>
                                            </q-item-section>

                                            <q-item-section side>{{ profile.followers }}</q-item-section>
                                        </q-item>
                                        <q-separator spaced />
                                        <q-item>
                                            <q-item-section>
                                                <q-item-label lines="1">Friends</q-item-label>
                                            </q-item-section>

                                            <q-item-section side>{{ profile.friends }}</q-item-section>
                                        </q-item>
                                        <q-separator spaced />
                                        <q-item>
                                            <q-item-section>
                                                <q-item-label lines="1">Media</q-item-label>
                                            </q-item-section>

                                            <q-item-section side>{{ profile.media }}</q-item-section>
                                        </q-item>
                                        <q-separator spaced />
                                        <q-item>
                                            <q-item-section>
                                                <q-item-label lines="1">Statuses</q-item-label>
                                            </q-item-section>

                                            <q-item-section side>{{ profile.statuses }}</q-item-section>
                                        </q-item>
                                        <q-separator spaced />
                                        <q-item>
                                            <q-item-section>
                                                <q-item-label lines="1">Joined</q-item-label>
                                            </q-item-section>

                                            <q-item-section side>{{ profile.joined }}</q-item-section>
                                        </q-item>
                                    </q-list>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
</template>