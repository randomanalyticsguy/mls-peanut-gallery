<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps({
  comment: Object
});

// need to decode the html from the reddit comment
const htmlDecode = (input:string) => {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

</script>
<template>
  <div>
    <span>{{ comment?.author }} @ {{ (new Date(comment?.created_utc * 1000)).toLocaleString() }}</span><br />
    <div v-html="htmlDecode(comment?.body_html)" />
  </div>
</template>

<style>
  span {
    color: #ffffff;
  }
</style>