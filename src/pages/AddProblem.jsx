import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Plus, 
  Copy, 
  Image as ImageIcon, 
  Star, 
  ArrowRight,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

const defaultTags = [
  'Arrays', 'Two Pointers', 'Sliding Window', 'Stack', 
  'Binary Search', 'Linked List', 'Trees', 'Graphs', 
  'DP', 'Greedy', 'Backtracking'
];

const languages = [
  { value: 'python', label: 'Python', ext: '.py' },
  { value: 'javascript', label: 'JavaScript', ext: '.js' },
  { value: 'typescript', label: 'TypeScript', ext: '.ts' },
  { value: 'cpp', label: 'C++', ext: '.cpp' },
  { value: 'java', label: 'Java', ext: '.java' },
  { value: 'rust', label: 'Rust', ext: '.rs' },
  { value: 'go', label: 'Go', ext: '.go' }
];

export default function AddProblem() {
  const location = useLocation();
  const navigate = useNavigate();
  const editingProblem = location.state?.editProblem || null;

  // Form States
  const [problemId, setProblemId] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedTags, setSelectedTags] = useState(['Arrays']);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState('');
  const [sourceLinks, setSourceLinks] = useState('');
  const [revisit, setRevisit] = useState(true);
  const [partial, setPartial] = useState(false);
  const [solvedDate, setSolvedDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // UI States
  const [customTags, setCustomTags] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Generate an incremental problem ID if we have problems, otherwise default to "1"
    if (window.api && !editingProblem) {
      window.api.getProblems().then(data => {
        const nextId = (data || []).length + 1;
        setProblemId(String(nextId));
      });
    }

    if (editingProblem) {
      setProblemId(editingProblem.problemId || editingProblem.id?.replace('prob-', '') || '1');
      setTitle(editingProblem.title);
      setUrl(editingProblem.url || '');
      setDifficulty(editingProblem.difficulty || 'medium');
      setSelectedTags(editingProblem.tags || [editingProblem.category] || []);
      setLanguage(editingProblem.language || 'python');
      setCode(editingProblem.code || '');
      setTimeSpent(editingProblem.timeSpent || '');
      setConfidence(editingProblem.confidence || 3);
      setNotes(editingProblem.notes || '');
      setSourceLinks(editingProblem.url || '');
      setRevisit(editingProblem.revisit !== undefined ? editingProblem.revisit : true);
      setPartial(editingProblem.partial || false);
      setSolvedDate(editingProblem.solvedDate || '');
    } else if (location.state?.prefilledDate) {
      setSolvedDate(location.state.prefilledDate);
    }
  }, [editingProblem, location.state]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const tagName = prompt('Enter custom tag name:');
    if (tagName && tagName.trim()) {
      const cleanTag = tagName.trim();
      if (!defaultTags.includes(cleanTag) && !customTags.includes(cleanTag)) {
        setCustomTags([...customTags, cleanTag]);
      }
      if (!selectedTags.includes(cleanTag)) {
        setSelectedTags([...selectedTags, cleanTag]);
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard!', 'success');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Problem title is required.');
      return;
    }
    setErrorMsg('');

    if (!window.api) return;

    try {
      const existingProblems = await window.api.getProblems();
      
      // Calculate Spaced Repetition reviews
      const getRevisitDays = (rating) => {
        if (rating === 1) return 1;   // Tomorrow
        if (rating === 2) return 3;   // In 3 Days
        if (rating === 3) return 7;   // In a Week
        if (rating === 4) return 14;  // In 2 Weeks
        return 30;                    // In a Month
      };

      const newNextReviewDate = new Date();
      newNextReviewDate.setDate(newNextReviewDate.getDate() + getRevisitDays(confidence));
      const formattedNextReviewDate = newNextReviewDate.toISOString().split('T')[0];

      const problemData = {
        title: title.trim(),
        url: url.trim(),
        problemId: problemId.trim(),
        difficulty,
        category: selectedTags[0] || 'Arrays & Hashing',
        tags: selectedTags,
        language,
        code,
        timeSpent: Number(timeSpent) || 0,
        confidence,
        notes: notes.trim(),
        revisit,
        partial,
        nextReviewDate: formattedNextReviewDate,
        solvedDate,
      };

      let updatedList;
      if (editingProblem) {
        problemData.id = editingProblem.id;
        
        updatedList = existingProblems.map(p => p.id === editingProblem.id ? problemData : p);
        const response = await window.api.saveProblems(updatedList);
        
        if (response.success) {
          showToast('Problem updated successfully!', 'success');
          setTimeout(() => navigate('/search'), 1000);
        } else {
          showToast('Failed to save: ' + response.error, 'error');
        }
      } else {
        problemData.id = 'prob-' + Date.now();
        
        updatedList = [problemData, ...existingProblems];
        const response = await window.api.saveProblems(updatedList);
        
        if (response.success) {
          showToast('Problem saved successfully!', 'success');
          // Reset form fields
          setTitle('');
          setUrl('');
          setDifficulty('medium');
          setSelectedTags(['Arrays']);
          setLanguage('python');
          setCode('');
          setTimeSpent('');
          setConfidence(3);
          setNotes('');
          setSourceLinks('');
          setRevisit(true);
          setPartial(false);
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          setSolvedDate(`${y}-${m}-${d}`);
          // Set next incremental problem ID
          setProblemId(String(updatedList.length + 1));
        } else {
          showToast('Failed to save: ' + response.error, 'error');
        }
      }
    } catch (err) {
      showToast('Error saving: ' + err.message, 'error');
    }
  };

  const getLanguageExt = () => {
    const found = languages.find(l => l.value === language);
    return found ? found.ext : '.txt';
  };

  const todayString = new Date().toLocaleDateString('default', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0d0d0d] text-[#f0f0f0] font-sans selection:bg-[#da7756]/20 selection:text-white pb-16">
      {/* Toast Notification */}
      {toast.message && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border bg-easy/10 border-easy/30 text-easy shadow-lg shadow-easy/10 transition-all duration-300 font-medium">
          <Sparkles size={18} />
          <span className="text-[13px]">{toast.message}</span>
        </div>
      )}

      {/* Header (Matches Stitch Add Problem Screen) */}
      <header className="px-6 py-4 border-b border-[#2a2a2a] bg-[#0d0d0d] sticky top-0 z-40 flex items-center justify-between select-none">
        <div className="flex items-baseline">
          <h1 className="text-[24px] font-bold text-[#f0f0f0] tracking-tight">
            {editingProblem ? 'Edit Problem' : 'Add Problem'}
          </h1>
          <span className="font-mono text-[13px] text-[#888888] ml-4 self-end mb-0.5">
            {todayString}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#888888] hover:text-[#da7756] transition-colors" title="Help Guide">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* Main Form Canvas */}
      <div className="p-6 max-w-[1200px] mx-auto w-full space-y-6 flex-1">
        {errorMsg && (
          <div className="bg-[#e05555]/10 border border-[#e05555]/30 text-[#e05555] px-4 py-2 rounded-lg flex items-center gap-2 text-[13px] font-mono select-none">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Columns: Core Info & Code Editor */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Basic Info */}
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#da7756]/30 transition-colors space-y-6 select-none">
              {/* Problem ID & Title */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 flex flex-col gap-1.5">
                  <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider">Problem ID</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] font-mono text-[13px]">#</span>
                    <input 
                      type="text" 
                      placeholder="1"
                      value={problemId}
                      onChange={(e) => setProblemId(e.target.value)}
                      className="w-full bg-[#131313] border border-[#2a2a2a] focus:border-[#da7756] outline-none pl-8 pr-3 py-2 font-mono text-[13px] text-[#f0f0f0] rounded-xl transition-all"
                    />
                  </div>
                </div>
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider">Problem Title</label>
                  <input 
                    type="text" 
                    placeholder="Two Sum"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#131313] border border-[#2a2a2a] focus:border-[#da7756] outline-none px-4 py-2 text-[14px] text-[#f0f0f0] rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Difficulty Selectors */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider">Difficulty</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setDifficulty('easy')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all font-mono text-[12px] font-medium cursor-pointer ${
                      difficulty === 'easy'
                        ? 'border-[#4caf7d] text-[#4caf7d] bg-[#4caf7d]/10'
                        : 'border-[#2a2a2a] text-[#888888] hover:border-[#4caf7d] hover:text-[#4caf7d]'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('medium')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all font-mono text-[12px] font-medium cursor-pointer ${
                      difficulty === 'medium'
                        ? 'border-[#f0a030] text-[#f0a030] bg-[#f0a030]/10'
                        : 'border-[#2a2a2a] text-[#888888] hover:border-[#f0a030] hover:text-[#f0a030]'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('hard')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all font-mono text-[12px] font-medium cursor-pointer ${
                      difficulty === 'hard'
                        ? 'border-[#e05555] text-[#e05555] bg-[#e05555]/10'
                        : 'border-[#2a2a2a] text-[#888888] hover:border-[#e05555] hover:text-[#e05555]'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    Hard
                  </button>
                </div>
              </div>

              {/* Tags Selector Pills */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {[...defaultTags, ...customTags].map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <span
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1 rounded-full border font-mono text-[12px] cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#da7756] text-[#da7756] bg-[#da7756]/10'
                            : 'border-[#2a2a2a] text-[#888888] hover:border-[#888888]'
                        }`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1 rounded-full border border-dashed border-[#2a2a2a] text-[#da7756] hover:border-[#da7756] transition-all font-mono text-[12px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Custom
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Monaco Editor */}
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl flex flex-col h-[420px] overflow-hidden hover:border-[#da7756]/30 transition-colors">
              <div className="flex justify-between items-center px-4 py-2 border-b border-[#2a2a2a] bg-[#131313] select-none">
                <span className="font-mono text-[12px] text-[#888888]">
                  YourSolution{getLanguageExt()}
                </span>
                
                {/* Language Select Dropdown */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#222222] border-none text-[#888888] focus:text-[#f0f0f0] font-mono text-[11px] py-1 px-3 rounded-md focus:ring-0 cursor-pointer outline-none"
                >
                  {languages.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopyCode}
                    className="text-[#888888] hover:text-[#da7756] transition-colors" 
                    title="Copy Code"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Monaco Code Sandbox */}
              <div className="flex-1 bg-[#131313] py-2 relative overflow-hidden">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={language}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                    fontSize: 13,
                    lineNumbers: 'on',
                    automaticLayout: true,
                    fontFamily: 'JetBrains Mono, Courier New, monospace',
                    padding: { top: 8, bottom: 8 }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Meta Form details & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card 3: Question Snapshot Upload (Simulation) */}
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#da7756]/30 transition-colors select-none">
              <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-2 block">Question Snapshot</label>
              <div 
                onClick={() => showToast('Image snapshot selection simulated.', 'success')}
                className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center justify-center text-[#888888] hover:border-[#da7756] hover:text-[#da7756] transition-colors cursor-pointer bg-[#131313] h-32"
              >
                <ImageIcon size={32} className="mb-2 text-[#888888]/80 group-hover:text-[#da7756]" />
                <span className="text-[13px] font-sans">Drop image here</span>
                <span className="font-mono text-[10px] text-[#444444] mt-1">or click to browse</span>
              </div>
            </div>

            {/* Card 4: Stats Spent & Star Ratings */}
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#da7756]/30 transition-colors space-y-4 select-none">
              <div>
                <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-1.5 block">Solved Date</label>
                <input 
                  type="date"
                  value={solvedDate}
                  onChange={(e) => setSolvedDate(e.target.value)}
                  className="w-full bg-[#131313] border border-[#2a2a2a] focus:border-[#da7756] outline-none px-3 py-2 font-mono text-[13px] text-[#f0f0f0] rounded-xl transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-1.5 block">Time Spent</label>
                <div className="relative">
                  <input 
                    type="number"
                    placeholder="0"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    className="w-full bg-[#131313] border border-[#2a2a2a] focus:border-[#da7756] outline-none pl-3 pr-16 py-2 font-mono text-[13px] text-[#f0f0f0] rounded-xl transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] font-mono text-[12px]">mins</span>
                </div>
              </div>

              <div>
                <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-1.5 block">Self Rating</label>
                <div className="flex gap-1.5 text-[#888888]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setConfidence(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star 
                        size={20} 
                        className={star <= confidence ? 'text-[#da7756] fill-[#da7756]' : 'text-[#888888] hover:text-[#da7756]'} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 5: Textarea Notes */}
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] border-l-4 border-l-[#da7756] rounded-xl p-6 hover:border-[#da7756]/30 transition-colors flex-1 flex flex-col space-y-4 select-none">
              <div className="flex-1 flex flex-col">
                <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-1.5 block">Solution Insights</label>
                <textarea 
                  placeholder="Key insights, algorithmic edge cases, dry-run templates..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#131313] border border-[#2a2a2a] focus:border-[#da7756] outline-none px-3 py-2 text-[13px] text-[#f0f0f0] rounded-xl h-28 resize-none transition-all font-sans"
                />
              </div>
              <div>
                <label className="font-mono text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-1.5 block">Sources / Link</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://leetcode.com/problems/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-[#131313] border border-[#2a2a2a] focus:border-[#da7756] outline-none px-3 py-1.5 font-mono text-[12px] text-[#f0f0f0] rounded-xl transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (url.trim()) {
                        showToast('Problem URL verified.', 'success');
                      }
                    }}
                    className="bg-[#131313] border border-[#da7756] hover:bg-[#da7756]/10 text-[#da7756] px-3 py-1 rounded-xl transition-colors font-mono text-[11px] font-bold whitespace-nowrap cursor-pointer flex items-center gap-1"
                  >
                    <LinkIcon size={11} /> Bind
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Panel Actions & Switches */}
            <div className="space-y-4 select-none">
              <div className="flex flex-col gap-3 p-4 bg-[#131313] rounded-xl border border-[#2a2a2a]">
                {/* Revisit Toggle */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-[13px] font-medium text-[#f0f0f0] group-hover:text-[#da7756] transition-colors">Mark for Revisit</span>
                  <div className="relative inline-block w-10 mr-1 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      checked={revisit}
                      onChange={(e) => setRevisit(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all duration-300 relative border ${
                      revisit ? 'bg-[#da7756] border-[#da7756]' : 'bg-[#2a2a2a] border-[#2a2a2a]'
                    }`}>
                      <div className={`w-4 h-4 bg-[#0d0d0d] rounded-full absolute top-[1px] transition-all duration-300 ${
                        revisit ? 'right-[2px]' : 'right-[22px]'
                      }`} />
                    </div>
                  </div>
                </label>

                <div className="w-full h-[1px] bg-[#2a2a2a]" />

                {/* Partial Toggle */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-[13px] font-medium text-[#f0f0f0] group-hover:text-[#da7756] transition-colors">Partial Attempt</span>
                  <div className="relative inline-block w-10 mr-1 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      checked={partial}
                      onChange={(e) => setPartial(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all duration-300 relative border ${
                      partial ? 'bg-[#da7756] border-[#da7756]' : 'bg-[#2a2a2a] border-[#2a2a2a]'
                    }`}>
                      <div className={`w-4 h-4 bg-[#0d0d0d] rounded-full absolute top-[1px] transition-all duration-300 ${
                        partial ? 'right-[2px]' : 'right-[22px]'
                      }`} />
                    </div>
                  </div>
                </label>
              </div>

              {/* Log / Save button */}
              <button 
                onClick={handleSave}
                className="w-full bg-[#da7756] hover:bg-[#ffb59d] text-[#0d0d0d] font-bold text-[14px] py-3 rounded-xl border border-[#da7756] hover:shadow-[0_0_12px_rgba(218,119,86,0.5)] active:scale-[0.98] transition-all duration-200 uppercase tracking-wider font-mono cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{editingProblem ? 'Save Changes' : 'Log Problem'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
