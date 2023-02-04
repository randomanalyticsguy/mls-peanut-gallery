<script lang="ts" setup>
import { ref, onMounted, provide, computed } from 'vue'
import Reddit from "../support/Reddit"

const authed_reddit = ref<Reddit>()

// wish I could get provide working, would be cool, but eh
/*
provide('reddit', computed(() => {
  return authed_reddit.value;
}))
*/

const setAuthed = (val:boolean) => {
  authed_reddit.value = val ? new Reddit() : undefined;
}

onMounted(async () => {
  if(await Reddit.isAuthed()){
    setAuthed(true);
  }
})

</script>
<template>
  <div v-if="authed_reddit">
    <slot></slot>
    <button @click="Reddit.logout().then(v => setAuthed(false))">Logout</button>
  </div>
  <div v-else>
    <p>
      Welcome to the MLS Peanut Gallery web extension! <br /><br />
      You'll need to connect your Reddit account to get started.
    </p>
    <button @click="Reddit.auth().then(v => setAuthed(true))">Login to Reddit</button>
  </div>
</template>