<template>
  <view class="container">
    <scroll-view scroll-y class="form-scroll">
      <!-- 菜名 -->
      <view class="form-group">
        <view class="form-label required">菜名</view>
        <input
          class="form-input"
          v-model="form.name"
          placeholder="请输入菜名"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 图片 -->
      <view class="form-group">
        <view class="form-label">图片</view>
        <view class="image-picker" @click="chooseImage">
          <image
            v-if="form.image"
            class="preview-image"
            :src="form.image"
            mode="aspectFill"
          />
          <view v-else class="image-picker-placeholder">
            <text class="picker-icon">📷</text>
            <text class="picker-text">点击选择图片</text>
          </view>
        </view>
        <text v-if="form.image" class="image-tip" @click="clearImage">点击重新选择，长按此处清除</text>
      </view>

      <!-- 食材 -->
      <view class="form-group">
        <view class="form-label required">食材清单</view>
        <!-- 身体状态筛选 -->
        <view class="seasonal-recommend condition-recommend">
          <view class="seasonal-header">
            <text class="seasonal-title">💡 身体状况</text>
          </view>
          <view class="condition-selector">
            <view class="condition-selector-tags">
              <view
                v-for="tag in availableConditionsForRecommend"
                :key="tag"
                class="condition-select-tag"
                :class="{ active: selectedConditionsForRecommend.includes(tag) }"
                @click="toggleRecommendCondition(tag)"
              >
                {{ tag }}
              </view>
            </view>
          </view>
        </view>

        <!-- 应季推荐 -->
        <view class="seasonal-recommend">
          <view class="seasonal-header">
            <text class="seasonal-title">🌿 应季推荐（{{ currentSeasonLabel }}）</text>
            <text class="seasonal-toggle" @click="showSeasonal = !showSeasonal">{{ showSeasonal ? '收起' : '展开' }}</text>
          </view>
          <view v-if="showSeasonal" class="seasonal-body">
            <view v-for="group in seasonalIngredients" :key="group.category" class="seasonal-group">
              <text class="seasonal-group-title">{{ group.category }}</text>
              <view class="seasonal-tags">
                <view
                  v-for="item in group.items"
                  :key="item"
                  class="seasonal-tag"
                  :class="{ selected: form.ingredients.includes(item) }"
                  @click="addSeasonalIngredient(item)"
                >
                  + {{ item }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 全年推荐 -->
        <view class="seasonal-recommend all-year-recommend">
          <view class="seasonal-header">
            <text class="seasonal-title">🌍 全年推荐</text>
            <text class="seasonal-toggle" @click="showAllYear = !showAllYear">{{ showAllYear ? '收起' : '展开' }}</text>
          </view>
          <view v-if="showAllYear" class="seasonal-body">
            <view v-for="group in ALL_YEAR_INGREDIENTS" :key="group.category" class="seasonal-group">
              <text class="seasonal-group-title">{{ group.category }}</text>
              <view class="seasonal-tags">
                <view
                  v-for="item in group.items"
                  :key="item"
                  class="seasonal-tag all-year-tag"
                  :class="{ selected: form.ingredients.includes(item) }"
                  @click="addSeasonalIngredient(item)"
                >
                  + {{ item }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 调理推荐 -->
        <view v-if="conditionRecommendItems.length > 0" class="seasonal-recommend condition-recommend">
          <view class="seasonal-header">
            <text class="seasonal-title">💡 调理推荐</text>
            <text class="seasonal-toggle" @click="showConditionRecommend = !showConditionRecommend">{{ showConditionRecommend ? '收起' : '展开' }}</text>
          </view>
          <view v-if="showConditionRecommend" class="seasonal-body">
            <view class="seasonal-tags">
              <view
                v-for="item in conditionRecommendItems"
                :key="item"
                class="seasonal-tag condition-tag-item"
                :class="{ selected: form.ingredients.includes(item) }"
                @click="addSeasonalIngredient(item)"
              >
                + {{ item }}
              </view>
            </view>
          </view>
        </view>

        <!-- 调味料推荐 -->
        <view class="seasonal-recommend seasoning-recommend">
          <view class="seasonal-header">
            <text class="seasonal-title">🧂 调味料</text>
            <text class="seasonal-toggle" @click="showSeasoning = !showSeasoning">{{ showSeasoning ? '收起' : '展开' }}</text>
          </view>
          <view v-if="showSeasoning" class="seasonal-body">
            <view v-for="group in SEASONING_INGREDIENTS" :key="group.category" class="seasonal-group">
              <text class="seasonal-group-title">{{ group.category }}</text>
              <view class="seasonal-tags">
                <view
                  v-for="item in group.items"
                  :key="item"
                  class="seasonal-tag seasoning-tag"
                  :class="{ selected: form.ingredients.includes(item) }"
                  @click="addSeasonalIngredient(item)"
                >
                  + {{ item }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <view
          v-for="(item, index) in form.ingredients"
          :key="index"
          class="ingredient-row"
        >
          <view class="ingredient-sort-btns">
            <view class="sort-btn" :class="{ disabled: index === 0 }" @click="moveIngredient(index, -1)">
              <text class="sort-icon">↑</text>
            </view>
            <view class="sort-btn" :class="{ disabled: index === form.ingredients.length - 1 }" @click="moveIngredient(index, 1)">
              <text class="sort-icon">↓</text>
            </view>
          </view>
          <input
            class="ingredient-input"
            v-model="form.ingredients[index]"
            :placeholder="`食材 ${index + 1}`"
            placeholder-class="input-placeholder"
          />
          <view
            v-if="form.ingredients.length > 1"
            class="ingredient-remove"
            @click="removeIngredient(index)"
          >
            <text class="remove-icon">−</text>
          </view>
        </view>
        <view class="ingredient-actions">
          <view class="add-btn ingredient-add" @click="addIngredient">
            <text class="add-icon">+</text>
            <text class="add-text">添加食材</text>
          </view>
          <view class="add-btn ingredient-to-steps" @click="addIngredientsToSteps">
            <text class="add-icon">📋</text>
            <text class="add-text">添加到步骤</text>
          </view>
        </view>
      </view>

      <!-- 烹饪步骤 -->
      <view class="form-group">
        <view class="form-label">烹饪步骤</view>
        <textarea
          class="form-textarea"
          v-model="form.steps"
          placeholder="请输入烹饪步骤，换行分隔"
          placeholder-class="input-placeholder"
          :maxlength="2000"
        />
      </view>

      <!-- 适合季节 -->
      <view class="form-group">
        <view class="form-label required">适合季节</view>
        <view class="season-options">
          <view
            class="season-btn"
            :class="{ active: isAllSeasons }"
            :style="isAllSeasons ? { backgroundColor: '#9C27B0', color: '#fff' } : {}"
            @click="toggleAllSeasons"
          >
            🌍 全年
          </view>
          <view
            v-for="season in allSeasons"
            :key="season"
            class="season-btn"
            :class="{ active: form.seasons.includes(season) }"
            :style="form.seasons.includes(season) ? { backgroundColor: getSeasonColor(season), color: '#fff' } : {}"
            @click="toggleSeason(season)"
          >
            {{ getSeasonEmoji(season) }} {{ season }}
          </view>
        </view>
      </view>

      <!-- 自定义标签 -->
      <view class="form-group">
        <view class="form-label">自定义标签</view>
        <!-- 历史标签选项 -->
        <view v-if="historyTags.length > 0" class="history-tags-section">
          <text class="history-tags-label">历史标签（点击选用，长按删除）</text>
          <view class="history-tags-row">
            <view
              v-for="tag in historyTags"
              :key="tag"
              class="option-tag gray history-tag"
              :class="{ active: form.tags.includes(tag) }"
              @click="selectHistoryTag(tag)"
              @longpress="deleteHistoryTag(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>
        <!-- 输入添加新标签 -->
        <view class="custom-tag-input-row">
          <input
            class="custom-tag-input"
            v-model="customTagInput"
            placeholder="输入新标签名称"
            placeholder-class="input-placeholder"
            @confirm="addCustomTag"
          />
          <view class="custom-tag-add" @click="addCustomTag">
            <text>添加</text>
          </view>
        </view>
        <!-- 当前菜谱已选标签 -->
        <view v-if="form.tags.length > 0" class="custom-tags-row">
          <view class="selected-tags-label">当前已选：</view>
          <view class="selected-tags-list">
            <view
              v-for="tag in form.tags"
              :key="tag"
              class="option-tag gray active custom-active"
            >
              {{ tag }}
              <text class="tag-close" @click="removeTag(tag)">×</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <view class="action-btn btn-cancel" @click="goBack">
        <text>取消</text>
      </view>
      <view class="action-btn btn-save" @click="onSave">
        <text>保存</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Recipe, Season } from '@/types/recipe'
import { getRecipeById, createRecipe, updateRecipe } from '@/services/recipe'
import { getAllSeasons, getSeasonColor, getSeasonEmoji } from '@/utils/season'
import { DEFAULT_CONDITION_TAGS, SEASONAL_INGREDIENTS, ALL_YEAR_INGREDIENTS, CONDITION_INGREDIENTS, SEASONING_INGREDIENTS } from '@/constants/tags'
import { getCurrentSeason } from '@/utils/season'
import { getLatestRecord } from '@/services/health'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'

const allSeasons = getAllSeasons()
const currentSeasonForRecommend = getCurrentSeason()
const currentSeasonLabel = currentSeasonForRecommend + '季'
const seasonalIngredients = SEASONAL_INGREDIENTS[currentSeasonForRecommend]
const showSeasonal = ref(false)
const showAllYear = ref(false)
const showSeasoning = ref(false)
const showConditionRecommend = ref(false)

// 根据身体状况推荐食材
const latestHealth = getLatestRecord()
const availableConditionsForRecommend = ['健康', ...DEFAULT_CONDITION_TAGS]
const selectedConditionsForRecommend = ref<string[]>(
  latestHealth ? [...latestHealth.conditions] : ['健康']
)

function toggleRecommendCondition(tag: string) {
  const idx = selectedConditionsForRecommend.value.indexOf(tag)
  if (idx > -1) {
    selectedConditionsForRecommend.value.splice(idx, 1)
  } else {
    // 选择“健康”时清除其他，选择其他时清除“健康”
    if (tag === '健康') {
      selectedConditionsForRecommend.value = ['健康']
    } else {
      const healthIdx = selectedConditionsForRecommend.value.indexOf('健康')
      if (healthIdx > -1) {
        selectedConditionsForRecommend.value.splice(healthIdx, 1)
      }
      selectedConditionsForRecommend.value.push(tag)
    }
  }
}

const conditionRecommendItems = computed(() => {
  const items: string[] = []
  for (const condition of selectedConditionsForRecommend.value) {
    const list = CONDITION_INGREDIENTS[condition]
    if (list) {
      for (const item of list) {
        if (!items.includes(item)) items.push(item)
      }
    }
  }
  return items
})

const isEdit = ref(false)
const recipeId = ref('')

const form = ref({
  name: '',
  image: '',
  ingredients: [''],
  steps: '',
  seasons: [currentSeasonForRecommend] as Season[],
  conditions: [] as string[],
  tags: [] as string[],
})

const customTagInput = ref('')
const historyTags = ref<string[]>(getStorage<string[]>(STORAGE_KEYS.CUSTOM_TAGS, []))

onLoad((options) => {
  if (options?.id) {
    isEdit.value = true
    recipeId.value = options.id as string
    const recipe = getRecipeById(recipeId.value)
    if (recipe) {
      form.value = {
        name: recipe.name,
        image: recipe.image,
        ingredients: recipe.ingredients.length > 0 ? [...recipe.ingredients] : [''],
        steps: recipe.steps,
        seasons: [...recipe.seasons],
        conditions: [...recipe.conditions],
        tags: [...recipe.tags],
      }
      // 回填身体状况到推荐筛选器
      if (recipe.conditions.length > 0) {
        selectedConditionsForRecommend.value = [...recipe.conditions]
      }
    }
  }
})

// 读取图片为 base64
function readImageAsBase64(tempPath: string): Promise<string> {
  return new Promise((resolve) => {
    // 微信小程序
    try {
      const fs = uni.getFileSystemManager()
      const data = fs.readFileSync(tempPath, 'base64') as string
      resolve(`data:image/jpeg;base64,${data}`)
      return
    } catch {
      // 非小程序或失败，继续其他方式
    }

    // H5
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      fetch(tempPath)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = () => resolve(tempPath)
          reader.readAsDataURL(blob)
        })
        .catch(() => resolve(tempPath))
      return
    }

    resolve(tempPath)
  })
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempPath = res.tempFilePaths[0]
      readImageAsBase64(tempPath).then((data) => {
        form.value.image = data
      })
    },
  })
}

