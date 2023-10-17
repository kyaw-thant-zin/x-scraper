<script setup>
import dayjs from "dayjs"
import { APP } from '@/config.js'
import { useQuasar } from 'quasar'
import { ref, computed, onMounted } from 'vue'
import { useXStore } from '@/stores/X'

const $q = useQuasar()
const followerStore = useXStore()
const id = computed(() => APP.decryptID(followerStore.router.currentRoute._value.params.id.toString()))

const getDaysOfCurrentMonth = () => {
  const currentMonth = dayjs().month(); // Get the current month (0-indexed)
  const daysInMonth = dayjs().month(currentMonth).daysInMonth(); // Get the number of days in the current month
  const daysArray = [];

  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  return daysArray;
}

const chartInstance = ref(null)
const chartViewOptionRef = ref('今週')
const chartViewOptions = [ '今週', '日ごと', '週ごと', '月ごと' ]
const followersDataPoints = ref([
    { label: "Feb", y: 11},
    { label: "Mar", y: 4 },
    { label: "Apr", y: 7 },
    { label: "May", y: 10 },
    { label: "Jun", y: 6 },
    { label: "Jul", y: 14 },
    { label: "Aug", y: 13.5 },
])
const followingDataPoints = ref([
    { label: "Feb", y: 5},
    { label: "Mar", y: 2 },
    { label: "Apr", y: 13 },
    { label: "May", y: 4 },
    { label: "Jun", y: 14.5 },
    { label: "Jul", y: 7 },
    { label: "Aug", y: 10 },
])
const mediaDataPoints = ref([
    { label: "Feb", y: 15},
    { label: "Mar", y: 22 },
    { label: "Apr", y: 13 },
    { label: "May", y: 24 },
    { label: "Jun", y: 14.5 },
    { label: "Jul", y: 3 },
    { label: "Aug", y: 12 },
])
const statusDataPoints = ref([
    { label: "Feb", y: 9},
    { label: "Mar", y: 11 },
    { label: "Apr", y: 3 },
    { label: "May", y: 4 },
    { label: "Jun", y: 15 },
    { label: "Jul", y: 9 },
    { label: "Aug", y: 12 },
])

