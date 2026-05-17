import React, { useMemo, useRef, useEffect } from 'react';
import { usePoints } from '../../context/PointsContext';

// Vivid GitHub-style green ramp — much more saturated than before
const RANK_STYLES = {
  S: { bg: '#166534', darkBg: '#22c55e', label: 'S-Rank' }, // deep forest / bright green
  A: { bg: '#15803d', darkBg: '#4ade80', label: 'A-Rank' }, // rich green
  B: { bg: '#16a34a', darkBg: '#86efac', label: 'B-Rank' }, // medium green
  C: { bg: '#22c55e', darkBg: '#bbf7d0', label: 'C-Rank' }, // vibrant green
  D: { bg: '#4ade80', darkBg: '#dcfce7', label: 'D-Rank' }, // light but still vivid
};

const getRankStyle = (rank, isDark = false) => {
  const s = RANK_STYLES[rank];
  if (!s) return {};
  return { backgroundColor: isDark ? s.darkBg : s.bg };
};

const ContributionHeatmap = ({ data }) => {
  const scrollRef = useRef(null);
  const { pointsEnabled } = usePoints();

  const { monthsData, totalContributions, currentActiveStreak, maxStreak } = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let total = 0;

    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const score = data?.find(s => s.date === dateStr);
      if (score && score.totalPoints > 0) total++;

      days.push({
        date: d,
        dateStr,
        rank: score?.rank || null,
        points: score?.totalPoints || 0,
        dayOfWeek: d.getDay(),
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }

    let tempStreak = 0;
    let maxStrk = 0;
    for (let i = 0; i < days.length; i++) {
      if (days[i].points > 0) {
        tempStreak++;
        maxStrk = Math.max(maxStrk, tempStreak);
      } else {
        if (i < days.length - 1) tempStreak = 0;
      }
    }

    const mData = [];
    let currentMonthStr = '';
    let currentMonthGroup = null;

    days.forEach(day => {
      const monthStr = `${day.year}-${day.month}`;
      if (monthStr !== currentMonthStr) {
        if (currentMonthGroup) mData.push(currentMonthGroup);
        currentMonthGroup = {
          monthStr,
          monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][day.month],
          days: [],
          isCurrentMonth: day.month === today.getMonth() && day.year === today.getFullYear(),
        };
        currentMonthStr = monthStr;
      }
      currentMonthGroup.days.push(day);
    });
    if (currentMonthGroup) mData.push(currentMonthGroup);

    mData.forEach(monthObj => {
      const firstDay = monthObj.days[0].dayOfWeek;
      const pads = Array.from({ length: firstDay }).map((_, i) => ({
        isBlank: true,
        key: `pad-start-${monthObj.monthStr}-${i}`,
      }));
      const padded = [...pads, ...monthObj.days];
      const weeksArr = [];
      for (let i = 0; i < padded.length; i += 7) {
        weeksArr.push(padded.slice(i, i + 7));
      }
      monthObj.weeks = weeksArr;
    });

    return { monthsData: mData, totalContributions: total, currentActiveStreak: tempStreak, maxStreak: maxStrk };
  }, [data]);

  // Auto-scroll to current month on mount and when data loads
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll all the way to the right — current month is the last block
    setTimeout(() => {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }, 100);
  }, [monthsData]);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
      <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-6">
        {totalContributions} active days in the last year
      </h3>

      {/* Streak Indicators */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Current Active Streak</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {currentActiveStreak} <span className="text-sm font-medium">days</span>
          </p>
        </div>
        <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Max Streak</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {maxStreak} <span className="text-sm font-medium">days</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2" ref={scrollRef}>
        <div className="min-w-max flex">
          {/* Day-of-week labels */}
          <div
            className="flex flex-col justify-between text-xs text-gray-400 dark:text-slate-500 font-medium w-10 mr-4 text-right mt-6"
            style={{ height: '122px' }}
          >
            <span style={{ height: '14px' }} />
            <span style={{ height: '14px', lineHeight: '14px' }}>Mon</span>
            <span style={{ height: '14px' }} />
            <span style={{ height: '14px', lineHeight: '14px' }}>Wed</span>
            <span style={{ height: '14px' }} />
            <span style={{ height: '14px', lineHeight: '14px' }}>Fri</span>
            <span style={{ height: '14px' }} />
          </div>

          {/* Months Container */}
          <div className="flex space-x-3">
            {monthsData.map((m) => (
              <div key={m.monthStr} className="flex flex-col">
                {/* Month label — highlight current month */}
                <div className={`text-xs font-bold mb-2 h-4 ${m.isCurrentMonth ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}`}>
                  {m.monthName}
                  {m.isCurrentMonth && <span className="ml-1">◀</span>}
                </div>

                {/* Week columns */}
                <div className="flex space-x-1">
                  {m.weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col space-y-1">
                      {week.map((day, dIndex) => {
                        if (day.isBlank) {
                          return <div key={day.key} className="w-3.5 h-3.5 rounded-sm bg-transparent" />;
                        }

                        const isEmpty = day.points === 0;
                        const isToday = day.dateStr === (() => {
                          const t = new Date();
                          return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
                        })();

                        const titleText = pointsEnabled
                          ? `${day.dateStr}: ${day.points} pts${isEmpty ? ' (no activity)' : ` — ${day.rank}-Rank`}`
                          : `${day.dateStr}: ${isEmpty ? 'No activity' : 'Active day'}`;

                        return (
                          <div
                            key={day.dateStr}
                            className={`w-3.5 h-3.5 rounded-sm hover:ring-2 hover:ring-offset-1 hover:ring-green-400 transition-all cursor-pointer ${isToday ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}
                            style={isEmpty
                              ? { backgroundColor: 'var(--heat-empty, #e9f5e9)' }
                              : getRankStyle(day.rank)
                            }
                            title={titleText}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center mt-6 text-xs text-gray-500 dark:text-slate-400 font-medium">
          <span className="text-gray-400 dark:text-slate-500 italic">Hover a cell to see details</span>
          <div className="flex items-center space-x-2">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: '#e9f5e9' }} title="No activity" />
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: '#4ade80' }} title={pointsEnabled ? 'D-Rank' : 'Level 1'} />
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: '#22c55e' }} title={pointsEnabled ? 'C-Rank' : 'Level 2'} />
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: '#16a34a' }} title={pointsEnabled ? 'B-Rank' : 'Level 3'} />
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: '#15803d' }} title={pointsEnabled ? 'A-Rank' : 'Level 4'} />
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: '#166534' }} title={pointsEnabled ? 'S-Rank' : 'Level 5'} />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