function clearImage() {
  form.value.image = ''
}

function addIngredient() {
  form.value.ingredients.push('')
}

function addSeasonalIngredient(item: string) {
  // 已存在则取消选中（移除）
  const existIdx = form.value.ingredients.findIndex((i: string) => i.trim() === item)
  if (existIdx > -1) {
    form.value.ingredients.splice(existIdx, 1)
    if (form.value.ingredients.length === 0) {
      form.value.ingredients.push('')
    }
    uni.showToast({ title: `已移除「${item}」`, icon: 'none', duration: 1000 })
    return
  }
  // 如果已有空白输入框，填入第一个空白框
  const emptyIdx = form.value.ingredients.findIndex((i: string) => i.trim() === '')
  if (emptyIdx > -1) {
    form.value.ingredients[emptyIdx] = item
  } else {
    form.value.ingredients.push(item)
  }
  uni.showToast({ title: `已添加「${item}」`, icon: 'none', duration: 1000 })
}

function removeIngredient(index: number) {
  if (form.value.ingredients.length > 1) {
    form.value.ingredients.splice(index, 1)
  }
}

function moveIngredient(index: number, direction: number) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= form.value.ingredients.length) return
  const temp = form.value.ingredients[index]
  form.value.ingredients[index] = form.value.ingredients[newIndex]
  form.value.ingredients[newIndex] = temp
}

