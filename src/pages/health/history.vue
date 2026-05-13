<template>
  <view class="container">
    <view v-if="records.length > 0" class="record-list">
      <view
        v-for="record in records"
        :key="record.id"
        class="record-card"
        @longpress="onLongPress(record.id)"
      >
        <view class="record-header">
          <text class="record-date">{{ formatDate(record.date) }}</text>
          <text class="delete-btn" @click="onDelete(record.id)">删除</text>
        </view>
        <view class="record-tags">
          <view v-for="tag in record.conditions" :key="tag" class="record-tag">
            <text class="record-tag-text">{{ tag }}</text>
          </view>
        </view>
        <view v-if="record.note" class="record-note">
          <text class="record-note-text">{{ record.note }}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-text">暂无记录，去记录一下今天的身体状况吧</text>
      <view class="empty-btn" @click="goToRecord">
        <text class="empty-btn-text">去记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAllRecords, deleteRecord } from '@/services/health'
import type { HealthRecord } from '@/types/health'

const records = ref<HealthRecord[]>([])

function loadRecords() {
  const all = getAllRecords()
  records.value = all.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

function onDelete(id: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    success: (res) => {
      if (res.confirm) {
        deleteRecord(id)
        loadRecords()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    },
  })
}

function onLongPress(id: string) {
  onDelete(id)
}

function goToRecord() {
  uni.switchTab({ url: '/pages/health/record' })
}

onShow(() => {
  loadRecords()
})
</script>

<style scoped>
.container {
  padding: 30rpx;
  background-color: #f8f8f8;
  min-height: 100%;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.record-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.record-date {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.delete-btn {
  font-size: 26rpx;
  color: #ff5252;
  padding: 8rpx 16rpx;
}

.record-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.record-tag {
  padding: 8rpx 20rpx;
  background-color: #e8f5e9;
  border-radius: 28rpx;
}

.record-tag-text {
  font-size: 24rpx;
  color: #4CAF50;
}

.record-note {
  padding-top: 16rpx;
  border-top: 2rpx solid #f0f0f0;
}

.record-note-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.empty-btn {
  padding: 20rpx 60rpx;
  background-color: #4CAF50;
  border-radius: 40rpx;
}

.empty-btn-text {
  font-size: 30rpx;
  color: #fff;
}
</style>
