<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索菜名或食材"
          placeholder-class="search-placeholder"
          @input="onSearch"
        />
        <text v-if="keyword" class="clear-icon" @click="clearSearch">×</text>
      </view>
    </view>

    <!-- 季节筛选 -->
    <view class="season-bar">
      <scroll-view scroll-x class="season-scroll">
        <view
          v-for="s in seasonOptions"
          :key="s"
          class="season-tag"
          :class="{ active: selectedSeason === s }"
          :style="selectedSeason === s ? { backgroundColor: getSeasonColor(s as Season), color: '#fff' } : {}"
          @click="selectSeason(s)"
        >
          {{ s === '全部' ? s : getSeasonEmoji(s as Season) + ' ' + s }}
        </view>
      </scroll-view>
    </view>

    <!-- 身体状况标签筛选 -->
    <view class="condition-section">
      <view class="condition-header" @click="toggleConditionExpand">
        <text class="condition-title">身体状况筛选</text>
        <text class="condition-toggle">{{ conditionExpanded ? '收起 ▲' : '展开 ▼' }}</text>
      </view>
      <view v-show="conditionExpanded" class="condition-body">
        <view
          v-for="tag in allConditionTags"
          :key="tag"
          class="condition-tag"
          :class="{ active: selectedConditions.includes(tag) }"
          @click="toggleCondition(tag)"
        >
          {{ tag }}
        </view>
      </view>
      <view v-if="selectedConditions.length > 0" class="condition-summary">
        已选: {{ selectedConditions.join(', ') }}
      </view>
    </view>

    <!-- 菜谱列表 -->
    <scroll-view scroll-y class="recipe-list">
      <view
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="recipe-card"
        @click="goToDetail(recipe.id)"
      >
        <view class="card-image-wrap">
          <image
            v-if="recipe.image"
            class="card-image"
            :src="recipe.image"
            mode="aspectFill"
          />
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

      <!-- 空状态 -->
      <view v-if="filteredRecipes.length === 0" class="empty-state">
        <text class="empty-icon">🍃</text>
        <text class="empty-text">暂无符合条件的菜谱</text>
        <text class="empty-subtext">试着添加一道新菜谱吧</text>
      </view>
    </scroll-view>

    <!-- 浮动添加按钮 -->
    <view class="fab" @click="goToEdit">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { Recipe, Season } from '@/types/recipe'
import { searchRecipes, filterRecipes } from '@/services/recipe'
import { getAllSeasons, getSeasonColor, getSeasonEmoji } from '@/utils/season'
import { DEFAULT_CONDITION_TAGS } from '@/constants/tags'

const keyword = ref('')
const selectedSeason = ref<string>('全部')
const selectedConditions = ref<string[]>([])
const conditionExpanded = ref(false)
const allRecipes = ref<Recipe[]>([])

const seasonOptions = ['全部', ...getAllSeasons()]
const allConditionTags = DEFAULT_CONDITION_TAGS

function loadRecipes() {
  allRecipes.value = searchRecipes('')
}

onShow(() => {
  loadRecipes()
})

const filteredRecipes = computed(() => {
  let result = allRecipes.value

  // 搜索
  if (keyword.value.trim()) {
    result = searchRecipes(keyword.value.trim())
  }

  // 筛选
  const seasons: Season[] | undefined = selectedSeason.value === '全部' ? undefined : [selectedSeason.value as Season]
  const conditions: string[] | undefined = selectedConditions.value.length > 0 ? selectedConditions.value : undefined

  if (seasons || conditions) {
    const filterOptions: { seasons?: Season[]; conditions?: string[] } = {}
    if (seasons) filterOptions.seasons = seasons
    if (conditions) filterOptions.conditions = conditions

    // 如果有搜索词，在搜索结果中再筛选；否则在全部中筛选
    if (keyword.value.trim()) {
      // 手动交集：searchRecipes 的结果中再按条件过滤
      result = result.filter(r => {
        if (seasons && !seasons.some(s => r.seasons.includes(s))) return false
        if (conditions && !conditions.some(c => r.conditions.includes(c))) return false
        return true
      })
    } else {
      result = filterRecipes(filterOptions)
    }
  }

  return result
})

function onSearch() {
  // 输入时自动触发 computed 更新
}

function clearSearch() {
  keyword.value = ''
}

function selectSeason(season: string) {
  selectedSeason.value = season
}

function toggleConditionExpand() {
  conditionExpanded.value = !conditionExpanded.value
}

function toggleCondition(tag: string) {
  const index = selectedConditions.value.indexOf(tag)
  if (index > -1) {
    selectedConditions.value.splice(index, 1)
  } else {
    selectedConditions.value.push(tag)
  }
}

function formatIngredients(ingredients: string[]): string {
  const top3 = ingredients.slice(0, 3)
  return top3.join('、') + (ingredients.length > 3 ? '...' : '')
}

const allSeasons = getAllSeasons()
function isAllSeasons(seasons: Season[]): boolean {
  return allSeasons.every(s => seasons.includes(s))
}

function goToDetail(id: string) {
  uni.navigateTo({
    url: `/pages/recipe/detail?id=${id}`,
  })
}

function goToEdit() {
  uni.navigateTo({
    url: '/pages/recipe/edit',
  })
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

/* 搜索栏 */
.search-bar {
  padding: 20rpx 30rpx;
  background-color: #fff;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.search-placeholder {
  color: #999;
}

.clear-icon {
  font-size: 32rpx;
  color: #999;
  padding: 0 8rpx;
}

/* 季节筛选 */
.season-bar {
  background-color: #fff;
  padding: 0 20rpx 20rpx;
  border-bottom: 1rpx solid #eee;
}

.season-scroll {
  white-space: nowrap;
}

.season-tag {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f0f0f0;
  transition: all 0.2s;
}

.season-tag.active {
  font-weight: 500;
}

/* 身体状况筛选 */
.condition-section {
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.condition-toggle {
  font-size: 24rpx;
  color: #999;
}

.condition-body {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
}

.condition-tag {
  padding: 10rpx 22rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  border-radius: 28rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f5f5f5;
  border: 2rpx solid transparent;
}

.condition-tag.active {
  background-color: #e3f2fd;
  color: #2196F3;
  border-color: #2196F3;
}

.condition-summary {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #2196F3;
}

/* 菜谱列表 */
.recipe-list {
  flex: 1;
  padding: 20rpx;
}

.recipe-card {
  display: flex;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
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
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.empty-subtext {
  font-size: 24rpx;
  color: #999;
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.4);
  z-index: 100;
}

.fab-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}
</style>
