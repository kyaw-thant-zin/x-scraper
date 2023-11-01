import dayjs from "dayjs";
import { ref } from "vue";
import { APP } from '@/config.js'
import { defineStore } from "pinia";
import { API } from "@/api/index.js";
import relativeTime from "dayjs/plugin/relativeTime";

import { io } from "socket.io-client";

export const useYtStore = defineStore("yt", () => {
  const _loading = ref(false);
  const _success = ref(false);
  const _error = ref(false);
  const _yts = ref(null);
  const _yt = ref(null);
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
    dumpData.name = data.tt_details[0].nickname
    dumpData.account = data.uniqueId
    dumpData.followers = data.tt_details[0].followers
    dumpData.following = data.tt_details[0].following
    dumpData.media = data.tt_details[0].media_count
    dumpData.last_detection = dayjs(data.updateTimestamp).fromNow()
    dumpData.creation_time = data.updateTimestamp
    dumpData.action = "";
    _yt.value = dumpData
  };

  const storeRows = (data) => {
    const beautifyData = []
    console.log(data)
    if (data && data != null) {
      data.forEach((element) => {
        const dumpData = {};
        dumpData.id = element.id;
        dumpData.refresh = false;
        dumpData.account = element.account
        dumpData.followers = element.yt_details[0].subscribers
        dumpData.following = element.yt_details[0].views
        dumpData.media = element.yt_details[0].media_count
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

      let lastIndexXDetail = data?.tt_details.length - 1
      
      const profile = {
        img: data.avatar,
        name: data?.tt_details[lastIndexXDetail].nickname,
        account: data.uniqueId,
        desc: data?.tt_details[lastIndexXDetail].description,
        biolink: data?.tt_details[lastIndexXDetail].biolink,
        following: data?.tt_details[lastIndexXDetail].following,
        followers: data?.tt_details[lastIndexXDetail].followers,
        likes: data?.tt_details[lastIndexXDetail].likes_count,
        friends: data?.tt_details[lastIndexXDetail].friends,
        media: data?.tt_details[lastIndexXDetail].media_count,
        chart: []
      };



      console.log(data?.tt_details)

      if(data?.tt_details.length > 0) {

        const latestRecordsByDate = {};
        for (const record of data.tt_details) {
          const date = dayjs(record.updateTimestamp).format('YYYY-MM-DD'); // Extract the date (year-month-day)

          if (!latestRecordsByDate[date] || dayjs(latestRecordsByDate[date].updateTimestamp).isBefore(record.updateTimestamp)) {
            latestRecordsByDate[date] = record;
          }
        }

        const latestData = Object.values(latestRecordsByDate);
        latestData.forEach((ele) => {

          const parsedDate = dayjs(ele.updateTimestamp)
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
    const response = await API.yt.getAll();
    storeLoading(false);
    return storeRows(response);
  };

  const handleGet = async (id) => {
    storeLoading(true);
    const response = await API.tt.get(id);
    storeLoading(false);
    return storeDetail(response);
  };

  const handleStore = async (formData) => {
    storeLoading(true);

    socket.on("create-account-tt", (res) => {
      _createMessage.value = res.message
    });

    const response = await API.tt.store(formData);
    console.log(response)
    if (response?.success) {
      storeSuccess(true);
    } else {
      storeError(true);
    }
    storeLoading(false);
  };

  const handleDestroy = async (id) => {
    storeLoading(true);
    const response = await API.tt.destroy(id);
    if (response?.success) {
      storeSuccess(true);
    } else {
      storeError(true);
    }
    storeLoading(false);
  };

  const handleRefreshProcess = () => {
    socket.on("refresh-account-tt", (res) => {
      console.log(res)
      if (res?.updated && res.updated && res?.data && res.data != null) {
        storeRow(res.data)
      }
    });
  };

  const handleRefreshAll = async () => {
    // storeLoading(true)
    const response = await API.tt.refreshAll()
    if (response?.success) {
      storeSuccess(true)
    } else {
      storeError(true)
    }
    // storeLoading(false)
  };

  const handleRefresh = async (account) => {
    // storeLoading(true)
    const response = await API.tt.refresh(account)
    if (response?.success) {
      storeSuccess(true)
    } else {
      storeError(true)
    }
    // storeLoading(false)
  };

  return {
    _yts,
    _yt,
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
    handleRefreshAll,
    handleRefreshProcess,
  };
});
