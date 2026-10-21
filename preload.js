/**
 * Electron Preload Script - NGO Data Tracker
 * Exposes strict, safe contextBridge API with contextIsolation enabled
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Authentication & Master Passphrase
  isFirstLaunch: () => ipcRenderer.invoke('auth:is-first-launch'),
  setupMasterPassword: (masterPassword) => ipcRenderer.invoke('auth:setup-master-password', masterPassword),
  unlockDatabase: (masterPassword) => ipcRenderer.invoke('auth:unlock-database', masterPassword),

  // Database Operations (Beneficiaries)
  getBeneficiaries: () => ipcRenderer.invoke('db:get-beneficiaries'),
  addBeneficiary: (beneficiary) => ipcRenderer.invoke('db:add-beneficiary', beneficiary),
  deleteBeneficiary: (id, name, reason) => ipcRenderer.invoke('db:delete-beneficiary', { id, name, reason }),

  // System Administration & Physical Backups
  exportEncryptedDatabase: () => ipcRenderer.invoke('db:export-database'),
  importEncryptedDatabase: (passphrase) => ipcRenderer.invoke('db:import-database', passphrase),

  // RA 10173 Audit Trail Access
  getAuditLogs: () => ipcRenderer.invoke('audit:get-logs'),

  // Environment Information
  platform: process.platform,
  isElectron: true,
});
