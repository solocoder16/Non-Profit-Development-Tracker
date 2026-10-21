import React, { useState, useMemo } from 'react';
import { CommunityReport, UserRole } from '../../types';
import {
  BookOpen,
  Plus,
  Calendar,
  MapPin,
  ArrowRight,
  User,
  Sparkles,
  Quote,
  Users,
  GraduationCap,
  Trash2,
  Camera,
  Edit,
  Search,
  Filter,
  X,
  Layers,
} from 'lucide-react';
import { ReportDetailModal } from './ReportDetailModal';
import { ReportComposeModal } from './ReportComposeModal';

interface CommunityReportsViewProps {
  reports: CommunityReport[];
  onAddReport: (report: CommunityReport) => void;
  onUpdateReport?: (report: CommunityReport) => void;
  onDeleteReport?: (reportId: string) => void;
  currentRole: UserRole;
  onLogAudit: (action: any, details: string) => void;
  communities?: string[];
}

export const CommunityReportsView: React.FC<CommunityReportsViewProps> = ({
  reports,
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  currentRole,
  onLogAudit,
  communities = [],
}) => {
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'cva' | 'eie'>('all');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<CommunityReport | null>(null);
  const [editingReport, setEditingReport] = useState<CommunityReport | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesProgram = selectedProgram === 'all' || r.program === selectedProgram;
      const matchesCommunity =
        !selectedCommunity ||
        r.location.toLowerCase().includes(selectedCommunity.toLowerCase());
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        r.title.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query) ||
        r.officerName.toLowerCase().includes(query) ||
        r.summary.toLowerCase().includes(query) ||
        r.tags.some((t) => t.toLowerCase().includes(query));
      return matchesProgram && matchesCommunity && matchesSearch;
    });
  }, [reports, selectedProgram, selectedCommunity, searchQuery]);

  const cvaCount = reports.filter((r) => r.program === 'cva').length;
  const eieCount = reports.filter((r) => r.program === 'eie').length;

  const handleDeleteReport = (report: CommunityReport) => {
    if (
      confirm(
        `Are you sure you want to permanently delete the published field report "${report.title}"? This cannot be undone.`
      )
    ) {
      if (onDeleteReport) {
        onDeleteReport(report.id);
      }
      if (activeReport?.id === report.id) {
        setActiveReport(null);
      }
    }
  };

  const clearAllFilters = () => {
    setSelectedProgram('all');
    setSelectedCommunity(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Community Activities &amp; Field Dispatches
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Qualitative field reports, community scorecard dialogues, citizen monitoring, and emergency response metrics.
          </p>
        </div>

        {currentRole !== 'auditor' && (
          <button
            onClick={() => {
              setEditingReport(null);
              setIsComposeOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Field Report</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 border-b border-slate-200 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Program Sector Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedProgram('all')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedProgram === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Dispatches ({reports.length})
            </button>
            <button
              onClick={() => setSelectedProgram('cva')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedProgram === 'cva'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Citizen Voice &amp; Action ({cvaCount})</span>
            </button>
            <button
              onClick={() => setSelectedProgram('eie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedProgram === 'eie'
                  ? 'bg-white text-indigo-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Education in Emergencies ({eieCount})</span>
            </button>
          </div>

          {/* Search Box & Quick Community Area Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {communities && communities.length > 0 && (
              <select
                value={selectedCommunity || 'all'}
                onChange={(e) => setSelectedCommunity(e.target.value === 'all' ? null : e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">All Community Areas</option>
                {communities.map((comm) => (
                  <option key={comm} value={comm}>
                    {comm}
                  </option>
                ))}
              </select>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search title, location, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Pill Strip */}
        {(selectedCommunity || selectedProgram !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Active Filters:</span>

            {selectedCommunity && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs">
                <MapPin className="w-3 h-3 text-emerald-700" />
                <span>Zone: {selectedCommunity}</span>
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className="hover:text-rose-600 ml-1 cursor-pointer"
                  title="Remove community filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedProgram !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs">
                <span>Sector: {selectedProgram.toUpperCase()}</span>
                <button
                  onClick={() => setSelectedProgram('all')}
                  className="hover:text-rose-600 ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs">
                <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-rose-600 ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-[11px] text-slate-500 hover:text-rose-600 font-bold underline ml-1 cursor-pointer"
            >
              Reset all ({filteredReports.length} shown)
            </button>
          </div>
        )}
      </div>

      {/* Report Grid or Empty State */}
      {filteredReports.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-200 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No Field Dispatches Match Filter
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {selectedCommunity
                ? `No published reports found for "${selectedCommunity}". You can compose a new CVA or EiE dispatch for this community area.`
                : 'Try adjusting your search keywords or program sector filters.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
            {currentRole !== 'auditor' && (
              <button
                onClick={() => {
                  setEditingReport(null);
                  setIsComposeOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Compose Dispatch
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <article
              key={report.id}
              onClick={() => {
                onLogAudit('view_child', `Read field dispatch: ${report.title}`);
                setActiveReport(report);
              }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
            >
              {/* Cover Photo */}
              <div className="h-48 w-full bg-slate-100 relative overflow-hidden shrink-0">
                <img
                  src={report.coverImage}
                  alt={report.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-xs ${
                      report.program === 'cva'
                        ? 'bg-emerald-600'
                        : report.program === 'eie'
                        ? 'bg-indigo-600'
                        : 'bg-amber-600'
                    }`}
                  >
                    {report.program === 'cva'
                      ? 'Citizen Voice and Action'
                      : report.program === 'eie'
                      ? 'Education in Emergencies'
                      : 'Integrated Relief'}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{report.location}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{report.date}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{report.officerName}</span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                    {report.title}
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                {/* Key Metrics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {report.metrics.slice(0, 4).map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center"
                    >
                      <span className="text-[10px] text-slate-500 block truncate">{m.label}</span>
                      <span className="text-xs font-black text-emerald-700 block mt-0.5">
                        {m.value}
                      </span>
                      {m.unit && (
                        <span className="text-[9px] text-emerald-800 font-medium block truncate">
                          {m.unit}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Beneficiary Quote Snippet */}
                {report.communityVoiceQuote && (
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/70 text-xs text-slate-700 italic flex items-start gap-2">
                    <Quote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">
                      &ldquo;{report.communityVoiceQuote.quote}&rdquo;{' '}
                      <span className="not-italic font-bold text-slate-800 text-[11px] block mt-1">
                        — {report.communityVoiceQuote.author}
                      </span>
                    </p>
                  </div>
                )}

                {/* Bottom Action Strip with Delete and Edit Photo Buttons */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>Topics:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[170px]">
                      {report.tags.slice(0, 3).join(' · ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {currentRole !== 'auditor' && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingReport(report);
                            setIsComposeOpen(true);
                          }}
                          title="Edit report and upload/replace photo"
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingReport(report);
                            setIsComposeOpen(true);
                          }}
                          title="Edit full report details"
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(report);
                          }}
                          title="Delete this published article"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform ml-1">
                      <span>Read Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modals */}
      {activeReport && (
        <ReportDetailModal
          report={activeReport}
          isOpen={Boolean(activeReport)}
          onClose={() => setActiveReport(null)}
          onDelete={() => handleDeleteReport(activeReport)}
          onEdit={(rep) => {
            setEditingReport(rep);
            setIsComposeOpen(true);
          }}
          currentRole={currentRole}
        />
      )}

      <ReportComposeModal
        isOpen={isComposeOpen}
        initialReport={editingReport}
        onClose={() => {
          setIsComposeOpen(false);
          setEditingReport(null);
        }}
        onSave={(savedRep) => {
          if (editingReport) {
            if (onUpdateReport) {
              onUpdateReport(savedRep);
            } else {
              onAddReport(savedRep);
            }
            onLogAudit('create_report', `Updated field report and photo: "${savedRep.title}"`);
            if (activeReport?.id === savedRep.id) {
              setActiveReport(savedRep);
            }
          } else {
            onAddReport(savedRep);
            onLogAudit('create_report', `Published field report with photo: "${savedRep.title}"`);
          }
          setEditingReport(null);
        }}
      />

    </div>
  );
};
