import React, { useState } from 'react';
import { MapPin, Plus, CheckCircle2, AlertCircle, X, Users, Sparkles } from 'lucide-react';
import { ChildBeneficiary } from '../../types';

interface ManageCommunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: string[];
  children: ChildBeneficiary[];
  onAddCommunity: (newArea: string) => void;
}

export const ManageCommunitiesModal: React.FC<ManageCommunitiesModalProps> = ({
  isOpen,
  onClose,
  communities,
  children,
  onAddCommunity,
}) => {
  const [newAreaInput, setNewAreaInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmed = newAreaInput.trim();
    if (!trimmed) {
      setError('Please enter a community or area name.');
      return;
    }

    const alreadyExists = communities.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setError('This community area already exists in the classification list.');
      return;
    }

    onAddCommunity(trimmed);
    setSuccessMessage(`Successfully registered "${trimmed}" as a community classification area.`);
    setNewAreaInput('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Helper to count beneficiaries in a community
  const getBeneficiaryCount = (areaName: string) => {
    return children.filter(
      (c) => (c.communityCluster || '').toLowerCase() === areaName.toLowerCase()
    ).length;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-sm">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Classification of Community Areas</h2>
              <p className="text-xs text-slate-500">Official coverage locations & field community clusters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Add New Area Input Box */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Add Additional Area for Future Reference</span>
            </div>
            <p className="text-xs text-slate-600">
              Enter any new barangay, resettlement zone, or municipality to make it immediately selectable in beneficiary enrollment forms.
            </p>

            <form onSubmit={handleAdd} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="e.g. Sitio Bagong Silang, Rodriguez, Rizal"
                  value={newAreaInput}
                  onChange={(e) => {
                    setNewAreaInput(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Area</span>
              </button>
            </form>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-100/70 p-2 rounded-lg border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* List of Active Community Options */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Registered Communities ({communities.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Persistent on local server C:\WebApp Data
              </span>
            </div>

            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
              {communities.map((area, idx) => {
                const count = getBeneficiaryCount(area);
                const isDefault = idx < 5;

                return (
                  <div
                    key={area}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {area}
                          </span>
                          {isDefault && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              Official
                            </span>
                          )}
                          {!isDefault && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                              Added
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{count}</span>
                        <span className="text-[11px]">{count === 1 ? 'child' : 'children'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total {communities.length} classification areas active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
