<template>
  <FormSelectBase
    v-model="selectedValue"
    :items="items"
    name="workspaceSelect"
    :label="labelText ? labelText : 'Workspace'"
    class="min-w-[110px]"
    :label-id="labelId"
    :button-id="buttonId"
    :show-label="showLabel"
    mount-menu-on-body
    fully-control-value
    clearable
    :disabled-item-predicate="disabledItemPredicate"
    :help="help"
  >
    <template #nothing-selected>
      {{ items && items.length > 0 ? 'Select workspace' : 'No workspaces' }}
    </template>
    <template #something-selected="{ value }">
      <div class="flex items-center gap-x-2">
        <WorkspaceAvatar
          :logo="(value as ProjectsWorkspaceSelect_WorkspaceFragment).logo"
          :name="(value as ProjectsWorkspaceSelect_WorkspaceFragment).name"
          size="2xs"
        />
        <span class="truncate text-foreground">
          {{ (value as ProjectsWorkspaceSelect_WorkspaceFragment).name }}
        </span>
      </div>
    </template>
    <template #option="{ item }">
      <div v-tippy="tooltipText(item)" class="flex items-center gap-x-2">
        <WorkspaceAvatar :logo="item.logo" :name="item.name" size="2xs" />
        <span class="truncate text-foreground">{{ item.name }}</span>
      </div>
    </template>
  </FormSelectBase>
</template>
<script setup lang="ts">
import type { Nullable, WorkspaceRoles } from '@speckle/shared'
import { useFormSelectChildInternals } from '@speckle/ui-components'
import type { PropType } from 'vue'
import type { ProjectsWorkspaceSelect_WorkspaceFragment } from '~/lib/common/generated/gql/graphql'
import { graphql } from '~~/lib/common/generated/gql'

graphql(`
  fragment ProjectsWorkspaceSelect_Workspace on Workspace {
    id
    role
    name
    logo
    readOnly
    slug
  }
`)

const emit = defineEmits<{
  (
    e: 'update:modelValue',
    v:
      | ProjectsWorkspaceSelect_WorkspaceFragment
      | ProjectsWorkspaceSelect_WorkspaceFragment[]
      | undefined
  ): void
}>()

const props = defineProps({
  modelValue: {
    type: Object as PropType<ProjectsWorkspaceSelect_WorkspaceFragment | undefined>,
    default: undefined
  },
  items: Array as PropType<ProjectsWorkspaceSelect_WorkspaceFragment[]>,
  disabledRoles: {
    required: false,
    type: Array as PropType<WorkspaceRoles[]>
  },
  showLabel: Boolean,
  labelText: String,
  help: String,
  disabledItemTooltip: String
})

const elementToWatchForChanges = ref(null as Nullable<HTMLElement>)
const itemContainer = ref(null as Nullable<HTMLElement>)
const labelId = useId()
const buttonId = useId()

const { selectedValue } =
  useFormSelectChildInternals<ProjectsWorkspaceSelect_WorkspaceFragment>({
    props: toRefs(props),
    emit,
    dynamicVisibility: { elementToWatchForChanges, itemContainer }
  })

const disabledItemPredicate = (item: ProjectsWorkspaceSelect_WorkspaceFragment) =>
  props.disabledRoles
    ? props.disabledRoles.includes(item.role as WorkspaceRoles) || item.readOnly
    : false
const tooltipText = (item: ProjectsWorkspaceSelect_WorkspaceFragment) =>
  item.readOnly
    ? 'Workspace is read-only'
    : props.disabledRoles?.includes(item.role as WorkspaceRoles)
    ? props.disabledItemTooltip
    : ''
</script>
