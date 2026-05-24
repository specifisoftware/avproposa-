import { ProposalData, calcSubtotal, formatCurrency } from '@/types/proposal'

interface ProposalPreviewProps {
  data: ProposalData
}

// ─── Classic Template ────────────────────────────────────────────────────────

function ClassicPreview({ data }: ProposalPreviewProps) {
  const cur = data.currency || 'USD'
  const subtotal = calcSubtotal(data.rooms)
  const taxAmount = subtotal * (data.taxRate / 100)
  const grandTotal = subtotal + taxAmount

  const hasAnyPhoto = data.rooms.some((r) => r.equipment.some((e) => e.imageUrl))

  return (
    <div
      id="proposal-preview"
      style={{
        background: '#ffffff',
        padding: '44px 52px',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#1e293b',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', lineHeight: 1 }}>
            PROPOSAL
          </div>
          {data.proposalNumber && (
            <div style={{ fontSize: '13px', color: '#2563EB', marginTop: '6px', fontWeight: 600 }}>
              #{data.proposalNumber}
            </div>
          )}
          {data.date && (
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
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
            style={{ maxHeight: '68px', maxWidth: '160px', objectFit: 'contain' }}
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

      {/* Accent line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #2563EB, #7c3aed)', borderRadius: '99px', marginBottom: '32px' }} />

      {/* Client + Integrator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '36px' }}>
        <div style={{ borderLeft: '3px solid #2563EB', paddingLeft: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Prepared For
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            {data.clientName || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Client Name</span>}
          </div>
          {data.address && (
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {data.address}
            </div>
          )}
        </div>
        <div style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Prepared By
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            {data.integratorName || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Integrator Name</span>}
          </div>
        </div>
      </div>

      {/* Rooms */}
      {data.rooms.length > 0 ? (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '18px' }}>
            Scope of Work
          </div>
          {data.rooms.map((room, idx) => {
            const roomTotal = room.equipment.reduce((acc, item) => acc + item.qty * item.unitPrice, 0)
            return (
              <div key={room.id} style={{ marginBottom: idx < data.rooms.length - 1 ? '28px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', background: '#f8fafc', borderRadius: '8px', padding: '10px 14px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {room.name || 'Unnamed Room'}
                    </span>
                    {room.type && (
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
                        {room.type}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
                    {formatCurrency(roomTotal, cur)}
                  </span>
                </div>

                {room.equipment.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        {hasAnyPhoto && <th style={{ width: '212px', borderBottom: '2px solid #e2e8f0' }} />}
                        <th style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', letterSpacing: '0.05em' }}>ITEM</th>
                        <th style={{ textAlign: 'center', padding: '7px 10px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', width: '60px' }}>QTY</th>
                        <th style={{ textAlign: 'right', padding: '7px 10px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', width: '100px' }}>UNIT</th>
                        <th style={{ textAlign: 'right', padding: '7px 10px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', width: '100px' }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.equipment.map((item, i) => {
                        const bg = i % 2 === 1 ? '#fafafa' : '#fff'
                        const border = `1px solid ${i % 2 === 0 ? '#f1f5f9' : 'transparent'}`
                        return (
                          <tr key={item.id}>
                            {hasAnyPhoto && (
                              <td style={{ padding: '6px 6px 6px 10px', borderBottom: border, background: bg }}>
                                {item.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    crossOrigin="anonymous"
                                    style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '6px', display: 'block', background: '#f8fafc' }}
                                  />
                                ) : (
                                  <div style={{ width: '200px', height: '200px', background: '#f1f5f9', borderRadius: '6px' }} />
                                )}
                              </td>
                            )}
                            <td style={{ padding: '8px 10px', color: '#334155', borderBottom: border, background: bg }}>{item.name || '—'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: '#475569', borderBottom: border, background: bg }}>{item.qty}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#475569', borderBottom: border, background: bg }}>{formatCurrency(item.unitPrice, cur)}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#0F172A', borderBottom: border, background: bg }}>{formatCurrency(item.qty * item.unitPrice, cur)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginBottom: '32px' }}>
          Add rooms on the left to see them here
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Notes &amp; Terms
          </div>
          <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line', background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', borderLeft: '3px solid #2563EB' }}>
            {data.notes}
          </div>
        </div>
      )}

      {/* Pricing summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '280px' }}>
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '14px 20px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ fontWeight: 500, color: '#334155' }}>{formatCurrency(subtotal, cur)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Tax ({data.taxRate}%)</span>
                <span style={{ fontWeight: 500, color: '#334155' }}>{formatCurrency(taxAmount, cur)}</span>
              </div>
            </div>
            <div style={{ padding: '14px 20px', background: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>Grand Total</span>
              <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '20px' }}>{formatCurrency(grandTotal, cur)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#cbd5e1' }}>
        <span>Generated with AVProposal</span>
        <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  )
}

// ─── Modern Template ─────────────────────────────────────────────────────────

function ModernPreview({ data }: ProposalPreviewProps) {
  const cur = data.currency || 'USD'
  const subtotal = calcSubtotal(data.rooms)
  const taxAmount = subtotal * (data.taxRate / 100)
  const grandTotal = subtotal + taxAmount

  const hasAnyPhoto = data.rooms.some((r) => r.equipment.some((e) => e.imageUrl))

  return (
    <div
      id="proposal-preview"
      style={{
        background: '#ffffff',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#1e293b',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Dark Header */}
      <div style={{ background: '#0F172A', padding: '36px 48px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logoUrl}
              alt="Company logo"
              crossOrigin="anonymous"
              style={{ maxHeight: '56px', maxWidth: '160px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            />
          ) : (
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              {data.integratorName || 'Your Company'}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1 }}>
            PROPOSAL
          </div>
          {data.proposalNumber && (
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
              #{data.proposalNumber}
            </div>
          )}
          {data.date && (
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {new Date(data.date + 'T12:00:00').toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>

      {/* Accent bar */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #2563EB 0%, #7c3aed 50%, #2563EB 100%)' }} />

      {/* Body */}
      <div style={{ padding: '36px 48px' }}>

        {/* Client + Integrator */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
          <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '20px 22px', border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
              Prepared For
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              {data.clientName || <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontWeight: 400 }}>Client Name</span>}
            </div>
            {data.address && (
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {data.address}
              </div>
            )}
          </div>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px 22px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
              Prepared By
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              {data.integratorName || <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontWeight: 400 }}>Integrator Name</span>}
            </div>
          </div>
        </div>

        {/* Rooms */}
        {data.rooms.length > 0 ? (
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '20px', background: '#2563EB', borderRadius: '99px' }} />
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Scope of Work
              </div>
            </div>
            {data.rooms.map((room, idx) => {
              const roomTotal = room.equipment.reduce((acc, item) => acc + item.qty * item.unitPrice, 0)
              return (
                <div key={room.id} style={{ marginBottom: idx < data.rooms.length - 1 ? '28px' : 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                        {room.name || 'Unnamed Room'}
                      </span>
                      {room.type && (
                        <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '99px' }}>
                          {room.type}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }}>
                      {formatCurrency(roomTotal, cur)}
                    </span>
                  </div>

                  {room.equipment.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                          {hasAnyPhoto && <th style={{ width: '212px' }} />}
                          <th style={{ textAlign: 'left', padding: '8px 16px', fontSize: '10px', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>ITEM</th>
                          <th style={{ textAlign: 'center', padding: '8px 16px', fontSize: '10px', fontWeight: 700, color: '#475569', width: '60px' }}>QTY</th>
                          <th style={{ textAlign: 'right', padding: '8px 16px', fontSize: '10px', fontWeight: 700, color: '#475569', width: '100px' }}>UNIT PRICE</th>
                          <th style={{ textAlign: 'right', padding: '8px 16px', fontSize: '10px', fontWeight: 700, color: '#475569', width: '100px' }}>TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {room.equipment.map((item, i) => (
                          <tr key={item.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            {hasAnyPhoto && (
                              <td style={{ padding: '7px 6px 7px 10px', borderTop: '1px solid #f1f5f9' }}>
                                {item.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    crossOrigin="anonymous"
                                    style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px', display: 'block', background: '#f8fafc' }}
                                  />
                                ) : (
                                  <div style={{ width: '200px', height: '200px', background: '#f1f5f9', borderRadius: '8px' }} />
                                )}
                              </td>
                            )}
                            <td style={{ padding: '9px 16px', color: '#334155', borderTop: '1px solid #f1f5f9' }}>{item.name || '—'}</td>
                            <td style={{ padding: '9px 16px', textAlign: 'center', color: '#64748b', borderTop: '1px solid #f1f5f9' }}>{item.qty}</td>
                            <td style={{ padding: '9px 16px', textAlign: 'right', color: '#64748b', borderTop: '1px solid #f1f5f9' }}>{formatCurrency(item.unitPrice, cur)}</td>
                            <td style={{ padding: '9px 16px', textAlign: 'right', fontWeight: 700, color: '#0F172A', borderTop: '1px solid #f1f5f9' }}>{formatCurrency(item.qty * item.unitPrice, cur)}</td>
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
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginBottom: '32px', border: '1px dashed #e2e8f0' }}>
            Add rooms on the left to see them here
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '4px', height: '20px', background: '#7c3aed', borderRadius: '99px' }} />
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Notes &amp; Terms
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-line', background: '#faf5ff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
              {data.notes}
            </div>
          </div>
        )}

        {/* Pricing summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '300px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,0.12)' }}>
            <div style={{ padding: '18px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{formatCurrency(subtotal, cur)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Tax ({data.taxRate}%)</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{formatCurrency(taxAmount, cur)}</span>
              </div>
            </div>
            <div style={{ padding: '20px 22px', background: 'linear-gradient(135deg, #1e40af, #2563EB)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grand Total</span>
              <span style={{ fontWeight: 900, color: '#ffffff', fontSize: '22px', letterSpacing: '-0.5px' }}>{formatCurrency(grandTotal, cur)}</span>
            </div>
          </div>
        </div>

        {/* Signature area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '36px' }}>
          {['Client Signature', 'Authorized Signature'].map((label) => (
            <div key={label}>
              <div style={{ borderBottom: '2px solid #e2e8f0', marginBottom: '8px', height: '40px' }} />
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <div style={{ background: '#0F172A', padding: '14px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#475569' }}>Generated with AVProposal</span>
        <span style={{ fontSize: '10px', color: '#475569' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

export default function ProposalPreview({ data }: ProposalPreviewProps) {
  if (data.template === 'modern') return <ModernPreview data={data} />
  return <ClassicPreview data={data} />
}
