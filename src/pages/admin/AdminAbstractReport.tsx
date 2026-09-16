import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { AbstractReportData } from '../../services/adminService';
import { Printer, Download } from 'lucide-react';
import { Button } from '../../components/Button';

export default function AdminAbstractReport() {
  const [report, setReport] = useState<AbstractReportData | null>(null);

  useEffect(() => {
    adminService.getAbstractReport().then(setReport);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!report) return <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Generating Abstract Report...</div>;

  return (
    <div>
      {/* Action Bar (Hidden when printing) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h1 className="h2">Abstract Report</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
          <Button variant="outline" onClick={handlePrint}><Printer size={18} /> Print Report</Button>
          <Button><Download size={18} /> Export PDF</Button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div className="print-container" style={{ backgroundColor: '#fff', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', color: '#000' }}>
        
        {/* Report Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
          <h1 style={{ margin: 0, textTransform: 'uppercase', fontSize: '24px' }}>Land Selling App</h1>
          <h2 style={{ margin: '8px 0', textTransform: 'uppercase', fontSize: '18px', color: '#444' }}>Administrative Abstract Report</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-4)', fontSize: '12px' }}>
            <span><strong>Period:</strong> {report.period}</span>
            <span><strong>Generated:</strong> {new Date().toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
          
          {/* A. User Abstract */}
          <section>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', fontSize: '16px' }}>A. USER ABSTRACT</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Category</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Active</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Inactive</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>Buyers</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{report.userAbstract.buyers}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>-</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>-</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>Sellers</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{report.userAbstract.sellers}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>-</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>-</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>Agents</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{report.userAbstract.agents}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>-</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>-</td>
                </tr>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>Total Users</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{report.userAbstract.total}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{report.userAbstract.active}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{report.userAbstract.inactive}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* B. Property Abstract */}
          <section>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', fontSize: '16px' }}>B. PROPERTY ABSTRACT</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Property Type</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Published</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Pending</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Sold</th>
                </tr>
              </thead>
              <tbody>
                {report.propertyAbstract.map((p, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.type}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{p.total}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{p.published}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{p.pending}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{p.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* C. Location Abstract */}
          <section>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', fontSize: '16px' }}>C. LOCATION-WISE ABSTRACT</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>District</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Properties</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Published</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Sold</th>
                </tr>
              </thead>
              <tbody>
                {report.locationAbstract.map((loc, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{loc.district}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{loc.total}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{loc.published}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{loc.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* D. Price Abstract */}
          <section style={{ breakInside: 'avoid' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', fontSize: '16px' }}>D. PRICE ABSTRACT</h3>
            <div style={{ display: 'flex', gap: '40px', fontSize: '14px' }}>
              <div>
                <div style={{ color: '#555' }}>Total Listed Value</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>₹ {report.priceAbstract.totalValue.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ color: '#555' }}>Average Property Price</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>₹ {report.priceAbstract.avgPrice.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </section>

          {/* Verification Signature */}
          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px dotted #ccc', paddingTop: '20px' }}>
            <div>
              <p>Generated By: _____________________</p>
              <p style={{ marginTop: '8px' }}>(System Administrator)</p>
            </div>
            <div>
              <p>Authorized Signature: _____________________</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
