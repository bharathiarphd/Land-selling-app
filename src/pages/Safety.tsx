import { ShieldAlert, CheckCircle, FileText, Map, Scale } from 'lucide-react';

export default function Safety() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
        <div style={{ backgroundColor: '#fef2f2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-4)' }}>
          <ShieldAlert color="#ef4444" size={40} />
        </div>
        <h1 className="h2">Buyer Safety Center</h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Protect yourself when buying land. Follow these essential guidelines before completing any transaction.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
        
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 className="h4" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', color: 'var(--color-primary-dark)' }}>
            <FileText /> Document Verification
          </h2>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Check Encumbrance Certificate (EC):</strong> Always verify the EC for the past 15-30 years to ensure there are no hidden loans or disputes.</span></li>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Verify Patta & Chitta:</strong> Ensure the revenue records match the seller's name.</span></li>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Trace Parent Documents:</strong> Review the chain of title leading up to the current owner.</span></li>
          </ul>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 className="h4" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', color: 'var(--color-primary-dark)' }}>
            <Map /> Physical Inspection
          </h2>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Visit the Site:</strong> Never buy land without physically visiting it multiple times.</span></li>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Verify Boundaries:</strong> Cross-check physical boundaries with the FMB (Field Measurement Book) sketch.</span></li>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Check Road Access:</strong> Ensure the land has legal and physical road access, not just paper access.</span></li>
          </ul>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 className="h4" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', color: 'var(--color-primary-dark)' }}>
            <Scale /> Legal Precautions
          </h2>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Hire a Property Lawyer:</strong> Have a qualified legal professional scrutinize all documents before paying an advance.</span></li>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Beware of Unapproved Layouts:</strong> Ensure DTCP or CMDA approvals are genuine. Panchayat approvals may not be valid for layouts.</span></li>
            <li style={{ display: 'flex', gap: 'var(--spacing-3)' }}><CheckCircle color="var(--color-success)" size={20} style={{ flexShrink: 0 }} /> <span><strong>Never Send Advance Online:</strong> Do not transfer token amounts purely based on online listings without verification.</span></li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#fffbeb', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid #fcd34d', textAlign: 'center', marginTop: 'var(--spacing-4)' }}>
          <p style={{ color: '#92400e', fontWeight: 'bold' }}>
            Disclaimer: The Land Selling App provides a platform for buyers and sellers to connect. We do not guarantee the title, ownership, or legal status of any property listed on our platform.
          </p>
        </div>
      </div>
    </div>
  );
}
