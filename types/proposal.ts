export interface EquipmentItem {
  id: string
  name: string
  qty: number
  unitPrice: number
}

export interface Room {
  id: string
  name: string
  type: string
  equipment: EquipmentItem[]
}

export type ProposalTemplate = 'classic' | 'modern'

export interface ProposalData {
  clientName: string
  integratorName: string
  address: string
  date: string
  proposalNumber: string
  logoUrl: string
  rooms: Room[]
  notes: string
  taxRate: number
  template: ProposalTemplate
}

export const ROOM_TYPES = [
  'Conference Room',
  'Boardroom',
  'Classroom',
  'Auditorium',
  'Training Room',
  'Lobby / Reception',
  'Huddle Room',
  'Command Center',
  'House of Worship',
  'Retail',
  'Other',
] as const

export function calcSubtotal(rooms: Room[]): number {
  return rooms.reduce(
    (acc, room) =>
      acc + room.equipment.reduce((racc, item) => racc + item.qty * item.unitPrice, 0),
    0,
  )
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function makeDefaultProposal(): ProposalData {
  return {
    clientName: '',
    integratorName: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    proposalNumber: `PROP-${Date.now().toString().slice(-6)}`,
    logoUrl: '',
    rooms: [],
    notes: '',
    taxRate: 10,
    template: 'classic',
  }
}
