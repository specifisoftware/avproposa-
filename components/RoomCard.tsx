'use client'

import { Room, EquipmentItem, ROOM_TYPES } from '@/types/proposal'

interface RoomCardProps {
  room: Room
  onUpdate: (room: Room) => void
  onDelete: (id: string) => void
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export default function RoomCard({ room, onUpdate, onDelete }: RoomCardProps) {
  const addEquipment = () => {
    onUpdate({
      ...room,
      equipment: [
        ...room.equipment,
        { id: Date.now().toString(), name: '', qty: 1, unitPrice: 0 },
      ],
    })
  }

  const updateEquipment = (id: string, field: keyof EquipmentItem, value: string | number) => {
    onUpdate({
      ...room,
      equipment: room.equipment.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    })
  }

  const deleteEquipment = (id: string) => {
    onUpdate({
      ...room,
      equipment: room.equipment.filter((item) => item.id !== id),
    })
  }

  const roomTotal = room.equipment.reduce((acc, item) => acc + item.qty * item.unitPrice, 0)

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
      {/* Room header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Room Name</label>
            <input
              type="text"
              value={room.name}
              onChange={(e) => onUpdate({ ...room, name: e.target.value })}
              placeholder="e.g. Main Conference Room"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Room Type</label>
            <select
              value={room.type}
              onChange={(e) => onUpdate({ ...room, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            >
              <option value="">Select type…</option>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => onDelete(room.id)}
          title="Remove room"
          className="mt-5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Equipment table */}
      {room.equipment.length > 0 && (
        <div className="mb-3 overflow-x-auto -mx-4 px-4">
          <div style={{ minWidth: '380px' }}>
          <div className="grid gap-2 text-xs font-medium text-slate-400 mb-1.5 px-1"
               style={{ gridTemplateColumns: '1fr 52px 90px 80px 24px' }}>
            <span>Item</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Total</span>
            <span />
          </div>
          {room.equipment.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 items-center mb-2"
              style={{ gridTemplateColumns: '1fr 52px 90px 80px 24px' }}
            >
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateEquipment(item.id, 'name', e.target.value)}
                placeholder="Equipment name"
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <input
                type="number"
                value={item.qty}
                min="0"
                onChange={(e) =>
                  updateEquipment(item.id, 'qty', Math.max(0, parseInt(e.target.value) || 0))
                }
                className="px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <input
                type="number"
                value={item.unitPrice || ''}
                min="0"
                step="0.01"
                placeholder="0.00"
                onChange={(e) =>
                  updateEquipment(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                }
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <div className="px-2 py-1.5 text-xs text-right text-slate-500 bg-white rounded-lg border border-gray-100 tabular-nums">
                ${(item.qty * item.unitPrice).toFixed(2)}
              </div>
              <button
                onClick={() => deleteEquipment(item.id)}
                className="text-gray-300 hover:text-red-400 transition-colors flex items-center justify-center"
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <button
          onClick={addEquipment}
          className="text-xs font-medium text-[#2563EB] hover:underline"
        >
          + Add equipment row
        </button>
        {room.equipment.length > 0 && (
          <span className="text-xs font-semibold text-slate-600 tabular-nums">
            Room total: ${roomTotal.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  )
}
