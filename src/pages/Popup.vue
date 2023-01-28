<script lang="ts" setup>
import { ref } from 'vue'
import reddit from "../support/Reddit"
import Listing from '../support/Listing';

const Reddit = new reddit();
const is_logged_in = ref(false);
const has_active_listing = ref(false);
const matched_active_listing_url = ref('');
const matched_active_listing = ref();
const current_image = ref('');

(async () => {
  is_logged_in.value = await Reddit.isAuthed();
  has_active_listing.value = await Listing.has_active_listing();
  try {
    let active_listing = await Listing.active_listing;
    let matched = await Reddit.hasListing(active_listing);
    if(matched){
      console.log(matched) // build frontend interface off this bad boy here?
      matched_active_listing.value = matched;
      matched_active_listing_url.value = "https://reddit.com" + matched.data.permalink
    } else {
      current_image.value = active_listing.mainImage // why not ig
    }
    
  } catch (e){
    console.error(e)
  }
})();
</script>

<template>
  <div v-if="is_logged_in">
    <div v-if="has_active_listing">
      <div v-if="matched_active_listing">
        <p>Other people are talking about this listing!</p>
        <p>TODO: Frontend Interface</p>
        <p><a :href="matched_active_listing_url">Click here to view what they're saying!</a></p>
      </div>
      <div v-else>
        <p>Looks like you're the first r/MLSPeanutGallery member to look at this listing!</p>
        <p>Would you like to post it?</p>
        <img :src="current_image" style="width: 100%;"/><br />
        <button @click="Reddit.post()">Share this listing to r/MLSPeanutGallery</button>
      </div>
    </div>
    <div v-else>
      In order to use this extension, go to a listing on Zillow.com.
    </div>
    
    <button @click="Reddit.logout().then(v => is_logged_in = false)">Logout</button>
  </div>
  <div v-else>
    <button @click="Reddit.auth().then(v => is_logged_in = v)">Login to Reddit</button>
  </div>
</template>

<style>
html,
body {
  width: 300px;
  height: 400px;
  padding: 0;
  margin: 0;
}

body {
  background-color: rgb(36, 36, 36);
}

body > div {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

img {
  width: 200px;
  height: 200px;
}

h1 {
  font-size: 18px;
  color: white;
  font-weight: bold;
  margin: 0;
}

p {
  color: white;
  opacity: 0.7;
  margin: 0;
}

code {
  font-size: 12px;
  padding: 2px 4px;
  background-color: #ffffff24;
  border-radius: 2px;
}
</style>
