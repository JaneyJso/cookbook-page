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
        <text class="group-title">自定义标签（长按删除）</text>
        <view class="tag-list">
          <view
            v-for="tag in customTags"
            :key="tag"
            class="tag-item"
            :class="{ active: selectedConditions.includes(tag) }"
            @click="toggleTag(tag)"
            @longpress="deleteCustomTag(tag)"
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

    <!-- 身体状况对应食材推荐管理 -->
    <view v-if="selectedConditions.length > 0" class="ingredients-section">
      <text class="section-label">对应食材推荐</text>
      <view v-for="condition in selectedConditions" :key="condition" class="condition-ingredients-group">
        <text class="condition-name">{{ condition }}</text>
        <view class="ingredient-list">
          <view
            v-for="item in getConditionIngredients(condition)"
            :key="item"
            class="ingredient-item"
            :class="{ custom: isCustomIngredient(condition, item) }"
            @longpress="isCustomIngredient(condition, item) && removeCustomIngredient(condition, item)"
          >
            <text class="ingredient-text">{{ item }}</text>
          </view>
        </view>
        <view class="ingredient-add-row">
          <input
            class="ingredient-add-input"
            v-model="ingredientInputs[condition]"
            :placeholder="`添加${condition}推荐食材`"
            @confirm="addCustomIngredient(condition)"
          />
          <view class="ingredient-add-btn" @click="addCustomIngredient(condition)">
            <text class="add-btn-text">+</text>
          </view>
        </view>
      </view>
      <text class="ingredients-tip">自定义食材长按可删除</text>
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
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { CONDITION_TAG_GROUPS, DEFAULT_CONDITION_TAGS, CONDITION_INGREDIENTS } from '@/constants/tags'
import { createRecord } from '@/services/health'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'

const date = ref(getTodayDate())
const selectedConditions = ref<string[]>([])
const customTags = ref<string[]>([])
const newCustomTag = ref('')
const note = ref('')

// 自定义身体状况食材映射
const customConditionIngredients = ref<Record<string, string[]>>(
  getStorage<Record<string, string[]>>(STORAGE_KEYS.CUSTOM_CONDITION_INGREDIENTS, {})
)
const ingredientInputs = reactive<Record<string, string>>({})

function getConditionIngredients(condition: string): string[] {
  const preset = CONDITION_INGREDIENTS[condition] || []
  const custom = customConditionIngredients.value[condition] || []
  return [...preset, ...custom]
}

function isCustomIngredient(condition: string, item: string): boolean {
  const list = customConditionIngredients.value[condition]
  return !!list && list.includes(item)
}

function addCustomIngredient(condition: string) {
  const val = (ingredientInputs[condition] || '').trim()
  if (!val) return
  const preset = CONDITION_INGREDIENTS[condition] || []
  if (!customConditionIngredients.value[condition]) {
    customConditionIngredients.value[condition] = []
  }
  if (preset.includes(val) || customConditionIngredients.value[condition].includes(val)) {
    uni.showToast({ title: '食材已存在', icon: 'none' })
    return
  }
  customConditionIngredients.value[condition].push(val)
  setStorage(STORAGE_KEYS.CUSTOM_CONDITION_INGREDIENTS, customConditionIngredients.value)
  ingredientInputs[condition] = ''
  uni.showToast({ title: `已添加「${val}」`, icon: 'none', duration: 1000 })
}

function removeCustomIngredient(condition: string, item: string) {
  const list = customConditionIngredients.value[condition]
  if (list) {
    const idx = list.indexOf(item)
    if (idx > -1) {
      list.splice(idx, 1)
      setStorage(STORAGE_KEYS.CUSTOM_CONDITION_INGREDIENTS, customConditionIngredients.value)
      uni.showToast({ title: `已删除「${item}」`, icon: 'none', duration: 1000 })
    }
  }
}

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

function deleteCustomTag(tag: string) {
  const idx = customTags.value.indexOf(tag)
  if (idx > -1) {
    customTags.value.splice(idx, 1)
    setStorage(STORAGE_KEYS.CUSTOM_CONDITION_TAGS, customTags.value)
  }
  const selIdx = selectedConditions.value.indexOf(tag)
  if (selIdx > -1) {
    selectedConditions.value.splice(selIdx, 1)
  }
  uni.showToast({ title: `已删除「${tag}」`, icon: 'none', duration: 1000 })
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

/* 食材推荐管理 */
.ingredients-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.condition-ingredients-group {
  margin-bottom: 30rpx;
}

.condition-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #FF9800;
  margin-bottom: 14rpx;
  display: block;
}

.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 14rpx;
}

.ingredient-item {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  border: 2rpx solid #e0e0e0;
  background-color: #fafafa;
  display: flex;
  align-items: center;
}

.ingredient-item.custom {
  border-style: dashed;
  border-color: #FF9800;
}

.ingredient-text {
  font-size: 24rpx;
  color: #666;
}

.custom-mark {
  font-size: 18rpx;
  color: #FF9800;
  margin-left: 4rpx;
}

.ingredient-add-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.ingredient-add-input {
  flex: 1;
  height: 64rpx;
  padding: 0 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 32rpx;
  font-size: 26rpx;
  background-color: #f8f8f8;
}

.ingredient-add-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FF9800;
  border-radius: 50%;
}

.ingredient-add-btn .add-btn-text {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.ingredients-tip {
  font-size: 20rpx;
  color: #bbb;
  display: block;
}
</style>
