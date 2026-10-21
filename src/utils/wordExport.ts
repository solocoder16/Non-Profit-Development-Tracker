import { ChildBeneficiary, CommunityReport, VolunteerProfile } from '../types';

function escapeXml(unsafe: string = ''): string {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Universal Word Document (.doc) Downloader
 * Generates an editable Microsoft Word document with proper XML headers and CSS styling.
 * Microsoft Word and Office suites open this directly as native editable document text, not a screenshot.
 */
export function downloadWordDocument(filename: string, title: string, contentHtml: string): void {
  const fileContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeXml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: letter;
      margin: 0.8in 0.8in 0.8in 0.8in;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .org-header {
      border-bottom: 2pt solid #047857;
      padding-bottom: 8pt;
      margin-bottom: 16pt;
    }
    .org-title {
      font-size: 15pt;
      font-weight: bold;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      margin: 0;
    }
    .org-subtitle {
      font-size: 9pt;
      color: #64748b;
      margin: 2pt 0 0 0;
    }
    h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #0f172a;
      margin: 0 0 6pt 0;
      line-height: 1.25;
    }
    h2 {
      font-size: 12pt;
      font-weight: bold;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      border-bottom: 1pt solid #cbd5e1;
      padding-bottom: 3pt;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }
    p {
      margin: 0 0 6pt 0;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0 14pt 0;
    }
    th, td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 8pt;
      font-size: 10pt;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #1e293b;
      width: 25%;
    }
    .metric-table th {
      background-color: #ecfdf5;
      color: #065f46;
      width: auto;
      text-align: center;
    }
    .metric-table td {
      text-align: center;
      font-weight: bold;
      font-size: 12pt;
      color: #0f172a;
    }
    .callout {
      background-color: #f8fafc;
      border-left: 3.5pt solid #059669;
      padding: 10pt 14pt;
      margin: 10pt 0;
      font-style: italic;
    }
    .badge {
      display: inline-block;
      padding: 2pt 6pt;
      font-size: 9pt;
      font-weight: bold;
      border-radius: 3pt;
      background-color: #ecfdf5;
      color: #065f46;
      border: 0.5pt solid #a7f3d0;
    }
    .badge-amber {
      background-color: #fffbeb;
      color: #92400e;
      border: 0.5pt solid #fde68a;
    }
    .footer {
      margin-top: 24pt;
      padding-top: 10pt;
      border-top: 1pt solid #cbd5e1;
      font-size: 9pt;
      color: #64748b;
    }
    .sig-line {
      border-bottom: 1pt solid #334155;
      width: 200pt;
      margin-top: 30pt;
      margin-bottom: 4pt;
    }
    .photo-frame {
      border: 1pt solid #cbd5e1;
      padding: 3pt;
      background: #ffffff;
      width: 140pt;
      height: 140pt;
    }
  </style>
