import React, { useState, useEffect } from 'react';
import { CommunityReport, MetricItem } from '../../types';
import {
  X,
  Save,
  Plus,
  Trash2,
  Upload,
  HardDrive,
  Cloud,
  Link as LinkIcon,
  Image as ImageIcon,
  Camera,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { normalizePhotoUrl, readFileAsDataUrl, sanitizeImageUrl } from '../../utils/photoUtils';

interface ReportComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: CommunityReport) => void;
  initialReport?: CommunityReport | null;
}

const PRESET_PHOTOS = {
  cva: [
    {
      label: 'CVA Field Distribution (Citizen Scorecard / Relief)',
      url: '/src/assets/images/cva_cash_distribution_1792381930481.jpg',
    },
    {
      label: 'Community Engagement & Relief Supplies',
      url: '/src/assets/images/community_learning_supplies_1792381930966.jpg',
    },
  ],
  eie: [
    {
      label: 'EiE Temporary Learning Center & Class Continuity',
      url: '/src/assets/images/eie_temporary_learning_1792381930913.jpg',
    },
    {
      label: 'Emergency Student Kits & Learning Supplies',
      url: '/src/assets/images/community_learning_supplies_1792381930966.jpg',
    },
  ],
  integrated: [
    {
      label: 'Integrated Community Relief',
      url: '/src/assets/images/community_learning_supplies_1792381930966.jpg',
    },
  ],
};

