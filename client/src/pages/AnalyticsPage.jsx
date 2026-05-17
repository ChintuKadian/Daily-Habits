import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from '../api/axios';
import { TrendingUp, Award, Zap, Calendar } from 'lucide-react';
import ContributionHeatmap from '../components/analytics/ContributionHeatmap';

const EMOJI_MAP = { Work:'💼', Study:'📚', Health:'🏃', Personal:'🌱', Finance:'💰', Creative:'🎨', Social:'👥', Home:'🏠', General:'📋' };
const COLORS   = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316','#84cc16'];

const AnalyticsPage = () => {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1. Main analytics (scores / heatmap)
        const analyticsRes = await axios.get('/analytics');
        if (analyticsRes.data.success) {
          const d = analyticsRes.data.analytics;
          setData({
            ...d,
            chartData: d.chartData.map(row => ({
              ...row,
              timeSpent: row.timeSpent === 0 ? null : row.timeSpent
            }))
          });
        }

        // 2. Category breakdown — compute from tasks directly
        const tasksRes = await axios.get('/tasks');
        if (tasksRes.data.success) {
          const completed = tasksRes.data.tasks.filter(t => t.status === 'completed');
          const map = {};
          completed.forEach(task => {
            const cat = task.category || 'General';
            if (!map[cat]) map[cat] = { category: cat, taskCount: 0, totalPoints: 0, totalTime: 0, onTime: 0, late: 0 };
            map[cat].taskCount++;
            map[cat].totalPoints += task.pointsAwarded || 0;
            map[cat].totalTime   += task.timeSpent     || 0;
            if (task.isRecovery || (task.multiplierApplied !== null && task.multiplierApplied < 1))
              map[cat].late++;
            else
              map[cat].onTime++;
          });
          const sorted = Object.values(map).sort((a, b) => b.totalPoints - a.totalPoints);
          setCategoryData(sorted);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
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

      {/* ── Category Breakdown ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Tasks by Category</h3>
          <span className="text-sm text-gray-400 dark:text-slate-500 font-medium">All-time completed tasks</span>
        </div>

        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 dark:text-slate-500">
            <span className="text-4xl mb-3">📊</span>
            <p className="font-bold text-gray-500 dark:text-slate-400">No category data yet</p>
            <p className="text-sm mt-1">Complete tasks in different categories to see your breakdown here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {(() => {
              const maxPts = categoryData[0]?.totalPoints || 1;
              return categoryData.map((cat, idx) => {
                const barWidth = Math.max(4, Math.round((cat.totalPoints / maxPts) * 100));
                const emoji = EMOJI_MAP[cat.category] || '📋';
                const color = COLORS[idx % COLORS.length];
                const onTimeRate = cat.taskCount > 0 ? Math.round((cat.onTime / cat.taskCount) * 100) : 0;

                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{emoji}</span>
                        <span className="font-bold text-gray-800 dark:text-slate-100 text-sm">{cat.category}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
                          {cat.taskCount} task{cat.taskCount !== 1 ? 's' : ''}
                        </span>
                        {onTimeRate === 100 && (
                          <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full font-bold">✓ Always on time</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-bold">
                        <span className="text-gray-400 dark:text-slate-500">{cat.totalTime} mins</span>
                        <span style={{ color }} className="text-sm font-black">{cat.totalPoints} pts</span>
                      </div>
                    </div>

                    <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-700"
                        style={{ width: `${barWidth}%`, backgroundColor: color }}
                      />
                    </div>

                    <div className="flex items-center space-x-3 mt-1 text-xs">
                      <span className="text-green-500 font-medium">✓ {cat.onTime} on time</span>
                      {cat.late > 0 && <span className="text-orange-400 font-medium">⚠ {cat.late} late</span>}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
