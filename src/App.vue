<template>
  <div id="app" class="app-page">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="stylus" scoped>
@require 'assets/style/base.styl'
initialize()

.app-page{
  width: rem(4091);
  height: rem(2160);
  background-image: url("./assets/bg.png");
  background-size: contain;
  background-repeat: no-repeat;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
