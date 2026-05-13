<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import './uni.scss';

/* 隐藏H5端滚动条但保留滚动功能 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* 兼容 Firefox */
html, body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 页面容器：内容不超出时不滚动，超出时自动滚动 */
html, page {
  height: 100%;
  overflow: hidden;
}

uni-page-body {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