function addIngredientsToSteps() {
  const validIngredients = form.value.ingredients.filter((i: string) => i.trim() !== '')
  if (validIngredients.length === 0) {
    uni.showToast({ title: '没有可添加的食材', icon: 'none' })
    return
  }
  const ingredientText = validIngredients.join('、')
  if (form.value.steps) {
    form.value.steps = ingredientText + '\n' + form.value.steps
  } else {
    form.value.steps = ingredientText
  }
  uni.showToast({ title: '已添加到烹饪步骤', icon: 'none' })
}

function toggleSeason(season: Season) {
  const idx = form.value.seasons.indexOf(season)
  if (idx > -1) {
    form.value.seasons.splice(idx, 1)
  } else {
    form.value.seasons.push(season)
  }
}

// 全年选项
const isAllSeasons = computed(() => {
  return allSeasons.every(s => form.value.seasons.includes(s))
})

function toggleAllSeasons() {
  if (isAllSeasons.value) {
    form.value.seasons = []
  } else {
    form.value.seasons = [...allSeasons]
  }
}

function removeTag(tag: string) {
  const idx = form.value.tags.indexOf(tag)
  if (idx > -1) {
    form.value.tags.splice(idx, 1)
  }
}

function addCustomTag() {
  const val = customTagInput.value.trim()
  if (!val) return
  if (!form.value.tags.includes(val)) {
    form.value.tags.push(val)
  }
  // 保存到历史标签
  if (!historyTags.value.includes(val)) {
    historyTags.value.push(val)
    setStorage(STORAGE_KEYS.CUSTOM_TAGS, historyTags.value)
  }
  customTagInput.value = ''
}

