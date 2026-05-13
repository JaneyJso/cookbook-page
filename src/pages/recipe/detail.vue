<template>
  <view class="container" v-if="recipe">
    <!-- 顶部图片 -->
    <view class="image-section">
      <image
        v-if="recipe.image"
        class="recipe-image"
        :src="recipe.image"
        mode="aspectFill"
      />
      <view v-else class="image-placeholder">
        <text class="placeholder-icon">🍽️</text>
        <text class="placeholder-text">暂无图片</text>
      </view>
    </view>

    <!-- 标题 -->
    <view class="title-section">
      <text class="recipe-title">{{ recipe.name }}</text>
    </view>

    <!-- 标签区域 -->
    <view class="tags-section">
      <view class="tag-group">
        <template v-if="isAllSeasons(recipe.seasons)">
          <text class="detail-tag season-tag" style="background-color: #9C27B022; color: #9C27B0">🌍 全年</text>
        </template>
        <template v-else>
          <text
            v-for="season in recipe.seasons"
            :key="season"
            class="detail-tag season-tag"
            :style="{ backgroundColor: getSeasonColor(season) + '22', color: getSeasonColor(season) }"
          >
            {{ getSeasonEmoji(season) }} {{ season }}
          </text>
        </template>
      </view>
      <view v-if="recipe.conditions.length > 0" class="tag-group">
        <text
          v-for="condition in recipe.conditions"
          :key="condition"
          class="detail-tag condition-tag"
        >
          {{ condition }}
        </text>
      </view>
      <view v-if="recipe.tags.length > 0" class="tag-group">
        <text
          v-for="tag in recipe.tags"
          :key="tag"
          class="detail-tag custom-tag"
        >
          {{ tag }}
        </text>
      </view>
    </view>

    <!-- 食材清单 -->
    <view class="section">
      <view class="section-header">
        <text class="section-icon">🥬</text>
        <text class="section-title">食材清单</text>
      </view>
      <view class="ingredients-list">
        <view
          v-for="(item, index) in recipe.ingredients"
          :key="index"
          class="ingredient-item"
        >
          <text class="ingredient-dot">•</text>
          <text class="ingredient-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 烹饪步骤 -->
    <view class="section">
      <view class="section-header">
        <text class="section-icon">👨‍🍳</text>
        <text class="section-title">烹饪步骤</text>
      </view>
      <view class="steps-content">
        <text class="steps-text">{{ recipe.steps }}</text>
      </view>
    </view>

    <!-- 时间信息 -->
    <view class="time-section">
      <text class="time-text">创建时间：{{ formatTime(recipe.createdAt) }}</text>
      <text class="time-text">更新时间：{{ formatTime(recipe.updatedAt) }}</text>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-spacer"></view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="btn btn-edit" @click="goToEdit">
        <text class="btn-icon">✏️</text>
        <text class="btn-text">编辑</text>
      </view>
      <view class="btn btn-delete" @click="onDelete">
        <text class="btn-icon">🗑️</text>
        <text class="btn-text">删除</text>
      </view>
    </view>
  </view>

  <!-- 加载失败 -->
  <view v-else class="error-state">
    <text class="error-icon">😕</text>
    <text class="error-text">菜谱不存在或已被删除</text>
    <view class="error-btn" @click="goBack">
      <text>返回</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type { Recipe } from '@/types/recipe'
import { getRecipeById, deleteRecipe } from '@/services/recipe'
import { getSeasonColor, getSeasonEmoji, getAllSeasons } from '@/utils/season'
import type { Season } from '@/types/recipe'

const allSeasons = getAllSeasons()
function isAllSeasons(seasons: Season[]): boolean {
  return allSeasons.every(s => seasons.includes(s))
}

const recipe = ref<Recipe | null>(null)
let recipeId = ''

function loadRecipe(id: string) {
  const data = getRecipeById(id)
  if (data) {
    recipe.value = data
  } else {
    recipe.value = null
  }
}

onLoad((options) => {
  if (options?.id) {
    recipeId = options.id as string
    loadRecipe(recipeId)
  }
})

onShow(() => {
  if (recipeId) {
    loadRecipe(recipeId)
  }
})

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

function goToEdit() {
  if (!recipeId) return
  uni.navigateTo({
    url: `/pages/recipe/edit?id=${recipeId}`,
  })
}

function goBack() {
  uni.navigateBack()
}

function onDelete() {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${recipe.value?.name}」吗？`,
    confirmColor: '#f44336',
    success: (res) => {
      if (res.confirm) {
        deleteRecipe(recipeId)
        uni.showToast({
          title: '已删除',
          icon: 'success',
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 800)
      }
    },
  })
}
</script>

<style scoped>
.container {
  min-height: 100%;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 图片区域 */
.image-section {
  width: 100%;
  height: 400rpx;
  background-color: #e8f5e9;
}

.recipe-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.placeholder-text {
  font-size: 28rpx;
  color: #999;
}

/* 标题 */
.title-section {
  background-color: #fff;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.recipe-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
}

/* 标签区域 */
.tags-section {
  background-color: #fff;
  padding: 20rpx 30rpx 10rpx;
  border-bottom: 1rpx solid #eee;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.detail-tag {
  padding: 8rpx 20rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.condition-tag {
  background-color: #e3f2fd;
  color: #2196F3;
}

.custom-tag {
  background-color: #f0f0f0;
  color: #666;
}

/* 区块 */
.section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 食材列表 */
.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ingredient-item {
  display: flex;
  align-items: center;
}

.ingredient-dot {
  color: #4CAF50;
  font-size: 32rpx;
  margin-right: 12rpx;
  line-height: 1;
}

.ingredient-text {
  font-size: 28rpx;
  color: #444;
}

/* 步骤 */
.steps-content {
  background-color: #fafafa;
  border-radius: 16rpx;
  padding: 24rpx;
}

.steps-text {
  font-size: 28rpx;
  color: #444;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 时间 */
.time-section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 24rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.time-text {
  font-size: 22rpx;
  color: #999;
}

.bottom-spacer {
  height: 40rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  padding: 16rpx 30rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  z-index: 100;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: 12rpx;
  margin: 0 12rpx;
}

.btn-edit {
  background-color: #e8f5e9;
}

.btn-delete {
  background-color: #ffebee;
}

.btn-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.btn-edit .btn-text {
  color: #4CAF50;
}

.btn-delete .btn-text {
  color: #f44336;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 40rpx;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.error-text {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.error-btn {
  padding: 16rpx 48rpx;
  background-color: #4CAF50;
  border-radius: 40rpx;
}

.error-btn text {
  color: #fff;
  font-size: 28rpx;
}
</style>
