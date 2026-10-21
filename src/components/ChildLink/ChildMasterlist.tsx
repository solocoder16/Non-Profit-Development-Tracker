import React, { useState, useMemo } from 'react';
import { ChildBeneficiary, UserRole } from '../../types';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  Filter,
  UserCheck,
  GraduationCap,
  Sparkles,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  HardDrive,
  MapPin,
  FileText,
} from 'lucide-react';
import { exportChildLinkToCSV, DEFAULT_COMMUNITIES } from '../../utils/storage';
import { exportChildProfileToWord } from '../../utils/wordExport';
import { StorageLocationModal } from '../StorageLocationModal';
import { ManageCommunitiesModal } from './ManageCommunitiesModal';

interface ChildMasterlistProps {
  children: ChildBeneficiary[];
  onSelectChild: (child: ChildBeneficiary) => void;
  onEditChild: (child: ChildBeneficiary) => void;
  onDeleteChild: (id: string) => void;
  onNewChild: () => void;
  privacyMode: boolean;
  currentRole: UserRole;
  onLogAudit: (action: any, details: string) => void;
  communities?: string[];
  onAddCommunity?: (newArea: string) => void;
}

export const ChildMasterlist: React.FC<ChildMasterlistProps> = ({
  children,
  onSelectChild,
  onEditChild,
  onDeleteChild,
  onNewChild,
  privacyMode,
  currentRole,
  onLogAudit,
  communities: propCommunities,
  onAddCommunity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sponsored' | 'available' | 'graduated' | 'inactive'>('all');
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isCommunitiesModalOpen, setIsCommunitiesModalOpen] = useState(false);

  const activeCommunities = useMemo(() => {
    const list = propCommunities && propCommunities.length > 0 ? propCommunities : DEFAULT_COMMUNITIES;
    const set = new Set<string>(list);
    children.forEach((c) => {
      if (c.communityCluster) set.add(c.communityCluster);
    });
    return Array.from(set);
  }, [propCommunities, children]);

  // Filtered children
  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const matchesSearch =
        child.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.beneficiaryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.sponsorName && child.sponsorName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || child.status === statusFilter;
      const matchesCluster = clusterFilter === 'all' || child.communityCluster === clusterFilter;

      return matchesSearch && matchesStatus && matchesCluster;
    });
  }, [children, searchQuery, statusFilter, clusterFilter]);

  // Statistics
  const totalCount = children.length;
  const sponsoredCount = children.filter((c) => c.status === 'sponsored').length;
  const availableCount = children.filter((c) => c.status === 'available').length;
  const mediaReleaseCount = children.filter(
    (c) => c.mediaReleaseFormSigned ?? c.consentSigned ?? true
  ).length;
  const childProtectionCount = children.filter(
    (c) => c.childProtectionPolicySigned ?? true
  ).length;

  const handleExportCSV = () => {
    const csvContent = exportChildLinkToCSV(filteredChildren);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NGO_ChildLink_Masterlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogAudit('export_backup', `Exported ChildLink CSV (${filteredChildren.length} records)`);
  };

  const maskName = (name: string) => {
    if (!privacyMode) return name;
    const parts = name.split(' ');
    return parts.map((p) => (p.length > 2 ? `${p[0]}${'*'.repeat(p.length - 2)}${p[p.length - 1]}` : '**')).join(' ');
  };

  return (
    <div className="space-y-6">
      
      {/* Editorial Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Beneficiaries Masterlist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Central registry of enrolled beneficiaries, family living circumstances, and sponsorship allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCommunitiesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            title="Classification of Community: View options and add additional areas"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Community Areas ({activeCommunities.length})</span>
          </button>

          <button
            onClick={() => setIsStorageModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            title="Inspect physical storage path on local server"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
            <span>Storage Location</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          {currentRole !== 'auditor' && (
            <button
              onClick={onNewChild}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Beneficiary</span>
            </button>
          )}
        </div>
      </div>

      {/* Structured Metrics Strip (Anti-slop: clean flat metrics, no nested card shadows) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <div className="px-2">
          <span className="text-xs font-medium text-slate-500 block">Total Enrolled Children</span>
          <span className="text-2xl font-black text-slate-800 tabular-nums">{totalCount}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Masterlist database</span>
        </div>
        <div className="px-2 border-l border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Actively Sponsored</span>
          <span className="text-2xl font-black text-emerald-700 tabular-nums">{sponsoredCount}</span>
          <span className="text-[11px] text-emerald-800 block mt-0.5">
            {totalCount > 0 ? Math.round((sponsoredCount / totalCount) * 100) : 0}% coverage
          </span>
        </div>
        <div className="px-2 border-l border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Waiting for Sponsor</span>
          <span className="text-2xl font-black text-amber-600 tabular-nums">{availableCount}</span>
          <span className="text-[11px] text-amber-800 block mt-0.5">Priority case allocation</span>
        </div>
        <div className="px-2 border-l border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Media & Child Protection</span>
          <span className="text-2xl font-black text-slate-700 tabular-nums">{childProtectionCount}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {mediaReleaseCount}/{totalCount} Media · {childProtectionCount}/{totalCount} Protection
          </span>
        </div>
      </div>

      {/* Search and Segmented Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, code, nickname, or sponsor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Filter Segmented Controls (Clickable tab buttons) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('sponsored')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'sponsored' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sponsored ({sponsoredCount})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'available' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting ({availableCount})
            </button>
          </div>

          {/* Classification of Community Dropdown */}
          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className="text-xs py-1.5 px-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Community Areas ({totalCount})</option>
            {activeCommunities.map((c, idx) => {
              const count = children.filter((ch) => ch.communityCluster === c).length;
              return (
                <option key={c} value={c}>
                  {idx + 1}. {c} ({count})
                </option>
              );
            })}
          </select>
        </div>

      </div>

      {/* Main High-Density Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Beneficiary Code</th>
                <th className="py-3 px-4">Beneficiary Name & Nickname</th>
                <th className="py-3 px-4">Age / B-day</th>
                <th className="py-3 px-4">Grade & Favorite Subject</th>
                <th className="py-3 px-4">Status & Sponsor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No beneficiaries found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {searchQuery ? 'Try clearing your search query or filters.' : 'Begin by enrolling your first child.'}
                      </p>
                      {currentRole !== 'auditor' && !searchQuery && (
                        <button
                          onClick={onNewChild}
                          className="mt-3 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                        >
                          Enroll First Child
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredChildren.map((child) => (
                  <tr
                    key={child.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => {
                      onLogAudit('view_child', `Opened profile for ${child.beneficiaryName} (${child.beneficiaryCode})`);
                      onSelectChild(child);
                    }}
                  >
                    {/* Beneficiary Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {child.beneficiaryCode}
                    </td>

                    {/* Beneficiary Name & Nickname with Photo Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                          {privacyMode ? (
                            <span className="text-[10px] font-bold text-slate-400">***</span>
                          ) : child.photoUrl ? (
                            <img
                              src={child.photoUrl}
                              alt={child.beneficiaryName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 w-full h-full flex items-center justify-center uppercase">
                              {child.nickname ? child.nickname.slice(0, 2) : child.beneficiaryName.slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-[200px]">
                            {maskName(child.beneficiaryName)}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>Nickname: {privacyMode ? '***' : child.nickname || '—'}</span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[140px]">{child.communityCluster}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Age / B-day */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-800 tabular-nums">
                        {child.age} yrs old
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {privacyMode ? '****-**-**' : child.bday}
                      </div>
                    </td>

                    {/* Grade Level & Favorite Subject */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{child.gradeLevel}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {child.favoriteSubject ? `Prefers: ${child.favoriteSubject}` : '—'}
                      </div>
                    </td>

                    {/* Status & Sponsor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span
                          className={
                            child.status === 'sponsored'
                              ? 'text-emerald-700'
                              : child.status === 'available'
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }
                        >
                          {child.status === 'sponsored'
                            ? '● Sponsored'
                            : child.status === 'available'
                            ? '○ Needs Sponsor'
                            : '✓ ' + child.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px] mt-0.5">
                        {child.sponsorName ? child.sponsorName : '—'}
                      </div>
                    </td>

                    {/* Row Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            onLogAudit('view_child', `Exported Word dossier for ${child.beneficiaryName}`);
                            exportChildProfileToWord(child);
                          }}
                          title="Download Word Document (.doc)"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            onLogAudit('view_child', `Viewed dossier for ${child.beneficiaryName}`);
                            onSelectChild(child);
                          }}
                          title="View Case Profile Dossier"
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {currentRole !== 'auditor' && (
                          <button
                            onClick={() => onEditChild(child)}
                            title="Edit Beneficiary Record"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {currentRole === 'project_officer' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove beneficiary ${child.beneficiaryName}? This cannot be undone.`)) {
                                onDeleteChild(child.id);
                                onLogAudit('delete_child', `Deleted beneficiary record: ${child.beneficiaryName} (${child.beneficiaryCode})`);
                              }
                            }}
                            title="Delete Record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredChildren.length}</span> of{' '}
            <span className="font-bold text-slate-800">{totalCount}</span> enrolled beneficiaries
          </div>
          <div className="text-[11px] text-slate-400">
            Confidential ChildLink Masterlist · Protected under Data Privacy Policy
          </div>
        </div>

      </div>

      <StorageLocationModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
      />

      <ManageCommunitiesModal
        isOpen={isCommunitiesModalOpen}
        onClose={() => setIsCommunitiesModalOpen(false)}
        communities={activeCommunities}
        children={children}
        onAddCommunity={(newArea) => {
          if (onAddCommunity) onAddCommunity(newArea);
        }}
      />

    </div>
  );
};
