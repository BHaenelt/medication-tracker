'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MedicationLog {
  _id: string;
  medicationId: {
    _id: string;
    name: string;
    dosage: string;
  };
  scheduledTime: string;
  takenAt?: string;
  status: string;
  notes?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchTodaysLogs();
  }, []);

  const fetchTodaysLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/logs/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (logId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/logs/${logId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'taken',
          takenAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        fetchTodaysLogs();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/logs/scheduled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchTodaysLogs();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  const pendingLogs = logs.filter(log => log.status === 'pending' && log.medicationId);
  const takenLogs = logs.filter(log => log.status === 'taken' && log.medicationId);

  // Helper function to check if a medication is missed
  const isMissed = (scheduledTime: string) => {
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    return now > scheduled;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Today</h1>
            <p className="text-slate-600 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-600 hover:text-slate-900"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-8">
          <button
            onClick={generateSchedule}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Generate schedule
          </button>
          <button
            onClick={() => router.push('/medications')}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors"
          >
            Medications
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <p className="text-slate-600 mb-2">Nothing scheduled today</p>
            <p className="text-sm text-slate-500">
              Add medications and generate your schedule to get started
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingLogs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  To Take
                </h2>
                <div className="space-y-3">
                  {pendingLogs.map((log) => (
                    <div
                      key={log._id}
                      className={`bg-white rounded-xl p-5 border transition-colors ${
                        isMissed(log.scheduledTime) 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {log.medicationId.name}
                            </h3>
                            {isMissed(log.scheduledTime) && (
                              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                                MISSED
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-0.5">{log.medicationId.dosage}</p>
                          <p className={`text-sm mt-2 ${
                            isMissed(log.scheduledTime) ? 'text-red-600 font-medium' : 'text-slate-500'
                          }`}>
                            {new Date(log.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={() => markAsTaken(log._id)}
                          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Take
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {takenLogs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  Completed
                </h2>
                <div className="space-y-3">
                  {takenLogs.map((log) => (
                    <div
                      key={log._id}
                      className="bg-white rounded-xl p-5 border border-slate-200 opacity-60"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {log.medicationId.name}
                          </h3>
                          <p className="text-slate-600 mt-0.5">{log.medicationId.dosage}</p>
                          <p className="text-sm text-emerald-600 mt-2">
                            ✓ Taken at {new Date(log.takenAt!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
