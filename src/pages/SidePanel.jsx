import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Edit3, Shield, Copy, Check, FileCode, Clock, BookOpen } from 'lucide-react';

const cheatSheets = [
  {
    id: 'binary-search',
    title: 'Binary Search',
    lang: 'Python',
    code: `def binary_search(arr, target):
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`
  },
  {
    id: 'bfs-dfs',
    title: 'Tree BFS / DFS',
    lang: 'Python',
    code: `# Tree BFS
from collections import deque
def bfs(root):
    if not root: return
    queue = deque([root])
    while queue:
        node = queue.popleft()
        # Process node
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)

# Tree DFS Recursive
def dfs(root):
    if not root: return
    # Process root
    dfs(root.left)
    dfs(root.right)`
  },
  {
    id: 'complexity',
    title: 'Complexity Maps',
    lang: 'Reference',
    code: `Input Size  | Target Complexity | Example Algorithms
----------- | ----------------- | ------------------
N <= 10     | O(N!) or O(2^N)   | Permutations, Backtracking
N <= 20     | O(2^N)            | DFS, Bitmasking, Subsets
N <= 100    | O(N^3)            | Floyd-Warshall, Nested Loops
N <= 1,000  | O(N^2)            | Bubble Sort, DP matrix
N <= 10^5   | O(N log N)        | Merge Sort, Heap, Sorting
N <= 10^6   | O(N)              | Hash Map pass, Sliding Window
N > 10^8    | O(log N)          | Binary Search, Binary Pow`
  }
];

