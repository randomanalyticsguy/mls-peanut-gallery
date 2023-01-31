<script lang="ts" setup>
import { ref, onMounted, provide, computed } from 'vue'
import Reddit from "../support/Reddit"

const authed_reddit = ref<Reddit>()

provide('reddit', computed(() => {
  return authed_reddit.value;
}))


onMounted(async () => {
  if(await Reddit.isAuthed()){
    authed_reddit.value = new Reddit();
  }
})

</script>
<template>
  <div v-if="authed_reddit">
    <slot></slot>
    <button @click="Reddit.logout().then(v => authed_reddit = undefined)">Logout</button>
  </div>
  <div v-else>
    <button @click="Reddit.auth().then(v => authed_reddit = new Reddit())">Login to Reddit</button>
  </div>
</template>