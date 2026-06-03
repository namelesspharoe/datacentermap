import type { Official } from '../types/officials'

const now = '2026-05-28T00:00:00.000Z'

/** Seed officials for demo counties (fictional contact details for UI testing). */
export const SEED_OFFICIALS: Official[] = [
  // Loudoun County, VA (51107)
  {
    id: 'seed-51107-1',
    countyFips: '51107',
    name: 'Phyllis J. Randall',
    position: 'Chair, Board of Supervisors',
    phone: '703-777-0200',
    email: 'chair@loudoun.gov',
    website: 'https://www.loudoun.gov',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  {
    id: 'seed-51107-2',
    countyFips: '51107',
    name: 'Caleb A. Kershner',
    position: 'Vice Chair, Board of Supervisors',
    phone: '703-777-0204',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  {
    id: 'seed-51107-3',
    countyFips: '51107',
    name: 'Stephen D. Norman',
    position: 'County Administrator',
    phone: '703-777-0100',
    email: 'administrator@loudoun.gov',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  // Santa Clara County, CA (06085)
  {
    id: 'seed-06085-1',
    countyFips: '06085',
    name: 'Susan Ellenberg',
    position: 'President, Board of Supervisors',
    phone: '408-299-5031',
    website: 'https://www.sccgov.org',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  {
    id: 'seed-06085-2',
    countyFips: '06085',
    name: 'James Williams',
    position: 'County Executive',
    phone: '408-299-5100',
    email: 'ceo@sccgov.org',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  // Prince William County, VA (51153)
  {
    id: 'seed-51153-1',
    countyFips: '51153',
    name: 'Desmond L. Armstrong',
    position: 'Chair, Board of County Supervisors',
    phone: '703-792-6000',
    website: 'https://www.pwcva.gov',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  {
    id: 'seed-51153-2',
    countyFips: '51153',
    name: 'Christopher E. Martino',
    position: 'County Executive',
    phone: '703-792-6001',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  // Maricopa County, AZ (04013)
  {
    id: 'seed-04013-1',
    countyFips: '04013',
    name: 'Jack Sellers',
    position: 'Chair, Board of Supervisors',
    phone: '602-506-1111',
    website: 'https://www.maricopa.gov',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  {
    id: 'seed-04013-2',
    countyFips: '04013',
    name: 'Denny Barney',
    position: 'Vice Chair, Board of Supervisors',
    phone: '602-506-7562',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  // Cook County, IL (17031)
  {
    id: 'seed-17031-1',
    countyFips: '17031',
    name: 'Toni Preckwinkle',
    position: 'President, Cook County Board',
    phone: '312-603-6400',
    website: 'https://www.cookcountyil.gov',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
  {
    id: 'seed-17031-2',
    countyFips: '17031',
    name: 'Karen Yarbrough',
    position: 'County Clerk',
    phone: '312-603-5000',
    email: 'clerk@cookcountyil.gov',
    source: 'seed',
    status: 'approved',
    updatedAt: now,
  },
]

export function getSeedOfficialsByFips(fips: string): Official[] {
  return SEED_OFFICIALS.filter((o) => o.countyFips === fips && o.status === 'approved')
}
