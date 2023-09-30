import dayjs from "dayjs";
import { ref } from "vue";
import { APP } from '@/config.js'
import { defineStore } from "pinia";
import { API } from "@/api/index.js";
import relativeTime from "dayjs/plugin/relativeTime";

import { io } from "socket.io-client";

export const useFollowerStore = defineStore("follower", () => {
  const _loading = ref(false);
  const _success = ref(false);
  const _error = ref(false);
  const _followers = ref(null);
  const _follower = ref(null);
  const _createMessage = ref("データを取得中ですのでお待ちください。");

  dayjs.extend(relativeTime);
  const socket = io(APP.ACTIVE_SITE_URL);

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
    _follower.value = dumpData
  };

  const storeRows = (data) => {
    const beautifyData = [];
    if (data != null) {
      data.forEach((element) => {
        const dumpData = {};
        dumpData.id = element.id;
        dumpData.refresh = false;
        dumpData.name = element.name
        dumpData.account = element.account;
        dumpData.followers = element.followers;
        dumpData.following = element.following;
        dumpData.media = element.media_count;
        dumpData.tt_created_at = element.tt_created_at;
        dumpData.last_detection = dayjs(element.updateTimestamp).fromNow();
        dumpData.action = "";
        beautifyData.push(dumpData);
      });
    }
    return beautifyData;
  };

  const storeDetail = (data) => {
    const profile = {
      bg: data?.profile_banner_url,
      img: data?.profile_image_url_https,
      name: data?.name,
      account: data?.account,
      desc: data?.description,
      following: data?.following,
      followers: data?.followers,
      friends: data?.friends,
      media: data?.media_count,
      statuses: data?.statuses_count,
      joined: data?.tt_created_at,
    };
    return profile;
  };

  const handleGetAll = async () => {
    storeLoading(true);
    const response = await API.followers.getAll();
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

  const handleRefresh = async () => {
    // storeLoading(true)
    const response = await API.followers.refresh()
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
