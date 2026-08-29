'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  User, 
  Filter, 
  Tag
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  eventTitle: string;
  assignee: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export default function EventTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'TASK-1',
      title: 'Sewa Sound System & Lighting',
      eventTitle: 'Seminar Nasional 2026',
      assignee: 'Deni Kurniawan',
      dueDate: '2026-09-02',
      priority: 'HIGH',
      status: 'TODO',
    },
    {
      id: 'TASK-2',
      title: 'Desain & Cetak Banner Backdrop',
      eventTitle: 'Seminar Nasional 2026',
      assignee: 'Fajar Nugraha',
      dueDate: '2026-08-30',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
    },
    {
      id: 'TASK-3',
      title: 'Finalisasi Daftar Undangan Pembicara',
      eventTitle: 'Seminar Nasional 2026',
      assignee: 'Budi Santoso',
      dueDate: '2026-08-25',
      priority: 'MEDIUM',
      status: 'DONE',
    },
  ]);

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'MEDIUM':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const columns: { label: string; status: TaskItem['status']; color: string }[] = [
    { label: 'Belum Dikerjakan', status: 'TODO', color: 'border-slate-700' },
    { label: 'Sedang Berjalan', status: 'IN_PROGRESS', color: 'border-cyan-500/50' },
    { label: 'Selesai', status: 'DONE', color: 'border-emerald-500/50' },
  ];

  return (
    <div className="space-y-6 p-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
            Manajemen Tugas Acara
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Pantau progress pengerjaan tugas panitia dan deadline acara secara visual.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all">
          <Plus className="w-4 h-4" /> Tambah Task Baru
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              className={`p-4 rounded-2xl bg-slate-900/60 border ${col.color} backdrop-blur-xl flex flex-col space-y-4`}
            >
              {/* Header Kolom */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  {col.label}
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                    {colTasks.length}
                  </span>
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-slate-100 text-sm leading-snug">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{task.eventTitle}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" /> {task.assignee}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {task.dueDate}
                      </span>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Tidak ada tugas di kolom ini.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
