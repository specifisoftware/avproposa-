import { ProposalData, calcSubtotal, formatCurrency } from '@/types/proposal'

interface ProposalPreviewProps {
  data: ProposalData
}

export default function ProposalPreview({ data }: ProposalPreviewProps) {
  const subtotal = calcSubtotal(data.rooms)
  const taxAmount = subtotal * (data.taxRate / 100)
  const grandTotal = subtotal + taxAmount

  return (
    <div
      id="proposal-preview"
      style={{
        background: '#ffffff',
        padding: '40px 48px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#1e293b',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.3px' }}>
            PROPOSAL
          </div>
          {data.proposalNumber && (
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              #{data.proposalNumber}
            </div>
          )}
          {data.date && (
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              {new Date(data.date + 'T12:00:00').toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          )}
        </div>

        {data.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.logoUrl}
            alt="Company logo"
            crossOrigin="anonymous"
            style={{ maxHeight: '64px', maxWidth: '160px', objectFit: 'contain' }}
          />
        ) : (
          <div style={{
            width: '140px', height: '56px', background: '#f1f5f9', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', color: '#94a3b8', fontStyle: 'italic',
          }}>
            Company Logo
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '28px' }} />

      {/* Client + Integrator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Prepared For
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
            {data.clientName || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Client Name</span>}
          </div>
          {data.address && (
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {data.address}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Prepared By
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
            {data.integratorName || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Integrator Name</span>}
          </div>
        </div>
      </div>

      {/* Rooms */}
      {data.rooms.length > 0 ? (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Scope of Work
          </div>
          {data.rooms.map((room, idx) => {
            const roomTotal = room.equipment.reduce(
              (acc, item) => acc + item.qty * item.unitPrice, 0,
            )
            return (
              <div key={room.id} style={{ marginBottom: idx < data.rooms.length - 1 ? '24px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                      {room.name || 'Unnamed Room'}
                    </span>
                    {room.type && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>
                        {room.type}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    {formatCurrency(roomTotal)}
                  </span>
                </div>

                {room.equipment.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ textAlign: 'left', padding: '7px 10px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', borderBottom: '1px solid #e2e8f0' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '7px 10px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', borderBottom: '1px solid #e2e8f0', width: '60px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '7px 10px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', borderBottom: '1px solid #e2e8f0', width: '100px' }}>Unit Price</th>
                        <th style={{ textAlign: 'right', padding: '7px 10px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', borderBottom: '1px solid #e2e8f0', width: '100px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.equipment.map((item, i) => (
                        <tr key={item.id} style={{ background: i % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                          <td style={{ padding: '7px 10px', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>{item.name || '—'}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'center', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{item.qty}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{formatCurrency(item.unitPrice)}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: '#334155', borderBottom: '1px solid #f1f5f9' }}>{formatCurrency(item.qty * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{
          background: '#f8fafc', borderRadius: '10px', padding: '32px',
          textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginBottom: '32px',
        }}>
          Add rooms on the left to see them here
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Notes &amp; Terms
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line', background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', borderLeft: '3px solid #e2e8f0' }}>
            {data.notes}
          </div>
        </div>
      )}

      {/* Pricing summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '260px' }}>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Subtotal</span>
              <span style={{ fontWeight: 500, color: '#334155' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Tax ({data.taxRate}%)</span>
              <span style={{ fontWeight: 500, color: '#334155' }}>{formatCurrency(taxAmount)}</span>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>Grand Total</span>
              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '18px' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
        <span>Generated with AVProposal</span>
        <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  )
}
