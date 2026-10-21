import React, { useEffect, useState } from 'react';
import { fetchServerStorageInfo, StorageInfoResponse } from '../utils/storage';
import {
  X,
  HardDrive,
  Database,
  ShieldCheck,
  Download,
  Folder,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Save,
  Laptop,
} from 'lucide-react';

interface StorageLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageLocationModal: React.FC<StorageLocationModalProps> = ({ isOpen, onClose }) => {
  const [info, setInfo] = useState<StorageInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchServerStorageInfo().then((res) => {
        setInfo(res);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText('C:\\WebApp Data');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveDirectlyToFolder = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      const content = JSON.stringify(data, null, 2);

      // Check if browser supports File System Access API (Chrome, Edge, Opera)
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'vineyard_masterlist.json',
          types: [
            {
              description: 'JSON Masterlist Database File',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        setSaveStatus('Success! vineyard_masterlist.json was saved directly to your selected folder.');
        setTimeout(() => setSaveStatus(null), 6000);
      } else {
        // Fallback: standard file download
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'vineyard_masterlist.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSaveStatus('Downloaded vineyard_masterlist.json. You can now move it to C:\\WebApp Data.');
        setTimeout(() => setSaveStatus(null), 6000);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('File save error:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-sm">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Masterlist Storage Location</h2>
              <p className="text-xs text-slate-500">Local server physical database &amp; browser cache inspection</p>
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Explanation Alert: Why is it not automatically in C:\ yet? */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5">
                <span className="font-bold text-blue-900 block text-sm">
                  Why isn&apos;t the file on your local C:\ drive automatically?
                </span>
                <p className="text-blue-800 leading-relaxed">
                  You are currently accessing this application through a <strong>web browser via cloud preview</strong>. For your computer&apos;s security, web browsers (Chrome, Edge, Firefox) have a strict security sandbox that <em>prohibits any website on the internet from silently creating folders or writing files directly to your C:\ drive in the background without your explicit action</em>.
                </p>
                <p className="text-blue-800 leading-relaxed">
                  To place the masterlist file onto your computer&apos;s <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono font-bold text-blue-950">C:\WebApp Data</code> folder, use the one-click button below.
                </p>
              </div>
            </div>

            {/* Direct Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveDirectlyToFolder}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Masterlist File to C:\WebApp Data on This PC</span>
              </button>
              {saveStatus && (
                <p className="text-xs text-emerald-800 font-semibold mt-2 text-center animate-fadeIn">
                  ✓ {saveStatus}
                </p>
              )}
            </div>
          </div>

          {/* Primary File Location Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <FileJson className="w-4 h-4 text-emerald-700" />
                <span>1. Configured Windows Primary Disk File</span>
              </div>
              <button
                type="button"
                onClick={handleCopyPath}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-white px-2 py-1 rounded border border-emerald-200 cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Path'}</span>
              </button>
            </div>

            <div className="p-3 bg-white rounded-lg border border-emerald-200 font-mono text-xs text-emerald-900 font-bold break-all select-all">
              C:\WebApp Data\vineyard_masterlist.json
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-1">
              <p>
                <strong>Server Primary Directory:</strong> <code className="font-mono text-emerald-800 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">C:\WebApp Data</code>
              </p>
              <p>
                <strong>Masterlist Database File:</strong> <code className="font-mono text-slate-800 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">C:\WebApp Data\vineyard_masterlist.json</code>
              </p>
              {info?.fileSizeFormatted && (
                <p>
                  <strong>Current Active Database Size:</strong> <span className="font-mono text-slate-700">{info.fileSizeFormatted}</span>
                </p>
              )}
              {info?.lastModified && (
                <p>
                  <strong>Last Updated:</strong> <span className="text-slate-700">{new Date(info.lastModified).toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Local Workstation Node Server Deployment Note */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider">
              <Laptop className="w-4 h-4 text-emerald-700" />
              <span>Direct Real-Time Disk Sync (Local Node Server)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              When running this project locally on your Windows machine (via <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-800">node server.ts</code> or <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-800">npm run dev</code>), the Node.js server runs with native Windows OS file permissions, automatically creating <code className="font-mono text-emerald-800 font-bold">C:\WebApp Data</code> and writing to <code className="font-mono text-emerald-800 font-bold">vineyard_masterlist.json</code> on every change without needing browser downloads!
            </p>
          </div>

          {/* Secondary Offline Browser Cache */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Database className="w-4 h-4 text-slate-600" />
                <span>2. In-Browser Offline Fallback Mirror</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Local Device Cache</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
              localStorage[&apos;vineyard_children_data&apos;]
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Maintains an instant zero-latency mirror cache in your browser so field officers can continue logging and updating records even if offline.
            </p>
          </div>

          {/* Logo Location Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Folder className="w-4 h-4 text-emerald-700" />
                <span>3. Configured Logo File Location</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0">
                <img
                  src="/api/logo"
                  alt="NGO Data Tracker Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1">
                <span className="text-[11px] text-slate-500 block mb-0.5">Windows Server Path:</span>
                <code className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block break-all select-all">
                  C:\WebApp Data\Logo\NGO Data Tracker Logo.png
                </code>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Served by the local Express backend via <code className="text-slate-700 font-mono">/api/logo</code> with automatic fallback to built-in vector SVG emblem.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleSaveDirectlyToFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Masterlist File</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
