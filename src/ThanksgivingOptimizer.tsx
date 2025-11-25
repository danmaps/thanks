import React, { useState } from 'react';
import { Sparkles, Plus, X } from 'lucide-react';

type Task = {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
};

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
];

function maxMealPrepTasks(tasks: Task[]): Task[] {
  if (!tasks || tasks.length === 0) return [];

  const sorted = [...tasks].sort((a, b) => {
    const endDiff = a.end - b.end;
    if (endDiff !== 0) return endDiff;
    return a.start - b.start;
  });

  const chosen: Task[] = [];
  let lastEnd = -Infinity;

  for (const task of sorted) {
    if (task.start >= lastEnd) {
      chosen.push(task);
      lastEnd = task.end;
    }
  }
  return chosen;
}

// Overlap layout similar to calendar columns
function getTaskLayout(tasks: Task[]) {
  const sorted = [...tasks].sort((a, b) => a.start - b.start || a.end - b.end);
  const columns: Task[][] = [];
  const taskColumns = new Map<string, number>();

  sorted.forEach(task => {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const hasOverlap = column.some(t => !(task.start >= t.end || task.end <= t.start));
      if (!hasOverlap) {
        column.push(task);
        taskColumns.set(task.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([task]);
      taskColumns.set(task.id, columns.length - 1);
    }
  });
  return { columns, taskColumns, totalColumns: columns.length };
}

export default function ThanksgivingOptimizer() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Make Gravy', start: 10, end: 11, color: COLORS[0] },
    { id: '2', name: 'Mash Potatoes', start: 11, end: 12, color: COLORS[1] },
    { id: '3', name: 'Bake Rolls', start: 11, end: 13, color: COLORS[2] },
    { id: '4', name: 'Prep Salad', start: 12, end: 13, color: COLORS[3] }
  ]);
  const [optimizedTasks, setOptimizedTasks] = useState<Task[]>([]);
  const [isOptimized, setIsOptimized] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', start: 8, end: 9 });

  const MIN_TIME = 8;
  const MAX_TIME = 18;
  const HOURS = Array.from({ length: MAX_TIME - MIN_TIME }, (_, i) => MIN_TIME + i);
  const SLOT_HEIGHT = 80;

  const addTask = () => {
    if (newTask.name.trim() && newTask.start < newTask.end) {
      const task: Task = {
        id: Date.now().toString(),
        name: newTask.name,
        start: newTask.start,
        end: newTask.end,
        color: COLORS[tasks.length % COLORS.length]
      };
      setTasks(prev => [...prev, task]);
      setNewTask({ name: '', start: 8, end: 9 });
      setShowAddForm(false);
      setIsOptimized(false);
    }
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setIsOptimized(false);
  };

  const optimize = () => {
    setOptimizedTasks(maxMealPrepTasks(tasks));
    setIsOptimized(true);
  };

  const reset = () => {
    setIsOptimized(false);
    setOptimizedTasks([]);
  };

  const getTaskStyle = (task: Task) => {
    const top = (task.start - MIN_TIME) * SLOT_HEIGHT;
    const height = (task.end - task.start) * SLOT_HEIGHT;
    return { top, height };
  };

  const isTaskOptimal = (task: Task) => isOptimized && optimizedTasks.some(t => t.id === task.id);

  const layout = getTaskLayout(tasks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">🦃 Thanksgiving Task Optimizer</h1>
          <p className="text-amber-700">Add your meal prep tasks and find the optimal schedule</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-amber-600 text-white flex justify-between items-center">
                <h2 className="text-lg font-semibold">Schedule</h2>
                <div className="flex gap-2">
                  {isOptimized ? (
                    <button onClick={reset} className="px-3 py-1 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">Reset</button>
                  ) : (
                    <button
                      onClick={optimize}
                      disabled={tasks.length === 0}
                      className="flex items-center gap-1 px-3 py-1 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                      <Sparkles size={14} /> Optimize
                    </button>
                  )}
                </div>
              </div>
              <div className="relative" style={{ height: HOURS.length * SLOT_HEIGHT }}>
                {HOURS.map((hour, idx) => (
                  <div key={hour} className="absolute w-full border-b border-gray-200" style={{ top: idx * SLOT_HEIGHT, height: SLOT_HEIGHT }}>
                    <div className="px-4 py-2 text-sm font-medium text-gray-500">{hour}:00</div>
                  </div>
                ))}
                <div className="absolute inset-0 pl-20 pr-4">
                  {tasks.map(task => {
                    const style = getTaskStyle(task);
                    const isOptimal = isTaskOptimal(task);
                    const isRejected = isOptimized && !isOptimal;
                    const column = layout.taskColumns.get(task.id) || 0;
                    const totalColumns = layout.totalColumns;
                    const width = totalColumns > 1 ? `${100 / totalColumns}%` : '100%';
                    const left = totalColumns > 1 ? `${(column * 100) / totalColumns}%` : '0';
                    return (
                      <div
                        key={task.id}
                        className="absolute rounded-lg p-3 transition-all duration-300 group"
                        style={{
                          top: style.top,
                          height: style.height,
                          left,
                          width: `calc(${width} - 4px)`,
                          backgroundColor: task.color,
                          opacity: isRejected ? 0.3 : 1,
                          transform: isOptimal ? 'scale(1.02)' : 'scale(1)',
                          border: isOptimal ? '3px solid #16a34a' : '2px solid transparent',
                          boxShadow: isOptimal ? '0 4px 12px rgba(22, 163, 74, 0.3)' : 'none',
                          zIndex: isOptimal ? 10 : 1
                        }}
                      >
                        <div className="flex justify-between items-start h-full">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm truncate">{task.name}</div>
                            <div className="text-xs text-white/90 mt-0.5">{task.start}:00 - {task.end}:00</div>
                            {isOptimal && <div className="mt-1 inline-block px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">✓ Selected</div>}
                          </div>
                          <button
                            onClick={() => removeTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
                            title="Remove task"
                            aria-label="Remove task"
                          >
                            <X size={16} className="text-white" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-amber-900 mb-4">Add Task</h2>
              {!showAddForm ? (
                <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                  <Plus size={18} /> New Task
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Task name"
                    value={newTask.name}
                    onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="task-start-select" className="block text-xs text-gray-600 mb-1">Start</label>
                      <select
                        id="task-start-select"
                        value={newTask.start}
                        onChange={e => setNewTask({ ...newTask, start: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      >
                        {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="task-end-select" className="block text-xs text-gray-600 mb-1">End</label>
                      <select
                        id="task-end-select"
                        value={newTask.end}
                        onChange={e => setNewTask({ ...newTask, end: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      >
                        {HOURS.concat(MAX_TIME).map(h => <option key={h} value={h}>{h}:00</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addTask}
                      disabled={!newTask.name.trim() || newTask.start >= newTask.end}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >Add</button>
                    <button
                      onClick={() => { setShowAddForm(false); setNewTask({ name: '', start: 8, end: 9 }); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
            {isOptimized && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-amber-900 mb-4">Results</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="text-sm text-green-700 mb-1">Maximum Tasks</div>
                    <div className="text-3xl font-bold text-green-900">{optimizedTasks.length}</div>
                    <div className="text-xs text-green-600 mt-1">out of {tasks.length} total</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Selected Tasks:</div>
                    <div className="space-y-2">
                      {optimizedTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: `${task.color}20` }}>
                          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: task.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{task.name}</div>
                            <div className="text-xs text-gray-600">{task.start}:00 - {task.end}:00</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-amber-900 mb-3">How it works</h2>
              <p className="text-sm text-gray-700 leading-relaxed">The greedy algorithm sorts tasks by end time and picks the earliest-ending task that doesn't conflict. This guarantees the maximum number of non-overlapping tasks.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
