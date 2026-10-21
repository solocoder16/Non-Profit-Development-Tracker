import React, { useState, useMemo } from 'react';
import {
  VolunteerProfile,
  VolunteerEngagementType,
  VolunteerStatus,
  UserRole,
} from '../../types';
import {
  Search,
  Plus,
  HeartHandshake,
  Users,
  Calendar,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  Printer,
  Sparkles,
  Phone,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { VolunteerModal } from './VolunteerModal';
import { VolunteerDossierModal } from './VolunteerDossierModal';

interface VolunteerMasterlistProps {
  volunteers: VolunteerProfile[];
  onAddVolunteer: (volunteer: VolunteerProfile) => void;
  onUpdateVolunteer: (volunteer: VolunteerProfile) => void;
  onDeleteVolunteer: (volunteerId: string) => void;
  communities: string[];
  currentRole: UserRole;
  privacyMode: boolean;
  onLogAudit: (action: any, details: string) => void;
}

export const VolunteerMasterlist: React.FC<VolunteerMasterlistProps> = ({
  volunteers,
  onAddVolunteer,
  onUpdateVolunteer,
  onDeleteVolunteer,
  communities,
  currentRole,
  privacyMode,
  onLogAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEngagement, setSelectedEngagement] = useState<'all' | VolunteerEngagementType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | VolunteerStatus>('all');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  // Modals state
  const [activeVolunteerForDossier, setActiveVolunteerForDossier] = useState<VolunteerProfile | null>(null);
  const [volunteerToEdit, setVolunteerToEdit] = useState<VolunteerProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Statistics
  const totalCount = volunteers.length;
  const longTermCount = volunteers.filter((v) => v.engagementType === 'long_term').length;
  const oneTimeCount = volunteers.filter((v) => v.engagementType === 'one_time').length;
  const activeCount = volunteers.filter((v) => v.status === 'active').length;
  const onCallCount = volunteers.filter((v) => v.status === 'on_call').length;

  // Filtered Volunteers
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((vol) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = vol.fullName.toLowerCase().includes(q);
        const matchesPref = vol.preferredName?.toLowerCase().includes(q) || false;
        const matchesCode = vol.volunteerCode.toLowerCase().includes(q);
        const matchesPhone = vol.contactNumber.toLowerCase().includes(q);
        const matchesSkills = (vol.skills || []).some((s) => s.toLowerCase().includes(q));
        const matchesTracks = (vol.volunteerTracks || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesPref && !matchesCode && !matchesPhone && !matchesSkills && !matchesTracks) {
          return false;
        }
      }

      // Engagement type
      if (selectedEngagement !== 'all' && vol.engagementType !== selectedEngagement) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && vol.status !== selectedStatus) {
        return false;
      }

      // Community
      if (selectedCommunity !== 'all' && vol.barangayCommunity !== selectedCommunity) {
        return false;
      }

      // Track
      if (selectedTrack !== 'all' && !(vol.volunteerTracks || []).includes(selectedTrack)) {
        return false;
      }

      return true;
    });
  }, [volunteers, searchQuery, selectedEngagement, selectedStatus, selectedCommunity, selectedTrack]);

  const maskName = (name: string) => {
    if (!privacyMode || !name) return name;
    const parts = name.split(' ');
    return parts
      .map((p) => (p.length > 2 ? `${p[0]}${'*'.repeat(Math.max(p.length - 2, 2))}${p[p.length - 1]}` : '***'))
      .join(' ');
  };

  const handleDelete = (volunteer: VolunteerProfile) => {
    if (confirm(`Are you sure you want to remove volunteer "${volunteer.fullName}" (${volunteer.volunteerCode})?`)) {
      onDeleteVolunteer(volunteer.id);
      onLogAudit('delete_volunteer', `Removed volunteer record: ${volunteer.fullName} (${volunteer.volunteerCode})`);
      if (activeVolunteerForDossier?.id === volunteer.id) {
        setActiveVolunteerForDossier(null);
      }
    }
  };

  const handlePrintMasterlist = () => {
    window.print();
  };

  // Export CSV summary
  const handleExportCsv = () => {
    const headers = [
      'Volunteer Code',
      'Full Name',
      'Preferred Name',
      'Engagement Type',
      'Status',
      'Age',
      'Gender',
      'Contact',
      'Email',
      'Community',
      'Occupation',
      'Volunteer Tracks',
      'Core Skills',
      'Blood Type',
      'Emergency Contact Name',
      'Emergency Phone',
      'Enrollment Date',
    ];

    const rows = filteredVolunteers.map((v) => [
      v.volunteerCode,
      v.fullName,
      v.preferredName || '',
      v.engagementType === 'long_term' ? 'Long-Term Volunteer' : 'One-Time Event Volunteer',
      v.status,
      v.age,
      v.gender,
      v.contactNumber,
      v.email,
      v.barangayCommunity,
      v.occupation,
      (v.volunteerTracks || []).join('; '),
      (v.skills || []).join('; '),
      v.bloodType || '',
      v.emergencyContact?.name || '',
      v.emergencyContact?.primaryPhone || '',
      v.enrollmentDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NGO_Volunteer_Masterlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogAudit('export_backup', 'Exported Volunteer Masterlist to CSV');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Humanitarian Corps Volunteer Masterlist
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Officer enrollment registry for long-term and one-time event volunteers, emergency contacts, tracks, and skills.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            title="Export filtered volunteer roster as CSV spreadsheet"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintMasterlist}
            title="Print clean volunteer registry"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print List</span>
          </button>

          {currentRole !== 'auditor' && (
            <button
              onClick={() => {
                setVolunteerToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Volunteer</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volunteers */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Enrolled Corps</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Community Volunteer Network</span>
        </div>

        {/* Long-Term Volunteers */}
        <div className="p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Long-Term Volunteers</span>
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2 tabular-nums">
            {longTermCount}
          </div>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">
            {totalCount > 0 ? `${Math.round((longTermCount / totalCount) * 100)}% of total corps` : 'Continuous engagement'}
          </span>
        </div>

        {/* One-Time Event Volunteers */}
        <div className="p-5 bg-white rounded-2xl border border-blue-200/80 shadow-2xs bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">One-Time Event Volunteers</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-2 tabular-nums">
            {oneTimeCount}
          </div>
          <span className="text-[11px] text-blue-700 block mt-0.5 font-medium">
            Campaign &amp; disaster dispatches
          </span>
        </div>

        {/* Deployable Status */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active &amp; On-Call</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {activeCount + onCallCount}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {activeCount} active · {onCallCount} on-call triage
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Engagement Type Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs w-fit">
          <button
            onClick={() => setSelectedEngagement('all')}
            className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
              selectedEngagement === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Volunteers ({totalCount})
          </button>
          <button
            onClick={() => setSelectedEngagement('long_term')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
              selectedEngagement === 'long_term'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            <span>Long-Term ({longTermCount})</span>
          </button>
          <button
            onClick={() => setSelectedEngagement('one_time')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
              selectedEngagement === 'one_time'
                ? 'bg-white text-blue-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>One-Time Event ({oneTimeCount})</span>
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search volunteer name, ID, skill, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-700 font-medium"
            >
              <option value="all">All Deployment Statuses</option>
              <option value="active">Active (Deployable)</option>
              <option value="on_call">On-Call (Emergency Only)</option>
              <option value="inactive">Inactive / On Leave</option>
              <option value="completed">Completed (Event Finished)</option>
            </select>
          </div>

          {/* Community Filter */}
          <div>
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-700 font-medium"
            >
              <option value="all">All Communities / Barangays</option>
              {communities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Program Track Filter */}
          <div>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-700 font-medium"
            >
              <option value="all">All Volunteer Program Tracks</option>
              <option value="ChildLink Tutoring & Mentorship">ChildLink Tutoring & Mentorship</option>
              <option value="CVA Citizen Advocacy & Scorecards">CVA Citizen Advocacy & Scorecards</option>
              <option value="EiE Emergency Learning & Relief">EiE Emergency Learning & Relief</option>
              <option value="Medical & First Aid">Medical & First Aid</option>
              <option value="Relief Logistics & Packing">Relief Logistics & Packing</option>
              <option value="Event Facilitation & Community Outreach">Event Facilitation & Outreach</option>
              <option value="Documentation, Media & Photography">Documentation, Media & Photo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Volunteers Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Volunteer Code</th>
                <th className="py-3 px-4">Volunteer Name &amp; Details</th>
                <th className="py-3 px-4">Engagement Choice</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tracks &amp; Skills</th>
                <th className="py-3 px-4">Contact &amp; Location</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map((vol) => (
                  <tr
                    key={vol.id}
                    onClick={() => {
                      onLogAudit('view_child', `Opened volunteer dossier for ${vol.fullName} (${vol.volunteerCode})`);
                      setActiveVolunteerForDossier(vol);
                    }}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Volunteer Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {vol.volunteerCode}
                    </td>

                    {/* Name & Photo Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                          {privacyMode ? (
                            <span className="text-[10px] font-bold text-slate-400">***</span>
                          ) : vol.photoUrl ? (
                            <img
                              src={vol.photoUrl}
                              alt={vol.fullName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 w-full h-full flex items-center justify-center uppercase">
                              {vol.preferredName ? vol.preferredName.slice(0, 2) : vol.fullName.slice(0, 2)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-[180px]">
                            {maskName(vol.fullName)}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            <span>{vol.preferredName ? `"${vol.preferredName}" · ` : ''}</span>
                            <span>{vol.age} yrs · {vol.gender}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Engagement Type (Long-Term vs One-Time Event) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          vol.engagementType === 'long_term'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        <HeartHandshake className="w-3 h-3" />
                        <span>{vol.engagementType === 'long_term' ? 'Long-Term' : 'One-Time Event'}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          vol.status === 'active'
                            ? 'bg-emerald-100 text-emerald-900'
                            : vol.status === 'on_call'
                            ? 'bg-amber-100 text-amber-900'
                            : vol.status === 'completed'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ● {vol.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Tracks & Skills */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate">
                        {(vol.volunteerTracks || []).slice(0, 2).join(', ') || 'General Support'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Skills: {(vol.skills || []).slice(0, 3).join(' · ')}
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-800 font-medium">
                        {privacyMode ? '09**-***-****' : vol.contactNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px] mt-0.5">
                        {vol.barangayCommunity}
                      </div>
                    </td>

                    {/* Emergency Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {privacyMode ? '***' : vol.emergencyContact?.name || '—'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {privacyMode ? '09**-***-****' : vol.emergencyContact?.primaryPhone || '—'}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            onLogAudit('view_child', `Opened volunteer dossier for ${vol.fullName} (${vol.volunteerCode})`);
                            setActiveVolunteerForDossier(vol);
                          }}
                          title="View Volunteer Dossier & Print"
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {currentRole !== 'auditor' && (
                          <>
                            <button
                              onClick={() => {
                                setVolunteerToEdit(vol);
                                setIsModalOpen(true);
                              }}
                              title="Edit Volunteer Record & Photo"
                              className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(vol)}
                              title="Delete Volunteer"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <HeartHandshake className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No volunteers match the selected criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing the filters or click &ldquo;Enroll Volunteer&rdquo; to add a new volunteer.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Volunteer Enrollment / Edit Modal */}
      <VolunteerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setVolunteerToEdit(null);
        }}
        onSave={(savedVol) => {
          if (volunteerToEdit) {
            onUpdateVolunteer(savedVol);
            onLogAudit('update_volunteer', `Updated volunteer profile: ${savedVol.fullName} (${savedVol.volunteerCode})`);
            if (activeVolunteerForDossier?.id === savedVol.id) {
              setActiveVolunteerForDossier(savedVol);
            }
          } else {
            onAddVolunteer(savedVol);
            onLogAudit('create_volunteer', `Enrolled volunteer: ${savedVol.fullName} (${savedVol.volunteerCode}) [${savedVol.engagementType === 'long_term' ? 'Long-Term' : 'One-Time Event'}]`);
          }
          setIsModalOpen(false);
          setVolunteerToEdit(null);
        }}
        initialVolunteer={volunteerToEdit}
        communities={communities}
      />

      {/* Volunteer Dossier Modal */}
      {activeVolunteerForDossier && (
        <VolunteerDossierModal
          volunteer={activeVolunteerForDossier}
          isOpen={Boolean(activeVolunteerForDossier)}
          onClose={() => setActiveVolunteerForDossier(null)}
          onEdit={(vol) => {
            setVolunteerToEdit(vol);
            setIsModalOpen(true);
          }}
          privacyMode={privacyMode}
        />
      )}

    </div>
  );
};
