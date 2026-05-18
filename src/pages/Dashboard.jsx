import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Search, Bell, TrendingUp, CheckCircle2, Bookmark, ArrowRight, X, BookOpen, Tag, Code2, AlertTriangle, Plus, Star, Clock, ExternalLink } from 'lucide-react';

const getLocalDateString = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [profileName, setProfileName] = useState('Grinder');
  const [profileRank, setProfileRank] = useState('Beginner');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedProblemForModal, setSelectedProblemForModal] = useState(null);
  const [showGreetingBanner, setShowGreetingBanner] = useState(true);
  const [dailyVolume, setDailyVolume] = useState(3);

  useEffect(() => {
    document.title = "GrindOS - Dashboard";
    if (window.api) {
      window.api.getProblems().then(data => {
        setProblems(data || []);
        calculateStats(data || []);
      });
    }
    
    const loadProfile = () => {
      const stored = localStorage.getItem('grindos_profile_info');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setProfileName(parsed.name);
          if (parsed.goal) setProfileRank(parsed.goal);
          if (parsed.dailyVolume) setDailyVolume(Number(parsed.dailyVolume) || 3);
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadProfile();

    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  const handleToggleRevisit = async (probId) => {
    if (!window.api) return;
    const updated = problems.map(p => {
      if (p.id === probId) {
        return { ...p, revisit: !p.revisit };
      }
      return p;
    });
    setProblems(updated);
    calculateStats(updated);
    await window.api.saveProblems(updated);
    
    // Also update the selectedProblemForModal state so the UI updates in the modal immediately!
    setSelectedProblemForModal(prev => {
      if (prev && prev.id === probId) {
        return { ...prev, revisit: !prev.revisit };
      }
      return prev;
    });
  };

  const calculateStats = (allProblems) => {
    // 1. Due count
    const todayStr = getLocalDateString();
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
    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (solvedDates[0] !== todayStr && solvedDates[0] !== yesterdayStr) {
      return 0;
    }

    let currentStreak = 0;
    let checkDate = new Date();
    if (solvedDates[0] === yesterdayStr) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkStr = getLocalDateString(checkDate);
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
      const dateStr = getLocalDateString(currentDate);
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

  // Time of day greeting and nudge metrics
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 17) return '🌤️';
    return '🌙';
  };

  const todayStr = getLocalDateString();
  const solvedTodayCount = problems.filter(p => p.solvedDate === todayStr && !p.partial).length;
  const revisitCount = problems.filter(p => p.revisit).length;

  return (
    <div className="flex-1 flex flex-row h-full bg-[#0d0d0d] text-[#f0f0f0] font-sans selection:bg-[#da7756]/20 selection:text-white overflow-hidden relative">
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
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

        {/* Personalized Greeting Banner */}
        {showGreetingBanner && (
          <div className="bg-gradient-to-r from-[#1a1a1a] via-[#201c1a] to-[#1a1a1a] border border-[#ff6b35]/20 hover:border-[#ff6b35]/40 transition-all rounded-xl p-5 relative shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top duration-300 select-none">
            {/* Close Button */}
            <button
              onClick={() => setShowGreetingBanner(false)}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#f0f0f0] p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Greeting Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[24px]">{getGreetingIcon()}</span>
              <div>
                <h2 className="text-[20px] font-bold text-[#f0f0f0]">
                  {getGreeting()}, <span className="text-[#ff6b35]">{profileName}</span>!
                </h2>
                <p className="text-[#888888] text-[12px] font-mono mt-0.5">
                  Welcome back to your workspace. Let's conquer today's target!
                </p>
              </div>
            </div>

            {/* Nudges Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#2a2a2a]/60 pt-4">
              {/* Nudge 1: Revisit Queue */}
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-3.5 rounded-lg flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-[#ff6b35]/80 font-bold block mb-1">REVISIT QUEUE</span>
                  <p className="text-[13px] text-[#e0e0e0] leading-snug">
                    {revisitCount > 0 
                      ? `You have ${revisitCount} problem${revisitCount > 1 ? 's' : ''} marked for revisit — ready to master them?`
                      : 'All clean! No problems currently pending in your review queue.'
                    }
                  </p>
                </div>
                {revisitCount > 0 && (
                  <button
                    onClick={() => navigate('/revisit')}
                    className="shrink-0 bg-[#ff6b35] hover:bg-[#ff8c5a] text-[#0d0d0d] font-mono text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)]"
                  >
                    Review <ArrowRight size={11} />
                  </button>
                )}
              </div>

              {/* Nudge 2: Daily Target */}
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-3.5 rounded-lg flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-[#4caf7d] font-bold block mb-1">DAILY TARGET</span>
                  <p className="text-[13px] text-[#e0e0e0] leading-snug">
                    Daily Goal: solved <strong className="text-[#4caf7d]">{solvedTodayCount} of {dailyVolume}</strong> problems today.
                    {solvedTodayCount >= dailyVolume 
                      ? ' Target achieved! 🚀 Keep it going!' 
                      : ` Let's push to log ${dailyVolume - solvedTodayCount} more!`
                    }
                  </p>
                </div>
                {solvedTodayCount < dailyVolume && (
                  <button
                    onClick={() => navigate('/add')}
                    className="shrink-0 border border-[#4caf7d]/50 hover:border-[#4caf7d] text-[#4caf7d] bg-[#4caf7d]/5 hover:bg-[#4caf7d]/10 font-mono text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    Solve <Plus size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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

                const todayStr = getLocalDateString();
                const isToday = cell.dateStr === todayStr;

                // Color-coding depending on activity type
                let colorClass = 'bg-[#1a1a1a] text-[#888888] hover:border-[#2a2a2a] hover:bg-[#202020]'; // Default empty
                let solveBadge = 'No activity';

                if (cell.solves.length > 0) {
                  const hasRevisit = cell.solves.some(p => p.revisit);
                  const hasPartial = cell.solves.some(p => p.partial);

                  if (hasRevisit) {
                    colorClass = 'bg-[#f0c040] text-[#0d0d0d] font-bold hover:shadow-[0_0_12px_rgba(240,192,64,0.4)]';
                    solveBadge = 'Revisited (Yellow)';
                  } else if (hasPartial) {
                    colorClass = 'bg-gradient-to-tr from-[#ff6b35] from-50% to-[#1a1a1a] to-50% text-white font-bold border border-[#ff6b35]/45 hover:shadow-[0_0_12px_rgba(255,107,53,0.4)]';
                    solveBadge = 'Partial attempt';
                  } else {
                    const count = cell.solves.length;
                    if (count === 1) {
                      colorClass = 'bg-[#ff6b35]/30 text-[#f0f0f0] font-bold border border-[#ff6b35]/25 hover:border-[#ff6b35]/60 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)]';
                      solveBadge = '1 problem solved (Low activity)';
                    } else if (count === 2) {
                      colorClass = 'bg-[#ff6b35]/65 text-white font-bold border border-[#ff6b35]/45 hover:shadow-[0_0_12px_rgba(255,107,53,0.5)]';
                      solveBadge = '2 problems solved (Medium activity)';
                    } else {
                      colorClass = 'bg-[#ff6b35] text-[#0d0d0d] font-black hover:shadow-[0_0_18px_rgba(255,107,53,0.7)]';
                      solveBadge = `${count} problems solved (High activity)`;
                    }
                  }
                }

                return (
                  <div
                    key={`day-${cell.day}`}
                    title={cell.solves.length > 0 ? `${cell.day} ${currentMonthName}: ${cell.solves.length} problem(s) [${solveBadge}]` : `${cell.day} ${currentMonthName}`}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-xl flex items-center justify-center text-[14px] transition-all hover:scale-105 cursor-pointer ${colorClass} ${
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
                      #{prob.problemId || String(i + 1).padStart(3, '0')}
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

      {/* Slide-in Daily Solves Side Panel */}
      {selectedDate && (() => {
        const dailySolves = problems.filter(p => p.solvedDate === selectedDate);
        return (
          <div className="w-[35%] min-w-[320px] max-w-[480px] shrink-0 h-full border-l border-[#2a2a2a] bg-[#1a1a1a] flex flex-col hover:border-[#da7756]/10 transition-all select-text overflow-hidden z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-[#2a2a2a] bg-[#1a1a1a] flex justify-between items-center shrink-0 select-none">
              <div className="flex flex-col select-none">
                <span className="font-mono text-[10px] font-bold text-[#888888] uppercase tracking-wider">PROBLEMS SOLVED ON</span>
                <h3 className="font-mono text-[18px] md:text-[22px] font-bold text-[#da7756] border-b-2 border-[#da7756] pb-1.5 w-fit tracking-wide mb-1">
                  {selectedDate}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/add', { state: { prefilledDate: selectedDate } })}
                  className="bg-[#da7756]/10 hover:bg-[#da7756]/20 border border-[#da7756]/30 text-[#da7756] p-1.5 rounded-lg transition-all cursor-pointer hover:scale-105"
                  title="Log problem for this day"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[#888888] hover:text-[#f0f0f0] p-1.5 hover:bg-[#2a2a2a] rounded transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {dailySolves.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 select-none">
                  <svg className="w-20 h-20 text-[#444444] mb-4 opacity-50 animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 10 L90 90" />
                    <path d="M90 10 L10 90" />
                    <path d="M50 10 L50 90" />
                    <path d="M10 50 L90 50" />
                    <path d="M30 30 Q50 40 70 30 Q60 50 70 70 Q50 60 30 70 Q40 50 30 30 Z" />
                    <path d="M20 20 Q50 35 80 20 Q65 50 80 80 Q50 65 20 80 Q35 50 20 20 Z" />
                    <path d="M40 40 Q50 45 60 40 Q55 50 60 60 Q50 55 40 60 Q45 50 40 40 Z" />
                  </svg>
                  <span className="text-[14px] font-mono text-[#888888] italic">nothing here... yet</span>
                  <span className="text-[11px] text-[#444444] mt-2 font-mono uppercase tracking-wider">Keep on grinding!</span>
                </div>
              ) : (
                dailySolves.map((prob, idx) => {
                  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
                  return (
                    <div 
                      key={prob.id || idx}
                      onClick={() => {
                        setSelectedProblemForModal(prob);
                      }}
                      className="bg-[#0d0d0d] border border-[#2a2a2a] hover:border-[#da7756]/80 p-4 rounded-xl transition-all duration-300 cursor-pointer select-none group flex flex-col gap-3 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#da7756]/[0.01] rounded-full blur-2xl pointer-events-none group-hover:bg-[#da7756]/[0.03] transition-all duration-500" />
                      
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <h4 className="font-bold text-[15px] text-[#f0f0f0] group-hover:text-[#da7756] transition-colors leading-snug truncate">
                            {prob.title}
                          </h4>
                          
                          <div className="flex gap-0.5">
                            {stars.map((star) => (
                              <Star 
                                key={star} 
                                size={11} 
                                className={star <= (prob.confidence || 3) ? 'text-[#da7756] fill-[#da7756]' : 'text-[#333333]'} 
                              />
                            ))}
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-lg uppercase shrink-0 border tracking-wider ${
                          prob.difficulty === 'easy' 
                            ? 'bg-[#1a3a2a]/40 text-[#4caf7d] border-[#4caf7d]/30' 
                            : prob.difficulty === 'medium'
                              ? 'bg-[#3a2a0a]/40 text-[#f0a030] border-[#f0a030]/30'
                              : 'bg-[#3a1a1a]/40 text-[#e05555] border-[#e05555]/30'
                        }`}>
                          {prob.difficulty}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-[#1a1a1a] px-2 py-0.5 border border-[#2a2a2a] rounded-md text-[11px] text-[#888888] font-mono flex items-center gap-1 group-hover:border-[#da7756]/30 transition-colors">
                          <Tag size={10} className="text-[#da7756]" />
                          {prob.category}
                        </span>
                        {prob.tags && prob.tags.filter(t => t !== prob.category).slice(0, 1).map(tag => (
                          <span key={tag} className="bg-[#1a1a1a] px-2 py-0.5 border border-[#2a2a2a] rounded-md text-[11px] text-[#888888] font-mono flex items-center gap-1 group-hover:border-[#da7756]/30 transition-colors">
                            <Tag size={10} className="text-[#da7756]/50" />
                            {tag}
                          </span>
                        ))}
                        <span className="bg-[#1a1a1a] px-2 py-0.5 border border-[#2a2a2a] rounded-md text-[11px] text-[#888888] font-mono uppercase flex items-center gap-1 group-hover:border-[#da7756]/30 transition-colors">
                          <Code2 size={10} className="text-[#da7756]" />
                          {prob.language}
                        </span>
                      </div>

                      <div className="h-[1px] bg-[#2a2a2a]/60 w-full group-hover:bg-[#da7756]/20 transition-colors" />

                      <div className="flex items-center justify-between text-[11px] font-mono text-[#888888]">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-[#da7756]" />
                          <span>Time Spent:</span>
                          <span className="text-[#f0f0f0] font-semibold">{prob.timeSpent || 0} mins</span>
                        </div>
                        {prob.revisit && (
                          <span className="text-[10px] text-[#f0a030] bg-[#f0a030]/10 border border-[#f0a030]/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            REVISIT
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* Problem Details Modal */}
      {selectedProblemForModal && (
        <div className="fixed inset-0 bg-[#0d0d0d]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#1a1a1a] border border-[#2a2a2a] shadow-2xl rounded-2xl flex flex-col hover:border-[#ff8c5a]/30 transition-all overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2a2a2a] bg-[#131313] flex justify-between items-center select-none shrink-0">
              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="font-mono text-[10px] text-[#ff8c5a] uppercase tracking-wider font-bold">PROBLEM DETAILS</span>
                <h2 className="text-[20px] font-bold text-[#f0f0f0] tracking-tight truncate leading-snug flex items-center gap-2">
                  {selectedProblemForModal.problemId && (
                    <span className="text-[#ff8c5a] font-mono bg-[#ff8c5a]/10 px-2 py-0.5 border border-[#ff8c5a]/20 rounded-md text-[13px]">
                      #{selectedProblemForModal.problemId}
                    </span>
                  )}
                  {selectedProblemForModal.title}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-[#888888] uppercase mr-1">Self Rating:</span>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                    <Star 
                      key={star} 
                      size={13} 
                      className={star <= (selectedProblemForModal.confidence || 3) ? 'text-[#f0c040] fill-[#f0c040]' : 'text-[#333333]'} 
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0 ml-4">
                {/* Revisit Toggle Switch */}
                <div className="flex items-center gap-2.5 border border-[#2a2a2a] bg-[#131313] px-3 py-1.5 rounded-xl select-none">
                  <span className="text-[11px] font-mono text-[#888888] uppercase font-bold">Revisit Required</span>
                  <button
                    onClick={() => handleToggleRevisit(selectedProblemForModal.id)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300 ${
                      selectedProblemForModal.revisit ? 'bg-[#f0c040]' : 'bg-[#2a2a2a]'
                    }`}
                  >
                    <div
                      className={`bg-[#0d0d0d] w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                        selectedProblemForModal.revisit ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <span className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-lg uppercase border tracking-wider select-none ${
                  selectedProblemForModal.difficulty === 'easy' 
                    ? 'bg-[#1a3a2a]/40 text-[#4caf7d] border-[#4caf7d]/30' 
                    : selectedProblemForModal.difficulty === 'medium'
                      ? 'bg-[#3a2a0a]/40 text-[#f0a030] border-[#f0a030]/30'
                      : 'bg-[#3a1a1a]/40 text-[#e05555] border-[#e05555]/30'
                }`}>
                  {selectedProblemForModal.difficulty}
                </span>
                <button
                  onClick={() => setSelectedProblemForModal(null)}
                  className="text-[#888888] hover:text-[#f0f0f0] p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Meta stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px] font-mono text-[#888888] select-none">
                <div className="bg-[#131313] p-3.5 rounded-xl border border-[#2a2a2a] flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase text-[#444444]">Category</span>
                  <span className="text-[#f0f0f0] font-semibold truncate">{selectedProblemForModal.category}</span>
                </div>
                <div className="bg-[#131313] p-3.5 rounded-xl border border-[#2a2a2a] flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase text-[#444444]">Language</span>
                  <span className="text-[#f0f0f0] font-semibold uppercase">{selectedProblemForModal.language}</span>
                </div>
                <div className="bg-[#131313] p-3.5 rounded-xl border border-[#2a2a2a] flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase text-[#444444]">Time Spent</span>
                  <span className="text-[#ff8c5a] font-semibold">{selectedProblemForModal.timeSpent || 0} mins</span>
                </div>
                <div className="bg-[#131313] p-3.5 rounded-xl border border-[#2a2a2a] flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase text-[#444444]">Solved Date</span>
                  <span className="text-[#f0f0f0] font-semibold">{selectedProblemForModal.solvedDate}</span>
                </div>
              </div>

              {/* Tags Section */}
              {selectedProblemForModal.tags && selectedProblemForModal.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-[#888888] uppercase block select-none">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProblemForModal.tags.map((tag) => (
                      <span key={tag} className="bg-[#131313] px-3 py-1 border border-[#2a2a2a] rounded-lg text-[12px] font-mono text-[#f0f0f0] hover:border-[#ff8c5a]/40 transition-all select-none">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source/Leetcode external link button */}
              {selectedProblemForModal.url && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-[#888888] uppercase block select-none">External Link</span>
                  <button 
                    onClick={() => {
                      if (window.api?.openExternal) window.api.openExternal(selectedProblemForModal.url);
                    }}
                    className="flex items-center gap-2 bg-[#131313] hover:bg-[#ff8c5a]/10 border border-[#2a2a2a] hover:border-[#ff8c5a]/40 text-[#ff8c5a] font-mono text-[13px] px-4 py-2.5 rounded-xl transition-all cursor-pointer w-full justify-center md:w-fit font-bold hover:shadow-[0_0_12px_rgba(255,140,90,0.1)]"
                  >
                    Solve on Leetcode <ExternalLink size={14} />
                  </button>
                </div>
              )}

              {/* Notes / Insights - Full text not truncated */}
              {selectedProblemForModal.notes && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-[#888888] uppercase block select-none">Algorithmic Notes & Approach</span>
                  <div className="p-5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl text-[14px] leading-relaxed text-[#f0f0f0]">
                    <MarkdownRenderer content={selectedProblemForModal.notes} />
                  </div>
                </div>
              )}

              {/* Solution Code */}
              {selectedProblemForModal.code && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-[#888888] uppercase block select-none">Solution Code</span>
                  <div className="border border-[#2a2a2a] rounded-xl overflow-hidden py-2 bg-[#0d0d0d]">
                    <Editor
                      height="260px"
                      theme="vs-dark"
                      language={selectedProblemForModal.language}
                      value={selectedProblemForModal.code}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollbar: { vertical: 'visible', horizontal: 'visible' },
                        fontSize: 13,
                        lineNumbers: 'on',
                        automaticLayout: true,
                        fontFamily: 'JetBrains Mono, Courier New, monospace',
                        domReadOnly: true
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#2a2a2a] bg-[#131313] flex justify-end items-center gap-3 select-none shrink-0">
              <button
                onClick={() => setSelectedProblemForModal(null)}
                className="border border-[#2a2a2a] hover:border-[#888888] text-[#888888] hover:text-[#f0f0f0] font-mono text-[12px] px-5 py-2.5 rounded-xl transition-all cursor-pointer font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const prob = selectedProblemForModal;
                  setSelectedProblemForModal(null);
                  navigate('/add', { state: { editProblem: prob } });
                }}
                className="bg-[#ff8c5a] hover:bg-[#ffb59d] text-[#0d0d0d] font-mono text-[12px] px-5 py-2.5 rounded-xl transition-all cursor-pointer font-bold border border-[#ff8c5a] hover:shadow-[0_0_12px_rgba(255,140,90,0.4)]"
              >
                Edit Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
