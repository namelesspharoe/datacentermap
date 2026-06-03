export type OfficialSource = 'seed' | 'community'
export type OfficialStatus = 'pending' | 'approved' | 'rejected'

export interface Official {
  id: string
  countyFips: string
  name: string
  position: string
  phone?: string
  email?: string
  website?: string
  source: OfficialSource
  status: OfficialStatus
  updatedAt: string
}

export interface ContributionInput {
  countyFips: string
  name: string
  position: string
  phone?: string
  email?: string
  website?: string
}

export interface PendingContribution extends ContributionInput {
  id: string
  submittedAt: string
  submittedBy: string
  status: 'pending'
}