</head>
<body>
${contentHtml}
</body>
</html>`;

  const blob = new Blob(['\ufeff' + fileContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export a ChildLink Beneficiary Dossier to a Clean Microsoft Word Document (.doc)
 */
export function exportChildProfileToWord(child: ChildBeneficiary): void {
  const isSponsored = child.status === 'sponsored';
  const mediaReleaseSigned = child.mediaReleaseFormSigned ?? child.consentSigned ?? true;
  const childProtectionSigned = child.childProtectionPolicySigned ?? true;

  const photoHtml = child.photoUrl
    ? `<img src="${escapeXml(child.photoUrl)}" alt="${escapeXml(child.beneficiaryName)}" width="140" height="140" style="object-fit:cover; border:1pt solid #cbd5e1;" />`
    : `<div style="width:140pt; height:140pt; border:1pt dashed #cbd5e1; display:flex; align-items:center; justify-content:center; text-align:center; font-size:10pt; color:#64748b; padding:10pt;">[ Official Photo On File ]</div>`;

  const contentHtml = `
  <div class="org-header">
    <table style="width:100%; border:none; margin:0;">
      <tr>
        <td style="border:none; padding:0; vertical-align:top;">
          <p class="org-title">NGO Data Tracker · Humanitarian Operations</p>
          <p class="org-subtitle">ChildLink Beneficiary Case Dossier &amp; Sponsorship Record · Air-Gapped Local Archive</p>
        </td>
        <td style="border:none; padding:0; text-align:right; vertical-align:top;">
          <p style="font-size:10pt; font-weight:bold; color:#047857; margin:0;">CODE: ${escapeXml(child.beneficiaryCode)}</p>
          <p style="font-size:9pt; color:#64748b; margin:2pt 0 0 0;">Area: ${escapeXml(child.communityCluster)}</p>
        </td>
      </tr>
    </table>
  </div>

  <table style="width:100%; border:none; margin-bottom:12pt;">
    <tr>
      <td style="border:none; width:160pt; vertical-align:top; padding-right:12pt;">
        ${photoHtml}
        <p style="font-size:9pt; text-align:center; color:#64748b; margin-top:4pt;">Official Case Portrait</p>
      </td>
      <td style="border:none; vertical-align:top;">
        <h1 style="margin:0 0 4pt 0;">${escapeXml(child.beneficiaryName)}</h1>
        <p style="font-size:11pt; color:#475569; margin-bottom:8pt;">
          Known as: <strong>&ldquo;${escapeXml(child.nickname || '—')}&rdquo;</strong> &nbsp;|&nbsp;
          Status: <span class="badge ${isSponsored ? '' : 'badge-amber'}">${escapeXml(child.status.toUpperCase())}</span>
        </p>

        <table>
          <tr>
            <th>Date of Birth</th>
            <td>${escapeXml(child.bday)}</td>
            <th>Current Age</th>
            <td><strong>${child.age} years old</strong></td>
          </tr>
          <tr>
            <th>Grade Level</th>
            <td>${escapeXml(child.gradeLevel)}</td>
            <th>Favorite Subject</th>
            <td>${escapeXml(child.favoriteSubject || '—')}</td>
          </tr>
          <tr>
            <th>Household Chores</th>
            <td colspan="3">${escapeXml(child.householdChores || '—')}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <h2>1. Family Profile &amp; Living Circumstances</h2>
  <table>
    <tr>
      <th>Father's Name &amp; Occupation</th>
      <td>${escapeXml(child.fatherNameOccupation || 'Not reported')}</td>
    </tr>
    <tr>
      <th>Mother's Name &amp; Occupation</th>
      <td>${escapeXml(child.motherNameOccupation || 'Not reported')}</td>
    </tr>
    <tr>
      <th>Siblings</th>
      <td>${escapeXml(child.siblings || 'None listed')}</td>
    </tr>
    <tr>
      <th>Classification of Community</th>
      <td><strong>${escapeXml(child.communityCluster)}</strong></td>
    </tr>
  </table>

  <h2>2. Brief History of the Family &amp; Living Context</h2>
  <div class="callout" style="font-style:normal; line-height:1.6;">
    <p>${escapeXml(child.briefHistoryOfFamily || 'No family history documented.').replace(/\n/g, '<br/>')}</p>
  </div>

  <h2>3. Sponsorship Allocation</h2>
  <table>
    <tr>
      <th>Enrollment Status</th>
      <td><strong>${escapeXml(child.status.toUpperCase())}</strong></td>
      <th>Classification Area</th>
      <td>${escapeXml(child.communityCluster)}</td>
    </tr>
    ${
      isSponsored
        ? `
    <tr>
      <th>Assigned Sponsor Name</th>
      <td>${escapeXml(child.sponsorName || 'Grace Fellowship Outreach')}</td>
      <th>Sponsor Code</th>
      <td>${escapeXml(child.sponsorCode || 'SP-ACTIVE')}</td>
    </tr>`
        : `
    <tr>
      <th>Sponsorship Status</th>
      <td colspan="3">Available for Sponsorship</td>
    </tr>`
    }
  </table>

  <h2>4. Safeguarding Policies &amp; Compliance Sign-offs</h2>
  <table>
    <tr>
      <th>Media Release Form</th>
      <td>
        <strong>${mediaReleaseSigned ? 'SIGNED ON FILE (Approved)' : 'PENDING SIGNATURE'}</strong><br/>
        <span style="font-size:9pt; color:#64748b;">Authorizes program photography and video documentation for reporting and sponsor communication.</span>
      </td>
    </tr>
    <tr>
      <th>Child Protection Policy</th>
      <td>
        <strong>${childProtectionSigned ? 'SIGNED &amp; ACKNOWLEDGED (Compliant)' : 'PENDING ACKNOWLEDGMENT'}</strong><br/>
        <span style="font-size:9pt; color:#64748b;">Signed guardian acknowledgment of Child Protection Policy and zero-tolerance code of conduct.</span>
      </td>
    </tr>
    <tr>
      <th>Data Privacy Compliance</th>
      <td>
        <strong>PROTECTED (Offline Air-Gapped)</strong><br/>
        <span style="font-size:9pt; color:#64748b;">Stored on local workstation disk (C:\\WebApp Data). Republic of the Philippines Data Privacy Act of 2012 (RA 10173).</span>
      </td>
    </tr>
  </table>

  <div class="footer">
    <table style="width:100%; border:none;">
      <tr>
        <td style="border:none; padding:0; vertical-align:bottom;">
          <p style="margin:0; font-weight:bold; color:#334155;">NGO Data Tracker · Humanitarian Operations</p>
          <p style="margin:2pt 0 0 0; font-size:8.5pt; color:#64748b;">Document generated on ${new Date().toLocaleDateString()} · Official Beneficiary Dossier</p>
        </td>
        <td style="border:none; padding:0; text-align:right; vertical-align:bottom;">
          <div class="sig-line" style="margin-left:auto;"></div>
          <p style="margin:0; font-size:9pt; font-weight:bold; color:#334155;">Project Officer Sign-off &amp; Verification</p>
        </td>
      </tr>
    </table>
  </div>
  `;

  const safeName = child.beneficiaryName.replace(/[^a-zA-Z0-9_-]+/g, '_');
  downloadWordDocument(`Dossier_${child.beneficiaryCode}_${safeName}.doc`, `Beneficiary Dossier - ${child.beneficiaryName}`, contentHtml);
}

/**
 * Export a CVA or EiE Field Dispatch to a Clean Microsoft Word Document (.doc)
 */
export function exportCommunityReportToWord(report: CommunityReport): void {
  const isCva = report.program === 'cva';
  const programName = isCva
    ? 'Citizen Voice and Action (CVA)'
    : report.program === 'eie'
    ? 'Education in Emergencies (EiE)'
    : 'Integrated Community Relief';

  const metricsRows = report.metrics
    .map(
      (m) =>
        `<td style="padding:8pt; text-align:center;">
          <div style="font-size:9pt; color:#64748b; margin-bottom:2pt;">${escapeXml(m.label)}</div>
          <div style="font-size:16pt; font-weight:bold; color:#047857;">${escapeXml(m.value)}</div>
          <div style="font-size:8.5pt; color:#065f46; font-weight:bold;">${escapeXml(m.unit || '')}</div>
        </td>`
    )
    .join('');

  const contentHtml = `
  <div class="org-header">
    <table style="width:100%; border:none; margin:0;">
      <tr>
        <td style="border:none; padding:0; vertical-align:top;">
          <p class="org-title">NGO Data Tracker · Humanitarian Operations</p>
          <p class="org-subtitle">Community Field Dispatch · ${escapeXml(programName)}</p>
        </td>
        <td style="border:none; padding:0; text-align:right; vertical-align:top;">
          <p style="font-size:10pt; font-weight:bold; color:#047857; margin:0;">DATE: ${escapeXml(report.date)}</p>
          <p style="font-size:9pt; color:#64748b; margin:2pt 0 0 0;">Location: ${escapeXml(report.location)}</p>
        </td>
      </tr>
    </table>
  </div>

  <h1 style="font-size:20pt; margin-bottom:6pt;">${escapeXml(report.title)}</h1>
  
  <p style="font-size:10pt; color:#64748b; margin-bottom:12pt;">
    Field Officer: <strong>${escapeXml(report.officerName)}</strong> (${escapeXml(report.officerRole)}) &nbsp;|&nbsp;
    Sector: <strong>${escapeXml(programName)}</strong> &nbsp;|&nbsp;
    Target Area: <strong>${escapeXml(report.location)}</strong>
  </p>

  ${
    report.coverImage
      ? `
  <div style="margin: 10pt 0 16pt 0; text-align: center;">
    <img src="${escapeXml(report.coverImage)}" alt="Field Photo" style="max-width: 550pt; max-height: 320pt; width: auto; height: auto; border: 1pt solid #cbd5e1;" /><br/>
    <span style="font-size: 8.5pt; color: #64748b; font-style: italic; display: block; margin-top: 4pt;">
      ${escapeXml(report.photoGallery?.[0]?.caption || 'Official field photography documentation.')}
    </span>
  </div>`
      : ''
  }

  ${
    report.metrics && report.metrics.length > 0
      ? `
  <h2>Key Program &amp; Community Indicators</h2>
  <table class="metric-table" style="margin-bottom:14pt;">
    <tr>${metricsRows}</tr>
  </table>`
      : ''
  }

  <h2>Executive Summary</h2>
  <div class="callout" style="font-style:normal; font-size:11pt; line-height:1.6; background-color:#ecfdf5; border-left:4pt solid #047857;">
    <p><strong>${escapeXml(report.summary)}</strong></p>
  </div>

  <h2>1. Context &amp; Vulnerability Assessment</h2>
  <p>${escapeXml(report.situationOverview).replace(/\n/g, '<br/>')}</p>

  <h2>2. Operational Deployment &amp; Community Action</h2>
  <p>${escapeXml(report.actionTaken).replace(/\n/g, '<br/>')}</p>

  ${
    report.communityVoiceQuote
      ? `
  <h2>3. Community Voice &amp; Beneficiary Testimony</h2>
  <div class="callout" style="font-size:11.5pt; line-height:1.6;">
    <p>&ldquo;${escapeXml(report.communityVoiceQuote.quote)}&rdquo;</p>
    <p style="margin-top:6pt; font-weight:bold; font-style:normal; color:#334155; font-size:10pt;">
      — ${escapeXml(report.communityVoiceQuote.author)}, <span style="font-weight:normal; color:#64748b;">${escapeXml(report.communityVoiceQuote.role)}</span>
    </p>
  </div>`
      : ''
  }

  <h2>4. Operational Challenges &amp; Adaptive Lessons</h2>
  <p>${escapeXml(report.challengesAndAdaptations).replace(/\n/g, '<br/>')}</p>

  <h2>Report Tags &amp; Classification</h2>
  <p style="font-size:10pt; color:#475569;">
    Topics: <strong>${escapeXml(report.tags.join(' · '))}</strong>
  </p>

  <div class="footer">
    <table style="width:100%; border:none;">
      <tr>
        <td style="border:none; padding:0; vertical-align:bottom;">
          <p style="margin:0; font-weight:bold; color:#334155;">NGO Data Tracker · Humanitarian Operations</p>
          <p style="margin:2pt 0 0 0; font-size:8.5pt; color:#64748b;">Field Dispatch archived on local server · C:\\WebApp Data\\vineyard_masterlist.json</p>
        </td>
        <td style="border:none; padding:0; text-align:right; vertical-align:bottom;">
          <div class="sig-line" style="margin-left:auto;"></div>
          <p style="margin:0; font-size:9pt; font-weight:bold; color:#334155;">Project Officer Sign-off</p>
        </td>
      </tr>
    </table>
  </div>
  `;

  const safeTitle = (report.slug || report.title).replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 40);
  downloadWordDocument(`Report_${report.program.toUpperCase()}_${safeTitle}.doc`, report.title, contentHtml);
}

/**
 * Export an Official Volunteer Profile Dossier to Microsoft Word (.doc)
 * Covering all 6 required sections: Profile, Emergency Contact, Track & Availability,
 * Skills Background, Health & Safety, and Character References.
 */
export function exportVolunteerProfileToWord(volunteer: VolunteerProfile): void {
  const engagementLabel =
    volunteer.engagementType === 'long_term'
      ? 'LONG-TERM VOLUNTEER (Sustained Program Engagement)'
      : 'ONE-TIME EVENT VOLUNTEER (Specific Deployment / Disaster Relief)';

  const contentHtml = `
  <div class="org-header">
    <table style="width:100%; border:none; margin:0;">
      <tr>
        <td style="border:none; padding:0; vertical-align:top;">
          <p class="org-title">NGO Data Tracker · Humanitarian Operations</p>
          <p class="org-subtitle">Community Volunteer Management &amp; Field Deployment Office</p>
        </td>
        <td style="border:none; padding:0; text-align:right; vertical-align:top;">
          <p style="font-size:10pt; font-weight:bold; color:#047857; margin:0;">VOLUNTEER ID: ${escapeXml(volunteer.volunteerCode)}</p>
          <p style="font-size:9pt; color:#64748b; margin:2pt 0 0 0;">Enrolled: ${escapeXml(volunteer.enrollmentDate)}</p>
        </td>
      </tr>
    </table>
  </div>

  <h1 style="font-size:18pt; margin-bottom:4pt;">Official Volunteer Record Dossier</h1>
  <p style="font-size:10pt; color:#64748b; margin-bottom:12pt;">
    Humanitarian Corps Volunteer · <strong>${escapeXml(volunteer.fullName)}</strong>
    ${volunteer.preferredName ? ` (Known as &ldquo;${escapeXml(volunteer.preferredName)}&rdquo;)` : ''}
    &nbsp;|&nbsp; Status: <strong>${escapeXml(volunteer.status.toUpperCase())}</strong>
  </p>

  ${
    volunteer.photoUrl
      ? `
  <div style="margin: 8pt 0 14pt 0; text-align: center;">
    <img src="${escapeXml(volunteer.photoUrl)}" alt="Volunteer Photo" style="max-width: 140pt; max-height: 140pt; width: auto; height: auto; border: 1pt solid #cbd5e1; border-radius: 4pt;" />
  </div>`
      : ''
  }

  <h2>1. Volunteer Profile &amp; Identification</h2>
  <table>
    <tr>
      <th style="width:25%;">Full Name</th>
      <td style="width:25%;"><strong>${escapeXml(volunteer.fullName)}</strong></td>
      <th style="width:25%;">Preferred Name / Nickname</th>
      <td style="width:25%;">${escapeXml(volunteer.preferredName || '—')}</td>
    </tr>
    <tr>
      <th>Volunteer Code / ID</th>
      <td><strong>${escapeXml(volunteer.volunteerCode)}</strong></td>
      <th>Engagement Type</th>
      <td><strong style="color:#047857;">${escapeXml(engagementLabel)}</strong></td>
    </tr>
    <tr>
      <th>Date of Birth &amp; Age</th>
      <td>${escapeXml(volunteer.birthdate)} (${volunteer.age} years old)</td>
      <th>Gender</th>
      <td>${escapeXml(volunteer.gender)}</td>
    </tr>
    <tr>
      <th>Mobile Contact</th>
      <td>${escapeXml(volunteer.contactNumber)}</td>
      <th>Email Address</th>
      <td>${escapeXml(volunteer.email)}</td>
    </tr>
    <tr>
      <th>Residential Address</th>
      <td colspan="3">${escapeXml(volunteer.address)}</td>
    </tr>
    <tr>
      <th>Assigned Barangay / Community</th>
      <td><strong>${escapeXml(volunteer.barangayCommunity)}</strong></td>
      <th>Occupation / Profession</th>
      <td>${escapeXml(volunteer.occupation || '—')}</td>
    </tr>
    <tr>
      <th>Enrolling Officer</th>
      <td>${escapeXml(volunteer.enrolledByOfficer)}</td>
      <th>Enrollment Date</th>
      <td>${escapeXml(volunteer.enrollmentDate)}</td>
    </tr>
  </table>

  <h2>2. Emergency Contact Information</h2>
  <table>
    <tr>
      <th style="width:25%;">Primary Contact Person</th>
      <td style="width:25%;"><strong>${escapeXml(volunteer.emergencyContact?.name || '—')}</strong></td>
      <th style="width:25%;">Relationship</th>
      <td style="width:25%;">${escapeXml(volunteer.emergencyContact?.relationship || '—')}</td>
    </tr>
    <tr>
      <th>Primary Phone</th>
      <td><strong>${escapeXml(volunteer.emergencyContact?.primaryPhone || '—')}</strong></td>
      <th>Secondary Phone</th>
      <td>${escapeXml(volunteer.emergencyContact?.secondaryPhone || '—')}</td>
    </tr>
    <tr>
      <th>Emergency Address</th>
      <td colspan="3">${escapeXml(volunteer.emergencyContact?.address || 'Same as volunteer residence')}</td>
    </tr>
  </table>

  <h2>3. Volunteer Track Interest &amp; Availability</h2>
  <table>
    <tr>
      <th style="width:25%;">Interested Program Tracks</th>
      <td colspan="3"><strong>${escapeXml((volunteer.volunteerTracks || []).join(' · ') || 'General Volunteer Pool')}</strong></td>
    </tr>
    <tr>
      <th>Availability Days</th>
      <td>${escapeXml((volunteer.availabilityDays || []).join(', ') || 'Flexible')}</td>
      <th>Weekly Commitment</th>
      <td><strong>${escapeXml(volunteer.availabilityHoursPerWeek || 'As needed')}</strong></td>
    </tr>
    <tr>
      <th>Availability Details / Notes</th>
      <td colspan="3">${escapeXml(volunteer.notesOnAvailability || 'None specified')}</td>
    </tr>
  </table>

  <h2>4. Skills Background &amp; Competencies</h2>
  <table>
    <tr>
      <th style="width:25%;">Core Skills &amp; Talents</th>
      <td colspan="3"><strong>${escapeXml((volunteer.skills || []).join(' · ') || 'General Field Assistance')}</strong></td>
    </tr>
    <tr>
      <th>Educational Attainment</th>
      <td colspan="3">${escapeXml(volunteer.educationLevel)}</td>
    </tr>
    <tr>
      <th>Special Talents / Certifications</th>
      <td colspan="3">${escapeXml(volunteer.specialTalentsOrCertifications || '—')}</td>
    </tr>
    <tr>
      <th>Prior Volunteer / NGO Experience</th>
      <td colspan="3">${escapeXml(volunteer.priorVolunteerExperience || 'No previous NGO experience reported')}</td>
    </tr>
  </table>

  <h2>5. Health, Safety &amp; Reasonable Accommodations</h2>
  <table>
    <tr>
      <th style="width:25%;">Blood Type</th>
      <td style="width:25%;"><strong>${escapeXml(volunteer.bloodType || 'Unknown')}</strong></td>
      <th style="width:25%;">Medical Precautions / Allergies</th>
      <td style="width:25%;">${escapeXml(volunteer.medicalConditionsOrAllergies || 'None declared')}</td>
    </tr>
    <tr>
      <th>Dietary / Physical Limitations</th>
      <td colspan="3">${escapeXml(volunteer.dietaryOrPhysicalLimitations || 'None')}</td>
    </tr>
    <tr>
      <th>Requested Field Accommodations</th>
      <td colspan="3">${escapeXml(volunteer.reasonableAccommodations || 'None required')}</td>
    </tr>
    <tr>
      <th>Child Protection Policy</th>
      <td><strong>${volunteer.childProtectionPolicyAgreed ? 'SIGNED &amp; VERIFIED' : 'PENDING'}</strong></td>
      <th>Volunteer Service Waiver</th>
      <td><strong>${volunteer.volunteerWaiverSigned ? 'SIGNED &amp; VERIFIED' : 'PENDING'}</strong></td>
    </tr>
  </table>

  <h2>6. Character References</h2>
  <table>
    <thead>
      <tr>
        <th>Reference Name</th>
        <th>Relationship &amp; Organization</th>
        <th>Contact Number</th>
        <th>Email Address</th>
      </tr>
    </thead>
    <tbody>
      ${(volunteer.characterReferences || [])
        .map(
          (ref) => `
        <tr>
          <td><strong>${escapeXml(ref.name)}</strong></td>
          <td>${escapeXml(ref.relationship)} (${escapeXml(ref.organization)})</td>
          <td>${escapeXml(ref.phone)}</td>
          <td>${escapeXml(ref.email || '—')}</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <table style="width:100%; border:none;">
      <tr>
        <td style="border:none; padding:0; vertical-align:bottom;">
          <p style="margin:0; font-weight:bold; color:#334155;">NGO Data Tracker · Humanitarian Operations</p>
          <p style="margin:2pt 0 0 0; font-size:8.5pt; color:#64748b;">Volunteer record archived on local server · C:\\WebApp Data\\vineyard_masterlist.json</p>
        </td>
        <td style="border:none; padding:0; text-align:right; vertical-align:bottom;">
          <div class="sig-line" style="margin-left:auto;"></div>
          <p style="margin:0; font-size:9pt; font-weight:bold; color:#334155;">Enrolling Project Officer Sign-off</p>
        </td>
      </tr>
    </table>
  </div>
  `;

  const safeName = volunteer.fullName.replace(/[^a-zA-Z0-9_-]+/g, '_');
  downloadWordDocument(`Volunteer_${volunteer.volunteerCode}_${safeName}.doc`, `Volunteer Dossier - ${volunteer.fullName}`, contentHtml);
}

