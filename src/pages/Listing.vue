<script lang="ts" setup>
import { ref, onMounted, provide, computed, reactive } from 'vue'
import Listing from '../support/Listing';
import Post from './reddit/Post.vue';

const active_listing = ref<Listing>()

onMounted(async () => {
  active_listing.value = await Listing.active_listing;
  if(active_listing.value){
    console.log('found a listing!', active_listing.value)
  }
});

</script>
<template>
  <div v-if="active_listing">
    <Post />
  </div>
  <div v-else>
    <p>
      This extension only works on certain pages. <br /><br />
      In order to use this extension, please visit a listing on Zillow.com.  
    </p>
  </div>
</template>