import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Home, IndianRupee, ShieldAlert, FileText, CheckCircle, 
  TrendingUp, TrendingDown, Plus, Eye, Download, FileSpreadsheet, MapPin, Clock,
  Copy, Check, ExternalLink, PhoneCall
} from 'lucide-react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { adminService, type DashboardStats } from '../../services/adminService';
import { getAllProperties } from '../../utils/propertyUtils';
import { contactRequestUtils } from '../../utils/contactRequestUtils';

export default function AdminDashboard() {
  const [timeFilter, setTimeFilter] = useState('30 Days');
  const [revenueFilter, setRevenueFilter] = useState('Monthly');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

  const handleCopy = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    adminService.getDashboardStats().then(data => {
      setStats(data);
    });
    adminService.getRegisteredUsers().then(users => {
      setRegisteredUsers(users);
    });
    contactRequestUtils.getAllRequests().then(requests => {
      setPendingRequestsCount(requests.filter(r => r.status === 'Pending').length);
    });
  }, []);

  const allProps = getAllProperties();

  // Dynamic distribution from actual properties & users
  const userPieData = [
    { name: 'Buyers', value: stats?.users.buyers || 0, color: '#3b82f6' },
    { name: 'Sellers', value: stats?.users.sellers || 0, color: '#10b981' },
    { name: 'Agents', value: stats?.users.agents || 0, color: '#8b5cf6' },
  ];

  const typeCounts = allProps.reduce<Record<string, number>>((acc, p) => {
    const t = p.propertyType || 'Other';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const propertyTypeData = Object.keys(typeCounts).length > 0 ? Object.entries(typeCounts).map(([name, value], i) => ({
    name,
    value,
    color: ['#6366f1', '#f59e0b', '#14b8a6', '#ec4899', '#8b5cf6'][i % 5]
  })) : [
    { name: 'Residential', value: 0, color: '#6366f1' },
    { name: 'Commercial', value: 0, color: '#f59e0b' },
    { name: 'Land/Plot', value: 0, color: '#14b8a6' }
  ];

  const locCounts = allProps.reduce<Record<string, number>>((acc, p) => {
    if (p.district) acc[p.district] = (acc[p.district] || 0) + 1;
    return acc;
  }, {});

  const locationData = Object.keys(locCounts).length > 0 ? Object.entries(locCounts).map(([city, count]) => ({
    city,
    count
  })) : [
    { city: 'Chennai', count: 0 },
    { city: 'Coimbatore', count: 0 },
    { city: 'Madurai', count: 0 }
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const revenueData = months.map(name => ({
    name,
    subscription: 0,
    listing: 0,
    agents: 0
  }));

  const platformGrowthData = [
    { name: 'W1', users: stats?.users.total || 0, properties: allProps.length, views: allProps.reduce((sum, p) => sum + (p.views || 0), 0), enquiries: allProps.reduce((sum, p) => sum + (p.enquiries || 0), 0) },
    { name: 'W2', users: stats?.users.total || 0, properties: allProps.length, views: 0, enquiries: 0 },
    { name: 'W3', users: stats?.users.total || 0, properties: allProps.length, views: 0, enquiries: 0 },
    { name: 'W4', users: stats?.users.total || 0, properties: allProps.length, views: 0, enquiries: 0 },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const Card = ({ children, style = {} }: any) => (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', ...style }}>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Dashboard Sub-Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>Overview</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Last updated: Today at 14:30 PM</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            {['Today', '7 Days', '30 Days', '12 Months'].map(f => (
              <button 
                key={f}
                onClick={() => setTimeFilter(f)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer',
                  backgroundColor: timeFilter === f ? '#fff' : 'transparent',
                  color: timeFilter === f ? '#0f172a' : '#64748b',
                  boxShadow: timeFilter === f ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>Total Users</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a' }}>{stats?.users.total.toLocaleString('en-IN') ?? '0'}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><Users size={20} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontWeight: '500' }}><TrendingUp size={14} style={{marginRight: '2px'}}/> Live</span>
            <span style={{ color: '#94a3b8' }}>database users</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>Active Users</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a' }}>{stats?.users.active.toLocaleString('en-IN') ?? '0'}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#10b981' }}><Users size={20} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontWeight: '500' }}><TrendingUp size={14} style={{marginRight: '2px'}}/> Active</span>
            <span style={{ color: '#94a3b8' }}>current session</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>Total Properties</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a' }}>{stats?.properties.total.toLocaleString('en-IN') ?? '0'}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#f3e8ff', borderRadius: '8px', color: '#8b5cf6' }}><Home size={20} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontWeight: '500' }}><TrendingUp size={14} style={{marginRight: '2px'}}/> Live</span>
            <span style={{ color: '#94a3b8' }}>published & draft</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>Total Revenue</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a' }}>{formatCurrency(stats?.financial.revenue || 0)}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#d97706' }}><IndianRupee size={20} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: '#94a3b8' }}>from paid listings & subscriptions</span>
          </div>
        </Card>

        <Card style={{ backgroundColor: '#fff1f2', borderColor: '#ffe4e6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#be123c', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Pending Approvals</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#9f1239' }}>{stats?.properties.pending.toLocaleString('en-IN') ?? '0'}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#ffe4e6', borderRadius: '8px', color: '#e11d48' }}><FileText size={20} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#be123c', fontWeight: '500' }}>
            Requires attention
          </div>
        </Card>
        
        <Card style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#c2410c', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Open Complaints</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#9a3412' }}>{stats?.issues.openComplaints.toLocaleString('en-IN') ?? '0'}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#ffedd5', borderRadius: '8px', color: '#ea580c' }}><ShieldAlert size={20} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: '#c2410c' }}>active reports</span>
          </div>
        </Card>

        <Link to="/admin/contact-requests" style={{ textDecoration: 'none' }}>
          <Card style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ color: '#166534', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Buyer Contact Requests</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#15803d' }}>{pendingRequestsCount} Pending</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#16a34a' }}><PhoneCall size={20} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#15803d', fontWeight: '600' }}>
              Review & Approve Owner Access →
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/admin/contact-requests" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
              <PhoneCall size={16} /> Review Contact Requests ({pendingRequestsCount})
            </button>
          </Link>
          {[
            { label: 'Add Property', icon: <Plus size={16}/>, primary: true },
            { label: 'Add User', icon: <Users size={16}/> },
            { label: 'Review Approvals', icon: <CheckCircle size={16}/> },
            { label: 'View Complaints', icon: <ShieldAlert size={16}/> },
            { label: 'Generate Report', icon: <FileSpreadsheet size={16}/> }
          ].map((action, i) => (
            <button key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
              backgroundColor: action.primary ? '#2563eb' : '#fff',
              color: action.primary ? '#fff' : '#0f172a',
              border: action.primary ? 'none' : '1px solid #e2e8f0',
              boxShadow: action.primary ? '0 4px 6px -1px rgba(37,99,235,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}>
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        
        {/* Revenue Analytics */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>Revenue Analytics</h2>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{formatCurrency(1900000)} <span style={{fontSize:'0.85rem', color:'#10b981', fontWeight:'500'}}>+18%</span></div>
            </div>
            <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', outline: 'none', color: '#0f172a' }} value={revenueFilter} onChange={e => setRevenueFilter(e.target.value)}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorList" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}/>
                <Area type="monotone" dataKey="subscription" name="Subscriptions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="listing" name="Listing Fees" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorList)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Platform Growth */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>Platform Growth</h2>
            <button style={{ background:'none', border:'none', color:'#2563eb', fontSize:'0.85rem', fontWeight:'500', cursor:'pointer' }}>View Details</button>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}/>
                <Line yAxisId="left" type="monotone" dataKey="views" name="Property Views" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="enquiries" name="Enquiries" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Analytics & Geographic Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* User Analytics Pie */}
        <Card>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>User Demographics</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '50%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {userPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userPieData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '0.9rem', color: '#475569' }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Property Analytics Pie */}
        <Card>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>Property Categories</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '50%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={propertyTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {propertyTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {propertyTypeData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '0.9rem', color: '#475569' }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>Property Distribution</h2>
            <MapPin size={18} color="#94a3b8" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {locationData.map((loc, i) => {
              const max = Math.max(...locationData.map(d => d.count));
              const width = `${(loc.count / max) * 100}%`;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#475569', fontWeight: '500' }}>{loc.city}</span>
                    <span style={{ color: '#0f172a', fontWeight: '600' }}>{loc.count}</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width, backgroundColor: '#2563eb', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Real Registered Users Section */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#0284c7" />
              <span>Real Registered Users (நேரலை பயனர்கள்)</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              All registered users from live database with name, mobile number, registration date, and account status
            </p>
          </div>
          <Link 
            to="/admin/users" 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px', 
              color: '#0284c7', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none',
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #bae6fd', backgroundColor: '#f0f9ff',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Manage All Users</span>
            <ExternalLink size={14} />
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 20px', fontWeight: '600' }}>User ID</th>
                <th style={{ padding: '14px 20px', fontWeight: '600' }}>Name (பெயர்)</th>
                <th style={{ padding: '14px 20px', fontWeight: '600' }}>Mobile Number (கைபேசி)</th>
                <th style={{ padding: '14px 20px', fontWeight: '600' }}>Role (பங்கு)</th>
                <th style={{ padding: '14px 20px', fontWeight: '600' }}>Registration Date (பதிவு தேதி)</th>
                <th style={{ padding: '14px 20px', fontWeight: '600' }}>Account Status (கணக்கு நிலை)</th>
              </tr>
            </thead>
            <tbody>
              {registeredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Loading registered users from database...
                  </td>
                </tr>
              ) : (
                registeredUsers.slice(0, 8).map((u: any) => {
                  const role = u.role || 'Buyer';
                  const prefix = role === 'Admin' ? 'ADM' : role === 'Seller' ? 'SLR' : role === 'Agent' ? 'AGT' : 'USR';
                  const uid = u.userId || (u.phone?.includes('8248843385') ? 'ADM-000001' : `${prefix}-000001`);
                  const isCopied = copiedId === uid;
                  const isSuspended = u.status === 'Suspended';

                  return (
                    <tr key={u._id || u.id || uid} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: role === 'Admin' ? '#0284c7' : '#0f172a',
                            backgroundColor: role === 'Admin' ? 'rgba(2, 132, 199, 0.1)' : 'rgba(100, 116, 139, 0.08)',
                            border: `1px solid ${role === 'Admin' ? '#bae6fd' : '#e2e8f0'}`,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}>
                            {uid}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(uid)}
                            title={isCopied ? 'Copied!' : 'Copy User ID'}
                            style={{
                              background: isCopied ? '#dcfce7' : 'transparent',
                              border: '1px solid',
                              borderColor: isCopied ? '#86efac' : '#cbd5e1',
                              cursor: 'pointer',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: '11px',
                              color: isCopied ? '#15803d' : '#64748b'
                            }}
                          >
                            {isCopied ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0f172a' }}>
                        {u.name || 'User'}
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#334155' }}>
                        {u.phone ? u.phone.replace('+91', '+91 ') : '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: role === 'Admin' ? '#e0f2fe' : role === 'Agent' ? '#f3e8ff' : role === 'Seller' ? '#dcfce7' : '#f1f5f9',
                          color: role === 'Admin' ? '#0369a1' : role === 'Agent' ? '#7e22ce' : role === 'Seller' ? '#15803d' : '#475569'
                        }}>
                          {role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: isSuspended ? '#fee2e2' : '#dcfce7',
                          color: isSuspended ? '#dc2626' : '#15803d',
                          border: `1px solid ${isSuspended ? '#fca5a5' : '#86efac'}`
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isSuspended ? '#dc2626' : '#16a34a'
                          }} />
                          {u.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tables & Activity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Top Properties Table */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>Top Performing Properties</h2>
            <button style={{ background:'none', border:'none', color:'#2563eb', fontSize:'0.85rem', fontWeight:'500', cursor:'pointer' }}>View All</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Property</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Location</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Price</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Views</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Luxury Sea View Villa', loc: 'Chennai', price: '₹3.5 Cr', views: '12.4k', status: 'Published', color: '#10b981', bg: '#d1fae5' },
                  { name: 'Tech Park Commercial Space', loc: 'Bengaluru', price: '₹12.0 Cr', views: '8.2k', status: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
                  { name: 'Gated Community Plot', loc: 'Coimbatore', price: '₹45 Lakh', views: '6.5k', status: 'Published', color: '#10b981', bg: '#d1fae5' },
                  { name: 'Modern 3BHK Apartment', loc: 'Hyderabad', price: '₹1.2 Cr', views: '5.1k', status: 'Sold', color: '#64748b', bg: '#f1f5f9' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '500', color: '#0f172a', fontSize: '0.9rem' }}>{row.name}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{row.loc}</td>
                    <td style={{ padding: '16px 20px', fontWeight: '500', color: '#0f172a', fontSize: '0.9rem' }}>{row.price}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{row.views}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', color: row.color, backgroundColor: row.bg }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '4px' }}><Eye size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity Timeline */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>Recent Activity</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '16px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>
            
            {[
              { text: 'User Arun Kumar registered', time: '2 mins ago', icon: <Users size={14}/>, color: '#3b82f6', bg: '#dbeafe' },
              { text: 'New property added by Priya S.', time: '12 mins ago', icon: <Home size={14}/>, color: '#8b5cf6', bg: '#ede9fe' },
              { text: 'Property #1042 approved', time: '24 mins ago', icon: <CheckCircle size={14}/>, color: '#10b981', bg: '#d1fae5' },
              { text: 'Payment of ₹25,000 received', time: '1 hr ago', icon: <IndianRupee size={14}/>, color: '#f59e0b', bg: '#fef3c7' },
              { text: 'Complaint #239 resolved', time: '2 hrs ago', icon: <ShieldAlert size={14}/>, color: '#10b981', bg: '#d1fae5' }
            ].map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: act.bg, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid #fff' }}>
                  {act.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '4px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{act.text}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Clock size={12}/> {act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
