<template>
  <div class="w-full">
    <div
      class="flex items-stretch w-full"
      :class="
        isStacked
          ? 'flex-col space-y-3 '
          : 'flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3'
      "
    >
      <div v-for="option in options" :key="option.value" class="w-full flex flex-col">
        <button
          class="bg-foundation relative w-full h-full select-none rounded-md border shadow"
          :class="[
            selected === option.value ? 'border-outline-4' : 'border-outline-2',
            disabled || option.disabled
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:border-outline-1'
          ]"
          :disabled="disabled || option.disabled"
          @click="selectItem(option.value)"
        >
          <div class="p-4 flex flex-col space-y-2 h-full">
            <div
              class="flex justify-between gap-x-3"
              :class="option.icon ? 'items-start' : 'items-center'"
            >
              <div class="flex flex-1 items-start text-left gap-x-2">
                <component
                  :is="option.icon"
                  v-if="option.icon"
                  class="text-foreground h-8 w-8 -mt-1 stroke-[1px]"
                />
                <div class="flex flex-col">
                  <h4 :class="titleClasses">
                    {{ option.title }}
                  </h4>
                  <h5 v-if="option.subtitle" class="text-foreground-3 text-body-xs">
                    {{ option.subtitle }}
                  </h5>
                </div>
              </div>
              <div
                class="h-5 w-5 rounded-full flex items-center justify-center border-[1.5px] border-outline-5"
              >
                <div
                  v-if="selected === option.value"
                  class="h-2.5 w-2.5 rounded-full bg-primary flex"
                ></div>
              </div>
            </div>
            <div
              v-if="option.introduction"
              class="text-body-2xs text-foreground pb-1 select-none text-left pr-20"
            >
              {{ option.introduction }}
            </div>
            <slot :name="option.value" />
          </div>
        </button>
        <div
          v-if="option.help"
          class="sm:hidden text-xs flex space-x-0.5 mt-2 text-foreground"
        >
          <InformationCircleIcon class="h-4 w-4" />
          {{ option.help }}
        </div>
      </div>
    </div>
    <div v-if="!isStacked" class="hidden sm:flex space-x-3 w-full">
      <div v-for="option in options" :key="option.value" class="w-full">
        <div
          v-if="option.help"
          class="text-xs flex space-x-0.5 mt-2 text-foreground select-none"
        >
          <InformationCircleIcon class="h-4 w-4" />
          {{ option.help }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="Value extends string">
import { InformationCircleIcon } from '@heroicons/vue/24/outline'
import { type ConcreteComponent, computed } from 'vue'

type OptionType = {
  value: Value
  title: string
  subtitle?: string
  introduction?: string
  icon?: ConcreteComponent
  help?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    options: OptionType[]
    disabled?: boolean
    isStacked?: boolean
    size?: 'sm' | 'base'
  }>(),
  {
    size: 'base'
  }
)

const selected = defineModel<Value>()

const selectItem = (value: Value) => {
  selected.value = value
}

const titleClasses = computed(() => {
  const classes = ['font-medium text-foreground']
  if (props.size === 'sm') {
    classes.push('text-body-sm')
  } else {
    classes.push('text-body')
  }
  return classes
})
</script>
