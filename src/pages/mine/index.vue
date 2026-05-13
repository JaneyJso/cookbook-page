<template>
  <view class="container">
    <!-- 顶部用户信息区 -->
    <view class="header">
      <view class="logo">🍽️</view>
      <view class="app-name">食之有道</view>
      <view class="slogan">量身定制，吃出健康</view>
    </view>

    <!-- 数据统计卡片区 -->
    <view class="stats-section">
      <view class="stats-card">
        <view class="stats-num">{{ recipeCount }}</view>
        <view class="stats-label">菜谱总数</view>
      </view>
      <view class="stats-card">
        <view class="stats-num">{{ recordCount }}</view>
        <view class="stats-label">健康记录总数</view>
      </view>
      <view class="stats-card">
        <view class="stats-num">{{ monthRecordCount }}</view>
        <view class="stats-label">本月记录数</view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToHistory">
        <view class="menu-left">
          <text class="menu-icon">📋</text>
          <text class="menu-title">历史记录</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="handleExport">
        <view class="menu-left">
          <text class="menu-icon">📤</text>
          <text class="menu-title">导出数据</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="handleImport">
        <view class="menu-left">
          <text class="menu-icon">📥</text>
          <text class="menu-title">导入数据</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="handleClear">
        <view class="menu-left">
          <text class="menu-icon">🗑️</text>
          <text class="menu-title">清除所有数据</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item menu-item-last" @click="handleAbout">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-title">关于</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- H5 隐藏文件输入 -->
    <input
      v-if="isH5"
      ref="fileInputRef"
      type="file"
      accept=".json"
      class="file-input"
      @change="onFileChange"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAllRecipes } from '@/services/recipe'
import { getAllRecords, getRecordsByMonth } from '@/services/health'
import { setStorage, removeStorage, STORAGE_KEYS } from '@/utils/storage'

const recipeCount = ref(0)
const recordCount = ref(0)
const monthRecordCount = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)

const platform = uni.getSystemInfoSync().platform
const isH5 = platform === 'web' || platform === 'h5' || platform === 'devtools' && typeof window !== 'undefined'

function loadStats() {
  try {
    recipeCount.value = getAllRecipes().length
    recordCount.value = getAllRecords().length
    const now = new Date()
    monthRecordCount.value = getRecordsByMonth(now.getFullYear(), now.getMonth() + 1).length
  } catch (e) {
    console.error('加载统计数据失败:', e)
  }
}

onShow(() => {
  loadStats()
})

function goToHistory() {
  uni.navigateTo({
    url: '/pages/health/history',
  })
}

function handleExport() {
  try {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      recipes: getAllRecipes(),
      healthRecords: getAllRecords(),
    }
    const jsonStr = JSON.stringify(exportData, null, 2)

    if (isH5) {
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const dateStr = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `eat-recipe-backup-${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      uni.showToast({ title: '导出成功', icon: 'success' })
    } else {
      uni.setClipboardData({
        data: jsonStr,
        success: () => {
          uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '复制失败', icon: 'none' })
        },
      })
    }
  } catch (e) {
    console.error('导出失败:', e)
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
}

function handleImport() {
  if (isH5) {
    // H5 触发隐藏文件选择
    const input = fileInputRef.value
    if (input) {
      input.click()
    }
  } else {
    // 小程序从剪贴板读取
    uni.getClipboardData({
      success: (res) => {
        processImportData(res.data)
      },
      fail: () => {
        uni.showToast({ title: '读取剪贴板失败', icon: 'none' })
      },
    })
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result as string
    processImportData(content)
  }
  reader.onerror = () => {
    uni.showToast({ title: '读取文件失败', icon: 'none' })
  }
  reader.readAsText(file)

  // 清空 input 以便再次选择同一文件
  target.value = ''
}

function processImportData(jsonStr: string) {
  try {
    const data = JSON.parse(jsonStr)

    // 验证数据格式
    if (!data || typeof data !== 'object') {
      uni.showToast({ title: '数据格式无效', icon: 'none' })
      return
    }
    if (!data.version || !Array.isArray(data.recipes) || !Array.isArray(data.healthRecords)) {
      uni.showToast({ title: '数据格式不匹配', icon: 'none' })
      return
    }

    uni.showModal({
      title: '确认导入',
      content: '导入将覆盖现有数据，是否继续？',
      confirmColor: '#4CAF50',
      success: (res) => {
        if (res.confirm) {
          try {
            setStorage(STORAGE_KEYS.RECIPES, data.recipes)
            setStorage(STORAGE_KEYS.HEALTH_RECORDS, data.healthRecords)
            loadStats()
            uni.showToast({ title: '导入成功', icon: 'success' })
          } catch (e) {
            console.error('导入写入失败:', e)
            uni.showToast({ title: '导入失败', icon: 'none' })
          }
        }
      },
    })
  } catch (e) {
    console.error('解析 JSON 失败:', e)
    uni.showToast({ title: 'JSON 解析失败', icon: 'none' })
  }
}

function handleClear() {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有数据吗？此操作不可恢复！',
    confirmColor: '#ff4d4f',
    success: (res) => {
      if (res.confirm) {
        try {
          removeStorage(STORAGE_KEYS.RECIPES)
          removeStorage(STORAGE_KEYS.HEALTH_RECORDS)
          removeStorage(STORAGE_KEYS.CUSTOM_CONDITION_TAGS)
          loadStats()
          uni.showToast({ title: '清除成功', icon: 'success' })
        } catch (e) {
          console.error('清除失败:', e)
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    },
  })
}

function handleAbout() {
  uni.showModal({
    title: '关于',
    content: '食之有道 v1.0.0\n用心记录每一餐',
    showCancel: false,
    confirmColor: '#4CAF50',
  })
}
</script>

<style scoped>
.container {
  min-height: 100%;
  background-color: #f5f5f5;
}

/* 顶部用户信息区 */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0 60rpx;
  background: linear-gradient(180deg, #66bb6a 0%, #4caf50 100%);
}

.logo {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 44rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.slogan {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 数据统计卡片区 */
.stats-section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: -40rpx 30rpx 30rpx;
  padding: 0;
}

.stats-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx 0;
  margin: 0 10rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.stats-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #4caf50;
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 24rpx;
  color: #666666;
}

/* 功能列表 */
.menu-section {
  margin: 0 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #eeeeee;
}

.menu-item-last {
  border-bottom: none;
}

.menu-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-title {
  font-size: 30rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #cccccc;
}

/* 隐藏文件输入 */
.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}
</style>
