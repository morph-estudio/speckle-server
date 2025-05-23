<template>
  <WorkspacePlanLimitReachedDialog
    v-model:open="dialogOpen"
    :buttons="buttons"
    prevent-close
    :condensed="isEmbedEnabled || undefined"
  >
    <template #header>{{ title }}</template>
    <div class="mb-2">
      <p>{{ message }}</p>
    </div>
  </WorkspacePlanLimitReachedDialog>
</template>
<script setup lang="ts">
import { Roles, type MaybeNullOrUndefined } from '@speckle/shared'
import type { LayoutDialogButton } from '@speckle/ui-components'
import { modelRoute, settingsWorkspaceRoutes } from '~/lib/common/helpers/route'
import { useEmbed } from '~/lib/viewer/composables/setup/embed'
import { useWorkspaceLimits } from '~/lib/workspaces/composables/limits'
import { useMixpanel } from '~/lib/core/composables/mp'
import { useNavigation } from '~/lib/navigation/composables/navigation'

type LimitType = 'version' | 'comment' | 'federated'

const props = defineProps<{
  limitType: LimitType
  workspaceSlug: string
  workspaceRole: MaybeNullOrUndefined<string>
  projectId: string
  resourceIdString: string
}>()

const { isEnabled: isEmbedEnabled } = useEmbed()
const { versionLimitFormatted } = useWorkspaceLimits(props.workspaceSlug)
const mixpanel = useMixpanel()
const { mutateActiveWorkspaceSlug } = useNavigation()

const dialogOpen = defineModel<boolean>('open', {
  required: true
})

const title = computed(() => {
  switch (props.limitType) {
    case 'version':
      return 'Plan limit reached'
    case 'federated':
      return "The federated models couldn't be loaded"
    case 'comment':
      return 'The comment could not be loaded'
    default:
      return 'Plan limit reached'
  }
})

const message = computed(() => {
  switch (props.limitType) {
    case 'version':
      return `The version you're trying to load is older than the ${versionLimitFormatted.value} version history limit allowed by your workspace plan. Upgrade your workspace plan to gain access.`
    case 'federated':
      return `One of the models is older than the ${versionLimitFormatted.value}-day version history limit allowed by your workspace plan. Upgrade your workspace plan to gain access.`
    case 'comment':
      return `Unable to load the comment because one or more of the referenced models is older than the ${versionLimitFormatted.value}-day version history limit. Upgrade your workspace plan to gain access.`
    default:
      return "You've reached the limit of your plan. Please upgrade to continue."
  }
})

const stripVersionIds = (resourceIdString: string) => {
  const resources = resourceIdString.split(',')

  // For each resource, remove @versionId if present
  const cleanedResources = resources.map((resource) => {
    const atIndex = resource.indexOf('@')
    return atIndex > -1 ? resource.substring(0, atIndex) : resource
  })

  return cleanedResources.join(',')
}

const loadLatestButton = (isPrimary = true): LayoutDialogButton => ({
  text: 'Load latest version',
  props: {
    color: isPrimary ? 'primary' : 'outline'
  },
  onClick: () => {
    mixpanel.track('Load Latest Version Button Clicked', {
      location: 'viewer',
      // eslint-disable-next-line camelcase
      workspace_id: props.workspaceSlug
    })

    const latestResourceIdString = stripVersionIds(props.resourceIdString)

    // Use the modelRoute but with the cleaned resource string that has no version IDs
    navigateTo(modelRoute(props.projectId, latestResourceIdString))
  }
})

const explorePlansButton: LayoutDialogButton = {
  text: 'Explore plans',
  disabled: props.workspaceRole === Roles.Workspace.Guest,
  disabledMessage: 'As a Guest you cannot access plans and billing',
  onClick: () => {
    mixpanel.track('Limit Reached Dialog Upgrade Button Clicked', {
      type: props.limitType === 'version' ? 'version' : 'model',
      location: 'viewer',
      // eslint-disable-next-line camelcase
      workspace_id: props.workspaceSlug
    })
    mutateActiveWorkspaceSlug(props.workspaceSlug)
    return navigateTo(settingsWorkspaceRoutes.billing.route(props.workspaceSlug || ''))
  }
}

const buttons = computed((): LayoutDialogButton[] => {
  const buttons: Record<LimitType, LayoutDialogButton[]> = {
    version: isEmbedEnabled.value
      ? [loadLatestButton(false)]
      : [loadLatestButton(false), explorePlansButton],
    federated: isEmbedEnabled.value
      ? [loadLatestButton(false)]
      : [loadLatestButton(false), explorePlansButton],
    comment: [loadLatestButton(true)]
  }

  return buttons[props.limitType]
})

watch(dialogOpen, (value) => {
  if (value) {
    mixpanel.track('Limit Reached Dialog Viewed', {
      type: props.limitType === 'version' ? 'version' : 'model',
      location: 'viewer',
      // eslint-disable-next-line camelcase
      workspace_id: props.workspaceSlug,
      limitType: props.limitType
    })
  }
})
</script>
