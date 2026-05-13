<template>
  <view class="page">
    <!-- 顶部季节区域 -->
    <view class="season-header" :style="{ backgroundColor: seasonColor }">
      <view class="season-content">
        <text class="season-title">{{ currentSeason }} {{ seasonEmoji }}</text>
        <text class="season-month">{{ seasonMonthText }}</text>
        <text class="season-tips">{{ seasonTips }}</text>
      </view>
    </view>

    <!-- 今日身体状况卡片 -->
    <view class="section">
      <view class="section-title">
        <text class="title-icon">💚</text>
        <text>今日身体状况</text>
      </view>
      <view class="health-card card" v-if="latestRecord">
        <view class="health-date">{{ latestRecord.date }}</view>
        <view class="health-tags">
          <view
            class="tag condition-tag"
            v-for="(condition, index) in latestRecord.conditions"
            :key="index"
          >
            {{ condition }}
          </view>
        </view>
        <view class="health-note" v-if="latestRecord.note">{{ latestRecord.note }}</view>
      </view>
      <view class="health-card card empty-card" v-else @click="goToHealthRecord">
        <view class="empty-content">
          <text class="empty-icon">📝</text>
          <text class="empty-text">记录今天的身体状况</text>
          <text class="empty-subtext">点击开始记录，获取更精准的菜谱推荐</text>
        </view>
      </view>
    </view>

    <!-- 为你推荐菜谱区域 -->
    <view class="section">
      <view class="section-title">
        <text class="title-icon">🥗</text>
        <text>为你推荐</text>
      </view>

      <!-- 推荐菜谱列表 -->
      <view class="recipe-list" v-if="recommendedRecipes.length > 0">
        <view
          class="recipe-card"
          v-for="recipe in recommendedRecipes"
          :key="recipe.id"
          @click="goToRecipeDetail(recipe.id)"
        >
          <view class="card-image-wrap">
            <image v-if="recipe.image" class="card-image" :src="recipe.image" mode="aspectFill" />
            <view v-else class="card-image-placeholder">
              <text class="placeholder-icon">🍽️</text>
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">{{ recipe.name }}</text>
            <text class="card-ingredients">{{ formatIngredients(recipe.ingredients) }}</text>
            <view class="card-tags">
              <template v-if="isAllSeasons(recipe.seasons)">
                <text class="tag season-tag-mini" style="background-color: #9C27B022; color: #9C27B0">全年</text>
              </template>
              <template v-else>
                <text
                  v-for="season in recipe.seasons"
                  :key="season"
                  class="tag season-tag-mini"
                  :style="{ backgroundColor: getSeasonColor(season) + '22', color: getSeasonColor(season) }"
                >
                  {{ season }}
                </text>
              </template>
              <text
                v-for="condition in recipe.conditions.slice(0, 2)"
                :key="condition"
                class="tag condition-tag-mini"
              >
                {{ condition }}
              </text>
              <text v-if="recipe.conditions.length > 2" class="tag more-tag">+{{ recipe.conditions.length - 2 }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 有菜谱但无推荐时，显示当前季节菜谱 -->
      <view class="recipe-list" v-else-if="seasonRecipes.length > 0">
        <view class="fallback-tip">
          <text>暂无精准匹配，为您推荐当季菜谱</text>
        </view>
        <view
          class="recipe-card"
          v-for="recipe in seasonRecipes"
          :key="recipe.id"
          @click="goToRecipeDetail(recipe.id)"
        >
          <view class="card-image-wrap">
            <image v-if="recipe.image" class="card-image" :src="recipe.image" mode="aspectFill" />
            <view v-else class="card-image-placeholder">
              <text class="placeholder-icon">🍽️</text>
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">{{ recipe.name }}</text>
            <text class="card-ingredients">{{ formatIngredients(recipe.ingredients) }}</text>
            <view class="card-tags">
              <template v-if="isAllSeasons(recipe.seasons)">
                <text class="tag season-tag-mini" style="background-color: #9C27B022; color: #9C27B0">全年</text>
              </template>
              <template v-else>
                <text
                  v-for="season in recipe.seasons"
                  :key="season"
                  class="tag season-tag-mini"
                  :style="{ backgroundColor: getSeasonColor(season) + '22', color: getSeasonColor(season) }"
                >
                  {{ season }}
                </text>
              </template>
              <text
                v-for="condition in recipe.conditions.slice(0, 2)"
                :key="condition"
                class="tag condition-tag-mini"
              >
                {{ condition }}
              </text>
              <text v-if="recipe.conditions.length > 2" class="tag more-tag">+{{ recipe.conditions.length - 2 }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 完全没有菜谱的空状态 -->
      <view class="empty-state card" v-else>
        <text class="empty-icon">🍽️</text>
        <text class="empty-text">还没有菜谱</text>
        <text class="empty-subtext">去添加第一道菜吧</text>
        <view class="btn-primary" @click="goToAddRecipe">添加菜谱</view>
      </view>
    </view>

    <!-- 底部留白，避免被浮动按钮遮挡 -->
    <view class="bottom-space"></view>

    <!-- 快捷操作浮动按钮 -->
    <view class="fab" @click="goToAddRecipe">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCurrentSeason, getSeasonEmoji, getSeasonColor, getAllSeasons } from '@/utils/season'
import { getLatestRecord } from '@/services/health'
import { getRecommendedRecipes, getAllRecipes, filterRecipes } from '@/services/recipe'
import type { Season } from '@/types/recipe'
import type { HealthRecord } from '@/types/health'

// 季节相关
const allSeasons = getAllSeasons()
function isAllSeasons(seasons: Season[]): boolean {
  return allSeasons.every(s => seasons.includes(s))
}
const currentSeason = ref<Season>(getCurrentSeason())
const seasonEmoji = ref(getSeasonEmoji(currentSeason.value))
const seasonColor = ref(getSeasonColor(currentSeason.value))

// 季节养生提示
const seasonTipsMap: Record<Season, string> = {
  '春': '万物复苏，宜养肝，多吃绿色蔬菜',
  '夏': '阳气最盛，宜养心，清淡饮食为佳',
  '秋': '天干物燥，宜养肺，多食润燥之品',
  '冬': '寒气袭人，宜养肾，温补正当其时',
}
const seasonTips = ref(seasonTipsMap[currentSeason.value])

// 季节月份文案
const seasonMonthMap: Record<Season, string> = {
  '春': '3月 - 5月',
  '夏': '6月 - 8月',
  '秋': '9月 - 11月',
  '冬': '12月 - 2月',
}
const seasonMonthText = ref(seasonMonthMap[currentSeason.value])

// 健康记录
const latestRecord = ref<HealthRecord | undefined>(undefined)

// 推荐菜谱
const recommendedRecipes = ref<ReturnType<typeof getRecommendedRecipes>>([])
const seasonRecipes = ref<ReturnType<typeof filterRecipes>>([])

// 加载数据
function loadData() {
  // 更新季节信息
  const season = getCurrentSeason()
  currentSeason.value = season
  seasonEmoji.value = getSeasonEmoji(season)
  seasonColor.value = getSeasonColor(season)
  seasonTips.value = seasonTipsMap[season]
  seasonMonthText.value = seasonMonthMap[season]

  // 获取最新健康记录
  latestRecord.value = getLatestRecord()

  // 获取身体状况标签
  const conditions = latestRecord.value?.conditions ?? []

  // 获取推荐菜谱
  recommendedRecipes.value = getRecommendedRecipes(currentSeason.value, conditions)

  // 如果没有推荐，获取当季所有菜谱
  if (recommendedRecipes.value.length === 0) {
    seasonRecipes.value = filterRecipes({ seasons: [currentSeason.value] })
  } else {
    seasonRecipes.value = []
  }
}

// 页面跳转
function goToHealthRecord() {
  uni.switchTab({ url: '/pages/health/record' })
}

function formatIngredients(ingredients: string[]): string {
  const top3 = ingredients.slice(0, 3)
  return top3.join('、') + (ingredients.length > 3 ? '...' : '')
}

function goToRecipeDetail(id: string) {
  uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
}

function goToAddRecipe() {
  uni.navigateTo({ url: '/pages/recipe/edit' })
}

// 使用 onShow 每次显示页面时刷新数据
onShow(() => {
  loadData()
})
</script>

<style scoped>
.page {
  min-height: 100%;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
}

/* 顶部季节区域 */
.season-header {
  padding: 60rpx 40rpx;
  border-radius: 0 0 40rpx 40rpx;
  margin-bottom: 30rpx;
}

.season-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.season-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.season-month {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12rpx;
}

.season-tips {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 区块 */
.section {
  margin: 0 30rpx 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 12rpx;
  font-size: 36rpx;
}

/* 卡片通用样式 */
.card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

/* 健康卡片 */
.health-card {
  margin-bottom: 10rpx;
}

.health-date {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.health-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.health-note {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 空卡片 */
.empty-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 30rpx;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.empty-subtext {
  font-size: 24rpx;
  color: #999;
}

/* 标签样式 */
.tag {
  display: inline-flex;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
}

/* 菜谱列表 */
.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.fallback-tip {
  text-align: center;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.recipe-card {
  display: flex;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.recipe-card:active {
  transform: scale(0.98);
}

.card-image-wrap {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.card-image {
  width: 100%;
  height: 100%;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 48rpx;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.card-ingredients {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.season-tag-mini {
  font-weight: 500;
}

.condition-tag-mini {
  background-color: #e3f2fd;
  color: #2196F3;
}

.more-tag {
  background-color: #f0f0f0;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 30rpx;
}

.empty-state .empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-state .empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.empty-state .empty-subtext {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.btn-primary {
  background-color: #4CAF50;
  color: #ffffff;
  font-size: 28rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  text-align: center;
}

.btn-primary:active {
  opacity: 0.85;
}

/* 底部留白 */
.bottom-space {
  height: 120rpx;
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #4CAF50;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.4);
  z-index: 100;
}

.fab:active {
  opacity: 0.85;
  transform: scale(0.95);
}

.fab-icon {
  color: #ffffff;
  font-size: 48rpx;
  font-weight: 300;
  line-height: 1;
}
</style>
