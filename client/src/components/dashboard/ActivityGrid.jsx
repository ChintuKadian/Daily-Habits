import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

const ActivityGrid = () => {
  const [activityData, setActivityData] = useState([]);
  const [streaks, setStreaks] = useState({ current: 0, max: 0 });
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/analytics');
        if (res.data.success) {
          const data = res.data.analytics.chartData || [];
          setActivityData(data);
          setStreaks({
            current: res.data.analytics.currentSRankStreak || 0,
            max: res.data.analytics.maxSRankStreak || 0
          });
          // Calculate total points
          const total = data.reduce((sum, item) => sum + (item.points || 0), 0);
          setTotalPoints(total);
        }
      } catch (err) {
        console.error('Failed to fetch activity data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Generate last 52 weeks of data
  const generateWeeksData = () => {
    const today = new Date();
    const dataMap = {};
    activityData.forEach(item => {
      dataMap[item.name] = item.points;
    });

    const weeks = [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // 52 weeks back

    let currentWeek = [];
    let currentDate = new Date(startDate);

    // Start from Monday
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    currentDate.setDate(diff);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const points = dataMap[dateStr] || 0;
      
      currentWeek.push({
        date: dateStr,
        points,
        dayOfWeek: currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1 // 0=Mon, 6=Sun
      });

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add remaining days if any
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getMonthLabels = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    const months = [];
    let currentMonth = -1;
    let weekIndex = 0;

    const weeks = generateWeeksData();
    weeks.forEach((week, idx) => {
      const firstDay = week.find(d => d !== null);
      if (firstDay) {
        const date = new Date(firstDay.date);
        if (date.getMonth() !== currentMonth) {
          currentMonth = date.getMonth();
          months.push({ month: date.toLocaleString('default', { month: 'short' }), weekIndex: idx });
        }
      }
    });

    return months;
  };

  const getColorForPoints = (points) => {
    if (points === 0) return 'bg-slate-900';
    if (points <= 50) return 'bg-emerald-800';
    if (points <= 100) return 'bg-emerald-600';
    if (points <= 200) return 'bg-emerald-400';
    return 'bg-emerald-300';
  };

  const dayLabels = ['Mon', 'Wed', 'Fri'];
  const weeks = generateWeeksData();
  const monthLabels = getMonthLabels();

  if (loading) {
    return <div className="text-center py-4">Loading activity...</div>;
  }

  return (
    <div className="bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-800 mb-8">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          {totalPoints} contributions in the last year
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-sm font-medium text-gray-400">Current Active Streak</p>
            <p className="text-2xl font-bold text-emerald-400">{streaks.current} days</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-sm font-medium text-gray-400">Max Streak</p>
            <p className="text-2xl font-bold text-emerald-400">{streaks.max} days</p>
          </div>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-2" style={{ minWidth: 'fit-content' }}>
          {/* Day labels */}
          <div className="flex flex-col gap-1 pt-6">
            {dayLabels.map((day, idx) => (
              <div
                key={idx}
                className="w-12 h-3 flex items-center justify-end pr-2 text-xs font-medium text-gray-400"
              >
                {day}
              </div>
            ))}
            {/* Extra rows to fill 7 days */}
            {[...Array(4)].map((_, idx) => (
              <div key={`empty-${idx}`} className="w-12 h-3" />
            ))}
          </div>

          {/* Month labels and grid */}
          <div>
            <div className="flex gap-1 px-1 pb-2">
              {monthLabels.map((item, idx) => (
                <div
                  key={idx}
                  style={{ marginLeft: `${item.weekIndex * 16}px` }}
                  className="text-xs font-semibold text-gray-400"
                >
                  {item.month}
                </div>
              ))}
            </div>

            {/* Weeks grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-emerald-400 ${
                        day ? getColorForPoints(day.points) : 'bg-slate-900'
                      }`}
                      title={day ? `${day.date}: ${day.points} points` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-800" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-300" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityGrid;
