import React, { useMemo } from 'react';

const getRankColor = (rank) => {
  switch (rank) {
    case 'S': return 'bg-green-700 dark:bg-green-500';
    case 'A': return 'bg-green-500 dark:bg-green-400';
    case 'B': return 'bg-green-400 dark:bg-green-300';
    case 'C': return 'bg-green-300 dark:bg-green-200';
    case 'D': return 'bg-green-200 dark:bg-emerald-900';
    default: return 'bg-gray-100 dark:bg-slate-700';
  }
};

const ContributionHeatmap = ({ data }) => {
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
        dateStr: dateStr,
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
        if (i < days.length - 1) {
          tempStreak = 0;
        }
      }
    }

    const mData = [];
    let currentMonthStr = '';
    let currentMonthGroup = null;

    days.forEach(day => {
      const monthStr = `${day.year}-${day.month}`;
      if (monthStr !== currentMonthStr) {
        if (currentMonthGroup) {
          mData.push(currentMonthGroup);
        }
        currentMonthGroup = {
          monthStr,
          monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][day.month],
          days: []
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
        key: `pad-start-${monthObj.monthStr}-${i}`
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

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
      <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-6">{totalContributions} contributions in the last year</h3>
      
      {/* Streak Indicators */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Current Active Streak</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{currentActiveStreak} <span className="text-sm font-medium">days</span></p>
        </div>
        <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Max Streak</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{maxStreak} <span className="text-sm font-medium">days</span></p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-max flex">
          {/* Day labels */}
          <div className="flex flex-col justify-between text-xs text-gray-400 dark:text-slate-500 font-medium w-10 mr-4 text-right mt-6" style={{ height: '122px' }}>
            <span style={{ height: '14px' }}></span>
            <span style={{ height: '14px', lineHeight: '14px' }}>Mon</span>
            <span style={{ height: '14px' }}></span>
            <span style={{ height: '14px', lineHeight: '14px' }}>Wed</span>
            <span style={{ height: '14px' }}></span>
            <span style={{ height: '14px', lineHeight: '14px' }}>Fri</span>
            <span style={{ height: '14px' }}></span>
          </div>

          {/* Months Container */}
          <div className="flex space-x-3">
            {monthsData.map((m) => (
              <div key={m.monthStr} className="flex flex-col">
                {/* Month Label */}
                <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-2 h-4">{m.monthName}</div>
                
                {/* Grid for this month */}
                <div className="flex space-x-1">
                  {m.weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col space-y-1">
                      {week.map((day, dIndex) => {
                        if (day.isBlank) {
                          return <div key={day.key} className="w-3.5 h-3.5 rounded-sm bg-transparent"></div>;
                        }
                        return (
                          <div 
                            key={day.dateStr} 
                            className={`w-3.5 h-3.5 rounded-sm ${day.points === 0 ? 'bg-gray-100 dark:bg-slate-700' : getRankColor(day.rank)} hover:ring-2 hover:ring-gray-400 transition-all cursor-pointer`}
                            title={`${day.dateStr}: ${day.points} contributions (${day.points === 0 ? 'No Contributions' : day.rank + ' Rank'})`}
                          ></div>
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
        <div className="flex justify-end items-center mt-6 text-xs text-gray-500 dark:text-slate-400 font-medium space-x-2">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3.5 h-3.5 rounded-sm bg-gray-100 dark:bg-slate-700" title="0 contributions"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-green-200 dark:bg-emerald-900" title="D Rank"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-green-300 dark:bg-green-200" title="C Rank"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-green-400 dark:bg-green-300" title="B Rank"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-green-500 dark:bg-green-400" title="A Rank"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-green-700 dark:bg-green-500" title="S Rank"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
