import { UpsertWorkspacePlan } from '@/modules/gatekeeper/domain/billing'
import { InvalidWorkspacePlanStatus } from '@/modules/gatekeeper/errors/billing'
import { EventBusEmit } from '@/modules/shared/services/eventBus'
import { GetWorkspace } from '@/modules/workspaces/domain/operations'
import { WorkspaceNotFoundError } from '@/modules/workspaces/errors/workspace'
import { throwUncoveredError, WorkspacePlan } from '@speckle/shared'

export const updateWorkspacePlanFactory =
  ({
    getWorkspace,
    upsertWorkspacePlan,
    emitEvent
  }: {
    getWorkspace: GetWorkspace
    // im using the generic function here, cause the service is
    // responsible for protecting the permutations
    upsertWorkspacePlan: UpsertWorkspacePlan
    emitEvent: EventBusEmit
  }) =>
  async ({
    workspaceId,
    name,
    status
  }: Pick<WorkspacePlan, 'workspaceId' | 'name' | 'status'>): Promise<void> => {
    const workspace = await getWorkspace({
      workspaceId
    })
    if (!workspace) throw new WorkspaceNotFoundError()
    const createdAt = new Date()
    switch (name) {
      case 'starter':
        switch (status) {
          case 'trial':
          case 'expired':
          case 'valid':
          case 'cancelationScheduled':
          case 'canceled':
          case 'paymentFailed':
            await upsertWorkspacePlan({
              workspacePlan: { workspaceId, status, name, createdAt }
            })
            break
          default:
            throwUncoveredError(status)
        }
        break
      case 'business':
      case 'plus':
      case 'team':
      case 'teamUnlimited':
      case 'pro':
      case 'proUnlimited':
        switch (status) {
          case 'trial':
          case 'expired':
            throw new InvalidWorkspacePlanStatus()
          case 'valid':
          case 'cancelationScheduled':
          case 'canceled':
          case 'paymentFailed':
            await upsertWorkspacePlan({
              workspacePlan: { workspaceId, status, name, createdAt }
            })
            break
          default:
            throwUncoveredError(status)
        }
        break

      case 'free':
      case 'academia':
      case 'unlimited':
      case 'starterInvoiced':
      case 'plusInvoiced':
      case 'businessInvoiced':
      case 'teamUnlimitedInvoiced':
      case 'proUnlimitedInvoiced':
        switch (status) {
          case 'valid':
            await upsertWorkspacePlan({
              workspacePlan: { workspaceId, status, name, createdAt }
            })
            break
          case 'cancelationScheduled':
          case 'canceled':
          case 'expired':
          case 'paymentFailed':
          case 'trial':
            throw new InvalidWorkspacePlanStatus()
          default:
            throwUncoveredError(status)
        }
        break
      default:
        throwUncoveredError(name)
    }
    await emitEvent({
      eventName: 'gatekeeper.workspace-plan-updated',
      payload: { workspacePlan: { name, status, workspaceId } }
    })
  }
