import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Search as SearchIcon, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Calendar, 
  Code2, 
  Tag, 
  BookOpen, 
  Clock, 
  ChevronRight,
  Star,
  Zap,
  Bookmark
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const categories = [
  'All',
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  'Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation',
  'Design'
];

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [problems, setProblems] = useState([]);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | solved | revisit
  const [ratingFilter, setRatingFilter] = useState('any'); // any | 5 | 4 | 3
  const [categoryFilter, setCategoryFilter] = useState('All');

  // UI Drawer & Modal states
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = () => {
    if (window.api) {
      window.api.getProblems().then(data => {
        const list = data || [];
        setProblems(list);
        
        // Handle nav deep link state to open drawer automatically
        if (location.state?.openProblemId) {
          const matched = list.find(p => p.id === location.state.openProblemId);
          if (matched) setSelectedProblem(matched);
        }
      });
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const handleOpenLink = (url, e) => {
    e.stopPropagation();
    if (url && window.api?.openExternal) {
      window.api.openExternal(url);
    }
  };

  const handleEdit = (problem, e) => {
    e.stopPropagation();
    navigate('/add', { state: { editProblem: problem } });
  };

  const handleDeleteConfirm = async () => {
    if (!problemToDelete || !window.api) return;

    try {
      const updatedList = problems.filter(p => p.id !== problemToDelete.id);
      const response = await window.api.saveProblems(updatedList);
      
      if (response.success) {
        showToast(`Deleted "${problemToDelete.title}" successfully.`, 'success');
        setProblemToDelete(null);
        if (selectedProblem && selectedProblem.id === problemToDelete.id) {
          setSelectedProblem(null);
        }
        loadProblems();
      } else {
        showToast('Failed to delete: ' + response.error, 'error');
      }
    } catch (err) {
      showToast('Error deleting: ' + err.message, 'error');
    }
  };

  // Filters logic
  const filteredProblems = problems.filter(problem => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      problem.title.toLowerCase().includes(query) ||
      (problem.intuition && problem.intuition.toLowerCase().includes(query)) ||
      (problem.notes && problem.notes.toLowerCase().includes(query)) ||
      (problem.code && problem.code.toLowerCase().includes(query)) ||
      problem.category.toLowerCase().includes(query) ||
      problem.language.toLowerCase().includes(query);

    const matchesDiff = diffFilter === 'all' || problem.difficulty === diffFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'revisit') matchesStatus = problem.revisit;
    else if (statusFilter === 'solved') matchesStatus = !problem.revisit;

    let matchesRating = true;
    if (ratingFilter !== 'any') {
      matchesRating = problem.confidence === Number(ratingFilter);
    }

    const matchesCat = categoryFilter === 'All' || problem.category === categoryFilter;

    return matchesSearch && matchesDiff && matchesStatus && matchesRating && matchesCat;
  });

  return (
    <div className="flex-1 flex h-screen bg-[#0d0d0d] text-[#f0f0f0] font-sans selection:bg-[#da7756]/20 selection:text-white relative overflow-hidden">
      {/* Toast Notification */}
      {toast.message && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border bg-easy/10 border-easy/30 text-easy shadow-lg shadow-easy/10 transition-all duration-300 font-medium">
          <Zap size={18} />
          <span className="text-[13px]">{toast.message}</span>
        </div>
      )}

      {/* Main Catalog View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Search bar input matches Stitch spec */}
        <header className="w-full px-6 pt-6 pb-4 shrink-0 select-none">
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#888888]">
              <SearchIcon size={18} />
            </div>
            <input 
              type="text"
              placeholder="search problems by name, notes logic, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131313] border border-[#2a2a2a] text-[#f0f0f0] font-sans py-3 pl-12 pr-24 rounded-xl focus:border-[#da7756] outline-none transition-colors text-[14px]"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none select-none">
              <span className="font-mono text-[11px] text-[#444444] bg-[#0d0d0d] px-2 py-0.5 border border-[#2a2a2a] rounded-lg">Ctrl+K</span>
            </div>
          </div>
        </header>

        {/* Filter Pills row */}
        <section className="px-6 pb-5 border-b border-[#2a2a2a] shrink-0 select-none">
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            
            <div className="flex flex-wrap gap-x-8 gap-y-3 items-center">
              {/* Difficulty pill group */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#888888] tracking-wider uppercase">DIFFICULTY:</span>
                <div className="flex gap-1.5">
                  {['all', 'easy', 'medium', 'hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDiffFilter(d)}
                      className={`px-3 py-0.5 font-mono text-[11px] rounded-full border capitalize cursor-pointer transition-colors ${
                        diffFilter === d 
                          ? 'border-[#da7756] text-[#da7756] bg-[#da7756]/5' 
                          : 'border-[#2a2a2a] text-[#888888] hover:border-[#888888]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status pill group */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#888888] tracking-wider uppercase">STATUS:</span>
                <div className="flex gap-1.5">
                  {[
                    { val: 'all', label: 'All' },
                    { val: 'solved', label: 'Solved' },
                    { val: 'revisit', label: 'Revisit' }
                  ].map(s => (
                    <button
                      key={s.val}
                      onClick={() => setStatusFilter(s.val)}
                      className={`px-3 py-0.5 font-mono text-[11px] rounded-full border cursor-pointer transition-colors ${
                        statusFilter === s.val 
                          ? 'border-[#da7756] text-[#da7756] bg-[#da7756]/5' 
                          : 'border-[#2a2a2a] text-[#888888] hover:border-[#888888]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating filter */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#888888] tracking-wider uppercase">RATING:</span>
                <div className="flex gap-1.5">
                  {[
                    { val: 'any', label: 'Any' },
                    { val: '5', label: '5-star' },
                    { val: '4', label: '4-star' },
                    { val: '3', label: '3-star' }
                  ].map(r => (
                    <button
                      key={r.val}
                      onClick={() => setRatingFilter(r.val)}
                      className={`px-3 py-0.5 font-mono text-[11px] rounded-full border cursor-pointer transition-colors ${
                        ratingFilter === r.val 
                          ? 'border-[#da7756] text-[#da7756] bg-[#da7756]/5' 
                          : 'border-[#2a2a2a] text-[#888888] hover:border-[#888888]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#888888] tracking-wider uppercase">CATEGORY:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#131313] border border-[#2a2a2a] text-[#888888] hover:text-[#f0f0f0] rounded-lg text-[12px] font-mono px-3 py-1 outline-none cursor-pointer focus:border-[#da7756]"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>
        </section>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-3">
            {filteredProblems.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-12 text-center flex flex-col items-center justify-center select-none">
                <AlertTriangle size={36} className="text-[#888888] mb-3 animate-pulse" />
                <span className="text-[13px] font-mono text-[#888888] mb-1">No solved problems match current query.</span>
                <span className="text-[11px] text-[#444444]">Modify filter variables or seed datasets.</span>
              </div>
            ) : (
              filteredProblems.map((prob, idx) => (
                <div 
                  key={prob.id || idx}
                  onClick={() => setSelectedProblem(prob)}
                  className={`group flex items-center justify-between bg-[#1a1a1a] border rounded-xl p-5 hover:border-[#da7756] transition-all cursor-pointer select-none ${
                    selectedProblem?.id === prob.id ? 'border-[#da7756] bg-[#da7756]/5' : 'border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex flex-col gap-1.5 min-w-0 pr-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-[12px] text-[#888888]">
                        #{String(idx + 1).padStart(3, '0')}
                      </span>
                      <h3 className="font-sans font-bold text-[16px] text-[#f0f0f0] group-hover:text-[#da7756] transition-colors truncate">
                        {prob.title}
                      </h3>
                      <span className={`px-2 py-0.5 border font-mono text-[10px] rounded-sm uppercase shrink-0 ${
                        prob.difficulty === 'easy' 
                          ? 'bg-[#1a3a2a]/40 text-[#4caf7d] border-[#4caf7d]/30' 
                          : prob.difficulty === 'medium'
                            ? 'bg-[#3a2a0a]/40 text-[#f0a030] border-[#f0a030]/30'
                            : 'bg-[#3a1a1a]/40 text-[#e05555] border-[#e05555]/30'
                      }`}>
                        {prob.difficulty}
                      </span>
                      {prob.revisit && (
                        <Bookmark size={13} className="text-[#da7756] fill-[#da7756]" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-[#888888]">
                      <div className="flex gap-1.5 select-none">
                        <span className="bg-[#131313] px-2 py-0.5 rounded text-[10px] font-mono text-[#888888] border border-[#2a2a2a]">
                          {prob.category}
                        </span>
                        <span className="bg-[#131313] px-2 py-0.5 rounded text-[10px] font-mono text-[#888888] border border-[#2a2a2a] uppercase">
                          {prob.language}
                        </span>
                      </div>
                      <div className="h-1 w-1 rounded-full bg-[#444444]" />
                      <span className="font-mono text-[11px] text-[#888888]">Solved: {prob.solvedDate}</span>
                      <div className="h-1 w-1 rounded-full bg-[#444444]" />
                      <div className="flex text-[#da7756]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={12} 
                            className={star <= (prob.confidence || 3) ? 'text-[#da7756] fill-[#da7756]' : 'text-[#444444]'} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right font-mono">
                      <span className="block text-[15px] font-bold text-[#f0f0f0]">
                        {prob.confidence || 3} <span className="text-[10px] font-medium text-[#888888] uppercase">CONF</span>
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-[#888888] group-hover:text-[#da7756] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#0e0e0e] border-t border-[#2a2a2a] px-6 py-2.5 flex justify-between items-center w-full select-none shrink-0 text-[11px] font-mono text-[#888888]">
          <div className="flex items-center gap-4">
            <span>GrindOS © 2026</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4caf7d] animate-pulse"></span>
              <span>v2.0.4-stable</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span>DATABASE_OFFLINE</span>
            <span className="text-[#da7756] font-bold">SYSTEM ACTIVE</span>
          </div>
        </footer>

      </div>

      {/* DETAILED DRAWERS LOGS SLIDE-IN VIEW */}
      {selectedProblem && (
        <div className="w-[440px] shrink-0 h-full border-l border-[#2a2a2a] bg-[#131313] flex flex-col hover:border-[#da7756]/20 transition-all select-text overflow-hidden z-20 shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-[#2a2a2a] bg-[#1c1c1c] flex justify-between items-center shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm ${
                selectedProblem.difficulty === 'easy' ? 'bg-[#1a3a2a]/40 text-[#4caf7d] border border-[#4caf7d]/30'
                  : selectedProblem.difficulty === 'medium' ? 'bg-[#3a2a0a]/40 text-[#f0a030] border border-[#f0a030]/30'
                  : 'bg-[#3a1a1a]/40 text-[#e05555] border border-[#e05555]/30'
              }`}>
                {selectedProblem.difficulty}
              </span>
              <span className="text-[11px] font-mono text-[#888888]">Solved: {selectedProblem.solvedDate}</span>
            </div>
            
            <button
              onClick={() => setSelectedProblem(null)}
              className="text-[#888888] hover:text-[#f0f0f0] p-1 hover:bg-[#2a2a2a] rounded transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Title */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[18px] font-bold font-sans text-[#f0f0f0] tracking-tight leading-snug">
                  {selectedProblem.title}
                </h2>
                {selectedProblem.url && (
                  <button
                    onClick={(e) => handleOpenLink(selectedProblem.url, e)}
                    className="flex items-center gap-1 text-[#da7756] hover:text-[#ffb59d] font-mono text-[11px] shrink-0 cursor-pointer select-none"
                  >
                    LeetCode
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2 select-none">
                <span className="flex items-center gap-1 text-[10px] font-mono border border-[#2a2a2a] px-2 py-0.5 bg-[#0d0d0d] rounded text-[#888888]">
                  <Tag size={10} className="text-[#da7756]" />
                  {selectedProblem.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono border border-[#2a2a2a] px-2 py-0.5 bg-[#0d0d0d] rounded text-[#888888] uppercase">
                  <Code2 size={10} className="text-[#da7756]" />
                  {selectedProblem.language}
                </span>
              </div>
            </div>

            {/* Complexity Badges */}
            <div className="grid grid-cols-2 gap-3 bg-[#1a1a1a] border border-[#2a2a2a] p-3.5 rounded-xl select-none">
              <div className="text-center font-mono">
                <span className="text-[10px] text-[#888888] block uppercase">Time Complexity</span>
                <span className="text-[13px] text-[#da7756] font-bold mt-0.5 block">{selectedProblem.timeComplexity || 'O(N)'}</span>
              </div>
              <div className="text-center font-mono border-l border-[#2a2a2a]">
                <span className="text-[10px] text-[#888888] block uppercase">Space Complexity</span>
                <span className="text-[13px] text-[#da7756] font-bold mt-0.5 block">{selectedProblem.spaceComplexity || 'O(1)'}</span>
              </div>
            </div>

            {/* Intuition quote block */}
            {selectedProblem.intuition && (
              <div className="p-4 bg-[#da7756]/5 border border-[#da7756]/20 rounded-xl">
                <span className="text-[11px] font-mono text-[#da7756] font-bold uppercase block mb-1 select-none">Key Intuition</span>
                <p className="text-[12px] font-mono text-[#888888] italic leading-relaxed">
                  "{selectedProblem.intuition}"
                </p>
              </div>
            )}

            {/* Monaco Solution Code Snippet */}
            {selectedProblem.code && (
              <div className="space-y-1.5 select-none">
                <span className="text-[11px] font-mono text-[#888888] uppercase block">Solution Code Snippet</span>
                <div className="border border-[#2a2a2a] rounded-xl overflow-hidden py-2 bg-[#0d0d0d]">
                  <Editor
                    height="200px"
                    theme="vs-dark"
                    language={selectedProblem.language}
                    value={selectedProblem.code}
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

            {/* Detailed Algorithmic notes */}
            <div className="space-y-1.5 border-t border-[#2a2a2a] pt-4">
              <span className="text-[11px] font-mono text-[#888888] uppercase flex items-center gap-1 mb-2 select-none">
                <BookOpen size={12} className="text-[#da7756]" />
                Detailed Log Notes
              </span>
              <div className="p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl overflow-y-auto max-h-[220px]">
                <MarkdownRenderer content={selectedProblem.notes} />
              </div>
            </div>

          </div>

          {/* Drawer footer controls */}
          <div className="p-4 border-t border-[#2a2a2a] bg-[#1c1c1c] flex gap-3 shrink-0 select-none">
            <button
              onClick={(e) => handleEdit(selectedProblem, e)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#da7756] hover:bg-[#ffb59d] text-[#0d0d0d] font-mono font-bold text-[12px] rounded-xl transition-all cursor-pointer active:scale-[0.98]"
            >
              <Edit2 size={13} /> Edit Log
            </button>
            <button
              onClick={() => setProblemToDelete(selectedProblem)}
              className="p-2 border border-[#2a2a2a] bg-[#0d0d0d] hover:bg-[#e05555]/10 hover:border-[#e05555]/30 text-[#e05555] rounded-xl transition-colors cursor-pointer"
              title="Delete Solved Log"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex items-center gap-1 px-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl font-mono text-[10px] text-[#888888]">
              <Clock size={12} className="text-[#da7756]" />
              <span>Next: {selectedProblem.nextReviewDate}</span>
            </div>
          </div>

        </div>
      )}

      {/* Delete Confirmation Modal */}
      {problemToDelete && (
        <div className="fixed inset-0 bg-[#0d0d0d]/80 backdrop-blur-sm z-50 flex items-center justify-center select-none animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-[360px] shadow-2xl relative animate-in scale-in duration-200">
            <div className="text-[#e05555] mb-4 flex justify-center">
              <div className="w-12 h-12 rounded-full bg-[#e05555]/10 border border-[#e05555]/20 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
            </div>
            
            <h3 className="text-[16px] font-bold text-center text-[#f0f0f0]">Wipe Problem Log?</h3>
            <p className="text-[12px] text-[#888888] text-center mt-2 leading-relaxed">
              Are you sure you want to permanently delete your logs for <strong className="text-[#f0f0f0]">"{problemToDelete.title}"</strong>? This action is irreversible.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-[#e05555] hover:bg-[#ff8888] text-[#0d0d0d] font-mono font-bold text-[12px] rounded-lg transition-colors cursor-pointer text-center"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setProblemToDelete(null)}
                className="flex-1 py-2 bg-[#0d0d0d] border border-[#2a2a2a] text-[#888888] font-mono text-[12px] rounded-lg hover:text-[#f0f0f0] transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
