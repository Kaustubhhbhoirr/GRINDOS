import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Terminal, TrendingUp, CheckCircle2, Bookmark, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [profileName, setProfileName] = useState('Grinder');
  const [profileRank, setProfileRank] = useState('Beginner');

  useEffect(() => {
    if (window.api) {
      window.api.getProblems().then(data => {
        setProblems(data || []);
        calculateStats(data || []);
      });
    }
    // Load profile metadata
    const stored = localStorage.getItem('grindos_profile_info');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setProfileName(parsed.name);
        if (parsed.goal) setProfileRank(parsed.goal);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const calculateStats = (allProblems) => {
    // 1. Due count
    const todayStr = new Date().toISOString().split('T')[0];
    const due = allProblems.filter(p => p.nextReviewDate <= todayStr && p.revisit).length;
    setDueCount(due);

    // 2. Streaks
    const active = calculateStreak(allProblems);
    setStreak(active);
    setLongestStreak(calculateLongestStreak(allProblems));

    // 3. Weekly solved
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
    const weekly = allProblems.filter(p => p.solvedDate >= oneWeekAgoStr).length;
    setWeeklyCount(weekly);
  };

  const calculateStreak = (allProblems) => {
    if (allProblems.length === 0) return 0;
    const solvedDates = [...new Set(allProblems.map(p => p.solvedDate))].sort((a, b) => b.localeCompare(a));
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (solvedDates[0] !== todayStr && solvedDates[0] !== yesterdayStr) {
      return 0;
    }

    let currentStreak = 0;
    let checkDate = new Date();
    if (solvedDates[0] === yesterdayStr) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (solvedDates.includes(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const calculateLongestStreak = (allProblems) => {
    if (allProblems.length === 0) return 0;
    const sortedDates = [...new Set(allProblems.map(p => p.solvedDate))].sort((a, b) => a.localeCompare(b));
    
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;
    
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      if (prevDate === null) {
        currentStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      prevDate = currentDate;
    }
    return Math.max(maxStreak, currentStreak);
  };

  // Monthly Calendar Cell Generator
  const getCalendarCells = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0: Sunday, 1: Monday, etc.
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    
    // Add empty padding cells for alignment
    for (let i = 0; i < startingDayOfWeek; i++) {
      cells.push({ day: null, dateStr: '', solves: [] });
    }

    // Add actual days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySolves = problems.filter(p => p.solvedDate === dateStr);
      cells.push({ day, dateStr, solves: daySolves });
    }

    return cells;
  };

  const calendarCells = getCalendarCells();
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  // Counts by difficulty
  const easyCount = problems.filter(p => p.difficulty === 'easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'hard').length;
  const totalSolved = problems.length;

  // Donut chart path values
  const easyPct = totalSolved > 0 ? (easyCount / totalSolved) * 100 : 0;
  const mediumPct = totalSolved > 0 ? (mediumCount / totalSolved) * 100 : 0;
  const hardPct = totalSolved > 0 ? (hardCount / totalSolved) * 100 : 0;

  // Recent 5 solves
  const recentSolves = [...problems]
    .sort((a, b) => b.solvedDate.localeCompare(a.solvedDate))
    .slice(0, 5);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0d0d0d] text-[#f0f0f0] font-sans selection:bg-[#da7756]/20 selection:text-white">
      {/* Top Bar Header (Matches Stitch layout) */}
      <header className="flex justify-between items-center w-full px-6 h-14 bg-[#131313] border-b border-[#2a2a2a] shrink-0 select-none">
        <div className="flex items-center gap-4 w-1/3">
          <div className="md:hidden flex items-center">
            <span className="font-mono text-[20px] font-bold text-[#da7756] tracking-tight">GrindOS</span>
          </div>
          {/* Quick Search */}
          <div 
            onClick={() => navigate('/search')}
            className="hidden md:flex items-center bg-[#0d0d0d] border border-[#2a2a2a] rounded px-3 py-1 w-64 hover:border-[#da7756]/50 cursor-pointer transition-colors rounded-xl"
          >
            <Search size={14} className="text-[#888888] mr-2 animate-pulse" />
            <span className="text-[13px] font-mono text-[#888888] select-none">Search problems (Ctrl+K)</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-4 justify-end w-1/3">
          <button 
            onClick={() => navigate('/revisit')}
            className="text-[#888888] hover:text-[#da7756] transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} />
            {dueCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#da7756] w-2 h-2 rounded-full animate-ping"></span>
            )}
          </button>
          <button 
            onClick={() => navigate('/panel')}
            className="text-[#888888] hover:text-[#da7756] transition-colors"
            title="Terminal Companion"
          >
            <Terminal size={20} />
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">
        {/* Page Header Title */}
        <div className="flex justify-between items-end mb-2 select-none">
          <div>
            <h1 className="text-[24px] leading-8 font-bold text-[#f0f0f0]">Dashboard</h1>
            <p className="text-[#888888] text-[13px] font-mono mt-1">
              GRIND_MODE // Rank: <span className="text-[#da7756] font-semibold">{profileRank || 'Senior'}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
          {/* Stat 1: Total Solved */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#da7756] transition-colors group rounded-xl">
            <div className="text-[#888888] text-[13px] font-mono uppercase tracking-wider mb-2">Total Solved</div>
            <div className="text-[32px] font-bold font-mono text-[#f0f0f0] group-hover:text-[#da7756] transition-colors">
              {totalSolved}
            </div>
            <div className="mt-2 text-[#4caf7d] text-[13px] font-mono flex items-center gap-1">
              <TrendingUp size={14} />
              <span>+{weeklyCount} this week</span>
            </div>
          </div>

          {/* Stat 2: Current Streak */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#da7756] transition-colors group rounded-xl">
            <div className="text-[#888888] text-[13px] font-mono uppercase tracking-wider mb-2">Current Streak</div>
            <div className="text-[32px] font-bold font-mono text-[#f0f0f0] group-hover:text-[#da7756] transition-colors">
              {streak} <span className="text-[18px] text-[#888888] font-normal font-sans">days</span>
            </div>
            <div className="mt-2 text-[#888888] text-[13px] font-mono">
              Target: 30 days
            </div>
          </div>

          {/* Stat 3: Longest Streak */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#da7756] transition-colors group rounded-xl">
            <div className="text-[#888888] text-[13px] font-mono uppercase tracking-wider mb-2">Longest Streak</div>
            <div className="text-[32px] font-bold font-mono text-[#f0f0f0] group-hover:text-[#da7756] transition-colors">
              {longestStreak} <span className="text-[18px] text-[#888888] font-normal font-sans">days</span>
            </div>
            <div className="mt-2 text-[#888888] text-[13px] font-mono">
              All-time best
            </div>
          </div>
        </section>

        {/* Activity Heatmap Grid Card */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 hover:border-[#da7756] transition-colors w-full rounded-xl select-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[18px] font-medium text-[#f0f0f0]">Activity</h2>
            <span className="text-[#888888] text-[13px] font-mono">{currentMonthName}</span>
          </div>

          <div className="overflow-x-auto pb-2">
            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-4 min-w-[500px] justify-items-center mb-3 text-[#888888] text-[13px] font-mono uppercase tracking-widest">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Monthly Calendar Cells */}
            <div className="grid grid-cols-7 gap-4 min-w-[500px]">
              {calendarCells.map((cell, idx) => {
                // If it's a padding cell
                if (cell.day === null) {
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] bg-[#0e0e0e] rounded-xl border border-transparent"
                    />
                  );
                }

                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = cell.dateStr === todayStr;

                // Color-coding depending on solves difficulty
                let colorClass = 'bg-[#0e0e0e] text-[#888888]'; // Default empty
                let solveBadge = '';

                if (cell.solves.length > 0) {
                  // Find the highest difficulty solved on this day (hard > medium > easy)
                  const hasHard = cell.solves.some(p => p.difficulty === 'hard');
                  const hasMedium = cell.solves.some(p => p.difficulty === 'medium');
                  
                  if (hasHard) {
                    colorClass = 'bg-[#e05555] text-white font-bold';
                    solveBadge = 'Hard solved';
                  } else if (hasMedium) {
                    colorClass = 'bg-[#f0a030] text-white font-bold';
                    solveBadge = 'Medium solved';
                  } else {
                    colorClass = 'bg-[#4caf7d] text-white font-bold';
                    solveBadge = 'Easy solved';
                  }
                }

                return (
                  <div
                    key={`day-${cell.day}`}
                    title={cell.solves.length > 0 ? `${cell.day} ${currentMonthName}: ${cell.solves.length} problem(s) solved (${solveBadge})` : `${cell.day} ${currentMonthName}`}
                    className={`w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-xl flex items-center justify-center text-[14px] transition-all hover:scale-105 ${colorClass} ${
                      isToday ? 'border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'border border-[#2a2a2a]'
                    }`}
                  >
                    {cell.day}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom Panel Grid Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Recent Solves (Takes up 2 columns) */}
          <section className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] flex flex-col hover:border-[#da7756] transition-colors overflow-hidden rounded-xl">
            <div className="p-4 border-b border-[#2a2a2a] flex justify-between items-center bg-[#1a1a1a]">
              <h2 className="text-[18px] font-medium text-[#f0f0f0]">Recent Problems</h2>
              <button 
                onClick={() => navigate('/search')}
                className="text-[#888888] text-[13px] font-mono hover:text-[#da7756] flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="flex flex-col overflow-x-auto">
              {/* Table Header */}
              <div className="flex px-6 py-3 border-b border-[#2a2a2a] text-[13px] font-mono text-[#888888] uppercase tracking-wider bg-[#0d0d0d]">
                <div className="w-16">ID</div>
                <div className="flex-1">Title</div>
                <div className="w-28 text-center">Difficulty</div>
                <div className="w-24 text-right">Status</div>
              </div>

              {/* Table Rows */}
              {recentSolves.length === 0 ? (
                <div className="p-8 text-center text-[#888888] font-mono text-[13px]">
                  No problems solved yet. Go to <span className="text-[#da7756] underline cursor-pointer" onClick={() => navigate('/add')}>Add Problem</span> to log your first solve!
                </div>
              ) : (
                recentSolves.map((prob, i) => (
                  <div 
                    key={prob.id || i}
                    onClick={() => navigate('/search', { state: { openProblemId: prob.id } })}
                    className="flex px-6 py-3 border-b border-[#2a2a2a] items-center hover:bg-[#222222] transition-colors group cursor-pointer"
                  >
                    <div className="w-16 text-[13px] font-mono text-[#888888]">
                      #{String(i + 1).padStart(3, '0')}
                    </div>
                    <div className="flex-1 text-[#f0f0f0] font-medium group-hover:text-[#da7756] transition-colors truncate pr-4">
                      {prob.title}
                    </div>
                    <div className="w-28 flex justify-center">
                      <span className={`text-[11px] font-mono font-medium px-2.5 py-0.5 uppercase rounded-lg border ${
                        prob.difficulty === 'easy' 
                          ? 'bg-[#1a3a2a]/40 text-[#4caf7d] border-[#4caf7d]/30' 
                          : prob.difficulty === 'medium'
                            ? 'bg-[#3a2a0a]/40 text-[#f0a030] border-[#f0a030]/30'
                            : 'bg-[#3a1a1a]/40 text-[#e05555] border-[#e05555]/30'
                      }`}>
                        {prob.difficulty}
                      </span>
                    </div>
                    <div className="w-24 flex justify-end">
                      {prob.revisit ? (
                        <Bookmark size={16} className="text-[#f0c040]" title="Marked for Revisit" />
                      ) : (
                        <CheckCircle2 size={16} className="text-[#4caf7d]" title="Completed" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Column 2: Difficulty Breakdown (Takes up 1 column) */}
          <section className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 flex flex-col hover:border-[#da7756] transition-colors rounded-xl select-none">
            <h2 className="text-[18px] font-medium text-[#f0f0f0] mb-6">Difficulty Breakdown</h2>
            
            <div className="flex flex-col items-center justify-center gap-6 my-auto">
              {/* SVG Donut Chart */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Empty base circle */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2a2a2a" strokeWidth="3" />
                  
                  {totalSolved > 0 ? (
                    <>
                      {/* Easy segment */}
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="none" 
                        stroke="#4caf7d" 
                        strokeWidth="3.2" 
                        strokeDasharray={`${easyPct} 100`} 
                        strokeDashoffset="0" 
                      />
                      {/* Medium segment */}
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="none" 
                        stroke="#f0a030" 
                        strokeWidth="3.2" 
                        strokeDasharray={`${mediumPct} 100`} 
                        strokeDashoffset={`-${easyPct}`} 
                      />
                      {/* Hard segment */}
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="none" 
                        stroke="#e05555" 
                        strokeWidth="3.2" 
                        strokeDasharray={`${hardPct} 100`} 
                        strokeDashoffset={`-${easyPct + mediumPct}`} 
                      />
                    </>
                  ) : null}
                </svg>
                
                {/* Total text in center */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[28px] font-bold font-mono text-[#f0f0f0] leading-none">
                    {totalSolved}
                  </span>
                  <span className="text-[10px] font-mono text-[#888888] uppercase mt-1">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex flex-col gap-3 w-full border-t border-[#2a2a2a] pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4caf7d]" />
                    <span className="text-[#f0f0f0] font-medium text-[13px]">Easy</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#888888]">
                    {easyCount} ({totalSolved > 0 ? Math.round(easyPct) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f0a030]" />
                    <span className="text-[#f0f0f0] font-medium text-[13px]">Medium</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#888888]">
                    {mediumCount} ({totalSolved > 0 ? Math.round(mediumPct) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#e05555]" />
                    <span className="text-[#f0f0f0] font-medium text-[13px]">Hard</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#888888]">
                    {hardCount} ({totalSolved > 0 ? Math.round(hardPct) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
