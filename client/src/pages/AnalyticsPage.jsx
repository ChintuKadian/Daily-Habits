import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from '../api/axios';
import { TrendingUp, Award, Zap, Calendar } from 'lucide-react';
import ContributionHeatmap from '../components/analytics/ContributionHeatmap';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/analytics');
        if (res.data.success) {
          const analyticsData = res.data.analytics;
          const modifiedData = {
            ...analyticsData,
            chartData: analyticsData.chartData.map(d => ({
              ...d,
              timeSpent: d.timeSpent === 0 ? null : d.timeSpent
            }))
          };
          setData(modifiedData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const last7DaysPoints = useMemo(() => {
    if (!data?.heatmapData) return 0;
    const sorted = [...data.heatmapData].sort((a,b) => new Date(b.date) - new Date(a.date));
    const now = new Date();
    now.setHours(0,0,0,0);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return sorted
      .filter(s => new Date(s.date) >= sevenDaysAgo)
      .reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  }, [data]);

  if (loading) return <div className="text-center py-10">Loading analytics...</div>;
  if (!data) return <div className="text-center py-10">No data available</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-gray-800 dark:text-slate-100 tracking-tight">Pattern Analytics</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-6 transition-colors">
          <div className="p-5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">Lifetime Points</p>
            <p className="text-4xl font-black text-gray-800 dark:text-slate-100 tracking-tight">{data.totalLifetimePoints}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-6 transition-colors">
          <div className="p-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-inner">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">Last 7 Days</p>
            <p className="text-4xl font-black text-gray-800 dark:text-slate-100 tracking-tight">{last7DaysPoints}</p>
          </div>
        </div>

        {data.currentSRankStreak > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-6 transition-colors">
            <div className="p-5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-2xl shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">Current S-Rank Streak</p>
              <p className="text-4xl font-black text-gray-800 dark:text-slate-100 tracking-tight">{data.currentSRankStreak} <span className="text-xl text-gray-400 dark:text-slate-500">Days</span></p>
            </div>
          </div>
        )}

        {data.maxSRankStreak > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-6 transition-colors">
            <div className="p-5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 rounded-2xl shadow-inner">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">Max S-Rank Streak</p>
              <p className="text-4xl font-black text-gray-800 dark:text-slate-100 tracking-tight">{data.maxSRankStreak} <span className="text-xl text-gray-400 dark:text-slate-500">Days</span></p>
            </div>
          </div>
        )}
      </div>

      <ContributionHeatmap data={data.heatmapData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-6">Activity (Points)</h3>
          <div className="h-80 w-full">
            {data.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="points" fill="#4F46E5" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium">Not enough data to display chart</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-6">Time Spent (Mins)</h3>
          <div className="h-80 w-full">
            {data.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#10B981' }}
                  />
                  <Line type="monotone" dataKey="timeSpent" stroke="#10B981" strokeWidth={4} connectNulls={false} dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium">Not enough data to display chart</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
