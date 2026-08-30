import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Area, AreaChart,
} from 'recharts';

// ─── Data ──────────────────────────────────────────────────────────────────
const revenueData = [
  { month: 'Jan', revenue: 92000, target: 100000 },
  { month: 'Feb', revenue: 108000, target: 110000 },
  { month: 'Mar', revenue: 97000, target: 105000 },
  { month: 'Apr', revenue: 123000, target: 115000 },
  { month: 'May', revenue: 134000, target: 130000 },
  { month: 'Jun', revenue: 124000, target: 120000 },
];
const roleData = [
  { name: 'Doctors', value: 12, color: '#E8630A' },
  { name: 'Nurses', value: 24, color: '#6366F1' },
  { name: 'Technicians', value: 9, color: '#22C55E' },
  { name: 'Admin', value: 7, color: '#F59E0B' },
];
const apptTrend = [
  { week: 'W1', appts: 62 }, { week: 'W2', appts: 75 },
  { week: 'W3', appts: 71 }, { week: 'W4', appts: 89 },
  { week: 'W5', appts: 95 }, { week: 'W6', appts: 98 },
];
const topDoctors = [
  { name: 'Dr. Priya Mehta', spec: 'Cardiology', patients: 68, revenue: 142000, rating: 4.9, color: '#E8630A' },
  { name: 'Dr. Arjun Sharma', spec: 'Orthopedics', patients: 54, revenue: 118000, rating: 4.8, color: '#6366F1' },
  { name: 'Dr. Kavita Nair', spec: 'Neurology', patients: 47, revenue: 107000, rating: 4.7, color: '#22C55E' },
  { name: 'Dr. Rohan Kapoor', spec: 'Pediatrics', patients: 41, revenue: 89000, rating: 4.6, color: '#F59E0B' },
];

// ─── Tokens ────────────────────────────────────────────────────────────────
const ACCENT = '#E8630A';
const INDIGO = '#6366F1';
const GREEN = '#22C55E';
const VIOLET = '#A855F7';
const AMBER = '#F59E0B';
const ROSE = '#F43F5E';

const WHITE = '#FFFFFF';
const SURFACE = '#F8F9FB';
const BORDER = '#E8ECF0';
const T_HI = '#0F172A';
const T_MID = '#64748B';
const T_LO = '#94A3B8';

// ─── Primitives ────────────────────────────────────────────────────────────
const Tag = ({ color, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    background: `${color}14`, color,
  }}>{children}</span>
);

const Dot = ({ color }) => (
  <span style={{
    width: 7, height: 7, borderRadius: 2,
    background: color, display: 'inline-block', flexShrink: 0,
  }} />
);

const Card = ({ children, style = {}, pad = 24 }) => (
  <div style={{
    background: WHITE, border: `1px solid ${BORDER}`,
    borderRadius: 16, boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
    padding: pad, ...style,
  }}>
    {children}
  </div>
);

const CardHead = ({ title, sub, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
    <div>
      <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: T_HI }}>{title}</p>
      {sub && <p style={{ margin: 0, fontSize: 12, color: T_MID }}>{sub}</p>}
    </div>
    {right}
  </div>
);

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10,
      padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', fontFamily: 'inherit',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: T_LO, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: i ? 5 : 0 }}>
          <Dot color={p.color || p.fill} />
          <span style={{ fontSize: 12, color: T_MID, minWidth: 78 }}>{p.name}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: T_HI, marginLeft: 'auto' }}>
            {['Revenue', 'Target'].includes(p.name) ? `₹${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const KPICard = ({ label, value, sub, delta, up = true, color, spark }) => (
  <Card style={{ position: 'relative', overflow: 'hidden', padding: '20px 22px' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '16px 16px 0 0', opacity: 0.7 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: T_LO, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
    </div>
    <div style={{ fontSize: 27, fontWeight: 800, color: T_HI, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: T_MID, marginTop: 4 }}>{sub}</div>}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
      <Tag color={up ? GREEN : ROSE}>{up ? '↑' : '↓'} {delta}</Tag>
      {spark && (
        <ResponsiveContainer width={68} height={28}>
          <AreaChart data={spark} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`sg_${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sg_${label.replace(/\s/g, '')})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  </Card>
);

