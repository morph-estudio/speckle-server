<template>
  <LayoutDialog v-model:open="open" max-width="md" :buttons="dialogButtons">
    <template #header>Join existing workspaces</template>
    <p class="text-body-xs text-foreground-2 pb-3">
      {{
        hasDiscoverableWorkspacesOrJoinRequests
          ? 'Workspaces that match your email domain'
          : 'You have no discoverable workspaces'
      }}
    </p>
    <div class="flex flex-col gap-y-3">
      <WorkspaceDiscoverableWorkspacesCard
        v-for="workspace in discoverableWorkspacesAndJoinRequests"
        :key="workspace.id"
        :workspace="workspace"
        show-dismiss-button
        location="workspace_switcher"
      />
    </div>
  </LayoutDialog>
</template>
<script setup lang="ts">
import type { LayoutDialogButton } from '@speckle/ui-components'
import { useDiscoverableWorkspaces } from '~/lib/workspaces/composables/discoverableWorkspaces'

const {
  discoverableWorkspacesAndJoinRequests,
  hasDiscoverableWorkspacesOrJoinRequests
} = useDiscoverableWorkspaces()

const open = defineModel<boolean>('open', { required: true })

const dialogButtons = computed((): LayoutDialogButton[] => {
  return [
    {
      text: 'Close',
      onClick: () => {
        open.value = false
      }
    }
  ]
})
</script>
