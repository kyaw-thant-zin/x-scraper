<script setup>
import dayjs from "dayjs"
import Chart from 'chart.js/auto'
import { APP } from '@/config.js'
import { useQuasar } from 'quasar'
import { ref, computed, onMounted } from 'vue'
import { useTtStore } from '@/stores/Tt'


import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const $q = useQuasar()
const ttStore = useTtStore()
const id = computed(() => APP.decryptID(ttStore.router.currentRoute._value.params.id.toString()))

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
const chartViewOptions = [ '今週', '今月', '週ごと', '月ごと' ]
const followersDataPoints = ref([])
let chart = null

const dateIcon = ref(null)
const dateRangeTxt = ref('')
const dateRangeObj = ref({
    start: null,
    end: null
})
const dateRange = ref(null)
const limitDate = (date) => {
    const currentDate = dayjs().format('YYYY/MM/DD')
    return currentDate >= date
}
const dateFocus = () => {
    dateIcon.value?.$el.click()
}
const updateDate = () => {
    const dateString = JSON.stringify(dateRange.value).replace(/[{}"]/g, '').replace(/from:/, '').replace(/to:/, '').replace(/[,]/g, ' - ')
    const dateArray = JSON.stringify(dateRange.value).replace(/[{}"]/g, '').replace(/from:/, '').replace(/to:/, '').split(',')
    dateRangeTxt.value = dateString
    dateRangeObj.value.start = dateArray[0]
    dateRangeObj.value.end = dateArray[1]
    // get title and dataPoints
    updateChart(chartViewOptionRef.value, true)
}

const profile = ref({
    bg: '',
    img: '',
    name: '',
    account: '',
    desc: '',
    following: '',
    followers: '',
    media: '',
    chart: ''
})

const updateView = (val) => {
    chartViewOptionRef.value = val
    dateRangeTxt.value = ''
    updateChart(chartViewOptionRef.value, false)
}


const updateChart = (updateTitle, custom) => {
    console.log('update chart')

    followersDataPoints.value = []

    if(!custom) {

        const currentDate = dayjs()
        const currentMonth = dayjs().month()
        const startOfWeek = currentDate.startOf('week')
        const endOfWeek = currentDate.endOf('week')
        const startOfMonth = currentDate.startOf('M')
        const endOfMonth = currentDate.endOf('M')
        const startOfYear = currentDate.startOf('y')
        const endOfYear = currentDate.endOf('y')

        if(updateTitle == '今週') { // this week
            const dataInCurrentWeek = profile.value.chart.filter(dateObj => {
                const date = dayjs(dateObj.date, 'YYYY/MM/DD')
                return date.isSameOrAfter(startOfWeek) && date.isSameOrBefore(endOfWeek)
            })

            if(dataInCurrentWeek && dataInCurrentWeek.length > 0) {
                dataInCurrentWeek.forEach((ele) => {
                    const dumpData = {
                        'label': ele.month+'/'+ele.day,
                        'y': Number(ele.y)
                    }
                    followersDataPoints.value.push(dumpData)
                })
            }

        } else if(updateTitle == '今月') { // this month
            const dataInCurrentMonth = profile.value.chart.filter(dateObj => {
                const date = dayjs(dateObj.date, 'YYYY/MM/DD')
                return date.isSameOrAfter(startOfMonth) && date.isSameOrBefore(endOfMonth)
            })

            if(dataInCurrentMonth && dataInCurrentMonth.length > 0) {
                dataInCurrentMonth.forEach((ele) => {
                    const dumpData = {
                        'label': ele.month+'/'+ele.day,
                        'y': Number(ele.y)
                    }
                    followersDataPoints.value.push(dumpData)
                })
            }
        } else if(updateTitle == '週ごと') { // weekly
            const weeklyDataPoints = {}
            // Group data by week
            profile.value.chart.forEach(dateObj => {
                const date = dayjs(dateObj.date, 'YYYY/MM/DD')
                const weekStart = date.startOf('week').format('YYYY/MM/DD')
                
                if (!weeklyDataPoints[weekStart] || date.isAfter(dayjs(weeklyDataPoints[weekStart].date, 'YYYY/MM/DD'))) {
                    weeklyDataPoints[weekStart] = {
                        label: date.format('MM/DD'),
                        y: Number(dateObj.y),
                    }
                }
            })
            // Convert the grouped data to an array
            const weeksInCurrentMonth = Object.values(weeklyDataPoints)
            followersDataPoints.value = weeksInCurrentMonth
            
        } else if(updateTitle == '月ごと') { // by month

        }
    } else {
        const startOfCustom = dayjs(dateRangeObj.value.start, 'YYYY/MM/DD')
        const endOfCustom = dayjs(dateRangeObj.value.end, 'YYYY/MM/DD')
        const dataInCustom = profile.value.chart.filter(dateObj => {
            const date = dayjs(dateObj.date, 'YYYY/MM/DD')
            return date.isSameOrAfter(startOfCustom) && date.isSameOrBefore(endOfCustom)
        })

        if(dataInCustom && dataInCustom.length > 0) {
            dataInCustom.forEach((ele) => {
                const dumpData = {
                    'label': ele.month+'/'+ele.day,
                    'y': Number(ele.y)
                }
                followersDataPoints.value.push(dumpData)
            })
        }
    }

    if(chart != null) {
        chart.data.labels = followersDataPoints.value.map(row => row.label)
        chart.data.datasets[0].data = followersDataPoints.value.map(row => row.y)
        chart.update();
    }

}

onMounted( async () => {
    // fetch profile
    profile.value = await ttStore.handleGet(id.value)
    updateChart(chartViewOptionRef.value)

    chart = new Chart(
        chartInstance.value,
        {
            type: 'line',
            data: {
                labels: followersDataPoints.value.map(row => row.label),
                datasets: [
                    {
                        label: 'フォロワー',
                        data: followersDataPoints.value.map(row => row.y),
                        fill: false,
                        borderColor: '#AFAFAF',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        suggestedMin: -1,  // Adjust to create spacing at the start
                        suggestedMax: 5,  // Adjust to create spacing at the end
                        ticks: {
                            stepSize: 1,
                            autoSkip: false,
                            maxRotation: 45,  // Rotate labels by 45 degrees
                            minRotation: 45   // Rotate labels by 45 degrees
                        }
                    },
                    y: {
                        
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'フォロワーのチャート'
                    },
                }
            },
        }
    )

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
                    <div class="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8 q-px-sm q-my-md">
                        <q-card>
                            <q-card-section class="row justify-between items-center q-py-md  q-px-lg">
                                <div class="common-card-ttl">アカウントの詳細</div>
                                <a :href="'https://tiktok.com/@'+profile.account" target="_blank" rel="noopener noreferrer">
                                    <q-btn rounded class="shadow-3 p-common-btn" label="訪問" no-caps />
                                </a>
                            </q-card-section>
                            <q-card-section class="q-px-none">
                                <div class="row q-px-lg q-gutter-md">
                                    <div class="col-12 col-sm-3 col-md-4 col-lg-2 col-xl-2">
                                        <label for="">チャートビュー</label>
                                        <q-select class="q-mt-sm" outlined dense @update:model-value="updateView" v-model="chartViewOptionRef" :options="chartViewOptions" />
                                    </div>
                                    <div class="col-12 col-sm-8 col-md-4 col-lg-3 col-xl-2">
                                        <label for="">期間</label>
                                        <q-input  class="q-mt-sm" @click="dateFocus" readonly v-model="dateRangeTxt" outlined dense>
                                            <template v-slot:append>
                                              <q-icon ref="dateIcon" name="event" class="cursor-pointer">
                                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                  <q-date v-model="dateRange" :options="limitDate" range>
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
                                        <!-- <CanvasJSChart :options="options" ref="chartInstance"/> -->
                                        <canvas ref="chartInstance"></canvas>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>
                    </div>
                    <div class="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 q-px-sm q-my-md">
                        <q-card>
                            <q-card-section>
                                <div class="row justify-center">
                                    <div class="col-6 col-sm-4 col-md-6 col-lg-4 col-xl-4 q-mb-md">
                                        <q-img class="q-circle shadow-2" :src="profile.img"  no-native-menu></q-img>
                                    </div>
                                    <div class="col-12 q-px-md q-mt-md">
                                        <div class="text-h6 text-weight-bolder">{{ profile.name }}</div>
                                        <p class="text-caption">@{{ profile.account }}</p>
                                        <p class="text-body2">{{ profile.desc }}</p>
                                        <p class="text-body2">{{ profile.biolink }}</p>
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
                                                    <q-item-label lines="1">Likes</q-item-label>
                                                </q-item-section>
            
                                                <q-item-section side>{{ profile.likes }}</q-item-section>
                                            </q-item>
                                            <q-separator spaced />
                                            <q-item>
                                                <q-item-section>
                                                    <q-item-label lines="1">Media</q-item-label>
                                                </q-item-section>
            
                                                <q-item-section side>{{ profile.media }}</q-item-section>
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