import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { DashboardStats } from '../../services/adminService';
import { Users, Home, IndianRupee, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const mockTrendData = [
  { name: 'Jan', users: 400, properties: 240, revenue: 24000 },
  { name: 'Feb', users: 300, properties: 139, revenue: 22100 },
  { name: 'Mar', users: 200, properties: 980, revenue: 22900 },
  { name: 'Apr', users: 278, properties: 390, revenue: 20000 },
  { name: 'May', users: 189, properties: 480, revenue: 21810 },
  { name: 'Jun', users: 239, properties: 380, revenue: 25000 },
  { name: 'Jul', users: 349, properties: 430, revenue: 21000 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    adminService.getDashboardStats().then(setStats);
  }, []);

  if (!stats) return <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Loading dashboard...</div>;

  const dataQualityScore = 92;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h1 className="h2">Master Dashboard</h1>
        
        {/* Data Quality Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Data Quality Score:</span>
          <span style={{ fontWeight: 'bold', color: dataQualityScore > 90 ? 'var(--color-success)' : 'var(--color-warning)' }}>{dataQualityScore}%</span>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
        
        {/* Users KPI */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Total Users</div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold' }}>{stats.users.total}</div>
            </div>
            <div style={{ backgroundColor: 'var(--color-primary-light)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
              <Users color="var(--color-primary-dark)" size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            <span><span style={{ color: 'var(--color-success)' }}>●</span> {stats.users.active} Active</span>
            <span><span style={{ color: 'var(--color-error)' }}>●</span> {stats.users.total - stats.users.active} Inactive</span>
          </div>
        </div>

        {/* Properties KPI */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Total Properties</div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold' }}>{stats.properties.total}</div>
            </div>
            <div style={{ backgroundColor: '#e0e7ff', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
              <Home color="#4338ca" size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            <span><span style={{ color: 'var(--color-success)' }}>●</span> {stats.properties.published} Published</span>
            <span><span style={{ color: 'var(--color-warning)' }}>●</span> {stats.properties.pending} Pending</span>
          </div>
        </div>

        {/* Revenue KPI */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Total Revenue</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>{formatCurrency(stats.financial.revenue)}</div>
            </div>
            <div style={{ backgroundColor: '#dcfce7', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
              <IndianRupee color="#15803d" size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            <span>{stats.financial.activeSubscriptions} Active Subscriptions</span>
          </div>
        </div>

        {/* Action Required KPI */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Action Required</div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-error)' }}>{stats.issues.openComplaints + stats.issues.pendingDocuments}</div>
            </div>
            <div style={{ backgroundColor: '#fee2e2', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
              <ShieldAlert color="#b91c1c" size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            <span>{stats.issues.pendingDocuments} Pending Docs</span>
            <span>{stats.issues.openComplaints} Complaints</span>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
        
        {/* Growth Chart */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 className="h4" style={{ marginBottom: 'var(--spacing-6)' }}>Platform Growth (Last 7 Months)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={mockTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="New Users" />
                <Line yAxisId="right" type="monotone" dataKey="properties" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="New Listings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Chart */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 className="h4" style={{ marginBottom: 'var(--spacing-6)' }}>User Role Distribution</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={[
                { name: 'Buyers', count: stats.users.buyers },
                { name: 'Sellers', count: stats.users.sellers },
                { name: 'Agents', count: stats.users.agents }
              ]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Quick Action Alerts */}
      <h3 className="h4" style={{ marginBottom: 'var(--spacing-4)' }}>Pending Attention</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ backgroundColor: '#fff7ed', padding: 'var(--spacing-3)', borderRadius: '50%' }}>
            <FileText color="#ea580c" />
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{stats.issues.pendingDocuments} Verification Reviews</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Properties waiting for document check</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ backgroundColor: '#fee2e2', padding: 'var(--spacing-3)', borderRadius: '50%' }}>
            <ShieldAlert color="#b91c1c" />
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{stats.issues.openComplaints} Open Complaints</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>User reports requiring moderation</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ backgroundColor: '#e0e7ff', padding: 'var(--spacing-3)', borderRadius: '50%' }}>
            <CheckCircle color="#4338ca" />
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{stats.properties.pending} Property Approvals</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>New listings pending publication</div>
          </div>
        </div>
      </div>
    </div>
  );
}
