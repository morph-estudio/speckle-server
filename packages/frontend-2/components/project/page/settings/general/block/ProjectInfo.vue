<template>
  <div class="flex flex-col gap-4">
    <ProjectPageSettingsBlock background title="Project info" :auth-check="canUpdate">
      <FormTextInput
        v-model="localProjectName"
        name="projectName"
        label="Project name"
        placeholder="Project name"
        show-label
        color="foundation"
        class="mb-2"
        :disabled="!canUpdate.authorized"
      />
      <FormTextArea
        v-model="localProjectDescription"
        name="projectDescription"
        label="Project description"
        placeholder="Description"
        show-label
        show-optional
        color="foundation"
        :disabled="!canUpdate.authorized"
      />
      <template #bottom-buttons>
        <FormButton color="subtle" :disabled="!hasChanges" @click="resetLocalState">
          Cancel
        </FormButton>
        <FormButton :disabled="!hasChanges" @click="emitUpdate">Update</FormButton>
      </template>
    </ProjectPageSettingsBlock>

    <LayoutDialog
      v-model:open="showConfirmDialog"
      max-width="md"
      :buttons="dialogButtons"
    >
      <template #header>Unsaved changes</template>
      <div class="space-y-4">
        <p>You have unsaved changes. Do you want to save them before leaving?</p>
      </div>
    </LayoutDialog>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import {
  FormTextInput,
  FormTextArea,
  FormButton,
  LayoutDialog,
  type LayoutDialogButton
} from '@speckle/ui-components'
import type { ProjectPageSettingsGeneralBlockProjectInfo_ProjectFragment } from '~~/lib/common/generated/gql/graphql'
import type { RouteLocationRaw } from 'vue-router'
import { graphql } from '~~/lib/common/generated/gql'

graphql(`
  fragment ProjectPageSettingsGeneralBlockProjectInfo_Project on Project {
    id
    name
    description
    permissions {
      canUpdate {
        ...FullPermissionCheckResult
      }
    }
  }
`)

const props = defineProps<{
  project: ProjectPageSettingsGeneralBlockProjectInfo_ProjectFragment
}>()

const emit = defineEmits(['update-project'])
const router = useRouter()

const targetRoute = ref<RouteLocationRaw | undefined>(undefined)
const localProjectName = ref(props.project.name)
const localProjectDescription = ref(props.project.description ?? '')
const showConfirmDialog = ref(false)

const canUpdate = computed(() => props.project.permissions.canUpdate)
const hasChanges = computed(() => {
  return (
    localProjectName.value !== props.project.name ||
    localProjectDescription.value !== props.project.description
  )
})

const emitUpdate = () => {
  emit('update-project', {
    name: localProjectName.value,
    description: localProjectDescription.value,
    onComplete: handleRedirection
  })
}

const handleRedirection = () => {
  showConfirmDialog.value = false
  resetLocalState()
  if (targetRoute.value) {
    router.push(targetRoute.value)
    targetRoute.value = undefined
  }
}

const resetLocalState = () => {
  localProjectName.value = props.project.name
  localProjectDescription.value = props.project.description ?? ''
  showConfirmDialog.value = false
}

const dialogButtons = computed<LayoutDialogButton[]>(() => [
  {
    text: 'Discard changes',
    props: { color: 'outline' },
    onClick: handleRedirection
  },
  {
    text: 'Save changes',
    props: {
      submit: true
    },
    onClick: () => {
      showConfirmDialog.value = false
      emitUpdate()
    }
  }
])

watch(
  () => props.project,
  (newProject, oldProject) => {
    if (newProject.name !== oldProject.name) {
      localProjectName.value = newProject.name
    }
    if (newProject.description !== oldProject.description) {
      localProjectDescription.value = newProject.description ?? ''
    }
  },
  { deep: true }
)

onBeforeRouteLeave((to, from, next) => {
  if (hasChanges.value && !showConfirmDialog.value) {
    targetRoute.value = to
    showConfirmDialog.value = true
    next(false)
  } else {
    next()
  }
})
</script>