function selectHistoryTag(tag: string) {
  if (form.value.tags.includes(tag)) {
    // 已选中则取消
    const idx = form.value.tags.indexOf(tag)
    form.value.tags.splice(idx, 1)
  } else {
    form.value.tags.push(tag)
  }
}

function deleteHistoryTag(tag: string) {
  const idx = historyTags.value.indexOf(tag)
  if (idx > -1) {
    historyTags.value.splice(idx, 1)
    setStorage(STORAGE_KEYS.CUSTOM_TAGS, historyTags.value)
  }
  // 同时从当前菜谱移除
  const formIdx = form.value.tags.indexOf(tag)
  if (formIdx > -1) {
    form.value.tags.splice(formIdx, 1)
  }
}

function validate(): boolean {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入菜名', icon: 'none' })
    return false
  }
  const validIngredients = form.value.ingredients.filter(i => i.trim())
  if (validIngredients.length === 0) {
    uni.showToast({ title: '请至少添加一种食材', icon: 'none' })
    return false
  }
  if (form.value.seasons.length === 0) {
    uni.showToast({ title: '请选择适合季节', icon: 'none' })
    return false
  }
  return true
}

function onSave() {
  if (!validate()) return

  const data = {
    name: form.value.name.trim(),
    image: form.value.image,
    ingredients: form.value.ingredients.filter(i => i.trim()),
    steps: form.value.steps.trim(),
    seasons: form.value.seasons,
    conditions: selectedConditionsForRecommend.value.filter(c => c !== '健康'),
    tags: form.value.tags,
  }

  if (isEdit.value) {
    updateRecipe(recipeId.value, data)
    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    createRecipe(data)
    uni.showToast({ title: '创建成功', icon: 'success' })
  }

  setTimeout(() => {
    uni.navigateBack()
  }, 600)
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

.form-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
  padding-bottom: 40rpx;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.form-group {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.form-label.required::after {
  content: '*';
  color: #f44336;
  margin-left: 6rpx;
}

.form-input {
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #fafafa;
}

.input-placeholder {
  color: #bbb;
}

/* 图片选择 */
.image-picker {
  width: 100%;
  height: 360rpx;
  border: 2rpx dashed #ccc;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #fafafa;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-picker-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.picker-icon {
  font-size: 56rpx;
  margin-bottom: 12rpx;
}

.picker-text {
  font-size: 26rpx;
  color: #999;
}

.image-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

/* 应季推荐 */
.seasonal-recommend {
  margin-bottom: 20rpx;
  background-color: #f0f9f0;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
}

.seasonal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seasonal-title {
  font-size: 26rpx;
  color: #4CAF50;
  font-weight: 500;
}

.seasonal-toggle {
  font-size: 24rpx;
  color: #4CAF50;
  padding: 4rpx 12rpx;
}

.seasonal-body {
  margin-top: 16rpx;
}

.seasonal-group {
  margin-bottom: 12rpx;
}

.seasonal-group-title {
  font-size: 22rpx;
  color: #888;
  margin-bottom: 8rpx;
  display: block;
}

.seasonal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.seasonal-tag {
  font-size: 24rpx;
  color: #4CAF50;
  background-color: #fff;
  border: 1rpx solid #4CAF50;
  border-radius: 20rpx;
  padding: 6rpx 16rpx;
}

.seasonal-tag.selected {
  background-color: #4CAF50;
  color: #fff;
  border-color: #4CAF50;
}

.all-year-tag.selected {
  background-color: #1976D2;
  color: #fff;
  border-color: #1976D2;
}

.condition-tag-item.selected {
  background-color: #FF9800;
  color: #fff;
  border-color: #FF9800;
}

.seasonal-tag:active {
  background-color: #4CAF50;
  color: #fff;
}

.all-year-tag {
  color: #1976D2;
  background-color: #E3F2FD;
  border-color: #BBDEFB;
}

.all-year-tag:active {
  background-color: #1976D2;
  color: #fff;
}

.all-year-recommend {
  background-color: #E3F2FD;
}

.seasoning-recommend {
  background-color: #FFF8E1;
}

.seasoning-tag {
  color: #795548;
  background-color: #EFEBE9;
  border-color: #D7CCC8;
}

.seasoning-tag.selected {
  background-color: #795548;
  color: #fff;
  border-color: #795548;
}

.condition-recommend {
  background-color: #fff3e0;
}

.condition-tag-item {
  color: #FF9800;
  border-color: #FF9800;
}

.condition-tag-item:active {
  background-color: #FF9800;
  color: #fff;
}

.condition-selector {
  margin-bottom: 16rpx;
}

.condition-selector-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.condition-selector-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.condition-select-tag {
  font-size: 22rpx;
  color: #999;
  background-color: #fff;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  padding: 4rpx 14rpx;
}

.condition-select-tag.active {
  color: #fff;
  background-color: #FF9800;
  border-color: #FF9800;
}

.recommend-empty {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
}

/* 食材 */
.ingredient-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.ingredient-sort-btns {
  display: flex;
  flex-direction: column;
  margin-right: 12rpx;
  gap: 4rpx;
}

.sort-btn {
  width: 40rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 8rpx;
}

.sort-btn.disabled {
  opacity: 0.3;
}

.sort-icon {
  font-size: 22rpx;
  color: #666;
}

.ingredient-actions {
  display: flex;
  gap: 20rpx;
}

.ingredient-to-steps {
  background-color: #E3F2FD;
  color: #1976D2;
}

.ingredient-input {
  flex: 1;
  height: 76rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #fafafa;
}

.ingredient-remove {
  width: 60rpx;
  height: 60rpx;
  margin-left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffebee;
  border-radius: 50%;
}

.remove-icon {
  font-size: 32rpx;
  color: #f44336;
  font-weight: 700;
  line-height: 1;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  padding: 14rpx 28rpx;
  border-radius: 12rpx;
  background-color: #e8f5e9;
}

.add-icon {
  font-size: 28rpx;
  color: #4CAF50;
  margin-right: 8rpx;
  font-weight: 700;
}

.add-text {
  font-size: 26rpx;
  color: #4CAF50;
}

/* 文本域 */
.form-textarea {
  width: 100%;
  height: 240rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #fafafa;
  box-sizing: border-box;
}

/* 季节选择 */
.season-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.season-btn {
  padding: 16rpx 36rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f0f0f0;
}

.season-btn.active {
  font-weight: 500;
}

/* 标签分组 */
.tag-group-block {
  margin-bottom: 20rpx;
}

.tag-group-title {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-tag {
  padding: 10rpx 24rpx;
  border-radius: 28rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f5f5f5;
  border: 2rpx solid transparent;
}

.option-tag.active {
  background-color: #e3f2fd;
  color: #2196F3;
  border-color: #2196F3;
}

.option-tag.gray.active {
  background-color: #e8f5e9;
  color: #4CAF50;
  border-color: #4CAF50;
}

.option-tag.custom-active {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
}

.tag-close {
  font-size: 20rpx;
  color: inherit;
  opacity: 0.7;
}

/* 自定义标签输入 */
.custom-tag-input-row {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  gap: 16rpx;
}

.custom-tag-input {
  flex: 1;
  height: 72rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #333;
  background-color: #fafafa;
}

.custom-tag-add {
  padding: 16rpx 32rpx;
  background-color: #4CAF50;
  border-radius: 12rpx;
}

.custom-tag-add text {
  color: #fff;
  font-size: 26rpx;
}

.custom-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.tag-empty-tip {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #bbb;
}

.history-tags-section {
  margin-bottom: 16rpx;
}

.history-tags-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
  display: block;
}

.history-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.history-tag {
  border: 2rpx solid #e0e0e0;
}

.history-tag.active {
  background-color: #4CAF50;
  color: #fff;
  border-color: #4CAF50;
}

.selected-tags-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.selected-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

/* 底部按钮 */
.bottom-actions {
  display: flex;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  border-top: 1rpx solid #eee;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
}

.action-btn text {
  font-size: 30rpx;
  font-weight: 500;
}

.btn-cancel {
  background-color: #f0f0f0;
}

.btn-cancel text {
  color: #666;
}

.btn-save {
  background-color: #4CAF50;
}

.btn-save text {
  color: #fff;
}
</style>
