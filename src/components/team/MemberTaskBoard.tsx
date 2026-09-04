'use client';
import React from 'react';
import { usePMStore } from '@/lib/store/pmStore';
import { useAuth } from '@/contexts/AuthContext';
import { TaskStatus } from '@/lib/types';
import { Clock, ExternalLink, Play, CheckCircle } from 'lucide-react';

export function MemberTaskBoard({ projectId }: { projectId: string }) {
  const { projects, tasks, updateTaskStatus, updateTaskEvidence } = usePMStore();
  const { session } = useAuth();
  
  const project = projects.find(p => p.id === projectId);
  
  if (!project) return <div className="p-6 text-center text-gray-500">Proyek tidak ditemukan.</div>;

  const isPMOrAdmin = session?.roles?.some(r => ['owner', 'super_admin', 'pm'].includes(r));
  const myTasks = tasks.filter(t => 
    t.projectId === projectId && 
    (isPMOrAdmin || t.assigneeId === session?.userId || t.assigneeName === session?.name)
  );



  const columns: { id: TaskStatus, title: string, color: string, bg: string }[] = [
    { id: 'todo', title: 'To Do', color: 'text-gray-600', bg: 'bg-gray-100' },
    { id: 'in_progress', title: 'Sedang Dikerjakan', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { id: 'review', title: 'Menunggu Review PM', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
    { id: 'done', title: 'Selesai', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' }
  ];

  const handleStartTask = (taskId: string) => updateTaskStatus(taskId, 'in_progress');
  
  const handleSubmitReview = (taskId: string) => {
    const link = prompt('Masukkan link hasil kerja Anda (Gdrive / Figma / dll):');
    if (link) {
      updateTaskEvidence(taskId, link);
      updateTaskStatus(taskId, 'review');
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col fade-in">
      <div className="mb-6 bg-white p-4 rounded-xl border shadow-sm shrink-0">
        <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
        <p className="text-sm text-gray-500">Klien: {project.clientName}</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max items-start">
          {columns.map(col => {
            const colTasks = myTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className={`w-80 rounded-xl flex flex-col max-h-full border ${col.bg}`}>
                <div className="p-3 font-bold border-b border-black/5 flex justify-between items-center shrink-0">
                  <span className={col.color}>{col.title}</span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs text-gray-600 shadow-sm">{colTasks.length}</span>
                </div>
                
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-gray-800 leading-tight mb-2">{task.title}</h4>
                      
                      {task.evidenceLink && (
                        <a href={task.evidenceLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded mb-3 hover:underline w-fit">
                          <ExternalLink size={12}/> Bukti Kerja
                        </a>
                      )}

                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-3 pt-3 border-t font-medium">
                        <Clock size={12}/> Deadline: {new Date(task.dueDate).toLocaleDateString('id-ID', {month:'short', day:'numeric'})}
                      </div>

                      {/* Team Member Actions */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        {col.id === 'todo' && (
                          <button onClick={() => handleStartTask(task.id)} className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex justify-center items-center gap-2 transition-colors">
                            <Play size={14}/> Mulai Kerjakan
                          </button>
                        )}
                        {col.id === 'in_progress' && (
                          <button onClick={() => handleSubmitReview(task.id)} className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg flex justify-center items-center gap-2 transition-colors">
                            <CheckCircle size={14}/> Submit untuk Review
                          </button>
                        )}
                        {col.id === 'review' && (
                          <p className="text-xs text-orange-600 font-medium text-center italic">Sedang diperiksa PM...</p>
                        )}
                        {col.id === 'done' && (
                          <p className="text-xs text-emerald-600 font-bold text-center flex items-center justify-center gap-1"><CheckCircle size={14}/> Disetujui PM</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-400 font-medium border-2 border-dashed border-gray-300 rounded-lg">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