const options = ref({
    animationEnabled: true,
    exportEnabled: true,
    zoomEnabled: true,
    title:{
        text: "フォロワーのチャート"
    },
    axisX: {
        title: ' ⟶',
        labelAngle: -45, // Rotate labels by -45 degrees
        interval: 1,     // Display every label
        staggerLines: 1,  // Stagger labels to prevent overlap
        gridColor: "lightgray",   // Color of the grid lines
        gridThickness: 1,  
    },
    axisY: {
        title: "",
        gridColor: "lightgray",   // Color of the grid lines
        gridThickness: 1,         // Thickness of the grid lines
    },
    toolTip: {
        shared: true
    },
    legend: {
        cursor: "pointer",
        itemclick: function (e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
    },
    data: [{
        type: "line",
        name: "Followers",
        color: "#F7C705",
        toolTipContent: "{name}: {y}",
        showInLegend: true,
        markerType: "circle",  // Set marker type to circle
        markerSize: 8,         // Adjust marker size
        yValueFormatString: "#,###.##",
        dataPoints: followersDataPoints.value
    },
    {
        type: "line",
        name: "Following",
        color: "#012066",
        toolTipContent: "{name}: {y}",
        showInLegend: true,
        markerType: "circle",  // Set marker type to circle
        markerSize: 8,         // Adjust marker size
        yValueFormatString: "#,###.##",
        dataPoints: followingDataPoints.value
    },{
        type: "line",
        name: "Media",
        color: "#08912A",
        toolTipContent: "{name}: {y}",
        showInLegend: true,
        markerType: "circle",  // Set marker type to circle
        markerSize: 8,         // Adjust marker size
        yValueFormatString: "#,###.##",
        dataPoints: mediaDataPoints.value
    },{
        type: "line",
        name: "Statuses",
        color: "#AA0738",
        toolTipContent: "{name}: {y}",
        showInLegend: true,
        markerType: "circle",  // Set marker type to circle
        markerSize: 8,         // Adjust marker size
        yValueFormatString: "#,###.##",
        dataPoints: statusDataPoints.value
    },]
})

const dateIcon = ref(null)
const dateRangeTxt = ref('')
const dateRange = ref(null)
const limitDate = (date) => {
    const currentDate = dayjs().format('YYYY/MM/DD')
    return currentDate > date
}
const dateFocus = () => {
    dateIcon.value?.$el.click()
}
const updateDate = () => {
    const dateString = JSON.stringify(dateRange.value).replace(/[{}"]/g, '').replace(/from:/, '').replace(/to:/, '').replace(/[,]/g, ' - ')
    dateRangeTxt.value = dateString

    // get title and dataPoints
    updateChart(chartViewOptionRef.value, followersDataPoints.value, followingDataPoints.value)
}

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

const updateView = (val) => {
    chartViewOptionRef.value = val
    updateChart(chartViewOptionRef.value, followersDataPoints.value, followingDataPoints.value)
}


const updateChart = (updateTitle, updateFollowerDataPoints, updateFollowingDataPoints) => {
    console.log('update chart')
    options.value.axisX.title = updateTitle
    options.value.data[0].dataPoints = updateFollowerDataPoints
    options.value.data[1].dataPoints = updateFollowingDataPoints
    chartInstance.value.chart.render()
}

onMounted( async () => {
    // fetch profile
    profile.value = await followerStore.handleGet(id.value)
    updateChart(chartViewOptionRef.value, followersDataPoints.value, followingDataPoints.value)
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
            <div class="q-px-md col-12">
                <q-toolbar>
                    <q-toolbar-title class="page-ttl">
                        フォロワー
                    </q-toolbar-title>
                </q-toolbar>
            </div>
            <div class="col-12 q-px-md">
                <div class="row">
                    <div class="col-12 col-sm-12 col-md-7 col-lg-8 col-xl-8 q-px-sm q-my-md">
                        <q-card>
                            <q-card-section class="row justify-between items-center q-py-md  q-px-lg">
                                <div class="common-card-ttl">アカウントの詳細</div>
                                <a :href="'https://twitter.com/'+profile.account" target="_blank" rel="noopener noreferrer">
                                    <q-btn rounded class="shadow-3 p-common-btn" label="訪問" no-caps />
                                </a>
                            </q-card-section>
                            <q-card-section class="q-px-none">
                                <div class="row q-px-lg q-gutter-md">
                                    <div class="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                        <label for="">チャートビュー</label>
                                        <q-select class="q-mt-sm" outlined dense @update:model-value="updateView" v-model="chartViewOptionRef" :options="chartViewOptions" />
                                    </div>
                                    <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                                        <label for="">期間</label>
                                        <q-input  class="q-mt-sm" @click="dateFocus" readonly v-model="dateRangeTxt" outlined dense>
                                            <template v-slot:append>
                                              <q-icon ref="dateIcon" name="event" class="cursor-pointer">
                                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                  <q-date v-model="dateRange" @update:model-value="updateDate" :options="limitDate" range>
                                                    <div class="row items-center justify-end">
                                                        <q-btn label="Cancel" color="primary" flat v-close-popup />
                                                        <q-btn label="OK" color="primary" flat @click="updateDate" v-close-popup />
                                                    </div>
                                                  </q-date>
                                                </q-popup-proxy>
                                              </q-icon>
                                            </template>
                                        </q-input>
                                    </div>
                                </div>
                                <div class="row q-px-lg q-mt-lg">
                                    <div class="col-12">
                                        <CanvasJSChart :options="options" ref="chartInstance"/>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>
                        <q-card class="q-mt-md">
                            <q-card-section>This is card</q-card-section>
                        </q-card>
                    </div>
                    <div class="col-12 col-sm-12 col-md-5 col-lg-4 col-xl-4 q-px-sm q-my-md">
                        <q-card>
                            <q-card-section>
                                <div class="row">
                                    <div class="col-12 q-mb-lg">
                                        <q-img class="profile-bg" :src="profile.bg"  no-native-menu>
                                            <img class="absolute-bottom-left q-circle profile-img" :src="profile.img">
                                        </q-img>
                                    </div>
                                    <div class="col-12 q-px-md profile-text">
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
    </div>
</template>

<style lang="scss">
.canvasjs-chart-credit {
    display: none !important;
}
</style>