<script lang="ts" setup>
import { reactive, ref, onMounted, defineProps } from 'vue'
import Comment from './Comment.vue';

import Reddit from '../../support/Reddit';

const props = defineProps({
  article_id: String
})

const post = ref({} as any);
const comments = reactive([] as Array<any>);

const reddit = new Reddit();

onMounted(async () => {
  if(props.article_id){
    let found = await reddit.loadComments(props.article_id);
    post.value = found.post;
    // we don't need the stats post, and that's a formatted markdown which is thicc in the interface
    found.comments.filter((c:any) => !c.body.startsWith('## Stats')).forEach((c:any) => comments.push(c))
  }
})


</script>
<template>
  <div>
    <p><a :href="'https://reddit.com' + post?.permalink" target="_blank">Click here</a> to view this post on Reddit.</p>
    <div class="comments-div" v-if="comments.length > 0">
      <Comment v-for="comment in comments" :comment="comment" :key="comment.id"/>
    </div>
    <div v-else>
      <p>Looks like nobody has commented on this post, you can be the first!</p>
    </div>
  </div>
</template>

<style>
.comments-div {
  max-height: 80vh;
  overflow-y: scroll;
}
</style>