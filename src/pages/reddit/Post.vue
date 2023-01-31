<script lang="ts" setup>
import { ref, onMounted, computed, inject } from 'vue';
import Listing from '../../support/Listing';
import Reddit from '../../support/Reddit';

const reddit = new Reddit(); // we know it's authed here no need to inject

const active_listing = ref<Listing>()

const active_post = ref(false);

onMounted(async () => {
  active_listing.value = await Listing.active_listing;
  if(active_listing){
    active_post.value = await reddit.hasListing(active_listing.value);  
  }
});

const handleClick = () => {
  if(reddit && active_listing.value){
    reddit.post(active_listing.value)
  }
}

</script>
<template>
  <div v-if="reddit !== undefined && active_listing !== undefined">
    <div v-if="active_post">
      <p>Other people are talking about this listing!</p>
      <p>TODO: Frontend Interface</p>
    </div>
    <div v-else>
      <p>Looks like you're the first r/MLSPeanutGallery member to look at this listing!</p>
      <p>Would you like to post it?</p>
      <img :src="active_listing.mainImage" style="width: 100%;"/><br />
      <button @click="handleClick()">Share this listing to r/MLSPeanutGallery</button>   
    </div>
  </div>
</template>