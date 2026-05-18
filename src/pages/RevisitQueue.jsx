import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Calendar, 
  X, 
  Bookmark, 
  CheckCircle2, 
  Terminal, 
  Star,
  FileCode,
  AlertTriangle
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function RevisitQueue() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [revisitQueue, setRevisitQueue] = useState([]);
  const [incompleteQueue, setIncompleteQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('revisit'); // 'revisit' or 'incomplete'
  const [showBanner, setShowBanner] = useState(true);
  const [toast, setToast] = useState('');
  
  const listRef = useRef(null);

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    if (revisitQueue.length > 0) {
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [revisitQueue.length]);

  const loadProblems = () => {
    if (window.api) {
      window.api.getProblems().then(data => {
        const list = data || [];
        setProblems(list);
        
        // Revisit queue consists of problems with revisit = true
        const rQueue = list.filter(p => p.revisit);
        setRevisitQueue(rQueue);

        // Incomplete queue consists of problems with partial = true
        const iQueue = list.filter(p => p.partial);
        setIncompleteQueue(iQueue);
      });
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  const handleResolveDirectly = async (prob) => {
    if (!window.api) return;
    try {
      const existingProblems = await window.api.getProblems();
      const updatedList = existingProblems.map(p => {
        if (p.id === prob.id) {
          return { ...p, revisit: false };
        }
        return p;
      });
      const response = await window.api.saveProblems(updatedList);
      if (response.success) {
        showToast(`"${prob.title}" marked as resolved!`);
        loadProblems();
      } else {
        showToast(`Failed to update problem: ${response.error}`);
      }
    } catch (err) {
      console.error('Error resolving problem:', err);
      showToast(`Error: ${err.message}`);
    }
  };

  const handleCompleteIt = (prob) => {
    navigate('/add', { state: { editProblem: prob } });
  };

  const displayedQueue = activeTab === 'revisit' ? revisitQueue : incompleteQueue;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0d0d0d] text-[#f0f0f0] font-sans selection:bg-[#da7756]/20 selection:text-white pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border bg-easy/10 border-easy/30 text-easy shadow-lg shadow-easy/10 transition-all duration-300 font-medium">
          <CheckCircle2 size={18} className="text-[#4caf7d]" />
          <span className="text-[13px] text-[#4caf7d]">{toast}</span>
        </div>
      )}

      {/* Auto-dismissing Revisit Notification Toast (Top Right) */}
      {showBanner && revisitQueue.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-l-4 border-l-[#da7756] border-[#2a2a2a] bg-[#1a1a1a] text-white shadow-xl shadow-black/60 select-none transition-all duration-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#da7756]" />
            <span className="text-[13px] font-medium font-sans">
              You have {revisitQueue.length} problem{revisitQueue.length > 1 ? 's' : ''} marked for revisit 💪
            </span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-[#888888] hover:text-[#f0f0f0] p-1 rounded hover:bg-[#2a2a2a] transition-all cursor-pointer shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Content Dashboard */}
      <main className="flex-1 p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center w-full pb-4 border-b border-[#2a2a2a] shrink-0 select-none">
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold text-[#f0f0f0] tracking-tight">QUEUE</h1>
            <span className="bg-[#da7756] text-[#0d0d0d] px-2 py-0.5 rounded-full font-mono text-[12px] font-bold animate-pulse">
              {displayedQueue.length}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="text-[#888888] hover:text-[#da7756] transition-colors"
              title="Dashboard"
            >
              <Terminal size={20} />
            </button>
          </div>
        </header>

        {/* Tab Switcher with Sleek Premium Underscores */}
        <div className="flex border-b border-[#2a2a2a] w-full select-none gap-2 relative">
          <button
            onClick={() => setActiveTab('revisit')}
            className={`pb-3 px-4 font-mono text-[13px] font-bold relative transition-all duration-300 cursor-pointer tracking-wider ${
              activeTab === 'revisit' 
                ? 'text-[#da7756]' 
                : 'text-[#888888] hover:text-[#f0f0f0]'
            }`}
          >
            REVISIT_DECK ({revisitQueue.length})
            {activeTab === 'revisit' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#da7756] animate-in slide-in-from-left duration-200" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('incomplete')}
            className={`pb-3 px-4 font-mono text-[13px] font-bold relative transition-all duration-300 cursor-pointer tracking-wider ${
              activeTab === 'incomplete' 
                ? 'text-[#da7756]' 
                : 'text-[#888888] hover:text-[#f0f0f0]'
            }`}
          >
            INCOMPLETE_JOBS ({incompleteQueue.length})
            {activeTab === 'incomplete' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#da7756] animate-in slide-in-from-right duration-200" />
            )}
          </button>
        </div>

        {/* Problem Cards List */}
        <div ref={listRef} className="flex flex-col gap-4">
          {displayedQueue.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center select-none animate-in fade-in duration-300">
              <CheckCircle2 size={40} className="text-[#4caf7d] mb-3 animate-pulse" />
              <span className="text-[14px] font-mono text-[#888888] mb-1">Queue is empty!</span>
              <span className="text-[12px] text-[#444444]">Nice work. Your DSA recall retention is clean.</span>
            </div>
          ) : (
            displayedQueue.map((prob, idx) => (
              <article 
                key={prob.id || idx}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#da7756] transition-colors group flex flex-col gap-6 animate-in fade-in slide-in-from-bottom duration-200"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2a2a2a]/60">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-mono text-[13px] text-[#888888]">
                        #{prob.problemId || String(idx + 1).padStart(3, '0')}
                      </span>
                      
                      {/* Half-orange square icon on incomplete tab cards */}
                      {activeTab === 'incomplete' && (
                        <div 
                          className="w-3.5 h-3.5 rounded bg-gradient-to-tr from-[#ff6b35] from-50% to-[#2a2a2a] to-50% border border-[#ff6b35]/40 shadow-[0_0_8px_rgba(255,107,53,0.3)] shrink-0" 
                          title="Partial Attempt"
                        />
                      )}

                      <h3 className="text-[18px] font-bold text-[#f0f0f0] group-hover:text-[#da7756] transition-colors">
                        {prob.title}
                      </h3>
                      <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border uppercase shrink-0 ${
                        prob.difficulty === 'easy' 
                          ? 'bg-[#1a3a2a]/40 text-[#4caf7d] border-[#4caf7d]/30' 
                          : prob.difficulty === 'medium'
                            ? 'bg-[#3a2a0a]/40 text-[#f0a030] border-[#f0a030]/30'
                            : 'bg-[#3a1a1a]/40 text-[#e05555] border-[#e05555]/30'
                      }`}>
                        {prob.difficulty}
                      </span>
                      <Bookmark size={16} className="text-[#da7756] fill-[#da7756] shrink-0" />
                    </div>

                    {/* Category & Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {prob.tags ? (
                        prob.tags.map(t => (
                          <span key={t} className="bg-[#131313] text-[#888888] px-2 py-0.5 rounded font-mono text-[11px] border border-[#2a2a2a]">
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="bg-[#131313] text-[#888888] px-2 py-0.5 rounded font-mono text-[11px] border border-[#2a2a2a]">
                          {prob.category}
                        </span>
                      )}
                    </div>

                    {/* Meta Information Row */}
                    <div className="flex flex-wrap items-center gap-6 text-[12px] font-mono text-[#888888]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>Solved: {prob.solvedDate || 'May 17, 2026'}</span>
                      </div>
                      {prob.timeSpent !== undefined && prob.timeSpent !== null && (
                        <div className="text-[#ff6b35] font-bold">
                          Time Spent: {prob.timeSpent} mins
                        </div>
                      )}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={star <= (prob.confidence || 3) ? 'text-[#da7756] fill-[#da7756]' : 'text-[#444444]'} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Tab Quick Action Buttons */}
                  <div className="shrink-0 select-none">
                    {activeTab === 'revisit' ? (
                      <button 
                        onClick={() => handleResolveDirectly(prob)}
                        className="bg-[#da7756] hover:bg-[#ffb59d] text-[#0d0d0d] font-bold text-[13px] px-5 py-2.5 rounded-xl border border-[#da7756] hover:shadow-[0_0_12px_rgba(218,119,86,0.5)] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                      >
                        Re-solved ✓
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleCompleteIt(prob)}
                        className="bg-[#da7756] hover:bg-[#ffb59d] text-[#0d0d0d] font-bold text-[13px] px-5 py-2.5 rounded-xl border border-[#da7756] hover:shadow-[0_0_12px_rgba(218,119,86,0.5)] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] flex items-center gap-1.5"
                      >
                        Complete it ✓
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Content Row: Split view of Notes & Code */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Algorithmic Notes */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block">
                      Algorithmic Notes & Intuitions
                    </span>
                    <div className="flex-1 p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl overflow-y-auto min-h-[200px] max-h-[240px]">
                      <MarkdownRenderer content={prob.notes || '*No details provided.*'} />
                    </div>
                  </div>

                  {/* Solution Code */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block">
                      Logged Solution Code ({prob.language || 'Code'})
                    </span>
                    <div className="border border-[#2a2a2a] rounded-xl overflow-hidden py-2 bg-[#0d0d0d] min-h-[200px]">
                      <Editor
                        height="220px"
                        theme="vs-dark"
                        language={prob.language || 'python'}
                        value={prob.code || '# No code logged.'}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          scrollbar: { vertical: 'auto', horizontal: 'auto' },
                          fontSize: 12,
                          lineNumbers: 'on',
                          automaticLayout: true,
                          fontFamily: 'JetBrains Mono, Courier New, monospace',
                          domReadOnly: true
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Footer Metadata */}
        <footer className="mt-8 pt-4 border-t border-[#2a2a2a] flex justify-between items-center text-[12px] font-mono text-[#888888] select-none">
          <div className="flex items-center gap-3">
            <span>QUEUE_SUCCESS_RATE: 100%</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4caf7d]" />
            <span>SYSTEM_UPTIME: 99.9%</span>
          </div>
          <div className="uppercase tracking-widest text-[11px]">
            Term_Build_v2.0.4
          </div>
        </footer>
      </main>
    </div>
  );
}
