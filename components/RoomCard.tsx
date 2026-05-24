'use client'

import { useRef, useState } from 'react'
import { Room, EquipmentItem, ROOM_TYPES, formatCurrency } from '@/types/proposal'

interface RoomCardProps {
  room: Room
  currency: string
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

function CameraIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function EquipmentRow({
  item,
  currency,
  onUpdate,
  onDelete,
}: {
  item: EquipmentItem
  currency: string
  onUpdate: (field: keyof EquipmentItem, value: string | number) => void
  onDelete: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Instant base64 preview
    const reader = new FileReader()
    reader.onload = (ev) => onUpdate('imageUrl', ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to R2 in background
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await fetch('/api/upload', { method: 'POST', body: fd })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="grid gap-2 items-center mb-2" style={{ gridTemplateColumns: '36px 1fr 52px 90px 72px 20px' }}>

      {/* Photo thumbnail / upload button */}
      <div className="relative">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        {item.imageUrl ? (
          <button
            onClick={() => fileRef.current?.click()}
            title="Change photo"
            className="relative w-9 h-9 rounded-lg overflow-hidden border border-gray-200 block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            title="Add photo"
            className="w-9 h-9 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB] text-gray-300 flex items-center justify-center transition-colors"
          >
            {uploading ? (
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <CameraIcon />
            )}
          </button>
        )}
      </div>

      <input
        type="text"
        value={item.name}
        onChange={(e) => onUpdate('name', e.target.value)}
        placeholder="Equipment name"
        className="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
      />
      <input
        type="number"
        value={item.qty}
        min="0"
        onChange={(e) => onUpdate('qty', Math.max(0, parseInt(e.target.value) || 0))}
        className="px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
      />
      <input
        type="number"
        value={item.unitPrice || ''}
        min="0"
        step="0.01"
        placeholder="0.00"
        onChange={(e) => onUpdate('unitPrice', parseFloat(e.target.value) || 0)}
        className="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
      />
      <div className="px-2 py-1.5 text-xs text-right text-slate-500 bg-white rounded-lg border border-gray-100 tabular-nums">
        {formatCurrency(item.qty * item.unitPrice, currency)}
      </div>
      <button
        onClick={onDelete}
        className="text-gray-300 hover:text-red-400 transition-colors flex items-center justify-center"
      >
        <XIcon size={12} />
      </button>
    </div>
  )
}

export default function RoomCard({ room, currency, onUpdate, onDelete }: RoomCardProps) {
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
                <option key={type} value={type}>{type}</option>
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
          <div style={{ minWidth: '440px' }}>
            <div
              className="grid gap-2 text-xs font-medium text-slate-400 mb-1.5 px-1"
              style={{ gridTemplateColumns: '36px 1fr 52px 90px 72px 20px' }}
            >
              <span />
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Total</span>
              <span />
            </div>
            {room.equipment.map((item) => (
              <EquipmentRow
                key={item.id}
                item={item}
                currency={currency}
                onUpdate={(field, value) => updateEquipment(item.id, field, value)}
                onDelete={() => deleteEquipment(item.id)}
              />
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
            Room total: {formatCurrency(roomTotal, currency)}
          </span>
        )}
      </div>
    </div>
  )
}
