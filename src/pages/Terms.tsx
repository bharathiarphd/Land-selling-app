export default function Terms() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-8) 0', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Terms & Conditions</h1>
      <div style={{ marginTop: 'var(--spacing-6)', color: 'var(--color-text)', lineHeight: 1.8 }}>
        <p style={{ marginBottom: 'var(--spacing-4)' }}>
          Welcome to Land Selling App. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions of use.
        </p>
        <h3 style={{ marginTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-2)' }}>1. User Accounts & Verification</h3>
        <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
          Users must provide accurate, current, and complete information during registration, including full name, verified phone number, email address, district, and PIN code. Each registered user is assigned a unique account ID.
        </p>
        <h3 style={{ marginTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-2)' }}>2. Property Listings</h3>
        <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
          Sellers and agents are responsible for ensuring that all uploaded property information, pricing, documents (Patta, Chitta, EC, DTCP/CMDA approvals), and survey details are genuine and legally valid.
        </p>
        <h3 style={{ marginTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-2)' }}>3. Privacy & Communication</h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          We respect user privacy and use industry-standard security to safeguard user credentials, authentication PINs, and personal communications.
        </p>
      </div>
    </div>
  );
}
