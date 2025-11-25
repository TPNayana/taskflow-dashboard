import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import api from '../api';

// --- FINAL STYLES ---
const calendarStyles = `
  .custom-calendar .react-calendar { 
    width: 100%; border: none; background: transparent !important; font-family: 'Inter', sans-serif; 
  }
  .custom-calendar .react-calendar__navigation button { 
    min-width: 30px; background: transparent !important; font-size: 1rem; font-weight: 700; color: #e2e8f0; 
  }
  .custom-calendar .react-calendar__navigation button:enabled:hover { background-color: rgba(255,255,255,0.1) !important; border-radius: 8px; }
  .custom-calendar .react-calendar__month-view__weekdays { 
    text-align: center; font-size: 0.65rem; color: #94a3b8; font-weight: 700; 
    text-transform: uppercase; margin-bottom: 0.5rem; border: none !important; text-decoration: none !important;
  }
  .custom-calendar .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none !important; border: none !important; }
  .custom-calendar .react-calendar__tile { 
    padding: 0.75rem; font-size: 0.9rem; color: #cbd5e1; font-weight: 600; border-radius: 12px; 
    background: transparent !important; transition: all 0.2s;
  }
  .custom-calendar .react-calendar__tile:enabled:hover { background-color: rgba(255,255,255,0.1) !important; color: #fff; }
  .custom-calendar .react-calendar__tile--now { background: transparent !important; color: #818cf8 !important; border: 1px solid rgba(99, 102, 241, 0.5) !important; }
  .custom-calendar .react-calendar__tile--active { 
    background: linear-gradient(135deg, #6366f1, #a855f7) !important; color: white !important; border: none !important; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
  }
  .custom-calendar .react-calendar__tile:disabled { color: #475569; opacity: 0.3; cursor: not-allowed; }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NOTES STATE
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('taskflow_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    localStorage.setItem('taskflow_notes', JSON.stringify(notes));
  }, [notes]);

  // LOAD TASKS (Refetches every time you switch tabs to ensure data is fresh)
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await api.get('/tasks');
        // Sort by creation date (newest first) locally to be safe
        const sortedTasks = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTasks(sortedTasks);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchTasks();
  }, [navigate, activeTab]); // <--- Dependency added here to force refresh on tab switch

  // HANDLERS
  const handleAddTask = async (e, dateOverride = null) => {
    if (e) e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await api.post('/tasks', { title: newTask, dueDate: dateOverride || new Date() });
      setTasks([res.data, ...tasks]); // Optimistic update
      setNewTask(''); 
      setIsModalOpen(false); 
    } catch (err) { console.error(err); }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      const res = await api.put(`/tasks/${id}`, { status: newStatus });
      setTasks(tasks.map(task => task._id === id ? res.data : task));
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) { console.error(err); }
  };

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const note = { id: Date.now(), text: newNote, date: new Date().toLocaleDateString() };
    setNotes([note, ...notes]);
    setNewNote('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const onDateClick = (date) => {
    setSelectedDate(date);
    setActiveTab('calendar'); 
    setIsModalOpen(true);     
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    const today = new Date().toDateString();
    const dueToday = tasks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate).toDateString() === today).length;
    return { total, completed, pending, dueToday };
  }, [tasks]);

  const tileDisabled = ({ date, view }) => view === 'month' && date < new Date().setHours(0,0,0,0);
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const circleDasharray = `${completionPercentage * 2.2}, 220`;

  return (
    <div className="min-h-screen bg-[#0f172a] flex font-sans text-slate-200 relative overflow-hidden">
      <style>{calendarStyles}</style>

      {/* BACKGROUND BLOBS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl ring-1 ring-white/10 transform transition-all scale-100">
            <h3 className="text-lg font-bold text-white mb-1">Add Task</h3>
            <p className="text-slate-400 text-xs mb-4">For {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <form onSubmit={(e) => handleAddTask(e, selectedDate)}>
              <input autoFocus type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="What needs to be done?" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4 text-sm text-white placeholder-slate-500 transition-all" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition bg-white/5 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg transition-all transform hover:scale-105">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg></div>
            TaskFlow
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {['dashboard', 'calendar'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex w-full items-center px-4 py-3 rounded-xl text-sm font-medium transition-all group ${activeTab === tab ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><span className="capitalize">{tab}</span></button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5"><button onClick={handleLogout} className="w-full py-2 text-xs font-bold text-red-400 hover:text-red-300 transition bg-red-500/10 rounded-lg border border-red-500/10">Sign Out</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-6 md:p-8 overflow-y-auto relative z-10">
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* HERO BANNER */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-900/30 border border-white/10 flex justify-between items-center">
              <div><h1 className="text-2xl font-bold mb-1">Hello, Achiever!</h1><p className="text-indigo-100 text-sm">You have <span className="font-semibold text-white">{stats.pending} tasks</span> pending today.</p></div>
              <div className="flex gap-4">
                 <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 text-center"><p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Due Today</p><p className="text-xl font-bold">{stats.dueToday}</p></div>
                 <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 text-center"><p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Pending</p><p className="text-xl font-bold">{stats.pending}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* QUICK ADD & TASK LIST */}
                <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-1.5 shadow-lg flex items-center">
                   <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-3">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      <form onSubmit={(e) => handleAddTask(e)} className="flex-1"><input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task..." className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-500 outline-none h-8" /></form>
                   </div>
                   <button onClick={(e) => handleAddTask(e)} className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 w-12 rounded-xl ml-1.5 flex items-center justify-center transition shadow-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></button>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4 px-1"><h2 className="text-lg font-bold text-white">My Tasks</h2><span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">{stats.total} TOTAL</span></div>
                  <div className="space-y-3">
                    {tasks.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm bg-slate-800/30 rounded-2xl border border-white/5">No tasks yet.</div> : 
                      tasks.slice(0, 6).map((task) => (
                        <div key={task._id} className="group bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-xl p-4 flex items-center hover:bg-white/5 transition-all duration-200 hover:scale-[1.01]">
                          <button onClick={() => toggleTask(task._id, task.status)} className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500/20 border-green-500/50' : 'border-slate-600 hover:border-indigo-400'}`}>{task.status === 'completed' && <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}</button>
                          <div className="ml-4 flex-1"><p className={`text-sm font-bold transition-all ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{task.title}</p><div className="flex items-center gap-3 mt-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month:'short', day:'numeric' }) : ''}</p></div></div>
                          <button onClick={() => deleteTask(task._id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="custom-calendar bg-slate-800/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-lg"><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold text-white">Calendar</h3><button onClick={() => setActiveTab('calendar')} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition"><svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></button></div><Calendar onClickDay={onDateClick} value={selectedDate} tileDisabled={tileDisabled} className="w-full" /></div>
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center relative overflow-hidden">
                   <h3 className="text-sm font-bold text-white mb-4 z-10">Progress</h3>
                   <div className="relative w-32 h-32 z-10">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle className="text-slate-700/30" strokeWidth="8" stroke="currentColor" fill="transparent" r="35" cx="50" cy="50" /><circle className="text-indigo-500 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={circleDasharray} strokeLinecap="round" stroke="currentColor" fill="transparent" r="35" cx="50" cy="50" /></svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"><span className="text-xl font-extrabold text-white">{completionPercentage}%</span></div>
                   </div>
                   <div className="flex gap-6 mt-4 z-10"><div className="text-center"><p className="text-lg font-bold text-white">{stats.completed}</p><p className="text-[10px] font-bold text-slate-400 uppercase">Done</p></div><div className="text-center"><p className="text-lg font-bold text-white">{stats.pending}</p><p className="text-[10px] font-bold text-slate-400 uppercase">Left</p></div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CALENDAR PAGE */}
        {activeTab === 'calendar' && (
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">Full Schedule</h1>
            {/* LAYOUT: Calendar + Notes (Left), Tasks (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* LEFT COLUMN: Calendar + Notes */}
              <div className="flex flex-col gap-6">
                {/* Calendar */}
                <div className="custom-calendar bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg">
                   <Calendar onClickDay={onDateClick} value={selectedDate} tileDisabled={tileDisabled} className="w-full h-full text-sm" 
                     tileContent={({ date, view }) => {
                        if (view !== 'month') return null;
                        const hasTask = tasks.some(t => t.dueDate && new Date(t.dueDate).toDateString() === date.toDateString());
                        return hasTask ? <div className="h-1 w-1 bg-indigo-500 rounded-full mx-auto mt-1 shadow-lg shadow-indigo-500/50"></div> : null;
                     }}
                   />
                </div>
                {/* Notes */}
                <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-sm font-bold text-white mb-4">Quick Notes</h3>
                  <form onSubmit={addNote} className="flex gap-2 mb-4">
                    <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Jot something down..." className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all" />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl shadow-lg transition"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg></button>
                  </form>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {notes.length === 0 ? <p className="text-slate-500 text-[10px] italic">No notes yet.</p> : 
                      notes.map((note) => (
                        <div key={note.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-start group">
                          <div><p className="text-xs text-slate-300">{note.text}</p><p className="text-[9px] text-slate-500 mt-1">{note.date}</p></div>
                          <button onClick={() => deleteNote(note.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Tasks for Selected Date */}
              <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                  <div><h2 className="text-xl font-bold text-white">{selectedDate.toLocaleDateString(undefined, {month:'long', day:'numeric'})}</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{selectedDate.toLocaleDateString(undefined, {weekday:'long'})}</p></div>
                  <button onClick={() => setIsModalOpen(true)} className="h-10 w-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-500/20"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg></button>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   {tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === selectedDate.toDateString()).length > 0 ? (
                     tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === selectedDate.toDateString()).map(task => (
                       <div key={task._id} className={`p-4 rounded-xl border transition-all group ${task.status === 'completed' ? 'bg-green-500/10 border-green-500/20 opacity-60' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <p className={`font-bold text-sm line-clamp-1 ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                            <button onClick={() => deleteTask(task._id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                          <button onClick={() => toggleTask(task._id, task.status)} className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${task.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'}`}>{task.status === 'completed' ? 'Completed' : 'Mark as Complete'}</button>
                       </div>
                     ))
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-2xl border-2 border-dashed border-slate-700/50"><p className="text-slate-400 font-bold text-sm mb-1">No tasks.</p><p className="text-slate-500 text-xs">Enjoy your day!</p></div>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;