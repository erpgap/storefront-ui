<script lang="ts" setup>
// eslint-disable-next-line camelcase
const route = useRoute();

const story = await useAsyncStoryblok(
  route.path,
  { version: 'draft' },
  { resolveRelations: [], resolveLinks: 'url', customParent: 'http://localhost:3000' },
);

if (story.value.status) {
  throw createError({
    statusCode: story.value.status,
    statusMessage: story.value.response,
  });
}
</script>
<template>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>