export default function SidePanel() {
  // Timer States
  const [time, setTime] = useState(0); // in deciseconds (1/10s)
  const [isRunning, setIsRunning] = useState(false);
  const [difficultyGoal, setDifficultyGoal] = useState('medium'); // easy | medium | hard

  // Scratchpad States
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem('grindos_scratchpad') || '';
  });

  // Tab State
  const [activeTab, setActiveTab] = useState('timer'); // timer | cheat
  const [activeSheet, setActiveSheet] = useState(cheatSheets[0].id);
  const [copiedId, setCopiedId] = useState(null);

  const timerRef = useRef(null);

  // Load Scratchpad sync
  useEffect(() => {
    localStorage.setItem('grindos_scratchpad', scratchpad);
  }, [scratchpad]);

  // Stopwatch Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Format Deciseconds to MM:SS.d
  const formatTime = () => {
    const totalSeconds = Math.floor(time / 10);
    const deciseconds = time % 10;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const minStr = String(minutes).padStart(2, '0');
    const secStr = String(seconds).padStart(2, '0');
    
    return `${minStr}:${secStr}.${deciseconds}`;
  };

  // Difficulty target goal times
  const getGoalMinutes = () => {
    if (difficultyGoal === 'easy') return 15;
    if (difficultyGoal === 'medium') return 35;
    return 45;
  };

  const getProgressPercentage = () => {
    const goalDeciseconds = getGoalMinutes() * 60 * 10;
    return Math.min(100, Math.floor((time / goalDeciseconds) * 100));
  };

  // Copy Cheat Sheet
  const handleCopyCode = (sheet) => {
    navigator.clipboard.writeText(sheet.code);
    setCopiedId(sheet.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex flex-col h-full gap-4 max-w-md mx-auto select-none overflow-hidden pb-4 pr-1">
      {/* Header */}
      <div>
        <h1 className="text-20 font-bold font-sans tracking-tight">Practice Companion</h1>
        <p className="text-11 text-text-secondary mt-0.5">Perfect vertical layout workspace for split-screen Leetcode grinds.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-1.5 bg-surface border border-border p-0.5 rounded-lg font-mono text-11 font-bold shrink-0 self-start">
        <button
          onClick={() => setActiveTab('timer')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all cursor-pointer ${
            activeTab === 'timer' ? 'bg-primary/10 text-primary border border-primary/10' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Clock size={12} />
          Stopwatch & Goals
        </button>
        <button
          onClick={() => setActiveTab('cheat')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all cursor-pointer ${
            activeTab === 'cheat' ? 'bg-primary/10 text-primary border border-primary/10' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileCode size={12} />
          Cheat Sheets
        </button>
      </div>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Tab 1: Stopwatch Timer */}
        {activeTab === 'timer' && (
          <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/20 transition-all flex flex-col gap-4 shrink-0 justify-center">
            
            {/* Target Difficulty Selector */}
            <div className="flex items-center justify-between">
              <span className="text-11 font-mono text-text-secondary">Target Difficulty:</span>
              <div className="flex bg-background border border-border p-0.5 rounded-md font-mono text-10 font-bold">
                {['easy', 'medium', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyGoal(diff)}
                    className={`px-2 py-0.5 rounded transition-all capitalize cursor-pointer ${
                      difficultyGoal === diff ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing stopwatch digits */}
            <div className="flex flex-col items-center justify-center py-3 select-text font-mono relative">
              <div className="text-42 font-bold text-primary font-mono tracking-tight leading-none drop-shadow-[0_0_8px_rgba(218,119,86,0.2)]">
                {formatTime()}
              </div>
              <span className="text-10 text-text-muted font-mono uppercase tracking-wider mt-2.5">
                Target: {getGoalMinutes()} Minutes ({getProgressPercentage()}% Spent)
              </span>
            </div>

            {/* Goal Progress Bar */}
            <div className="w-full h-1.5 bg-background border border-border rounded-full overflow-hidden p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  getProgressPercentage() > 90 ? 'bg-hard shadow-[0_0_6px_rgba(224,85,85,0.4)]' : 'bg-primary shadow-[0_0_6px_rgba(218,119,86,0.3)]'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {/* Play / Pause */}
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-11 font-mono font-bold border transition-all cursor-pointer ${
                  isRunning 
                    ? 'bg-hard/5 border-hard/30 text-hard hover:bg-hard/15' 
                    : 'bg-primary/10 border-primary/25 text-primary hover:bg-primary/20'
                }`}
              >
                {isRunning ? <Pause size={13} /> : <Play size={13} />}
                {isRunning ? 'Pause' : 'Start'}
              </button>
              
              {/* Reset */}
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTime(0);
                }}
                className="flex items-center justify-center py-1.5 px-3 border border-border bg-background hover:bg-surface-elevated/80 rounded-lg text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Cheat Sheets Library */}
        {activeTab === 'cheat' && (
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 shrink-0 h-[220px] overflow-hidden hover:border-primary/20 transition-colors">
            
            {/* Sheet Sub-Selectors */}
            <div className="flex gap-1.5 border-b border-border/80 pb-2 select-none overflow-x-auto shrink-0 scrollbar-none">
              {cheatSheets.map(sheet => (
                <button
                  key={sheet.id}
                  onClick={() => setActiveSheet(sheet.id)}
                  className={`px-2.5 py-0.5 rounded text-10 font-mono font-bold shrink-0 transition-all cursor-pointer ${
                    activeSheet === sheet.id ? 'bg-primary/10 text-primary border border-primary/15' : 'text-text-muted hover:text-text-secondary border border-transparent'
                  }`}
                >
                  {sheet.title}
                </button>
              ))}
            </div>

            {/* Render Selected Cheat Sheet Code Block */}
            {cheatSheets.map(sheet => {
              if (sheet.id !== activeSheet) return null;
              return (
                <div key={sheet.id} className="flex-1 flex flex-col min-h-0 relative">
                  <div className="absolute top-2 right-2 flex items-center gap-2 z-10 select-none">
                    <span className="text-[9px] font-mono border border-border/80 bg-background px-1.5 rounded text-text-muted select-none">
                      {sheet.lang}
                    </span>
                    <button
                      onClick={() => handleCopyCode(sheet)}
                      title="Copy Syntax"
                      className="p-1 bg-background hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-border rounded transition-all cursor-pointer"
                    >
                      {copiedId === sheet.id ? <Check size={12} className="text-easy animate-pulse" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <pre className="flex-1 bg-background/50 border border-border/80 rounded-lg p-3 font-mono text-[10.5px] text-text-secondary overflow-auto leading-normal select-text scrollbar-thin">
                    {sheet.code}
                  </pre>
                </div>
              );
            })}
          </div>
        )}

        {/* PERSISTENT SCRATCHPAD WIDGET (Occupies remaining height beautifully) */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-4 flex flex-col gap-2 hover:border-primary/20 transition-all min-h-0">
          <div className="flex items-center justify-between border-b border-border/80 pb-2 shrink-0">
            <span className="text-11 font-bold font-mono text-text-primary flex items-center gap-1.5">
              <Edit3 size={12} className="text-primary animate-pulse" />
              Practice Whiteboard Notepad
            </span>
            {scratchpad.trim() && (
              <button
                onClick={() => setScratchpad('')}
                className="text-10 font-mono text-text-muted hover:text-hard hover:scale-105 transition-all cursor-pointer select-none bg-background border border-border px-2 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          <textarea
            placeholder="Dry-run dry case notes here...&#10;e.g.&#10;nums = [2, 7, 11, 15]&#10;target = 9&#10;diff = 7 -> found index 1!&#10;&#10;Note: Scratchpad is autosaved instantly!"
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            className="flex-1 bg-background/50 border border-border/70 text-12 font-mono px-3 py-2 rounded-lg text-text-secondary focus:border-primary outline-none resize-none select-text overflow-y-auto leading-relaxed scrollbar-thin"
          />
        </div>
      </div>
    </div>
  );
}