// ─── Main ──────────────────────────────────────────────────────────────────
export default function Reports() {
  const [range, setRange] = useState('Monthly');

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalTarget = revenueData.reduce((s, d) => s + d.target, 0);
  const pct = Math.round((totalRevenue / totalTarget) * 100);
  const totalStaff = roleData.reduce((s, d) => s + d.value, 0);

  const revSpark = revenueData.map(d => ({ v: d.revenue }));
  const apptSpark = apptTrend.map(d => ({ v: d.appts }));

  return (
    <div style={{ background: SURFACE, minHeight: '100vh', fontFamily: '"Inter","Plus Jakarta Sans",system-ui,sans-serif', color: T_HI }}>

      {/* Nav */}
      <div className="clinic-reports-nav" style={{
        background: WHITE, borderBottom: `1px solid ${BORDER}`,
        padding: '0 32px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T_HI }}>ClinicOS</span>
          <span style={{ color: T_LO }}>/</span>
          <span style={{ fontSize: 13, color: T_MID, fontWeight: 500 }}>Reports & Analytics</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Tag color={GREEN}>● Live</Tag>
          <button style={{
            background: ACCENT, color: WHITE, border: 'none', borderRadius: 9,
            padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>↓ Export PDF</button>
        </div>
        <style>{`
          @media (max-width: 1024px) {
            .clinic-reports-kpis {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .clinic-reports-main-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 640px) {
            .clinic-reports-nav {
              height: auto !important;
              padding: 12px 16px !important;
              align-items: flex-start !important;
              flex-direction: column !important;
              gap: 12px !important;
            }

            .clinic-reports-content {
              padding: 20px 0 !important;
            }

            .clinic-reports-heading {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 14px !important;
            }

            .clinic-reports-kpis {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

      </div>

      <div className="clinic-reports-content" style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Heading + range toggle */}
        <div className="clinic-reports-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T_HI, margin: '0 0 5px', letterSpacing: '-0.02em' }}>
              Performance Overview
            </h1>
            <p style={{ fontSize: 13, color: T_MID, margin: 0 }}>
              Clinic metrics across revenue, staffing, and patient care · Updated just now
            </p>
          </div>
          <div style={{ display: 'flex', background: '#EDEDED', borderRadius: 11, padding: 3, gap: 2 }}>
            {['Weekly', 'Monthly', 'Yearly'].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                background: range === r ? WHITE : 'transparent',
                border: 'none', cursor: 'pointer',
                color: range === r ? ACCENT : T_MID,
                borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 700,
                boxShadow: range === r ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="clinic-reports-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          <KPICard label="Total Revenue" value="₹6,78,000" sub="This period" delta="+22% vs last" color={ACCENT} spark={revSpark} />
          <KPICard label="Appointments" value="653" sub="Completed visits" delta="+15% vs last" color={INDIGO} spark={apptSpark} />
          <KPICard label="New Patients" value="142" sub="First-time visits" delta="+8% vs last" color={GREEN} />
          <KPICard label="Staff Attendance" value="94.2%" sub="Present today" delta="+1.2% vs last" color={VIOLET} />
        </div>

        {/* Row 2: Revenue | Goal ring | Staff pie */}
        <div className="clinic-reports-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 230px 270px', gap: 16, marginBottom: 16 }}>

          {/* Revenue vs Target */}
          <Card>
            <CardHead
              title="Revenue vs Target"
              sub={`${range} breakdown · Jan–Jun 2025`}
              right={
                <div style={{ display: 'flex', gap: 14 }}>
                  {[['Revenue', ACCENT], ['Target', '#C8C4C0']].map(([l, c]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T_MID, fontWeight: 600 }}>
                      <span style={{ width: 10, height: 3, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                    </span>
                  ))}
                </div>
              }
            />
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={revenueData} barSize={11} barGap={3} barCategoryGap="32%">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} />
                    <stop offset="100%" stopColor="#F4966A" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEF0F3" />
                <XAxis dataKey="month" tick={{ fill: T_MID, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T_LO, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={42} />
                <Tooltip content={<Tip />} cursor={{ fill: '#F7F8FA' }} />
                <Bar dataKey="revenue" fill="url(#revGrad)" radius={[5, 5, 0, 0]} name="Revenue" />
                <Bar dataKey="target" fill="#E8EAED" radius={[5, 5, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Goal donut */}
          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CardHead title="Monthly Goal" sub="Revenue achievement" />
            <div style={{ position: 'relative', width: 148, height: 148, margin: '4px auto 0' }}>
              <PieChart width={148} height={148}>
                <defs>
                  <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={AMBER} />
                    <stop offset="100%" stopColor="#FB923C" />
                  </linearGradient>
                </defs>
                <Pie
                  data={[{ value: pct }, { value: 100 - pct }]}
                  cx={70} cy={70} startAngle={90} endAngle={-270}
                  innerRadius={48} outerRadius={66} dataKey="value" paddingAngle={0} stroke="none"
                >
                  <Cell fill="url(#goalGrad)" />
                  <Cell fill="#EEF0F3" />
                </Pie>
              </PieChart>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: T_HI, letterSpacing: '-0.04em', lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontSize: 10, color: T_LO, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>achieved</span>
              </div>
            </div>
            <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 12, background: '#FFFBF5', border: `1px solid #FDE6C8`, width: '100%', boxSizing: 'border-box' }}>
              <p style={{ fontSize: 11, color: T_LO, fontWeight: 600, margin: '0 0 7px' }}>Revenue progress</p>
              {[
                { l: 'Actual', v: `₹${(totalRevenue / 100000).toFixed(1)}L`, c: AMBER },
                { l: 'Target', v: `₹${(totalTarget / 100000).toFixed(1)}L`, c: T_MID },
                { l: 'Remaining', v: `₹${((totalTarget - totalRevenue) / 100000).toFixed(1)}L`, c: T_LO },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: T_MID }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, height: 5, borderRadius: 5, background: '#EDEBE8', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${AMBER}, #FB923C)`, borderRadius: 5 }} />
              </div>
            </div>
          </Card>

          {/* Staff by role */}
          <Card>
            <CardHead title="Staff by Role" sub={`${totalStaff} total staff members`} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={150} height={130}>
                <Pie data={roleData} cx={70} cy={62} innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={4} stroke="none">
                  {roleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v, n]}
                  contentStyle={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: 11, fontFamily: 'inherit' }}
                />
              </PieChart>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {roleData.map(r => {
                const p = Math.round((r.value / totalStaff) * 100);
                return (
                  <div key={r.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Dot color={r.color} />
                        <span style={{ fontSize: 12, color: T_MID }}>{r.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.value}</span>
                        <span style={{ fontSize: 11, color: T_LO }}>{p}%</span>
                      </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: '#EEF0F3' }}>
                      <div style={{ height: '100%', width: `${p}%`, background: r.color, borderRadius: 4, opacity: 0.85 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Appointment trend */}
        <Card style={{ marginBottom: 16 }}>
          <CardHead
            title="Weekly Appointment Trend"
            sub="Patient visits over the last 6 weeks"
            right={
              <div style={{ display: 'flex', gap: 8 }}>
                <Tag color={GREEN}>↑ 59% over 6 weeks</Tag>
                <Tag color={INDIGO}>Peak: W6 — 98 appts</Tag>
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={165}>
            <AreaChart data={apptTrend} margin={{ top: 4, right: 4, bottom: 0, left: -6 }}>
              <defs>
                <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#EEF0F3" />
              <XAxis dataKey="week" tick={{ fill: T_MID, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T_LO, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<Tip />} cursor={{ stroke: GREEN, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone" dataKey="appts" name="Appointments"
                stroke={GREEN} strokeWidth={2.5} fill="url(#apptGrad)"
                dot={{ fill: WHITE, stroke: GREEN, strokeWidth: 2.5, r: 4 }}
                activeDot={{ fill: GREEN, r: 6, stroke: WHITE, strokeWidth: 2.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Doctors */}
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T_HI, margin: '0 0 3px' }}>Top Performing Doctors</p>
              <p style={{ fontSize: 12, color: T_MID, margin: 0 }}>Ranked by revenue generated this period</p>
            </div>
            <button style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: T_MID, cursor: 'pointer' }}>View all →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: SURFACE }}>
                {['Doctor', 'Specialisation', 'Patients', 'Revenue', 'Rating'].map(h => (
                  <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: T_LO, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topDoctors.map((doc, i) => (
                <tr key={doc.name} style={{ borderBottom: i < topDoctors.length - 1 ? `1px solid ${BORDER}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${doc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: doc.color, flexShrink: 0 }}>
                        {doc.name.split(' ')[1][0]}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T_HI }}>{doc.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}><Tag color={doc.color}>{doc.spec}</Tag></td>
                  <td style={{ padding: '14px 24px', fontSize: 13, color: T_HI }}>
                    <span style={{ fontWeight: 700 }}>{doc.patients}</span>
                    <span style={{ fontSize: 11, color: T_LO, marginLeft: 4 }}>patients</span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T_HI }}>₹{(doc.revenue / 1000).toFixed(0)}k</span>
                    <div style={{ marginTop: 5, height: 3, borderRadius: 3, background: '#EEF0F3', width: 80 }}>
                      <div style={{ height: '100%', borderRadius: 3, background: doc.color, width: `${(doc.revenue / topDoctors[0].revenue) * 100}%`, opacity: 0.8 }} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: AMBER, fontSize: 14 }}>★</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T_HI }}>{doc.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Footer */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 11, color: T_LO, margin: 0 }}>ClinicOS Analytics · Data refreshes every 15 minutes</p>
          <p style={{ fontSize: 11, color: T_LO, margin: 0 }}>Last updated: Today, 09:42 AM</p>
        </div>

      </div>
    </div>
  );
}
