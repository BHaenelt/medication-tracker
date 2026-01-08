'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  times: string[];
  daysOfWeek: number[];
  instructions: string;
  isActive: boolean;
}

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

export default function MedicationsPage() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: [''],
    daysOfWeek: [] as number[], // No days selected by default
    instructions: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/medications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMedications(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          times: formData.times.filter(t => t.trim() !== '')
        })
      });

      if (response.ok) {
        setFormData({ name: '', dosage: '', times: [''], daysOfWeek: [], instructions: '' });
        setShowForm(false);
        fetchMedications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addTimeField = () => {
    setFormData({ ...formData, times: [...formData.times, ''] });
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const removeTime = (index: number) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes });
  };

  const toggleDay = (day: number) => {
    const newDays = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter(d => d !== day)
      : [...formData.daysOfWeek, day].sort((a, b) => a - b);
    setFormData({ ...formData, daysOfWeek: newDays });
  };

  const deleteMedication = async (id: string) => {
    if (!confirm('Delete this medication?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchMedications();
    } catch (err) {
      console.error(err);
    }
  };

  const getDayNames = (days: number[]) => {
    if (days.length === 7) return 'Every day';
    return days.sort((a, b) => a - b).map(d => DAYS[d].label).join(', ');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-600 hover:text-slate-900 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Medications</h1>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add medication
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-xl p-6 mb-8 border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-slate-900">New medication</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Aspirin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Dosage
                </label>
                <input
                  type="text"
                  required
                  placeholder="100mg"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Days of week
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        formData.daysOfWeek.includes(day.value)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Times
                </label>
                <div className="space-y-2">
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => updateTime(index, e.target.value)}
                        className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {formData.times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTime(index)}
                          className="px-4 text-slate-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addTimeField}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  + Add time
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Take with food"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Save
              </button>
            </form>
          </div>
        )}

        {medications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <p className="text-slate-500">No medications added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <div key={med._id} className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{med.name}</h3>
                    <p className="text-slate-600 mt-0.5">{med.dosage}</p>
                    <p className="text-sm text-slate-500 mt-2">{getDayNames(med.daysOfWeek)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {med.times.map((time, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                          {time}
                        </span>
                      ))}
                    </div>
                    {med.instructions && (
                      <p className="text-sm text-slate-500 mt-3">{med.instructions}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMedication(med._id)}
                    className="ml-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}