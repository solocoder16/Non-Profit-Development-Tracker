import React from 'react';
import { CommunityReport, UserRole } from '../../types';
import { VineyardLogo } from '../VineyardLogo';
import {
  X,
  Printer,
  Calendar,
  MapPin,
  User,
  Quote,
  ArrowLeft,
  Share2,
  Tag,
  FileText,
  Trash2,
  Edit,
  Camera,
} from 'lucide-react';
import { exportCommunityReportToWord } from '../../utils/wordExport';

interface ReportDetailModalProps {
  report: CommunityReport;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: (report: CommunityReport) => void;
  currentRole?: UserRole;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onDelete,
  onEdit,
  currentRole,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    exportCommunityReportToWord(report);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50 no-print">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Field Dispatches</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Edit / Change Photo Button */}
            {onEdit && currentRole !== 'auditor' && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(report);
                }}
                title="Edit this dispatch or upload/replace its photo"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-emerald-700" />
                <span>Edit Report &amp; Photo</span>
              </button>
            )}

            {/* Word Export Button */}
            <button
              onClick={handleDownloadWord}
              title="Download as readable, editable Microsoft Word document (.doc) with headings and tables"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download as Word (.doc)</span>
            </button>

            {/* Print Official Document Button */}
            <button
              onClick={handlePrint}
              title="Print official clean letterhead document without web chrome or screenshot borders"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Document</span>
            </button>

            {/* Delete Report Button */}
            {onDelete && currentRole !== 'auditor' && (
              <button
                onClick={onDelete}
                title="Delete this published article"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white">
          
          {/* Header Metadata */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-widest mb-3">
              <span>{report.program === 'cva' ? 'Citizen Voice and Action (CVA)' : report.program === 'eie' ? 'Education in Emergencies (EiE)' : 'Humanitarian Relief'}</span>
              <span aria-hidden="true">·</span>
              <span>Field Dispatch</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {report.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-4">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>{report.officerName}</span>
                <span className="text-slate-400">({report.officerRole})</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.date}</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.location}</span>
              </div>
            </div>
          </div>

          {/* Hero Cover Image */}
          {report.coverImage && (
            <div className="rounded-2xl overflow-hidden mb-8 border border-slate-200 relative group">
              <img
                src={report.coverImage}
                alt={report.title}
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-600">
                <span className="italic flex-1">
                  {report.photoGallery?.[0]?.caption ||
                    'Photo: Field documentation by Project Officer during community deployment.'}
                </span>
                {onEdit && currentRole !== 'auditor' && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(report);
                    }}
                    className="no-print shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quantitative Impact Indicators Strip (Anti-slop clean metrics) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl mb-8">
            {report.metrics.map((m, idx) => (
              <div key={idx} className={idx > 0 ? 'sm:border-l sm:border-slate-200 sm:pl-4' : ''}>
                <span className="text-xs text-slate-500 font-medium block">{m.label}</span>
                <span className="text-2xl font-black text-slate-900 tabular-nums block mt-0.5">
                  {m.value}
                </span>
                {m.unit && <span className="text-[11px] text-emerald-800 font-medium">{m.unit}</span>}
              </div>
            ))}
          </div>

          {/* Report Narrative Sections */}
          <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
            
            {/* Executive Summary */}
            <div className="text-base font-medium text-slate-800 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
              {report.summary}
            </div>

            {/* Situation Overview */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                1. Context & Vulnerability Assessment
              </h2>
              <p className="whitespace-pre-line">{report.situationOverview}</p>
            </div>

            {/* Action Taken */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                2. Operational Deployment & Response
              </h2>
              <p className="whitespace-pre-line">{report.actionTaken}</p>
            </div>

            {/* Community Voice Callout */}
            {report.communityVoiceQuote && (
              <div className="my-8 p-6 bg-slate-50 rounded-2xl border-l-4 border-emerald-600 flex gap-4 items-start">
                <Quote className="w-8 h-8 text-emerald-600 shrink-0 opacity-80" />
                <div>
                  <p className="text-base font-semibold text-slate-800 italic leading-snug">
                    &ldquo;{report.communityVoiceQuote.quote}&rdquo;
                  </p>
                  <p className="text-xs font-bold text-slate-700 mt-2">
                    — {report.communityVoiceQuote.author},{' '}
                    <span className="font-normal text-slate-500">
                      {report.communityVoiceQuote.role}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Challenges & Adaptations */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                3. Operational Challenges & Adaptive Lessons
              </h2>
              <p className="whitespace-pre-line">{report.challengesAndAdaptations}</p>
            </div>

            {/* Additional Photo Gallery */}
            {report.photoGallery && report.photoGallery.length > 1 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Field Photography Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.photoGallery.slice(1).map((photo, pIdx) => (
                    <div key={pIdx} className="rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-48 object-cover"
                      />
                      <p className="p-2 bg-slate-50 text-[11px] text-slate-500 italic">
                        {photo.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags (Anti-slop: clean unboxed text) */}
            <div className="pt-6 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Report Focus:</span>
              {report.tags.map((tag, tIdx) => (
                <React.Fragment key={tag}>
                  <span className="font-medium text-slate-700">{tag}</span>
                  {tIdx < report.tags.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))}
            </div>

          </div>

          {/* Dispatch Footer */}
          <div className="pt-8 mt-8 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <VineyardLogo variant="horizontal" size="sm" showSubtitle={false} />
            <div className="text-right">
              <span className="font-semibold text-slate-700">Project Officer Field Dispatch</span>
              <p className="text-[11px] text-slate-400">Archived Locally · Community Engagement Registry</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
