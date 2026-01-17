
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Brain, Clock, ArrowUpRight, ArrowDownRight, Activity, BookOpen } from 'lucide-react';
import { AnalysisResult } from '../types';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

interface DashboardProps {
  data: AnalysisResult;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Educational Focus" 
          value={`${data.metadata.learningRatio}%`} 
          trend="Learning Ratio" 
          isPositive={data.metadata.learningRatio > 50} 
          icon={<BookOpen className="w-5 h-5 text-emerald-500" />} 
        />
        <StatCard 
          title="Videos Analyzed" 
          value={data.metadata.totalVideos.toLocaleString()} 
          trend="Full History" 
          isPositive={true} 
          icon={<Activity className="w-5 h-5 text-blue-500" />} 
        />
        <StatCard 
          title="Primary Domain" 
          value={data.domains[0]?.name || 'N/A'} 
          trend="Top Interest" 
          isPositive={true} 
          icon={<Brain className="w-5 h-5 text-purple-500" />} 
        />
        <StatCard 
          title="Data Range" 
          value={data.metadata.dateRange || 'Lifetime'} 
          trend="Timeline" 
          isPositive={true} 
          icon={<Clock className="w-5 h-5 text-amber-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-6">Feature Cluster: Domain Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.domains}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {data.domains.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-6">Skill Taxonomy Map</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.skills}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.skills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{data.skills.length}</span>
              <span className="text-xs text-slate-500 uppercase font-bold">Skills</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {data.skills.slice(0, 3).map((skill, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 truncate mr-4">{skill.name}</span>
                <span className="font-bold text-slate-900">{skill.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-4">NLP Enrichment Summary</h3>
        <p className="text-slate-600 leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-2 bg-slate-50 rounded-r-xl">
          "{data.summary}"
        </p>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string; value: string; trend: string; isPositive: boolean; icon: React.ReactNode}> = ({title, value, trend, isPositive, icon}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <span className={`text-[10px] font-bold uppercase tracking-tight ${isPositive ? 'text-emerald-500' : 'text-blue-500'}`}>{trend}</span>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
  </div>
);

export default Dashboard;
