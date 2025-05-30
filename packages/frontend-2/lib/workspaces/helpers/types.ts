import type { MaybeNullOrUndefined } from '@speckle/shared'
import type {
  BillingInterval,
  WorkspacePlans,
  SettingsWorkspacesRegionsSelect_ServerRegionItemFragment
} from '~/lib/common/generated/gql/graphql'

export type SsoFormValues = {
  providerName: string
  clientId: string
  clientSecret: string
  issuerUrl: string
}

export type WorkspaceSsoProviderPublic = {
  name: string
  logo?: string | null
  ssoProviderName?: string | null
}

export type WorkspaceSsoError = {
  message: string
  status?: number
}

export enum WorkspaceSsoErrorCodes {
  SESSION_MISSING_OR_EXPIRED = 'SSO_SESSION_MISSING_OR_EXPIRED_ERROR',
  VERIFICATION_CODE_MISSING = 'SSO_VERIFICATION_CODE_MISSING_ERROR',
  PROVIDER_TYPE_NOT_SUPPORTED = 'SSO_PROVIDER_TYPE_NOT_SUPPORTED',
  PROVIDER_EXISTS = 'SSO_PROVIDER_EXISTS_ERROR',
  PROVIDER_MISSING = 'SSO_PROVIDER_MISSING_ERROR'
}

export type WorkspaceWizardState = {
  name: string
  slug: string
  invites: string[]
  plan: WorkspacePlans | null
  billingInterval: BillingInterval | null
  id: string
  region: SettingsWorkspacesRegionsSelect_ServerRegionItemFragment | null
  enableDomainDiscoverabilityForDomain: MaybeNullOrUndefined<string>
}

export enum WizardSteps {
  Details = 'Details',
  Invites = 'Invites',
  Pricing = 'Pricing',
  Region = 'Region',
  AddOns = 'AddOns'
}
