<template>
  <view class="container">
    <!-- 日期选择 -->
    <view class="date-section">
      <text class="section-label">记录日期</text>
      <picker mode="date" :value="date" @change="onDateChange">
        <view class="date-picker">
          <text class="date-text">{{ date }}</text>
          <text class="date-arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 身体状况标签 -->
    <view class="tags-section">
      <text class="section-label">身体状况</text>
      <view v-for="group in CONDITION_TAG_GROUPS" :key="group.group" class="tag-group">
        <text class="group-title">{{ group.group }}</text>
        <view class="tag-list">
          <view
            v-for="tag in group.tags"
            :key="tag"
            class="tag-item"
            :class="{ active: selectedConditions.includes(tag) }"
            @click="toggleTag(tag)"
          >
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 自定义标签 -->
      <view v-if="customTags.length > 0" class="tag-group">
        <text class="group-title">自定义标签</text>
        <view class="tag-list">
          <view
            v-for="tag in customTags"
            :key="tag"
            class="tag-item"
            :class="{ active: selectedConditions.includes(tag) }"
            @click="toggleTag(tag)"
          >
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 添加自定义标签 -->
      <view class="custom-tag-input">
        <input
          v-model="newCustomTag"
          class="tag-input"
          placeholder="输入自定义标签"
          maxlength="10"
        />
        <view class="add-btn" @click="addCustomTag">
          <text class="add-btn-text">添加</text>
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="note-section">
      <text class="section-label">备注</text>
      <textarea
        v-model="note"
        class="note-textarea"
        placeholder="记录一下今天的身体感受..."
        maxlength="200"
      />
      <text class="note-count">{{ note.length }}/200</text>
    </view>

    <!-- 保存按钮 -->
    <view class="save-btn" @click="onSave">
      <text class="save-btn-text">保存记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { CONDITION_TAG_GROUPS, DEFAULT_CONDITION_TAGS } from '@/constants/tags'
import { createRecord } from '@/services/health'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'

const date = ref(getTodayDate())
const selectedConditions = ref<string[]>([])
const customTags = ref<string[]>([])
const newCustomTag = ref('')
const note = ref('')

function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function onDateChange(e: { detail: { value: string } }) {
  date.value = e.detail.value
}

function toggleTag(tag: string) {
  const index = selectedConditions.value.indexOf(tag)
  if (index > -1) {
    selectedConditions.value.splice(index, 1)
  } else {
    selectedConditions.value.push(tag)
  }
}

function addCustomTag() {
  const tag = newCustomTag.value.trim()
  if (!tag) {
    uni.showToast({ title: '请输入标签名称', icon: 'none' })
    return
  }
  if (customTags.value.includes(tag) || DEFAULT_CONDITION_TAGS.includes(tag)) {
    uni.showToast({ title: '标签已存在', icon: 'none' })
    return
  }
  customTags.value.push(tag)
  selectedConditions.value.push(tag)
  setStorage(STORAGE_KEYS.CUSTOM_CONDITION_TAGS, customTags.value)
  newCustomTag.value = ''
}

function onSave() {
  if (selectedConditions.value.length === 0) {
    uni.showToast({ title: '请至少选择一个身体状况标签', icon: 'none' })
    return
  }

  createRecord({
    date: date.value,
    conditions: [...selectedConditions.value],
    note: note.value.trim(),
  })

  uni.showToast({
    title: '保存成功',
    icon: 'success',
    success: () => {
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 1500)
    },
  })
}

onLoad(() => {
  customTags.value = getStorage<string[]>(STORAGE_KEYS.CUSTOM_CONDITION_TAGS, [])
})
</script>

<style scoped>
.container {
  padding: 30rpx;
  background-color: #f8f8f8;
  min-height: 100%;
}

.section-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.date-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #eee;
}

.date-text {
  font-size: 32rpx;
  color: #333;
}

.date-arrow {
  font-size: 24rpx;
  color: #999;
}

.tags-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.tag-group {
  margin-bottom: 30rpx;
}

.group-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
  display: block;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  border: 2rpx solid #ddd;
  background-color: #fff;
}

.tag-item.active {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.tag-text {
  font-size: 26rpx;
  color: #666;
}

.tag-item.active .tag-text {
  color: #fff;
}

.custom-tag-input {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.tag-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 36rpx;
  font-size: 28rpx;
  background-color: #f8f8f8;
}

.add-btn {
  padding: 16rpx 32rpx;
  background-color: #4CAF50;
  border-radius: 36rpx;
}

.add-btn-text {
  font-size: 28rpx;
  color: #fff;
}

.note-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.note-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #f8f8f8;
  box-sizing: border-box;
}

.note-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 12rpx;
  display: block;
}

.save-btn {
  margin-top: 40rpx;
  margin-bottom: 60rpx;
  padding: 28rpx 0;
  background-color: #4CAF50;
  border-radius: 44rpx;
  text-align: center;
}

.save-btn-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}
</style>
