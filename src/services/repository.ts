import type { CountiesIndex, CountyRecord } from '../types/geo'
import type { ContributionInput, Official, PendingContribution } from '../types/officials'

export interface IDataRepository {
  loadCounties(): Promise<CountiesIndex>
  getOfficialsByFips(fips: string): Promise<Official[]>
  getPendingContributions(): Promise<PendingContribution[]>
  submitContribution(
    input: ContributionInput,
    submittedBy: string,
  ): Promise<PendingContribution>
}

export type { CountyRecord }
