'use client';

import React, { useState } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { getPlayerStats } from '../utils/achievementManager';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState<'BUG' | 'SUGGESTION' | 'BALANCE'>('BUG');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError('Please provide at least 5 characters describing the issue or feedback.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const stats = getPlayerStats();
      await addDoc(collection(db, 'bugReports'), {
        uid: user ? user.uid : null,
        username: stats.username || (user ? user.displayName : 'Anonymous_Defender'),
        email: user ? user.email : null,
        category,
        message: message.trim(),
        feverPoints: stats.feverPoints || 0,
        createdAt: serverTimestamp(),
        resolved: false,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'
      });

      setSubmitted(true);
      setMessage('');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit bug report:', err);
      setError(err.message || 'Failed to submit report. Please check your internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-gray-950 border-2 border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📝</span>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide uppercase">
                Playtest Feedback & Bug Report
              </h2>
              <p className="text-[11px] text-gray-400">
                Help improve Cyber Defender Fever! Direct line to the dev team.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-3 py-1 text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-all border border-gray-700"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
              <span className="text-4xl animate-bounce">🎉</span>
              <h3 className="text-lg font-bold text-emerald-400">Report Transmitted!</h3>
              <p className="text-xs text-gray-300 max-w-sm">
                Thank you for helping test the game! Your report was recorded in Firestore and will be reviewed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Category Pills */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('BUG')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      category === 'BUG' 
                        ? 'bg-red-950/60 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.3)]' 
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    <span>🐛</span> Bug
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('SUGGESTION')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      category === 'SUGGESTION' 
                        ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.3)]' 
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    <span>💡</span> Idea
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('BALANCE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      category === 'BALANCE' 
                        ? 'bg-yellow-950/60 border-yellow-500 text-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.3)]' 
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    <span>⚖️</span> Balance
                  </button>
                </div>
              </div>

              {/* Message Area */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Description</span>
                  <span className="text-[10px] text-gray-500">{message.length}/2000</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder={
                    category === 'BUG'
                      ? "Describe what happened, what card you were on, or if anything froze..."
                      : category === 'SUGGESTION'
                      ? "What feature, card topic, or visual juice would make the game even better?"
                      : "Did a card have too little or too much time? Was a prompt unclear?"
                  }
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all resize-none font-mono"
                  required
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-[11px] text-red-300">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Transmitting...' : 'Send Feedback 🚀'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