export const ReportComposeModal: React.FC<ReportComposeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReport,
}) => {
  const isEditing = Boolean(initialReport);

  const [title, setTitle] = useState('');
  const [program, setProgram] = useState<'cva' | 'eie' | 'integrated'>('cva');
  const [location, setLocation] = useState('Barangay Multi-Purpose Center');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [officerName, setOfficerName] = useState('Jericho');
  const [officerRole, setOfficerRole] = useState('Project Officer');
  const [summary, setSummary] = useState('');
  const [situationOverview, setSituationOverview] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [challengesAndAdaptations, setChallengesAndAdaptations] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteRole, setQuoteRole] = useState('');
  const [tagsInput, setTagsInput] = useState('Community, Relief, Field Work');

  // Photo state
  const [coverImage, setCoverImage] = useState<string>('');
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [photoSourceTab, setPhotoSourceTab] = useState<'local' | 'drive' | 'presets'>('local');
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [driveUrlError, setDriveUrlError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Gallery Photos
  const [gallery, setGallery] = useState<{ url: string; caption: string }[]>([]);

  // Key indicators
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { label: 'Beneficiary Individuals', value: '150', unit: 'persons' },
    { label: 'Families Assisted', value: '45', unit: 'households' },
  ]);

  // Synchronize state when opening or switching initialReport
  useEffect(() => {
    if (initialReport) {
      setTitle(initialReport.title || '');
      setProgram(initialReport.program || 'cva');
      setLocation(initialReport.location || '');
      setDate(initialReport.date || new Date().toISOString().slice(0, 10));
      setOfficerName(initialReport.officerName || 'Jericho');
      setOfficerRole(initialReport.officerRole || 'Project Officer');
      setSummary(initialReport.summary || '');
      setSituationOverview(initialReport.situationOverview || '');
      setActionTaken(initialReport.actionTaken || '');
      setChallengesAndAdaptations(initialReport.challengesAndAdaptations || '');
      setQuoteText(initialReport.communityVoiceQuote?.quote || '');
      setQuoteAuthor(initialReport.communityVoiceQuote?.author || '');
      setQuoteRole(initialReport.communityVoiceQuote?.role || '');
      setTagsInput(initialReport.tags ? initialReport.tags.join(', ') : 'Community, Relief');
      setCoverImage(initialReport.coverImage || '');
      setPhotoLoadError(false);
      setPhotoCaption(
        initialReport.photoGallery?.[0]?.caption ||
          `${initialReport.title} - Field documentation.`
      );
      setGallery(
        initialReport.photoGallery && initialReport.photoGallery.length > 1
          ? initialReport.photoGallery.slice(1).map((g) => ({
              url: sanitizeImageUrl(g.url),
              caption: g.caption || '',
            }))
          : []
      );
      setMetrics(
        initialReport.metrics && initialReport.metrics.length > 0
          ? initialReport.metrics
          : [
              { label: 'Beneficiary Individuals', value: '150', unit: 'persons' },
              { label: 'Families Assisted', value: '45', unit: 'households' },
            ]
      );
    } else {
      // New report defaults
      setTitle('');
      setProgram('cva');
      setLocation('Barangay Multi-Purpose Center');
      setDate(new Date().toISOString().slice(0, 10));
      setOfficerName('Jericho');
      setOfficerRole('Project Officer');
      setSummary('');
      setSituationOverview('');
      setActionTaken('');
      setChallengesAndAdaptations('');
      setQuoteText('');
      setQuoteAuthor('');
      setQuoteRole('');
      setTagsInput('Community, Relief, Field Work');
      setCoverImage('/src/assets/images/cva_cash_distribution_1792381930481.jpg');
      setPhotoLoadError(false);
      setPhotoCaption('Community field documentation during local outreach deployment.');
      setGallery([]);
      setMetrics([
        { label: 'Beneficiary Individuals', value: '150', unit: 'persons' },
        { label: 'Families Assisted', value: '45', unit: 'households' },
      ]);
    }
  }, [initialReport, isOpen]);

  // Handle program change default image if user hasn't explicitly set a custom photo
  const handleProgramChange = (newProg: 'cva' | 'eie' | 'integrated') => {
    setProgram(newProg);
    if (!initialReport && (!coverImage || coverImage.startsWith('/src/assets/images/'))) {
      if (newProg === 'cva') {
        setCoverImage('/src/assets/images/cva_cash_distribution_1792381930481.jpg');
        setPhotoCaption('Citizen Voice and Action (CVA) community accountability meeting.');
      } else if (newProg === 'eie') {
        setCoverImage('/src/assets/images/eie_temporary_learning_1792381930913.jpg');
        setPhotoCaption('Education in Emergencies (EiE) temporary learning space setup.');
      } else {
        setCoverImage('/src/assets/images/community_learning_supplies_1792381930966.jpg');
        setPhotoCaption('Integrated disaster relief distribution.');
      }
      setPhotoLoadError(false);
    }
  };

  if (!isOpen) return null;

  // Local photo upload handler
  const handleLocalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      const dataUrl = await readFileAsDataUrl(file, 1600, 1200, 0.85);
      const sanitized = sanitizeImageUrl(dataUrl);
      if (sanitized) {
        setCoverImage(sanitized);
        setPhotoLoadError(false);
      }
      if (!photoCaption) {
        setPhotoCaption(`Field photo: ${file.name.replace(/\.[^.]+$/, '')}`);
      }
    } catch (err) {
      console.error('Failed reading photo file:', err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  // Google Drive URL apply
  const handleApplyDriveUrl = () => {
    const trimmed = driveUrlInput.trim();
    if (!trimmed) {
      setDriveUrlError('Please paste a Google Drive file link or image URL.');
      return;
    }
    const sanitized = sanitizeImageUrl(trimmed);
    if (!sanitized) {
      setDriveUrlError('Please enter a valid HTTP, HTTPS, or Google Drive photo link.');
      return;
    }
    setCoverImage(sanitized);
    setPhotoLoadError(false);
    setDriveUrlInput('');
    setDriveUrlError(null);
    if (!photoCaption) {
      setPhotoCaption('Field documentation photo from Google Drive archive.');
    }
  };

  // Gallery local upload handler
  const handleAddGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file, 1200, 900, 0.85);
      const sanitized = sanitizeImageUrl(dataUrl);
      if (sanitized) {
        setGallery((prev) => [
          ...prev,
          {
            url: sanitized,
            caption: `Photo: ${file.name.replace(/\.[^.]+$/, '')}`,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed adding gallery photo:', err);
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleUpdateGalleryCaption = (index: number, caption: string) => {
    const updated = [...gallery];
    updated[index].caption = caption;
    setGallery(updated);
  };

  const handleAddMetric = () => {
    setMetrics([...metrics, { label: 'New Metric', value: '0', unit: '' }]);
  };

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleMetricChange = (index: number, field: keyof MetricItem, val: string) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], [field]: val };
    setMetrics(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Fallback image if none specified
    const finalCover =
      coverImage ||
      (program === 'cva'
        ? '/src/assets/images/cva_cash_distribution_1792381930481.jpg'
        : '/src/assets/images/eie_temporary_learning_1792381930913.jpg');

    const fullGallery = [
      {
        url: finalCover,
        caption: photoCaption || `${title || 'Field Dispatch'} - Official documentation`,
      },
      ...gallery,
    ];

    const reportRecord: CommunityReport = {
      id: initialReport?.id || `rep-${Date.now()}`,
      title: title || 'Field Engagement Dispatch',
      slug: (title || 'field-report').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      program,
      date,
      location,
      officerName,
      officerRole,
      summary,
      coverImage: finalCover,
      metrics,
      situationOverview,
      actionTaken,
      challengesAndAdaptations,
      communityVoiceQuote: {
        quote:
          quoteText ||
          'This humanitarian initiative brought essential support and social accountability to our community.',
        author: quoteAuthor || 'Community Representative',
        role: quoteRole || 'Resident & Beneficiary',
      },
      photoGallery: fullGallery,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: 'published',
      createdAt: initialReport?.createdAt || new Date().toISOString(),
    };

    onSave(reportRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-sm">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditing ? 'Edit Published Field Report & Photo' : 'Compose CVA / EiE Field Blog Report'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Document humanitarian community engagement, upload field photographs, and record emergency response indicators.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Core Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Citizen Scorecard Dialogue with Local Barangay Council on Health Services"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Sector
                </label>
                <select
                  value={program}
                  onChange={(e) => handleProgramChange(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-900"
                >
                  <option value="cva">Citizen Voice and Action (CVA)</option>
                  <option value="eie">Education in Emergencies (EiE)</option>
                  <option value="integrated">Integrated Community Relief</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Field Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Location / Barangay
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brgy. Langkiwa, Binan, Laguna"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PHOTO UPLOAD SECTION FOR CVA & EDUCATION IN EMERGENCIES                    */}
          {/* ========================================================================= */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Field Documentation Photo (CVA &amp; Education in Emergencies)
                </span>
              </div>
              {coverImage && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Photo Ready</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Photo Preview Card */}
              <div className="w-full sm:w-48 h-36 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex flex-col items-center justify-center relative shadow-2xs group">
                {(() => {
                  const safeCover = coverImage ? sanitizeImageUrl(coverImage) : '';
                  if (safeCover && !photoLoadError) {
                    return (
                      <>
                        <img
                          src={safeCover}
                          alt="Field documentation photo"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setPhotoLoadError(true)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImage('');
                              setPhotoLoadError(false);
                            }}
                            title="Remove Photo"
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-md font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                      <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        {photoLoadError ? 'Image unavailable' : 'No Photo Selected'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Upload a local file or paste link</span>
                    </div>
                  );
                })()}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-3">
                {/* Method Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs w-fit">
                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab('local')}
                    className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                      photoSourceTab === 'local'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Upload Local File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab('drive')}
                    className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                      photoSourceTab === 'drive'
                        ? 'bg-white text-blue-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Drive Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab('presets')}
                    className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                      photoSourceTab === 'presets'
                        ? 'bg-white text-emerald-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Standard Presets</span>
                  </button>
                </div>

                {/* Tab 1: Local File Upload */}
                {photoSourceTab === 'local' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs">
                        <Upload className="w-4 h-4" />
                        <span>{isProcessingPhoto ? 'Processing Photo...' : 'Choose Photo File from Computer'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isProcessingPhoto}
                          onChange={handleLocalPhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {coverImage && (
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                        >
                          Clear Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Upload photos from your field camera or computer (JPG, PNG, WEBP). Stored locally on this workstation and automatically saved to <code className="font-mono text-[10px] bg-slate-200/80 px-1 py-0.5 rounded">C:\WebApp Data\vineyard_masterlist.json</code>.
                    </p>
                  </div>
                )}

                {/* Tab 2: Google Drive Link */}
                {photoSourceTab === 'drive' && (
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Paste Google Drive link (e.g. https://drive.google.com/file/d/FILE_ID/view...)"
                          value={driveUrlInput}
                          onChange={(e) => {
                            setDriveUrlInput(e.target.value);
                            if (driveUrlError) setDriveUrlError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyDriveUrl();
                            }
                          }}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyDriveUrl}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
                      >
                        Apply Link
                      </button>
                    </div>
                    {driveUrlError && (
                      <p className="text-[11px] text-rose-600 font-medium">{driveUrlError}</p>
                    )}
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Paste any Google Drive sharing link. Make sure the file sharing is set to &ldquo;Anyone with the link can view&rdquo;.
                    </p>
                  </div>
                )}

                {/* Tab 3: Standard Presets */}
                {photoSourceTab === 'presets' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-600 font-medium">
                      Select an official field photograph template for this sector:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(PRESET_PHOTOS[program] || PRESET_PHOTOS.cva).map((preset, idx) => {
                        const safePresetUrl = sanitizeImageUrl(preset.url);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCoverImage(preset.url);
                              setPhotoCaption(preset.label);
                              setPhotoLoadError(false);
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                              coverImage === preset.url
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {safePresetUrl ? (
                              <img
                                src={safePresetUrl}
                                alt="Preset field photo"
                                className="w-10 h-10 object-cover rounded shrink-0 border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <span className="line-clamp-2 text-[11px]">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Photo Caption Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Photo Documentation Caption
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Field Officer Jericho verifying Citizen Scorecard feedback with Barangay Council in Towerville."
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Field Photos / Gallery */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Additional Field Documentation Photographs (Optional Gallery)
                </span>
                <label className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Another Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddGalleryPhoto}
                    className="hidden"
                  />
                </label>
              </div>

              {gallery.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {gallery.map((item, gIdx) => {
                    const safeGalleryUrl = sanitizeImageUrl(item.url);
                    return (
                      <div
                        key={gIdx}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5 shadow-2xs"
                      >
                        {safeGalleryUrl ? (
                          <img
                            src={safeGalleryUrl}
                            alt="Gallery photo"
                            className="w-14 h-14 object-cover rounded-md border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-md border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => handleUpdateGalleryCaption(gIdx, e.target.value)}
                            placeholder="Photo caption..."
                            className="w-full text-[11px] px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryPhoto(gIdx)}
                            className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  No additional gallery photos attached. Click &ldquo;Attach Another Photo&rdquo; to add supplementary shots of the emergency classroom or citizen scorecard assembly.
                </p>
              )}
            </div>
          </div>

          {/* Key Quantitative Indicators */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Key Humanitarian Indicators
              </span>
              <button
                type="button"
                onClick={handleAddMetric}
                className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Indicator</span>
              </button>
            </div>

            <div className="space-y-2">
              {metrics.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Metric Label (e.g. Kits Distributed)"
                    value={m.label}
                    onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 240)"
                    value={m.value}
                    onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. learners)"
                    value={m.unit || ''}
                    onChange={(e) => handleMetricChange(idx, 'unit', e.target.value)}
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {metrics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Narrative Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Executive Dispatch Summary
              </label>
              <textarea
                rows={2}
                required
                placeholder="High-level 2-3 sentence overview of this field engagement..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Context & Vulnerability Assessment
              </label>
              <textarea
                rows={3}
                placeholder="Describe why this CVA or EiE response was needed (flooding, crop failure, displacement)..."
                value={situationOverview}
                onChange={(e) => setSituationOverview(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. Operational Action Taken
              </label>
              <textarea
                rows={3}
                placeholder="Details of the field distribution, learning space setup, voucher disbursement, or partner involvement..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                3. Operational Challenges & Adaptations
              </label>
              <textarea
                rows={2}
                placeholder="Key challenges encountered (logistics, weather, electricity) and how the team adapted..."
                value={challengesAndAdaptations}
                onChange={(e) => setChallengesAndAdaptations(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Beneficiary Quote */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Beneficiary Voice / Community Quote
            </span>
            <input
              type="text"
              placeholder='Quote text, e.g. "Receiving the emergency assistance helped us buy medicine..."'
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Speaker Name (e.g. Nanay Corazon)"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Role (e.g. Mother of 3, Farming Household)"
                value={quoteRole}
                onChange={(e) => setQuoteRole(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comma-Separated Topics / Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors text-xs font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes & Photo' : 'Publish Field Dispatch'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
