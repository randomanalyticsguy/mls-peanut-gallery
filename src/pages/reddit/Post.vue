<script lang="ts" setup>
import { ref, onMounted, computed, inject } from 'vue';
import Listing from '../../support/Listing';
import Reddit from '../../support/Reddit';
import Comments from './Comments.vue';

const reddit = new Reddit(); // we know it's authed here no need to inject

const active_listing = ref<Listing>()

const active_post = ref<boolean|string>(false);
const loading = ref(false);

onMounted(async () => {
  active_listing.value = await Listing.active_listing;
  if(active_listing){
    active_post.value = await reddit.hasListing(active_listing.value);
  }
});

const handleClick = async () => {
  if(reddit && active_listing.value){
    loading.value = true;
    let postId = await reddit.post(active_listing.value);
    if(postId){
      active_post.value = true;
    }
    
    loading.value = false;
  }
}

</script>
<template>
  <div v-if="loading">
    <p>Imagine a loading spinner</p>
  </div>
  <div v-if="reddit !== undefined && active_listing !== undefined && !loading">
    <div v-if="active_post && typeof active_post == 'string'">
      <Comments :article_id="active_post" />
    </div>
    <div v-else>
      <p>Looks like you're the first r/MLSPeanutGallery member to look at this listing!</p>
      <p>Would you like to post it?</p>
      <img :src="active_listing.mainImage" style="width: 100%;"/><br />
      <button @click="handleClick()">Share this listing to r/MLSPeanutGallery</button>   
    </div>
  </div>
</template>