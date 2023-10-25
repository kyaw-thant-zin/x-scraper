import dayjs from "dayjs";
import { ref } from "vue";
import { APP } from '@/config.js'
import { defineStore } from "pinia";
import { API } from "@/api/index.js";
import relativeTime from "dayjs/plugin/relativeTime";

import { io } from "socket.io-client";

export const useInstaStore = defineStore("insta", () => {
  const _loading = ref(false);
  const _success = ref(false);
  const _error = ref(false);
  const _instas = ref(null);
  const _insta = ref(null);
  const _createMessage = ref("データを取得中ですのでお待ちください。");

  dayjs.extend(relativeTime);
  const socket = io(APP.ACTIVE_SITE_URL);
  // const socket = io(APP.ACTIVE_SITE_URL, {
  //   path: '/xfollowers/socket.io'
  // });

  socket.on("connect", () => {
    console.log('connected to server....')
  });

  const storeLoading = (loading) => {
    _loading.value = loading;
  };

  const storeError = (error) => {
    _error.value = error;
  };

  const storeSuccess = (success) => {
    _success.value = success;
  };

  const storeRow = (data) => {
    const dumpData = {};
    dumpData.id = data.id;
    dumpData.refresh = -1;
    dumpData.name = data.name
    dumpData.account = data.account;
    dumpData.followers = data.followers;
    dumpData.following = data.following;
    dumpData.media = data.media_count;
    dumpData.tt_created_at = data.tt_created_at;
    dumpData.last_detection = dayjs(data.updateTimestamp).fromNow();
    dumpData.action = "";
    _insta.value = dumpData
  };

  const storeRows = (data) => {
    const beautifyData = []
    if (data && data != null) {
      data.forEach((element) => {
        const dumpData = {};
        dumpData.id = element.id;
        dumpData.refresh = false;
        dumpData.name = element.insta_details[0].name
        dumpData.account = element.username
        dumpData.followers = element.insta_details[0].followers
        dumpData.following = element.insta_details[0].following
        dumpData.media = element.insta_details[0].media_count
        dumpData.last_detection = dayjs(element.updateTimestamp).fromNow()
        dumpData.creation_time = element.updateTimestamp
        dumpData.action = "";
        beautifyData.push(dumpData);
      });
    }
    return beautifyData;
  };

  const storeDetail = (data) => {

    if(data && data != null) {

      let lastIndexXDetail = data?.insta_details.length - 1
      
      const profile = {
        img: data.profile_image_url,
        name: data?.insta_details[lastIndexXDetail].name,
        account: data.username,
        desc: data?.insta_details[lastIndexXDetail].description,
        following: data?.insta_details[lastIndexXDetail].following,
        followers: data?.insta_details[lastIndexXDetail].followers,
        media: data?.insta_details[lastIndexXDetail].media_count,
        chart: []
      };


      if(data?.insta_details.length > 0) {

        const latestRecordsByDate = {};
        for (const record of data.insta_details) {
          const date = dayjs(record.createTimestamp).format('YYYY-MM-DD'); // Extract the date (year-month-day)

          if (!latestRecordsByDate[date] || dayjs(latestRecordsByDate[date].createTimestamp).isBefore(record.createTimestamp)) {
            latestRecordsByDate[date] = record;
          }
        }

        const latestData = Object.values(latestRecordsByDate);
        latestData.forEach((ele) => {

          const parsedDate = dayjs(ele.createTimestamp)
          const dumpEle = {
            year: parsedDate.year(),
            month: parsedDate.format('MM'),
            dayOfWeek: parsedDate.format('ddd'),
            day: parsedDate.date(),
            date: parsedDate.format('YYYY/MM/DD'),
            y: ele.followers
          }

          profile.chart.push(dumpEle)

        })

      }

      return profile;
    }

  };

  const handleGetAll = async () => {
    storeLoading(true);
    const response = await API.insta.getAll();
    storeLoading(false);
    return storeRows(response);
  };

  const handleGet = async (id) => {
    storeLoading(true);
    const response = await API.insta.get(id);
    storeLoading(false);
    return storeDetail(response);
  };

  const handleStore = async (formData) => {
    storeLoading(true);

    socket.on("create-account", (res) => {
      _createMessage.value = res.message
    });

    const response = await API.insta.store(formData);
    if (response?.success) {
      storeSuccess(true);
    } else {
      storeError(true);
    }
    storeLoading(false);
  };

  const handleDestroy = async (id) => {
    storeLoading(true);
    const response = await API.insta.destroy(id);
    if (response?.success) {
      storeSuccess(true);
    } else {
      storeError(true);
    }
    storeLoading(false);
  };

  const handleRefreshProcess = () => {
    socket.on("refresh-account", (res) => {
      if (res?.updated && res.updated && res?.data && res.data != null) {
          storeRow(res.data)
      }
    });
  };

  const handleRefresh = async () => {
    // storeLoading(true)
    const response = await API.insta.refresh()
    if (response?.success) {
      storeSuccess(true)
    } else {
      storeError(true)
    }
    // storeLoading(false)
  };

  return {
    _instas,
    _insta,
    _success,
    _error,
    _loading,
    _createMessage,
    storeError,
    storeSuccess,
    handleGetAll,
    handleGet,
    handleStore,
    handleDestroy,
    handleRefresh,
    handleRefreshProcess,
  };
});
