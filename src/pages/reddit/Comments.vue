<script lang="ts" setup>
import { ref, onMounted, defineProps } from 'vue'

import Reddit from '../../support/Reddit';

const props = defineProps({
  article_id: String
})

const reddit = new Reddit();

onMounted(async () => {
  console.log(props.article_id)
})


</script>
<template>
  <div>
    comments for {{ props.article_id }} go here
  </div>
</template>