import { useEffect, useState } from 'react';
import { 
  Award, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Award as AwardIcon,
  ArrowRight,
  Save,
  Flame,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import { seedProblems } from '../utils/seeder';

export default function Profile() {
  const [problems, setProblems] = useState([]);
  
  // Profile settings state (localStorage bound)
  const [profileName, setProfileName] = useState('Grinder');
  const [profileGoal, setProfileGoal] = useState('Crack FAANG');
  const [weapon, setWeapon] = useState('Python');
  const [dailyVolume, setDailyVolume] = useState('3');

  // UI States
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    loadProblems();
    
    const loadProfile = () => {
      const stored = localStorage.getItem('grindos_profile_info');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setProfileName(parsed.name);
          if (parsed.goal) setProfileGoal(parsed.goal);
          if (parsed.language) setWeapon(parsed.language);
          if (parsed.dailyVolume) setDailyVolume(String(parsed.dailyVolume));
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadProfile();

    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  const loadProblems = () => {
    if (window.api) {
      window.api.getProblems().then(setProblems);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  // Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const config = {
      name: profileName.trim() || 'Grinder',
      goal: profileGoal,
      language: weapon,
      dailyVolume: Number(dailyVolume) || 3
    };
    localStorage.setItem('grindos_profile_info', JSON.stringify(config));
    showToast('Profile credentials saved successfully!', 'success');
    window.dispatchEvent(new Event('storage'));
  };

  // Gamification stats
  const calculateXP = () => {
    let xp = 0;
    problems.forEach(p => {
      if (p.difficulty === 'easy') xp += 10;
      else if (p.difficulty === 'medium') xp += 30;
      else if (p.difficulty === 'hard') xp += 50;
    });
    return xp;
  };

  const totalXP = calculateXP();
  const xpPerLevel = 100;
  const level = Math.floor(totalXP / xpPerLevel) + 1;
  const currentXPInLevel = totalXP % xpPerLevel;
  const progressPercent = Math.min(100, Math.floor((currentXPInLevel / xpPerLevel) * 100));

  const getLevelTitle = (lvl) => {
    if (lvl === 1) return 'Brute Force Beginner';
    if (lvl === 2) return 'Array Apprentice';
    if (lvl === 3) return 'Pointer Practitioner';
    if (lvl === 4) return 'Stack Specialist';
    if (lvl === 5) return 'Linked List Leader';
    if (lvl === 6) return 'Recursion Ranger';
    if (lvl === 7) return 'Tree Traverser';
    if (lvl === 8) return 'Graph Guardian';
    if (lvl === 9) return 'DP Disciple';
    return 'Algorithmic Grandmaster';
  };

  const getLocalDateString = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Streaks
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

  const currentStreak = calculateStreak(problems);
  const longestStreak = calculateLongestStreak(problems);

  // Average Time Spent
  const averageTime = problems.length > 0 
    ? Math.round(problems.reduce((sum, p) => sum + (Number(p.timeSpent) || 0), 0) / problems.length)
    : 0;

  // Topic Analytics
  const categoryStats = problems.reduce((acc, p) => {
    if (!acc[p.category]) {
      acc[p.category] = { count: 0, totalConfidence: 0 };
    }
    acc[p.category].count += 1;
    acc[p.category].totalConfidence += (p.confidence || 3);
    return acc;
  }, {});

  let strongestTopic = 'None';
  let strongestCount = 0;
  let strongestConfidenceAvg = 0;

  let weakestTopic = 'None';
  let weakestConfidenceAvg = 6;
  let weakestCount = 0;

  Object.entries(categoryStats).forEach(([category, stats]) => {
    const avgConf = stats.totalConfidence / stats.count;
    if (stats.count > strongestCount || (stats.count === strongestCount && avgConf > strongestConfidenceAvg)) {
      strongestTopic = category;
      strongestCount = stats.count;
      strongestConfidenceAvg = avgConf;
    }
    if (avgConf < weakestConfidenceAvg || (avgConf === weakestConfidenceAvg && stats.count < weakestCount)) {
      weakestTopic = category;
      weakestConfidenceAvg = avgConf;
      weakestCount = stats.count;
    }
  });

  // Badges list
  const badgesList = [
    {
      id: 'first_blood',
      title: 'First Blood',
      desc: 'Logged your first solved coding problem.',
      unlocked: problems.length >= 1,
      icon: '🎯'
    },
    {
      id: 'consistency_3',
      title: 'Consistency King',
      desc: 'Achieved a solve streak of 3+ consecutive days.',
      unlocked: longestStreak >= 3,
      icon: '🔥'
    },
    {
      id: 'consistency_7',
      title: 'Grind Master',
      desc: 'Achieved a solve streak of 7+ consecutive days.',
      unlocked: longestStreak >= 7,
      icon: '👑'
    },
    {
      id: 'faang_slayer',
      title: 'FAANG Slayer',
      desc: 'Solved 5+ Medium/Hard tier problems.',
      unlocked: problems.filter(p => (p.difficulty === 'medium' || p.difficulty === 'hard') && !p.partial).length >= 5,
      icon: '⚔️'
    },
    {
      id: 'bug_squasher',
      title: 'Bug Squasher',
      desc: 'Successfully finished logging a partial problem.',
      unlocked: problems.some(p => !p.partial && p.timeSpent > 0),
      icon: '🛠️'
    },
    {
      id: 'perfect_score',
      title: 'Perfect 5-Star',
      desc: 'Logged at least one 5-star confidence solve.',
      unlocked: problems.some(p => p.confidence === 5),
      icon: '💎'
    }
  ];

  // Categories count
  const categoryCounts = problems.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Seeding
  const handleSeedData = async () => {
    if (!window.api) return;
    try {
      const response = await window.api.saveProblems(seedProblems);
      if (response.success) {
        showToast('Successfully seeded 10 LeetCode problems!', 'success');
        loadProblems();
      } else {
        showToast('Failed to seed: ' + response.error, 'error');
      }
    } catch (err) {
      showToast('Error seeding: ' + err.message, 'error');
    }
  };

  // Reset
  const handleResetData = async () => {
    if (!window.api) return;
    try {
      const response = await window.api.saveProblems([]);
      if (response.success) {
        showToast('Database wiped successfully.', 'success');
        setShowConfirmReset(false);
        loadProblems();
      } else {
        showToast('Failed to wipe: ' + response.error, 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // Export
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problems, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `grindos_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Backup downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to export: ' + err.message, 'error');
    }
  };

  // Import
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedProblems = JSON.parse(event.target.result);
        if (!Array.isArray(importedProblems)) {
          showToast('Invalid backup format. Must be a JSON array.', 'error');
          return;
        }

        if (window.api) {
          const response = await window.api.saveProblems(importedProblems);
          if (response.success) {
            showToast(`Successfully imported ${importedProblems.length} problems!`, 'success');
            loadProblems();
          } else {
            showToast('Failed to save imported data: ' + response.error, 'error');
          }
        }
      } catch (err) {
        showToast('Failed to parse JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0d0d0d] text-[#f0f0f0] font-sans selection:bg-[#da7756]/20 selection:text-white pb-16">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 font-medium ${
          toast.type === 'error' 
            ? 'bg-[#e05555]/10 border-[#e05555]/30 text-[#e05555] shadow-[#e05555]/10' 
            : 'bg-easy/10 border-easy/30 text-easy shadow-easy/10'
        }`}>
          {toast.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-[13px]">{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-4 border-b border-[#2a2a2a] shrink-0 select-none">
          <div>
            <h1 className="text-[24px] font-bold text-[#f0f0f0] tracking-tight">PROFILE // ONBOARDING</h1>
            <p className="text-[#888888] text-[13px] font-mono mt-1">Configure profile goals, view gamified achievements, and backup data blocks.</p>
          </div>
        </header>

        {/* Level Progression Banner */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between hover:border-[#da7756]/30 transition-colors relative overflow-hidden group select-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#da7756]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#da7756]/10 transition-all duration-500" />
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-16 h-16 rounded-xl bg-[#da7756]/10 border border-[#da7756]/20 flex items-center justify-center text-[#da7756] relative shrink-0">
              <AwardIcon size={36} strokeWidth={1.5} />
              <div className="absolute -bottom-1 -right-1 bg-[#da7756] text-[#0d0d0d] text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md border border-[#1a1a1a]">
                Lv {level}
              </div>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#f0f0f0] tracking-wide">{getLevelTitle(level)}</h2>
              <div className="flex items-center gap-2 mt-1 text-[12px] text-[#888888] font-mono">
                <Sparkles size={13} className="text-[#da7756] animate-pulse" />
                <span>{totalXP} Total XP Earned</span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 w-full sm:w-80 flex flex-col">
            <div className="flex justify-between items-end mb-1 text-[11px] font-mono text-[#888888]">
              <span>Level Progress</span>
              <span className="text-[#da7756] font-bold">{currentXPInLevel} / {xpPerLevel} XP ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-full overflow-hidden p-[1px]">
              <div 
                className="h-full bg-gradient-to-r from-[#da7756] to-[#ffb59d] rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Premium Performance & Consistency Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
          {/* Card 1: Total Solved */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#da7756]/30 transition-colors rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#da7756]/10 flex items-center justify-center text-[#da7756] shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[#888888] text-[11px] font-mono uppercase tracking-wider block">Total Solved</span>
              <span className="text-[20px] font-bold font-mono text-[#f0f0f0] mt-0.5 block">{problems.length}</span>
            </div>
          </div>

          {/* Card 2: Solve Streak */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#da7756]/30 transition-colors rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#da7756]/10 flex items-center justify-center text-[#da7756] shrink-0">
              <Flame size={20} className={currentStreak > 0 ? "animate-pulse fill-[#da7756]/20" : ""} />
            </div>
            <div className="min-w-0">
              <span className="text-[#888888] text-[11px] font-mono uppercase tracking-wider block">Solve Streak</span>
              <span className="text-[20px] font-bold font-mono text-[#f0f0f0] mt-0.5 block">
                {currentStreak} <span className="text-[12px] text-[#888888] font-normal font-sans">/ {longestStreak} max</span>
              </span>
            </div>
          </div>

          {/* Card 3: Avg Time */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#da7756]/30 transition-colors rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#da7756]/10 flex items-center justify-center text-[#da7756] shrink-0">
              <Clock size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[#888888] text-[11px] font-mono uppercase tracking-wider block">Avg Solve Time</span>
              <span className="text-[20px] font-bold font-mono text-[#f0f0f0] mt-0.5 block">
                {averageTime} <span className="text-[12px] text-[#888888] font-normal font-sans">mins</span>
              </span>
            </div>
          </div>

          {/* Card 4: Topic Analytics */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#da7756]/30 transition-colors rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#da7756]/10 flex items-center justify-center text-[#da7756] shrink-0">
              <Zap size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[#888888] text-[11px] font-mono uppercase tracking-wider block">Top Subject</span>
              <span className="text-[14px] font-bold text-[#f0f0f0] mt-0.5 block truncate" title={strongestTopic}>
                {strongestTopic === 'None' ? 'N/A' : strongestTopic}
              </span>
            </div>
          </div>
        </section>

        {/* Dynamic Badges & mini Heatmap */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
          {/* Achievements & Badges List */}
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#da7756]/30 transition-colors">
            <div className="flex items-center gap-2 border-b border-[#2a2a2a] pb-3 mb-4">
              <Award size={16} className="text-[#da7756]" />
              <h3 className="text-[14px] font-bold font-mono text-[#f0f0f0] uppercase tracking-wider">Achievements & Badges</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {badgesList.map(badge => (
                <div 
                  key={badge.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all duration-300 relative overflow-hidden ${
                    badge.unlocked 
                      ? 'bg-[#da7756]/5 border-[#da7756]/30 shadow-[0_0_15px_rgba(218,119,86,0.05)] hover:border-[#da7756]/60' 
                      : 'bg-[#131313]/50 border-[#2a2a2a] opacity-60'
                  }`}
                >
                  <div className={`text-[26px] shrink-0 p-1.5 rounded-xl ${badge.unlocked ? 'bg-[#da7756]/10' : 'bg-[#0d0d0d]'}`}>
                    {badge.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-[13.5px] font-bold font-sans tracking-wide ${badge.unlocked ? 'text-[#f0f0f0]' : 'text-[#888888]'}`}>
                        {badge.title}
                      </h4>
                      {badge.unlocked ? (
                        <span className="text-[9px] font-mono text-[#4caf7d] bg-[#4caf7d]/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">UNLOCKED</span>
                      ) : (
                        <span className="text-[9px] font-mono text-[#666666] bg-[#2a2a2a] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">LOCKED</span>
                      )}
                    </div>
                    <p className="text-[#888888] text-[11.5px] mt-1 font-sans leading-relaxed">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consistency Mini-Heatmap */}
          <div className="lg:col-span-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#da7756]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#da7756]" />
                  <h3 className="text-[14px] font-bold font-mono text-[#f0f0f0] uppercase tracking-wider">Consistency</h3>
                </div>
                <span className="text-[#888888] text-[11px] font-mono">
                  {new Date().toLocaleString('default', { month: 'short' })} {new Date().getFullYear()}
                </span>
              </div>

              {/* Compact calendar grid (smaller calendar circles) */}
              <div className="grid grid-cols-7 gap-2.5 justify-items-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
                  <span key={i} className="text-[#444444] text-[10px] font-mono font-bold select-none">{wd}</span>
                ))}
                {(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = today.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const totalDays = new Date(year, month + 1, 0).getDate();
                  const cells = [];
                  
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(<div key={`p-${i}`} className="w-[20px] h-[20px] rounded bg-[#0d0d0d] border border-transparent" />);
                  }

                  for (let day = 1; day <= totalDays; day++) {
                    const dateStr = getLocalDateString(new Date(year, month, day));
                    const isToday = dateStr === getLocalDateString();
                    const daySolves = problems.filter(p => p.solvedDate === dateStr);
                    let color = 'bg-[#131313] hover:border-[#2a2a2a]';
                    let titleVal = `${day} Solved: 0`;

                    if (daySolves.length > 0) {
                      const hasRevisit = daySolves.some(p => p.revisit);
                      const hasPartial = daySolves.some(p => p.partial);
                      if (hasRevisit) {
                        color = 'bg-[#f0c040] shadow-[0_0_8px_rgba(240,192,64,0.3)]';
                        titleVal = `${day} Solved: Revisited (Yellow)`;
                      } else if (hasPartial) {
                        color = 'bg-gradient-to-tr from-[#ff6b35] from-50% to-[#1a1a1a] to-50% border border-[#ff6b35]/30 shadow-[0_0_8px_rgba(255,107,53,0.3)]';
                        titleVal = `${day} Solved: Incomplete (Orange Gradient)`;
                      } else {
                        const count = daySolves.length;
                        if (count === 1) {
                          color = 'bg-[#ff6b35]/40 border border-[#ff6b35]/25';
                        } else if (count === 2) {
                          color = 'bg-[#ff6b35]/70 shadow-[0_0_6px_rgba(255,107,53,0.4)]';
                        } else {
                          color = 'bg-[#ff6b35] shadow-[0_0_10px_rgba(255,107,53,0.6)]';
                        }
                        titleVal = `${day} Solved: ${count}`;
                      }
                    }

                    cells.push(
                      <div 
                        key={day}
                        title={titleVal}
                        className={`w-[20px] h-[20px] rounded text-[9px] font-mono flex items-center justify-center transition-all cursor-default select-none ${color} ${
                          isToday ? 'ring-1 ring-white ring-offset-1 ring-offset-[#1a1a1a]' : 'border border-[#2a2a2a]'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>

            {/* Performance quote or ranking */}
            <div className="mt-4 pt-4 border-t border-[#2a2a2a]/60 text-center font-mono">
              <span className="text-[10px] text-[#888888] uppercase block tracking-wider">Algorithmic Focus</span>
              <p className="text-[12px] text-[#da7756] font-bold mt-1 leading-relaxed">
                {problems.length > 0 
                  ? `Strongest subject: ${strongestTopic}. Weakest: ${weakestTopic === 'None' ? 'N/A' : weakestTopic}.`
                  : "Solve problems to compute analytics."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Two-Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1 & 2: Setup form and progress */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Onboarding Profile Configurations */}
            <form onSubmit={handleSaveProfile} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#da7756]/30 transition-colors space-y-6">
              <h3 className="text-[15px] font-mono font-bold text-[#f0f0f0] border-b border-[#2a2a2a] pb-3 uppercase tracking-wider select-none">
                Profile Credentials
              </h3>
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-mono text-[12px] text-[#888888] uppercase tracking-wider block" htmlFor="name">
                  what should we call you?
                </label>
                <input 
                  id="name"
                  type="text" 
                  placeholder="your name..."
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 font-mono text-[13px] text-[#f0f0f0] placeholder:text-[#444444] focus:border-[#da7756] outline-none transition-colors"
                />
              </div>

              {/* Grid with Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Goal Option */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[12px] text-[#888888] uppercase tracking-wider block">primary goal</label>
                  <select 
                    value={profileGoal}
                    onChange={(e) => setProfileGoal(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 font-mono text-[13px] text-[#f0f0f0] focus:border-[#da7756] outline-none transition-colors cursor-pointer"
                  >
                    <option>Get an internship</option>
                    <option>Crack FAANG</option>
                    <option>Personal growth</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Weapon language */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[12px] text-[#888888] uppercase tracking-wider block">weapon of choice</label>
                  <select 
                    value={weapon}
                    onChange={(e) => setWeapon(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 font-mono text-[13px] text-[#f0f0f0] focus:border-[#da7756] outline-none transition-colors cursor-pointer"
                  >
                    <option>Java</option>
                    <option>Python</option>
                    <option>C++</option>
                    <option>JavaScript</option>
                    <option>Go</option>
                    <option>Rust</option>
                  </select>
                </div>
              </div>

              {/* Daily Volume */}
              <div className="space-y-1.5">
                <label className="font-mono text-[12px] text-[#888888] uppercase tracking-wider block">daily grind volume</label>
                <div className="relative flex items-center">
                  <input 
                    type="number"
                    value={dailyVolume}
                    onChange={(e) => setDailyVolume(e.target.value)}
                    placeholder="3"
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-4 pr-32 py-2 font-mono text-[13px] text-[#f0f0f0] placeholder:text-[#444444] focus:border-[#da7756] outline-none transition-colors"
                  />
                  <span className="absolute right-4 font-mono text-[11px] text-[#888888] uppercase select-none pointer-events-none">
                    problems / day
                  </span>
                </div>
              </div>

              {/* Save profile */}
              <div className="pt-2 select-none">
                <button 
                  type="submit"
                  className="w-full bg-[#da7756] hover:bg-[#ffb59d] text-[#0d0d0d] font-bold text-[14px] py-2.5 rounded-xl border border-[#da7756] hover:shadow-[0_0_10px_rgba(218,119,86,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
                >
                  <Save size={16} /> Save Profile Settings
                </button>
              </div>
            </form>

            {/* Card 2: Skill Focus & Category Progress bar stats */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#da7756]/30 transition-colors flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-[#2a2a2a] pb-3 select-none">
                <TrendingUp size={16} className="text-[#da7756]" />
                <h3 className="text-[14px] font-bold font-mono text-[#f0f0f0] uppercase tracking-wider">Skills Focus Metrics</h3>
              </div>
              
              {problems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#2a2a2a] rounded-lg select-none">
                  <span className="text-[13px] text-[#888888] font-mono mb-2">No category logs recorded yet.</span>
                  <span className="text-[11px] text-[#444444] max-w-xs leading-relaxed">Seed mock demo problems or add coding tasks to evaluate visual stats.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedCategories.map(([category, count]) => {
                    const percentage = Math.min(100, Math.floor((count / problems.length) * 100));
                    return (
                      <div key={category} className="p-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg flex flex-col gap-1.5 hover:border-[#da7756]/20 transition-all duration-300 select-none">
                        <div className="flex justify-between text-[12px] font-mono">
                          <span className="text-[#f0f0f0] truncate font-semibold pr-2">{category}</span>
                          <span className="text-[#da7756] font-bold shrink-0">{count} solved</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden p-[0.5px]">
                          <div 
                            className="h-full bg-[#da7756]/70 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Column 3: Data Utilities */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card 3: Data System actions */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#da7756]/30 transition-colors flex flex-col gap-4 select-none">
              <div className="flex items-center gap-2 border-b border-[#2a2a2a] pb-3">
                <Database size={16} className="text-[#da7756]" />
                <h3 className="text-[14px] font-bold font-mono text-[#f0f0f0] uppercase tracking-wider">System Utilities</h3>
              </div>

              <div className="flex flex-col gap-3">
                {/* Seed Button */}
                <button
                  type="button"
                  onClick={handleSeedData}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#da7756]/10 hover:bg-[#da7756]/20 text-[#da7756] border border-[#da7756]/30 rounded-xl text-[12px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles size={14} /> Seed Demo Database
                </button>

                {/* Export Backup */}
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={problems.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0d0d0d] hover:bg-[#222222] border border-[#2a2a2a] rounded-xl text-[12px] font-mono font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[#f0f0f0] whitespace-nowrap"
                >
                  <Download size={14} /> Export Backup (.json)
                </button>

                {/* Import Backup */}
                <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0d0d0d] hover:bg-[#222222] border border-[#2a2a2a] rounded-xl text-[12px] font-mono font-bold transition-all cursor-pointer text-[#f0f0f0] whitespace-nowrap">
                  <Upload size={14} /> Import Backup (.json)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>

                {/* Confirm Reset toggle */}
                {!showConfirmReset ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#e05555]/5 hover:bg-[#e05555]/15 text-[#e05555] border border-[#e05555]/20 rounded-xl text-[12px] font-mono font-bold transition-all cursor-pointer mt-2 whitespace-nowrap"
                  >
                    <Trash2 size={14} /> Wipe Local Database
                  </button>
                ) : (
                  <div className="p-4 bg-[#e05555]/10 border border-[#e05555]/30 rounded-xl flex flex-col gap-3 mt-2 animate-in fade-in duration-300">
                    <span className="text-[11px] font-mono text-[#e05555] font-bold text-center block uppercase tracking-wider">
                      ARE YOU ABSOLUTELY SURE?
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResetData}
                        className="flex-1 py-2 px-3 bg-[#e05555] hover:bg-[#ff8888] text-[#0d0d0d] font-mono font-bold text-[11px] rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Yes, Wipe
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmReset(false)}
                        className="flex-1 py-2 px-3 bg-[#0d0d0d] border border-[#2a2a2a] text-[#888888] font-mono text-[11px] rounded-lg hover:text-[#f0f0f0] transition-colors cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Offline footer text */}
            <div className="text-center mt-4">
              <p className="font-mono text-[10px] text-[#444444] uppercase tracking-widest leading-relaxed">
                your data stays on your machine.<br />always.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
