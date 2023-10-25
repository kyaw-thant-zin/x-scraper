import dayjs from "dayjs";
import { ref } from "vue";
import { APP } from '@/config.js'
import { defineStore } from "pinia";
import { API } from "@/api/index.js";
import relativeTime from "dayjs/plugin/relativeTime";

import { io } from "socket.io-client";

export const useXStore = defineStore("x", () => {
  const _loading = ref(false);
  const _success = ref(false);
  const _unique = ref(false)
  const _error = ref(false);
  const _followers = ref(null);
  const _follower = ref(null);
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

  const storeUnique = (unique) => {
    _unique.value = unique;
  };

  const storeSuccess = (success) => {
    _success.value = success;
  };

  const storeRow = (data) => {
    const dumpData = {};
    dumpData.id = data.id;
    dumpData.refresh = -1;
    dumpData.name = data?.x_details[0].name
    dumpData.account = data.account;
    dumpData.followers = data?.x_details[0].followers;
    dumpData.following = data?.x_details[0].following;
    dumpData.media = data?.x_details[0].media_count;
    dumpData.tt_created_at = data.tt_created_at;
    dumpData.last_detection = dayjs(data.updateTimestamp).fromNow();
    dumpData.action = "";
    _follower.value = dumpData
  };

  const storeRows = (data) => {
    const beautifyData = [];
    if (data != null) {
      data.forEach((element) => {
        const dumpData = {};
        dumpData.id = element.id;
        dumpData.refresh = false;
        dumpData.name = element?.x_details[0].name
        dumpData.account = element.account;
        dumpData.followers = element?.x_details[0].followers;
        dumpData.following = element?.x_details[0].following;
        dumpData.media = element?.x_details[0].media_count;
        dumpData.tt_created_at = element.tt_created_at;
        dumpData.last_detection = dayjs(element.updateTimestamp).fromNow();
        dumpData.creation_time = element.updateTimestamp
        dumpData.action = "";
        beautifyData.push(dumpData);
      });
    }
    return beautifyData;
  };

  const storeDetail = (data) => {

    if(data && data != null) {
      let lastIndexXDetail = data?.x_details.length - 1

      const profile = {
        bg: data?.profile_banner_url,
        img: data?.profile_image_url_https,
        name: data?.x_details[lastIndexXDetail].name,
        account: data?.account,
        desc: data?.x_details[lastIndexXDetail].description,
        following: data?.x_details[lastIndexXDetail].following,
        followers: data?.x_details[lastIndexXDetail].followers,
        friends: data?.x_details[lastIndexXDetail].friends,
        media: data?.x_details[lastIndexXDetail].media_count,
        statuses: data?.x_details[lastIndexXDetail].statuses_count,
        joined: data?.tt_created_at,
        chart: []
      };

      if(data?.x_details.length > 0) {
        
        const latestRecordsByDate = {};
        for (const record of data.x_details) {
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

    return null
  };

  const handleGetAll = async () => {
    storeLoading(true);
    const response = await API.followers.getAll()
    storeLoading(false);
    return storeRows(response);
  };

  const handleGet = async (id) => {
    storeLoading(true);
    const response = await API.followers.get(id);
    storeLoading(false);
    return storeDetail(response);
  };

  const handleStore = async (formData) => {
    storeLoading(true);

    socket.on("create-account", (res) => {
      _createMessage.value = res.message
    });

    const response = await API.followers.store(formData);
    if (response?.success) {
      storeSuccess(true);
    } else {
      storeError(true);
    }

    if(response?.unique) {
      storeUnique(true)
    } else {
      storeUnique(false)
    }

    storeLoading(false);
  };

  const handleDestroy = async (id) => {
    storeLoading(true);
    const response = await API.followers.destroy(id);
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

  const handleRefreshAll = async () => {
    // storeLoading(true)
    const response = await API.followers.refreshAll()
    if (response?.success) {
      storeSuccess(true)
    } else {
      storeError(true)
    }
    // storeLoading(false)
  };

  const handleRefresh = async (account) => {
    // storeLoading(true)
    const response = await API.followers.refresh(account)
    if (response?.success) {
      storeSuccess(true)
    } else {
      storeError(true)
    }
    // storeLoading(false)
  };

  return {
    _followers,
    _follower,
    _success,
    _unique,
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
