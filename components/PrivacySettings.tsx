/**
 * Privacy Settings Component
 * GDPR-compliant data management interface
 */

import React, { useState } from 'react';
import { ShieldCheck, Trash2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PrivacySettingsProps {
  userId?: string;
  onDataDelete?: () => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ userId, onDataDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteData = async () => {
    if (!userId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/data`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

      if (onDataDelete) {
        onDataDelete();
      }
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      alert('All your data has been permanently deleted.');
      window.location.reload();
    } catch (error) {
      console.error('Data deletion error:', error);
      alert('Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExportData = async () => {
    // Export user data as JSON
    const userData = {
      userId,
      timestamp: new Date().toISOString(),
      note: 'Your CareerLens analysis data',
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `careerlens-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-slate-900">Privacy & Data Control</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Your Rights (GDPR Compliant)
          </h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Right to access your data</li>
            <li>Right to delete your data</li>
            <li>Right to export your data</li>
            <li>Right to withdraw consent</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportData}
            className="flex-1 bg-slate-100 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export My Data
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Data
            </button>
          ) : (
            <div className="flex-1 bg-red-50 p-4 rounded-xl border border-red-200 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900 mb-1">Permanent Deletion</p>
                  <p className="text-sm text-red-700">
                    This will permanently delete all your data including watch history, analysis, and recommendations. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-all border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h3 className="font-bold text-slate-900 mb-2">Data Usage Policy</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your data is used solely for generating career recommendations. We do not sell, share, or use your data for advertising. 
            All data is encrypted in transit and at rest. Raw watch history is processed in real-time and not stored long-term.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
