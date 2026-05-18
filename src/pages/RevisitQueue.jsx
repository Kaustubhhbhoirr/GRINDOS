import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Calendar, 
  ExternalLink, 
  X, 
  Heart, 
  Sparkles, 
  AlertTriangle, 
  Bookmark, 
  Play, 
  CheckCircle2, 
  Terminal, 
  Bell, 
  Star,
  FileCode
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function RevisitQueue() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [revisitQueue, setRevisitQueue] = useState([]);
  const [showBanner, setShowBanner] = useState(true);

  // Session player states
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealSolution, setRevealSolution] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = () => {
    if (window.api) {
      window.api.getProblems().then(data => {
        const list = data || [];
        setProblems(list);
        // Revisit queue consists of problems with revisit = true
        const queue = list.filter(p => p.revisit);
        setRevisitQueue(queue);
      });
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  // Start study session
  const startSession = (specificProblem = null) => {
    if (specificProblem) {
      setSessionQueue([specificProblem]);
    } else {
      if (revisitQueue.length === 0) return;
      setSessionQueue([...revisitQueue]);
    }
    setCurrentIndex(0);
    setRevealSolution(false);
    setSessionActive(true);
  };

  // Revisit days map
  const getRevisitDays = (rating) => {
    if (rating === 1) return 1;
    if (rating === 2) return 3;
    if (rating === 3) return 7;
    if (rating === 4) return 14;
    return 30;
  };

  // Submit self-evaluation and reschedule
  const handleEvaluate = async (rating) => {
    const currentProblem = sessionQueue[currentIndex];
    if (!currentProblem || !window.api) return;

    try {
      // Calculate new revisit date
      const newNextReviewDate = new Date();
      newNextReviewDate.setDate(newNextReviewDate.getDate() + getRevisitDays(rating));
      const formattedNextReviewDate = newNextReviewDate.toISOString().split('T')[0];

      // Update problem details: if rated high (4 or 5), we can optional clear revisit check or keep it
      // Standard: keep in revisit queue but reschedule. If rating is 5 (Perfect), clear revisit!
      const updatedProblem = {
        ...currentProblem,
        confidence: rating,
        nextReviewDate: formattedNextReviewDate,
        revisit: rating < 5 // If they mastered it perfectly, clear from the review list!
      };

      // Save to database
      const existingProblems = await window.api.getProblems();
      const updatedList = existingProblems.map(p => p.id === currentProblem.id ? updatedProblem : p);
      
      const response = await window.api.saveProblems(updatedList);
      
      if (response.success) {
        showToast(`"${currentProblem.title}" updated! Next review: ${getRevisitDays(rating)} days.`);
        
        // Progress to next item or complete session
        if (currentIndex < sessionQueue.length - 1) {
          setRevealSolution(false);
          setCurrentIndex(prev => prev + 1);
        } else {
          // Finished everything in the session!
          setSessionActive(false);
          loadProblems();
        }
      }
    } catch (err) {
      console.error('Error during review evaluation:', err);
    }
  };

  const handleOpenLink = (url) => {
    if (url && window.api?.openExternal) {
      window.api.openExternal(url);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0d0d0d] text-[#f0f0f0] font-sans selection:bg-[#da7756]/20 selection:text-white pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border bg-easy/10 border-easy/30 text-easy shadow-lg shadow-easy/10 transition-all duration-300 font-medium">
          <Sparkles size={18} />
          <span className="text-[13px]">{toast}</span>
        </div>
      )}

      {/* Main Content Dashboard */}
      {!sessionActive ? (
        <main className="flex-1 p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">
          {/* Header Section */}
          <header className="flex justify-between items-center w-full pb-4 border-b border-[#2a2a2a] shrink-0 select-none">
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-bold text-[#f0f0f0] tracking-tight">REVISIT_QUEUE</h1>
              <span className="bg-[#da7756] text-[#0d0d0d] px-2 py-0.5 rounded-full font-mono text-[12px] font-bold">
                {revisitQueue.length}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/panel')}
                className="text-[#888888] hover:text-[#da7756] transition-colors"
                title="Terminal Companion"
              >
                <Terminal size={20} />
              </button>
            </div>
          </header>

          {/* CTA Banner */}
          {showBanner && revisitQueue.length > 0 && (
            <section className="animate-in fade-in slide-in-from-top duration-300 select-none">
              <div className="bg-[#da7756] flex flex-col sm:flex-row items-center justify-between px-6 py-3 rounded-xl border border-[#2a2a2a] gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className="text-[#0d0d0d]" />
                  <p className="text-[#0d0d0d] font-semibold text-[14px]">
                    You flagged {revisitQueue.length} problems as tough — ready to revisit?
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => startSession()}
                    className="bg-[#0d0d0d] text-[#da7756] px-4 py-1.5 rounded-lg font-bold hover:bg-[#1a1a1a] transition-colors flex items-center gap-1 text-[13px] cursor-pointer"
                  >
                    Let's go <span className="text-[14px]">💪</span>
                  </button>
                  <button 
                    onClick={() => setShowBanner(false)}
                    className="text-[#0d0d0d] hover:opacity-60 transition-opacity"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Problem Cards List */}
          <div className="flex flex-col gap-4">
            {revisitQueue.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center select-none">
                <CheckCircle2 size={40} className="text-[#4caf7d] mb-3 animate-pulse" />
                <span className="text-[14px] font-mono text-[#888888] mb-1">Queue is empty!</span>
                <span className="text-[12px] text-[#444444]">Nice work. Your DSA recall retention is clean.</span>
              </div>
            ) : (
              revisitQueue.map((prob, idx) => (
                <article 
                  key={prob.id || idx}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#da7756] transition-colors group flex flex-col md:flex-row md:items-start gap-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-mono text-[13px] text-[#888888]">
                        #{String(idx + 1).padStart(3, '0')}
                      </span>
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

                    {/* Category Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
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

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-6 text-[12px] font-mono text-[#888888] mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>Solved: {prob.solvedDate || 'May 17, 2026'}</span>
                      </div>
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

                    {/* Note Box */}
                    {prob.notes && (
                      <div className="bg-[#0d0d0d] border-l-2 border-[#da7756] p-3 rounded-r-lg max-h-[80px] overflow-hidden">
                        <p className="text-[#888888] font-mono text-[12px] leading-relaxed truncate">
                          <span className="text-[#da7756] opacity-80 font-bold">NOTE:</span> "{prob.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row md:flex-col gap-3 md:items-end justify-between md:justify-start shrink-0 select-none">
                    <button 
                      onClick={() => startSession(prob)}
                      className="bg-[#da7756] text-[#0d0d0d] font-bold text-[13px] px-4 py-2 rounded-xl border border-[#da7756] hover:shadow-[0_0_8px_rgba(218,119,86,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                    >
                      Re-solve ✓
                    </button>
                    <button 
                      onClick={() => navigate('/search', { state: { openProblemId: prob.id } })}
                      className="border border-[#2a2a2a] text-[#888888] hover:border-[#da7756] hover:text-[#f0f0f0] px-4 py-2 rounded-xl transition-all font-mono text-[11px] uppercase tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      <FileCode size={13} /> View Source
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Footer Metadata */}
          <footer className="mt-8 pt-4 border-t border-[#2a2a2a] flex justify-between items-center text-[12px] font-mono text-[#888888] select-none">
            <div className="flex items-center gap-3">
              <span>REVISIT_SUCCESS_RATE: 87%</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4caf7d]" />
              <span>SYSTEM_UPTIME: 99.9%</span>
            </div>
            <div className="uppercase tracking-widest text-[11px]">
              Term_Build_v2.0.4
            </div>
          </footer>
        </main>
      ) : (
        /* INTERACTIVE REVIEW SESSION FLASHCARD PLAYER */
        <div className="absolute inset-0 bg-[#0d0d0d]/95 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#1a1a1a] border border-[#2a2a2a] shadow-2xl rounded-2xl flex flex-col hover:border-[#da7756]/30 transition-all overflow-hidden h-[90vh]">
            
            {/* Player Header */}
            <div className="p-4 border-b border-[#2a2a2a] bg-[#131313] flex justify-between items-center select-none shrink-0">
              <div className="flex items-center gap-3">
                <span className="bg-[#da7756]/15 text-[#da7756] border border-[#da7756]/20 font-mono font-bold text-[11px] px-3 py-0.5 rounded-full">
                  Flashcard {currentIndex + 1} of {sessionQueue.length}
                </span>
                <h2 className="text-[13px] font-bold font-sans text-[#888888]">DSA Study Practice Deck</h2>
              </div>
              <button
                onClick={() => setSessionActive(false)}
                className="text-[#888888] hover:text-[#f0f0f0] hover:bg-[#222222] p-1 rounded-lg transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Card Workspace */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Problem Metadata Card */}
              <div className="p-5 bg-[#131313] border border-[#2a2a2a] rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-[20px] font-bold font-sans text-[#f0f0f0] tracking-tight leading-snug select-text">
                      {sessionQueue[currentIndex].title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sessionQueue[currentIndex].tags ? (
                        sessionQueue[currentIndex].tags.map(t => (
                          <span key={t} className="inline-block text-[10px] font-mono bg-[#0d0d0d] border border-[#2a2a2a] px-2 py-0.5 rounded text-[#888888] select-none">
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="inline-block text-[10px] font-mono bg-[#0d0d0d] border border-[#2a2a2a] px-2 py-0.5 rounded text-[#888888] select-none">
                          {sessionQueue[currentIndex].category}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {sessionQueue[currentIndex].url && (
                    <button
                      onClick={() => handleOpenLink(sessionQueue[currentIndex].url)}
                      className="flex items-center gap-1 text-[#da7756] hover:text-[#ffb59d] font-mono font-bold text-[11px] shrink-0 cursor-pointer select-none"
                    >
                      Open LeetCode
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>

                <div className="flex gap-4 text-[11px] font-mono text-[#888888] border-t border-[#2a2a2a]/60 pt-3 select-none">
                  <div>Difficulty: <span className={`capitalize font-bold ${
                    sessionQueue[currentIndex].difficulty === 'easy' ? 'text-[#4caf7d]'
                      : sessionQueue[currentIndex].difficulty === 'medium' ? 'text-[#f0a030]'
                      : 'text-[#e05555]'
                  }`}>{sessionQueue[currentIndex].difficulty}</span></div>
                  <div className="border-l border-[#2a2a2a] pl-4">Language: <span className="uppercase font-bold">{sessionQueue[currentIndex].language}</span></div>
                </div>
              </div>

              {/* Solution reveal layout */}
              {!revealSolution ? (
                /* Stage 1: Reveal CTA */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center select-none py-12">
                  <div className="w-16 h-16 rounded-full bg-[#da7756]/10 border border-[#da7756]/20 flex items-center justify-center text-[#da7756] mb-2 shadow-[0_0_15px_rgba(218,119,86,0.1)]">
                    <FileCode size={30} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[16px] font-bold font-sans text-[#f0f0f0]">Analyze and Re-solve!</h3>
                  <p className="text-[12px] text-[#888888] max-w-md leading-relaxed px-4">
                    Open Leetcode and practice your implementation. Keep logic optimized, check bounds and complexity. Ready to verify? Reveal solution node below.
                  </p>
                  
                  <button
                    onClick={() => setRevealSolution(true)}
                    className="flex items-center gap-2 mt-4 px-6 py-2.5 bg-[#da7756] hover:bg-[#ffb59d] text-[#0d0d0d] font-mono font-bold text-[12px] rounded-xl transition-all shadow-lg shadow-[#da7756]/20 cursor-pointer animate-bounce"
                  >
                    Reveal Solution Logs
                  </button>
                </div>
              ) : (
                /* Stage 2: Revealed details */
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Previous Code Snippet */}
                  {sessionQueue[currentIndex].code && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-[#888888] uppercase block select-none">Logged Solution Code</span>
                      <div className="border border-[#2a2a2a] rounded-xl overflow-hidden py-2 bg-[#0d0d0d] select-none">
                        <Editor
                          height="220px"
                          theme="vs-dark"
                          language={sessionQueue[currentIndex].language}
                          value={sessionQueue[currentIndex].code}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                            fontSize: 12,
                            lineNumbers: 'on',
                            automaticLayout: true,
                            fontFamily: 'JetBrains Mono, Courier New, monospace',
                            domReadOnly: true
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes Markdown Display */}
                  <div className="space-y-1.5 border-t border-[#2a2a2a] pt-4">
                    <span className="text-[11px] font-mono text-[#888888] uppercase block mb-2 select-none">
                      Algorithmic Notes & Intuitions
                    </span>
                    <div className="p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl overflow-y-auto max-h-[220px]">
                      <MarkdownRenderer content={sessionQueue[currentIndex].notes} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Evaluate Rescheduler Panel */}
            {revealSolution && (
              <div className="p-5 border-t border-[#2a2a2a] bg-[#131313] flex flex-col items-center gap-3 shrink-0 select-none animate-in slide-in-from-bottom duration-300">
                <span className="text-[13px] font-mono text-[#f0f0f0] font-semibold">
                  Select your current DSA recall confidence
                </span>

                <div className="flex flex-wrap gap-2.5 justify-center mt-1">
                  {[
                    { rating: 1, label: 'Struggled', sub: 'Retest 1d' },
                    { rating: 2, label: 'Difficult', sub: 'Retest 3d' },
                    { rating: 3, label: 'Decent', sub: 'Retest 7d' },
                    { rating: 4, label: 'Strong', sub: 'Retest 14d' },
                    { rating: 5, label: 'Perfect', sub: 'Retest 30d' }
                  ].map(btn => (
                    <button
                      key={btn.rating}
                      onClick={() => handleEvaluate(btn.rating)}
                      className="p-2 border border-[#2a2a2a] bg-[#0d0d0d] hover:bg-[#da7756]/10 hover:border-[#da7756]/40 rounded-xl transition-all flex flex-col items-center justify-between w-24 gap-1.5 cursor-pointer text-center group"
                    >
                      <Heart 
                        size={18} 
                        className="text-[#888888] group-hover:text-[#da7756] group-hover:fill-[#da7756] transition-all duration-300" 
                      />
                      <span className="text-[11px] font-sans text-[#f0f0f0] font-bold">{btn.label}</span>
                      <span className="text-[9px] font-mono text-[#888888] block shrink-0">{btn.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
