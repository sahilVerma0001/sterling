/**
 * Application Packet PDF Generator (12-Page Format)
 * Matches ISC application packet format with Capital & Co branding
 */

interface ApplicationPacketData {
  // Application Metadata
  applicationId: string;
  submissionId: string;
  formDate: string;
  
  // Agency Information
  agencyName: string;
  agencyContactName: string;
  agencyAddress: string;
  agencyCity: string;
  agencyState: string;
  agencyZip: string;
  agencyPhone: string;
  agencyEmail: string;
  
  // Applicant/Insured Information
  companyName: string;
  dba?: string;
  contactPerson: string;
  applicantAddress: string;
  applicantCity: string;
  applicantState: string;
  applicantZip: string;
  applicantPhone: string;
  applicantEmail: string;
  fein: string;
  entityType: string;
  yearsInBusiness: number;
  yearsExperienceInTrades: number;
  statesOfOperation: string;
  workIn5Boroughs: boolean;
  otherBusinessNames?: string;
  paymentOption: string;
  
  // Quote Information
  quoteType: string;
  carrierName: string;
  coverageType: string;
  desiredCoverageDates: string;
  
  // General Liability Coverages
  aggregateLimit: string;
  occurrenceLimit: string;
  productsCompletedOpsLimit: string;
  personalAdvertisingInjuryLimit: string;
  fireLegalLimit: string;
  medPayLimit: string;
  selfInsuredRetention: string;
  
  // Class Code & Gross Receipts
  classCode: string;
  grossReceipts: string;
  
  // Current Exposures
  estimatedTotalGrossReceipts: string;
  estimatedSubContractingCosts: string;
  estimatedMaterialCosts: string;
  estimatedTotalPayroll: string;
  numberOfFieldEmployees: string; // Format: "Owner + X"
  
  // Work Performed
  workDescription: string;
  percentageResidential: number;
  percentageCommercial: number;
  percentageNewConstruction: number;
  percentageRemodel: number;
  maxInteriorStories: number;
  maxExteriorStories: number;
  maxExteriorDepthBelowGrade: number;
  performOCIPWork: boolean;
  ocipReceipts?: string;
  nonOCIPReceipts?: string;
  lossesInLast5Years: number;
  
  // Work Experience Questions (Yes/No with explanations)
  performHazardousWork?: boolean;
  hazardousWorkExplanation?: string;
  performMedicalFacilitiesWork?: boolean;
  medicalFacilitiesExplanation?: string;
  performStructuralWork?: boolean;
  performTractHomeWork?: boolean;
  tractHomeExplanation?: string;
  workCondoConstruction?: boolean;
  performCondoRepairOnly?: boolean;
  performRoofingOps?: boolean;
  roofingExplanation?: string;
  performWaterproofing?: boolean;
  waterproofingExplanation?: string;
  useHeavyEquipment?: boolean;
  heavyEquipmentExplanation?: string;
  workOver5000SqFt?: boolean;
  workOver5000SqFtPercent?: number;
  workOver5000SqFtExplanation?: string;
  workCommercialOver20000SqFt?: boolean;
  commercialOver20000SqFtPercent?: number;
  commercialOver20000SqFtExplanation?: string;
  licensingActionTaken?: boolean;
  licensingActionExplanation?: string;
  allowedLicenseUseByOthers?: boolean;
  licenseUseExplanation?: string;
  judgementsOrLiens?: boolean;
  judgementsExplanation?: string;
  lawsuitsFiled?: boolean;
  lawsuitsExplanation?: string;
  awareOfPotentialClaims?: boolean;
  potentialClaimsExplanation?: string;
  
  // Written Contract Questions
  haveWrittenContract?: boolean;
  contractHasStartDate?: boolean;
  contractStartDateExplanation?: string;
  contractHasScopeOfWork?: boolean;
  contractScopeExplanation?: string;
  contractIdentifiesSubcontractedTrades?: boolean;
  contractSubcontractedTradesExplanation?: string;
  contractHasSetPrice?: boolean;
  contractSetPriceExplanation?: string;
  contractSignedByAllParties?: boolean;
  contractSignedExplanation?: string;
  doSubcontractWork?: boolean;
  alwaysCollectCertificatesFromSubs?: boolean;
  collectCertificatesExplanation?: string;
  requireSubsEqualInsuranceLimits?: boolean;
  subsEqualLimitsExplanation?: string;
  requireSubsNameAsAdditionalInsured?: boolean;
  subsAdditionalInsuredExplanation?: string;
  haveStandardFormalAgreementWithSubs?: boolean;
  standardAgreementExplanation?: string;
  agreementHasHoldHarmless?: boolean;
  holdHarmlessExplanation?: string;
  requireSubsWorkersComp?: boolean;
  subsWorkersCompExplanation?: string;
  
  // Policy Endorsements
  policyEndorsements?: string;
  
  // Application Agreement - Signatures
  applicantSignature?: string;
  applicantSignatureDate?: string;
  applicantTitle?: string;
  producerSignature?: string;
  producerSignatureDate?: string;
  
  // Page 9: Disclosure of Premium
  terrorismCoveragePremium?: string;
  rejectionStatementSignature?: string;
  rejectionStatementDate?: string;
  rejectionStatementPrintedName?: string;
  
  // Page 10: Surplus Lines Compliance
  policyNumber?: string;
  surplusLinesSignature?: string;
  surplusLinesDate?: string;
  
  // Page 11: Loss Warranty Letter
  lossWarrantyCompanySignature?: string;
  lossWarrantyDate?: string;
  lossWarrantySignature?: string;
  lossWarrantyTitle?: string;
  
  // Page 12: Invoice Statement
  programName?: string;
  premium?: string;
  stateTax?: string;
  associationDues?: string;
  policyFee?: string;
  inspectionFee?: string;
  totalCostOfPolicy?: string;
  depositPremium?: string;
  depositAssociationDues?: string;
  depositStateTax?: string;
  depositPolicyFee?: string;
  depositInspectionFee?: string;
  aiProcessingFee?: string;
  totalDeposit?: string;
  totalToRetain?: string;
  totalToBeSent?: string;
  invoiceProducerSignature?: string;
}

/**
 * Generate QR code URL (using a QR code API service)
 * For PDFShift compatibility, we use smaller size or text-only in production
 */
function generateQRCodeURL(text: string, size: number = 100, useTextFallback: boolean = false): string {
  // In production/PDFShift, use text-only to reduce size
  if (useTextFallback || process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return ''; // Return empty to use text-only fallback
  }
  // Using a free QR code API - smaller size for better compatibility
  return `https://api.qrserver.com/v1/create-qr-code/?size=${Math.min(size, 60)}x${Math.min(size, 60)}&data=${encodeURIComponent(text)}`;
}

/**
 * Format Yes/No with underline for selected option
 */
function formatYesNo(value: boolean | undefined, defaultValue: boolean = false): string {
  const isYes = value ?? defaultValue;
  return isYes 
    ? '<span style="text-decoration: underline;">Yes</span> <span>No</span>'
    : '<span>Yes</span> <span style="text-decoration: underline;">No</span>';
}

/**
 * Generate Page 1: Bind Request Checklist
 */
// Helper function to generate QR code HTML (text-only for production to reduce size)
function generateQRCodeHTML(text: string, size: number = 80): string {
  const qrUrl = generateQRCodeURL(text, size, true);
  if (qrUrl) {
    return `<div class="qr-code"><img src="${qrUrl}" alt="QR Code" /></div>`;
  }
  return `<div class="qr-code-text-only">${text}</div>`;
}

function generatePage1(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P1`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title">Bind Request Checklist</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Producer</div>
        </div>
      </div>
      <div class="main-content">
        <div class="header-info">
          <div class="broker-name">${data.agencyName}</div>
          <div class="applicant-name">${data.companyName}</div>
          <div class="application-id">Application ID: ${data.applicationId}</div>
        </div>
        <div class="instructions">
          <p>Thank you for your business. In order to expedite your request efficiently, we will need you to submit the following documents:</p>
        </div>
        <div class="checklist">
          <div class="checklist-item">☐ Signed Application</div>
          <div class="checklist-item">☐ Signed Loss Warranty Letter</div>
          <div class="checklist-item">☐ Signed Terrorism Coverage Disclosure Notice</div>
          <div class="checklist-item">☐ Signed Surplus Lines Affidavit</div>
          <div class="checklist-item">☐ Copy of Applicant Contractor License (If Applicable)</div>
          <div class="checklist-item">☐ Signed Invoice Statement</div>
          <div class="checklist-item">☐ Signed Finance Agreement</div>
        </div>
        <div class="submission-instructions">
          <p>Please submit complete and approved apps by visiting the application detail page for App ${data.applicationId} and uploading the above documents.</p>
        </div>
        <div class="binding-instructions">
          <p>All documents must be submitted to be bound by Integrated Specialty Coverages, LLC, no binds are in effect until Broker receives confirmation from Integrated Specialty Coverages, LLC via email.</p>
        </div>
        <div class="page-number">Page 1 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 2: Insurance Application - Header, Applicant Info, Quote Info, Coverages
 */
function generatePage2(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P2`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Insurance Application</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="header-section">
          <div class="header-left">
            <div class="logo-small">C&C</div>
            <div class="agency-info">
              <div class="agency-name">${data.agencyName}</div>
              <div class="agency-contact">${data.agencyContactName}</div>
              <div class="agency-address">${data.agencyAddress}</div>
              <div class="agency-city-state-zip">${data.agencyCity}, ${data.agencyState} ${data.agencyZip}</div>
              <div class="agency-phone">${data.agencyPhone}</div>
              <div class="agency-email">email: ${data.agencyEmail}</div>
            </div>
          </div>
          <div class="header-right">
            <div class="logo-small">C&C</div>
            <div class="brand-name">Capital & Co</div>
            <div class="brand-subtitle">Insurance Services</div>
          </div>
        </div>
        
        <div class="application-id-section">
          <strong>General Liability Application ID:</strong> ${data.applicationId}
        </div>
        
        <div class="two-column-section">
          <div class="column-left">
            <div class="field-row">
              <strong>Date</strong> ${data.formDate}
            </div>
          </div>
          <div class="column-right">
            <div class="section-title">Insured Information</div>
            <div class="field-value">${data.companyName}</div>
            <div class="field-value">${data.contactPerson}</div>
            <div class="field-value">${data.applicantAddress}</div>
            <div class="field-value">${data.applicantCity}, ${data.applicantState} ${data.applicantZip}</div>
            <div class="field-value">${data.applicantPhone}</div>
            <div class="field-value">email: ${data.applicantEmail}</div>
          </div>
        </div>
        
        <div class="quote-information-section">
          <div class="section-title">Quote Information</div>
          <div class="field-row">
            <strong>Type:</strong> ${data.quoteType}
          </div>
          <div class="field-row">
            <strong>Carrier:</strong> ${data.carrierName}
          </div>
          <div class="field-row">
            <strong>Coverage Type:</strong> ${data.coverageType}
          </div>
          <div class="field-row">
            <strong>Desired Coverage Dates:</strong> ${data.desiredCoverageDates}
          </div>
        </div>
        
        <div class="applicant-information-section">
          <div class="section-title-underline">APPLICANT INFORMATION</div>
          <div class="field-row">
            <strong>Mailing Address:</strong> ${data.applicantAddress}
          </div>
          <div class="field-row">
            <strong>FEIN:</strong> ${data.fein || 'N/A'}
          </div>
          <div class="field-row">
            <strong>Entity of Company:</strong> ${data.entityType}
          </div>
          <div class="field-row">
            <strong>Years in Business:</strong> ${data.yearsInBusiness}
          </div>
          <div class="field-row">
            <strong>Years of experience in the Trades for which you are applying for insurance:</strong> ${data.yearsExperienceInTrades}
          </div>
          <div class="field-row">
            <strong>States in which you do business that for which you are currently applying for insurance:</strong> ${data.statesOfOperation}
          </div>
          <div class="field-row">
            <strong>Will any of your work be performed in the 5 boroughs:</strong> ${data.workIn5Boroughs ? 'Yes' : 'No'}
          </div>
          <div class="field-row">
            <strong>Are there any other business names which you have used in the past or are currently using in addition to that for which you're currently applying for insurance?</strong> ${data.otherBusinessNames || 'No'}
          </div>
          <div class="field-row">
            <strong>Payment Option Details:</strong> ${data.paymentOption}
          </div>
        </div>
        
        <div class="coverages-section">
          <div class="section-title-underline">GENERAL LIABILITY COVERAGES</div>
          <div class="coverages-grid">
            <div class="coverage-item">
              <strong>Aggregate:</strong> ${data.aggregateLimit}
            </div>
            <div class="coverage-item">
              <strong>Occurrence:</strong> ${data.occurrenceLimit}
            </div>
            <div class="coverage-item">
              <strong>Products/Completed Operations:</strong> ${data.productsCompletedOpsLimit}
            </div>
            <div class="coverage-item">
              <strong>Personal/Advertising Injury:</strong> ${data.personalAdvertisingInjuryLimit}
            </div>
            <div class="coverage-item">
              <strong>Fire Legal:</strong> ${data.fireLegalLimit}
            </div>
            <div class="coverage-item">
              <strong>Med Pay:</strong> ${data.medPayLimit}
            </div>
            <div class="coverage-item">
              <strong>Self-Insured Retention:</strong> ${data.selfInsuredRetention}
            </div>
          </div>
        </div>
        
        <div class="class-code-section">
          <div class="class-code-left">
            <div class="section-title">CLASS CODE</div>
            <div class="field-value-large">${data.classCode}</div>
          </div>
          <div class="class-code-right">
            <div class="section-title">GROSS RECEIPTS</div>
            <div class="field-value-large">${data.grossReceipts}</div>
          </div>
        </div>
        
        <div class="page-number">Page 2 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 3: Current Exposures, Work Performed, Work Experience
 */
function generatePage3(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P3`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Insurance Application</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="section-title-uppercase">CURRENT EXPOSURES</div>
        <div class="exposures-grid">
          <div class="exposure-item">
            <strong>Estimated Total Gross Receipts:</strong> ${data.estimatedTotalGrossReceipts}
          </div>
          <div class="exposure-item">
            <strong>Estimated Sub Contracting Costs:</strong> ${data.estimatedSubContractingCosts}
          </div>
          <div class="exposure-item">
            <strong>Estimated Material Costs:</strong> ${data.estimatedMaterialCosts}
          </div>
          <div class="exposure-item">
            <strong>Estimated Total Payroll:</strong> ${data.estimatedTotalPayroll}
          </div>
          <div class="exposure-item">
            <strong>Number of Field Employees*:</strong> ${data.numberOfFieldEmployees}
          </div>
        </div>
        <div class="footnote">
          * For purposes of this application, "Employee" is defined as an individual working for you (the applicant), which receives a W-2 tax form or you withhold & pay employment related taxes for that individual.
        </div>
        
        <div class="section-title-uppercase">WORK PERFORMED</div>
        <div class="work-description">
          <strong>Complete Descriptions of operations that for which you are currently applying for insurance:</strong>
          <div class="description-text">${data.workDescription || ''}</div>
        </div>
        <div class="work-percentages">
          <div class="percentage-item">
            <strong>Percentage of Residential work performed:</strong> ${data.percentageResidential}%
          </div>
          <div class="percentage-item">
            <strong>Percentage of Commercial work performed:</strong> ${data.percentageCommercial}%
          </div>
          <div class="percentage-item">
            <strong>Percentage of New (Ground Up) work performed:</strong> ${data.percentageNewConstruction}%
          </div>
          <div class="percentage-item">
            <strong>Percentage of Remodel/Service/Repair work performed:</strong> ${data.percentageRemodel}%
          </div>
        </div>
        <div class="structural-details">
          <div class="detail-item">
            <strong>Maximum # of Interior Stories:</strong> ${data.maxInteriorStories}
          </div>
          <div class="detail-item">
            <strong>Maximum # of Exterior Stories:</strong> ${data.maxExteriorStories}
          </div>
          <div class="detail-item">
            <strong>Maximum Exterior Depth Below Grade in Feet:</strong> ${data.maxExteriorDepthBelowGrade}
          </div>
        </div>
        <div class="ocip-section">
          <div class="ocip-question">
            <strong>Will you perform OCIP (Wrap-up) work:</strong> ${formatYesNo(data.performOCIPWork)}
          </div>
          ${data.performOCIPWork ? `
          <div class="ocip-followup">
            <strong>If "Yes", what are the estimated receipts for work covered separately under OCIP/Wrap-up:</strong> ${data.ocipReceipts || ''}
          </div>
          ` : ''}
          <div class="ocip-receipts">
            <strong>Estimated Receipts for non-Wrap/OCIP:</strong> ${data.nonOCIPReceipts || ''}
          </div>
          <div class="losses">
            <strong>Number of losses in the last 5 years:</strong> ${data.lossesInLast5Years}
          </div>
        </div>
        
        <div class="section-title-uppercase">WORK EXPERIENCE</div>
        <div class="work-experience-questions">
          <div class="question-item">
            <div class="question-text">
              Will you or do you perform or subcontract any work involving the following: blasting operations, hazardous waste, asbestos, mold, PCBs, oil fields, dams/levees, bridges, quarries, railroads, earthquake retrofitting, fuel tanks, pipelines, or foundation repair?
            </div>
            <div class="yes-no-options">${formatYesNo(data.performHazardousWork)}</div>
            ${data.performHazardousWork ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.hazardousWorkExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              Will you or do you perform or subcontract any work involving the following: medical facilities (including new construction), hospitals (including new construction), churches or other house of worship, museums, historic buildings, airports, schools/playgrounds/recreational facilities (including new construction)?
            </div>
            <div class="yes-no-options">${formatYesNo(data.performMedicalFacilitiesWork)}</div>
            ${data.performMedicalFacilitiesWork ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.medicalFacilitiesExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Will you perform structural work?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.performStructuralWork)}</div>
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Will you perform work in new tract home developments of 25 or more units?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.performTractHomeWork)}</div>
            ${data.performTractHomeWork ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.tractHomeExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Will any of your work involve the construction of or be for new condominiums/townhouses/multi-unit residences?:</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.workCondoConstruction)}</div>
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Will you perform repair only for individual unit owners of condominiums/townhouses/multi-unit residences?:</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.performCondoRepairOnly)}</div>
          </div>
        </div>
        
        <div class="page-number">Page 3 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 4: Work Experience - Continued
 */
function generatePage4(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P4`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Insurance Application</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="section-title-uppercase">WORK EXPERIENCE - CONT.</div>
        
        <div class="work-experience-questions">
          <div class="question-item">
            <div class="question-text">
              <strong>Will you perform or subcontract any roofing operations, work on the roof or deck work on roofs?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.performRoofingOps)}</div>
            ${data.performRoofingOps ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.roofingExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Does your company perform any waterproofing?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.performWaterproofing)}</div>
            ${data.performWaterproofing ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.waterproofingExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Do you use motorized or heavy equipment in any of your operations?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.useHeavyEquipment)}</div>
            ${data.useHeavyEquipment ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.heavyEquipmentExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Will you perform work (new/remodel) on single family residences, in which the dwelling exceeds 5,000 square feet?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.workOver5000SqFt)}</div>
            ${data.workOver5000SqFt ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.workOver5000SqFtExplanation || ''}
            </div>
            ` : ''}
            <div class="percentage-field">
              <strong>What percentage of your work will be on homes over 5,000 square feet:</strong> ${data.workOver5000SqFtPercent || 0}%
            </div>
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Will you perform work on commercial buildings over 20,000 square feet?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.workCommercialOver20000SqFt)}</div>
            ${data.workCommercialOver20000SqFt ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.commercialOver20000SqFtExplanation || ''}
            </div>
            ` : ''}
            <div class="percentage-field">
              <strong>What percentage of your work will be on commercial buildings over 20,000 square feet:</strong> ${data.commercialOver20000SqFtPercent || 0}%
            </div>
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Has any licensing authority taken any action against you, your company or any affiliates?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.licensingActionTaken)}</div>
            ${data.licensingActionTaken ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.licensingActionExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Have you allowed or will you allow your license to be used by any other contractor?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.allowedLicenseUseByOthers)}</div>
            ${data.allowedLicenseUseByOthers ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.licenseUseExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Has the applicant or business owner ever had any judgements or liens filed against them or filed for bankruptcy?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.judgementsOrLiens)}</div>
            ${data.judgementsOrLiens ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.judgementsExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Has any lawsuit ever been filed or any claim otherwise been made against your company (including any partnership or any joint venture of which you have been a member of, any of your company's predecessors, or any person, company or entities on whose behalf your company has assumed liability)? (For the purposes of this application, a claim means a receipt of a demand for money, services or arbitration.)</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.lawsuitsFiled)}</div>
            ${data.lawsuitsFiled ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.lawsuitsExplanation || ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Is your company aware of any facts, circumstances, incidents, situations, damages or accidents (including but not limited to: faulty or defective workmanship, product failure, construction dispute, property damage or construction worker injury) that a reasonably prudent person might expect to give rise to a claim or lawsuit, whether valid or not, which might directly or indirectly involve the company? (For the purposes of this application, a claim means a receipt of a demand for money, services or arbitration.)</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.awareOfPotentialClaims)}</div>
            ${data.awareOfPotentialClaims ? `
            <div class="explanation-field">
              <strong>If "Yes", please explain:</strong> ${data.potentialClaimsExplanation || ''}
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="page-number">Page 4 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 5: Written Contract & Policy Endorsements
 */
function generatePage5(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P5`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Insurance Application</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="section-title-uppercase">WRITTEN CONTRACT</div>
        
        <div class="work-experience-questions">
          <div class="question-item">
            <div class="question-text">
              <strong>Do you have a written contract for all work you perform?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.haveWrittenContract)}</div>
            ${data.haveWrittenContract ? `
            <div class="sub-question-header">If "Yes", answer the following questions:</div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Does the contract identify a start date for the work?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.contractHasStartDate, true)}</div>
              ${!data.contractHasStartDate ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.contractStartDateExplanation || ''}
              </div>
              ` : ''}
            </div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Does the contract identify a precise scope of work?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.contractHasScopeOfWork, true)}</div>
              ${!data.contractHasScopeOfWork ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.contractScopeExplanation || ''}
              </div>
              ` : ''}
            </div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Does the contract identify all subcontracted trades (if any)?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.contractIdentifiesSubcontractedTrades, true)}</div>
              ${!data.contractIdentifiesSubcontractedTrades ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.contractSubcontractedTradesExplanation || ''}
              </div>
              ` : ''}
            </div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Does the contract provide a set price?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.contractHasSetPrice, true)}</div>
              ${!data.contractHasSetPrice ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.contractSetPriceExplanation || ''}
              </div>
              ` : ''}
            </div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Is the contract signed by all parties to the contract?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.contractSignedByAllParties, true)}</div>
              ${!data.contractSignedByAllParties ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.contractSignedExplanation || ''}
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
          
          <div class="question-item">
            <div class="question-text">
              <strong>Do you subcontract work?</strong>
            </div>
            <div class="yes-no-options">${formatYesNo(data.doSubcontractWork)}</div>
            ${data.doSubcontractWork ? `
            <div class="sub-question-header">If "Yes", answer the following questions:</div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Do you always collect certificates of insurance from subcontractors?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.alwaysCollectCertificatesFromSubs, true)}</div>
              ${!data.alwaysCollectCertificatesFromSubs ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.collectCertificatesExplanation || ''}
              </div>
              ` : ''}
            </div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Do you require subcontractors to have insurance limits equal to your own?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.requireSubsEqualInsuranceLimits, true)}</div>
              ${!data.requireSubsEqualInsuranceLimits ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.subsEqualLimitsExplanation || ''}
              </div>
              ` : ''}
            </div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Do you always require subcontractors to name you as additional insured?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.requireSubsNameAsAdditionalInsured, true)}</div>
              ${!data.requireSubsNameAsAdditionalInsured ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.subsAdditionalInsuredExplanation || ''}
              </div>
              ` : ''}
            </div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Do you have a standard formal agreement with subcontractors?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.haveStandardFormalAgreementWithSubs, true)}</div>
              ${!data.haveStandardFormalAgreementWithSubs ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.standardAgreementExplanation || ''}
              </div>
              ` : ''}
              ${data.haveStandardFormalAgreementWithSubs ? `
              <div class="sub-question-item">
                <div class="question-text">
                  <strong>If "Yes", does it have a hold harmless/indemnification agreement in your favor?</strong>
                </div>
                <div class="yes-no-options">${formatYesNo(data.agreementHasHoldHarmless, true)}</div>
                ${!data.agreementHasHoldHarmless ? `
                <div class="explanation-field">
                  <strong>If "No", please explain:</strong> ${data.holdHarmlessExplanation || ''}
                </div>
                ` : ''}
              </div>
              ` : ''}
            </div>
            
            <div class="sub-question-item">
              <div class="question-text">
                <strong>Do you require subcontractors to carry Worker's Compensation?</strong>
              </div>
              <div class="yes-no-options">${formatYesNo(data.requireSubsWorkersComp, true)}</div>
              ${!data.requireSubsWorkersComp ? `
              <div class="explanation-field">
                <strong>If "No", please explain:</strong> ${data.subsWorkersCompExplanation || ''}
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="section-title-uppercase" style="margin-top: 0.3in;">POLICY ENDORSEMENTS</div>
        <div class="policy-endorsements-content">
          ${data.policyEndorsements || 'Blanket AI + PW + WOS'}
        </div>
        
        <div class="page-number">Page 5 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 6: Notice & Policy Exclusions
 */
function generatePage6(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P6`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Insurance Application</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="section-title-uppercase">NOTICE</div>
        
        <div class="notice-content">
          <p>This is a quotation only. No coverage is in effect until an application is approved and policy binder is received. This policy is issued by your insurance company. Nothing is bound until final underwriting approval. Your insurance company may not be subject to all of the insurance laws and regulations of your state. State insurance insolvency guaranty funds may not available. Therefore please consult with your insurance agent for further information.</p>
          
          <p>Please note that your policy is subject to audit. Audits are routinely performed and specifically provided for in the policy. The initial premium is regarded as a deposit premium only since the underwriters are relying on the accuracy of the information provided by the insured. This includes the estimated gross receipts. Thus, the audit is necessary to verify the financial information provided since the premium is based upon these representations. ${data.carrierName} policies are audited by Zoom Professional Services. Zoom is the authorized representative in regard to your policy audit. We appreciate your anticipated cooperation.</p>
        </div>
        
        <div class="initial-line">
          Initial: _________________________
        </div>
        
        <div class="section-title-uppercase" style="margin-top: 0.3in;">POLICY EXCLUSIONS</div>
        
        <div class="exclusions-content">
          <p><strong>Section I – Coverages, Coverage A – Bodily Injury and Property Damage Liability:</strong> Expected or Intended Injury; Action Over; Worker's Compensation and Similar Laws; Aircraft, Auto or Watercraft; Mobile Equipment; Drywall Manufactured in China; Exterior Insulation and Finish Systems ("EIFS"); Assault and Battery; Professional Services; Damage to Property; Damage to Your Product; Damage to Your Work; Damage to Impaired Property or Property Not Physically Injured; Recall of Products; Work or Impaired Property; Personal and Advertising Injury; Subsidence, Movement, or Vibration of Land; School or Recreational Facility; Deleterious Substances; Open Structure "Water" Damage; Heating Devices; Explosives; Communicable Disease; Abuse or Molestation; Prior Work and Prior Products; Wrap Up.</p>
          
          <p><strong>Common Policy Exclusions:</strong> Past Work or Construction Projects; Buildings and Structures Exceeding Three Stories; Water or Fire Damage Liability; Hospital, Medical or Care Facilities; Physical or Mental Disability or Impairment; Material Misrepresentation; Overspray; House/Structure Raising; Fall from Heights; Animals; Independent Contractors/Subcontractors Sublimit; Airports; House of Worship; Underground Utility Location; Fire Suppression Systems; Collapse; Injury or Damage to Day Laborers; Undisclosed Waterproofing Operations; Abandoned Work; Urethane or Spray Roofing; Museums and Historic Buildings and Structures; Tract Home Project.</p>
          
          <p><strong>Coverage B – Personal and Advertising Injury:</strong> Knowing Violation of Rights of Another; Material Published with Knowledge of Falsity; Material Published Prior to Policy Period; Insureds in Media and Internet Type Business; Electronic Chat Rooms, Bulletin Boards, or Social Media; Unauthorized Use of Another's Name or Product; "Bodily Injury" and "Property Damage"; Quality or Performance of Goods – Failure to Conform to Statements; Wrong Description of Prices; Infringement of Copyright, Patent, Trademark or Trade Secret; Expected or Intended Injury or Damage; Common Policy Exclusions.</p>
          
          <p><strong>Coverage C – Medical Payments:</strong> Any Insured; Hired Person; Injury on Normally Occupied Premises; Workers Compensation and Similar Laws; Athletic Activities; Products-Completed Operations Hazard, Coverage A and B Exclusions.</p>
          
          <p><strong>Section II. Common Policy Exclusions:</strong> Breach of Contract/Contractual Liability; Employer's Liability; Pollution; Residential Project/Structure Size Restriction Exclusion; Commercial or Mixed Use Building/Project Size Restriction Exclusion; Multi-Unit Structures; War or Terrorism; Employment Practices; Cross Suits; Fraudulent, Intentional, or Criminal Acts; Unlicensed Contractors; Non-Compliance with Safety Regulations; Prior Litigation; Prior Knowledge; Ongoing Operations; Unsolicited Communications; Punitive Damages, Fines or Penalties; Attorney, Expert, and Vendor Fees and Costs of Others; Classification Limitation Exclusion; Social and Entertainment Activities and Events; Force Majeure or Acts of God; Liquor Liability; State Specific Operations; Electronic Data; Mental Injury; Roofing Operations; Louisiana Operations; Slip and Fall, Underground Horizontal Drilling, Cyber.</p>
          
          <p>Please refer to the policy for a complete list of exclusions. This list is subject to change and may differ from prior policy years.</p>
        </div>
        
        <div class="initial-line">
          * I have read and understand the policy exclusions identified above. Initial: _________________________
        </div>
        
        <div class="page-number">Page 6 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 7: Application Agreement
 */
function generatePage7(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P7`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Insurance Application</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="section-title-uppercase">APPLICATION AGREEMENT</div>
        
        <div class="agreement-content">
          <p>The purpose of this application is to assist in the underwriting process information contained herein is specifically relied upon in determination of insurability. The no loss letter shall be the basis of any insurance that may be issued and will be a part of such policy. The undersigned, therefore, warrants that the information contained herein is true and accurate to the best of his/her knowledge, information and belief.</p>
          
          <p>The undersigned Applicant warrants that the above statements and particulars, together with any attached or appended documents or materials ("this Application"), are true and complete and do not misrepresent, misstate or omit any material facts. The undersigned Applicant warrants that the representations and information supplied in each of the above sections entitled Applicant Information, Entity of Company, Additional Business Names, Description of Operations, Estimated Exposures, Previous Exposures, Work Experience and related information are specifically relied upon in the determination of insurability, are material to the risk to be insured, and will be a part of any policy issued. The undersigned Applicant understands that any misrepresentation or omission of any information in any part of this Application shall constitute grounds for immediate cancellation of coverage and denial of claims, if any. It is further understood that the applicant and or affiliated company is under a continuing obligation to immediately notify his/her underwriter through his/her broker of any material alteration of the information given. The Applicant agrees to notify the Company of any material changes in the answers to the questions on this Application which may arise prior to the effective date of any policy issued pursuant to this Application. The Applicant understands that any outstanding quotations may be modified or withdrawn based upon such changes at the sole discretion of the Company.</p>
          
          <p>Notwithstanding any of the foregoing, the Applicant understands the Company is not obligated nor under any duty to issue a policy of insurance based upon this Application. The Applicant further understands that, if a policy is issued, this Application will be incorporated into and form a part of such policy and any false information provided on this application will result in the nullification of such policy. Furthermore, the Applicant authorizes the Company, as administrative and servicing manager, to make any investigation and inquiry in connection with the Application as it may deem necessary.</p>
          
          <p>For your protection, this information is provided as required by applicable State and Federal law. Any person who knowingly presents false, fraudulent, misleading, incomplete or misleading facts or information or aids, abets, solicits, or conspires with any person to do so, for the purpose of obtaining insurance coverage, amending insurance coverage, seeking insurance benefits or to make a claim for the payment of a loss, is unlawful and is guilty of a crime and may be subject to fines and confinement in state or federal prison.</p>
        </div>
        
        <div class="initial-line">
          Initial: _________________________
        </div>
        
        <div class="agreement-content" style="margin-top: 0.2in;">
          <p>The applicant acknowledges that explanation of the terms, conditions and provisions of the policy of insurance, including but not limited to coverage being afforded, amendments, endorsements, exclusions and any other such information effecting the policy of insurance are provided solely by the applicant's agent, broker or producer and NOT the Company. The coverage type, nature, amounts and insurance needs of the applicant are the sole responsibility of the applicant and its agent/ broker or producer. The applicant understands the agent/ broker or producer has no authority to act on behalf of the insurance company.</p>
        </div>
        
        <div class="initial-line">
          Initial: _________________________
        </div>
        
        <div class="agreement-content" style="margin-top: 0.2in;">
          <p>Applicant acknowledges that this policy is subject to a self-insured retention. The total limit of liability as stated in the policy declarations shall apply in excess of the self-insured retention. The limits of insurance applicable to such coverages will not be reduced by the amount of such self-insured retention. This policy applies only to the amount excess of the self-insured retention. Complete satisfaction of the SIR by the applicant is a "condition precedent" to Company's duty to defend and/or indemnity. Please note that Company is not obligated to defend and/or indemnify the applicant until the SIR is paid in full. The self-insured retention shall remain applicable even if you file for bankruptcy, discontinues business or otherwise becomes unable to unwilling to pay the self-insured retention. The risk of insolvency is retained by you and is not transferrable. Please consult your policy for the full terms and conditions of the SIR.</p>
        </div>
        
        <div class="initial-line">
          Initial: _________________________
        </div>
        
        <div class="agreement-content" style="margin-top: 0.2in;">
          <p>If you are applying for a "claims made" policy then please note that policy provides coverage only for "claims made" and reported to the company in writing during the policy period. Thus there is NO retroactive coverage. Please consult your policy and or agent/broker for further information.</p>
        </div>
        
        <div class="initial-line">
          Initial: _________________________
        </div>
        
        <div class="agreement-content" style="margin-top: 0.2in;">
          <p>The coverage provided by your policy may also be subject to other limitations including, but not limited to, sublimits of liability and/or, per- project shared aggregate limits of liability. In addition, defense costs and claim expenses are included within the applicable limits of liability. This means that the limits of liability available to pay indemnity, settlements, judgments and "claim expenses" will be reduced, and may be exhausted, by payment of "claim expenses" including payment of any defense fees and costs. Please consult your policy and or agent/broker for further information.</p>
        </div>
        
        <div class="initial-line">
          Initial: _________________________
        </div>
        
        <div class="agreement-content" style="margin-top: 0.2in;">
          <p>Applicants must strictly comply with all applicable state and/or other governmental licensing requirements and regulations. Should an applicant's license become suspended, revoked or inactive at any time during the policy period, then NO coverage will be afforded under the policy.</p>
        </div>
        
        <div class="initial-line">
          Initial: _________________________
        </div>
        
        <div class="agreement-content" style="margin-top: 0.2in;">
          <p><strong>* Deposit Premium & Fees are fully earned.</strong></p>
          
          <p>We will compute all premiums for this policy in accordance with our rules and rates. Premium shown in this policy as advance premium is a deposit premium only and is based upon the information provided by the applicant and or its agent. This information is subject to audit.</p>
          
          <p>Please note that issuance of the policy includes membership in Preferred Contractors Association (PCA). For a complete list of benefits and information, visit the website at www.pcamembers.com</p>
        </div>
        
        <div class="signature-section" style="margin-top: 0.3in;">
          <div class="signature-field">
            <div class="signature-label">Signature of Applicant</div>
            <div class="signature-line">${data.applicantSignature || '_________________________'}</div>
          </div>
          <div class="signature-field">
            <div class="signature-label">Date</div>
            <div class="signature-line">${data.applicantSignatureDate || '_________________________'}</div>
          </div>
          <div class="signature-field">
            <div class="signature-label">Title (Owner, Officer, Partner)</div>
            <div class="signature-line">${data.applicantTitle || '_________________________'}</div>
          </div>
          <div class="signature-field">
            <div class="signature-label">Signature of Producer (Agent or Broker)</div>
            <div class="signature-line">${data.producerSignature || '_________________________'}</div>
          </div>
        </div>
        
        <div class="page-number">Page 7 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 8: Terrorism Coverage Disclosure Notice
 */
function generatePage8(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P8`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Acknowledgment</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="carrier-header">
          <div class="carrier-name-large">${data.carrierName}</div>
          <div class="endorsement-notice">THIS ENDORSEMENT CHANGES THE POLICY. PLEASE READ IT CAREFULLY</div>
          <div class="carrier-name-medium">${data.carrierName}</div>
          <div class="policy-type">COMMERCIAL GENERAL LIABILITY POLICY</div>
          <div class="document-title">**TERRORISM COVERAGE DISCLOSURE NOTICE**</div>
          <div class="section-title-bold">**TERRORISM COVERAGE PROVIDED UNDER THIS POLICY**</div>
        </div>
        
        <div class="terrorism-content">
          <p>The Terrorism Risk Insurance Act of 2002 and amendments thereto (collectively referred to as the "Act") established a program within the Department of the Treasury, under which the federal government shares, with the insurance industry, the risk of loss from future terrorist attacks. An act of terrorism is defined as any act certified by the Secretary of the Treasury, in concurrence with the Secretary of State and the Attorney General of the United States, to be an act of terrorism; to be a violent act or an act that is dangerous to human life, property or infrastructure; to have resulted in damage within the United States, or outside the United States in the case of an air carrier or vessel or the premises of a United States Mission; and to have been committed by an individual or individuals as part of an effort to coerce the civilian population of the United States or to influence the policy or affect the conduct of the United States Government by coercion.</p>
          
          <p>In accordance with the Act we are required to offer you coverage for losses resulting from an act of terrorism that is certified under the federal program as an act of terrorism. The policy's other provisions will still apply to such an act. <strong>This offer does not include coverage for incidents of nuclear, biological, chemical, or radiological terrorism which will be excluded from your policy.</strong> Your decision is needed on this question: do you choose to pay the premium for terrorism coverage stated in this offer of coverage, or do you reject the offer of coverage and not pay the premium? You may accept or reject this offer.</p>
          
          <p>If your policy provides commercial property coverage, in certain states, statutes or regulations may require coverage for fire following an act of terrorism. In those states, if terrorism results in fire, we will pay for the loss or damage caused by that fire, subject to all applicable policy provisions including the Limit of Insurance on the affected property. Such coverage for fire applies only to direct loss or damage by fire to Covered Property. Therefore, for example, the coverage does not apply to insurance provided under Business Income and/or Extra Expense coverage forms or endorsements that apply to those coverage forms, or to Legal Liability coverage forms or Leasehold Interest coverage forms.</p>
          
          <p>Your premium <strong>will include</strong> the additional premium for terrorism as stated in the section of this Notice titled <strong>DISCLOSURE OF PREMIUM.</strong></p>
        </div>
        
        <div class="section-title-bold" style="margin-top: 0.3in;">DISCLOSURE OF FEDERAL PARTICIPATION IN PAYMENT OF TERRORISM LOSSES</div>
        
        <div class="terrorism-content">
          <p>You should know that where coverage is provided by this policy for losses resulting from certified acts of terrorism, such losses may be partially reimbursed by the United States government under a formula established by federal law. However, your policy may contain other exclusions which might affect your coverage, such as an exclusion for nuclear events. Under the formula, the United States government generally <strong>reimburses 80% beginning on January 1, 2020</strong> of covered terrorism losses exceeding the statutorily established deductible paid by the insurance company providing the coverage.</p>
        </div>
        
        <div class="section-title-bold" style="margin-top: 0.3in;">DISCLOSURE OF CAP ON ANNUAL LIABILITY</div>
        
        <div class="terrorism-content">
          <p><strong>You Should Also Know That the Terrorism Risk Insurance Act, As Amended, Contains A $100 Billion Cap That Limits U.S. Government Reimbursement As Well As Insurers' Liability For Losses Resulting From Certified Acts Of Terrorism When The Amount Of Such Losses In Any One Calendar Year Exceeds $100 Billion. If The Aggregate Insured Losses For All Insurers Exceed $100 Billion, Your Coverage May Be Reduced.</strong></p>
        </div>
        
        <div class="page-number">Page 8 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 9: Disclosure of Premium (Terrorism Coverage)
 */
function generatePage9(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P9`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Acknowledgment</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="carrier-header">
          <div class="carrier-name-large">${data.carrierName}</div>
          <div class="section-title-bold" style="margin-top: 0.2in;">DISCLOSURE OF PREMIUM</div>
        </div>
        
        <div class="premium-disclosure-content">
          <p><strong>Your premium for terrorism coverage is:</strong> ${data.terrorismCoveragePremium || '$0.00'}</p>
          
          <p>Premium charged is for the policy period up to your policy expiration. (This charge/amount is applied to obtain the final premium.)</p>
          
          <p><strong>You may choose to reject the offer by signing the statement below and returning it to us.</strong> Your policy will be changed to exclude the described coverage. If you chose to accept this offer, this form does not have to be returned.</p>
        </div>
        
        <div class="section-title-bold" style="margin-top: 0.3in; text-align: center;">REJECTION STATEMENT</div>
        
        <div class="rejection-statement-box">
          <p>I hereby decline to purchase coverage for certified acts of terrorism. I understand that an exclusion of certain terrorism losses will be made part of this policy.</p>
        </div>
        
        <div class="signature-section" style="margin-top: 0.3in;">
          <div class="signature-field">
            <div class="signature-label">Member/Insured: <strong>${data.companyName}</strong></div>
          </div>
          <div class="signature-field" style="display: flex; gap: 0.3in;">
            <div style="flex: 1;">
              <div class="signature-label">Member/Insured Signature:</div>
              <div class="signature-line">${data.rejectionStatementSignature || '_________________________'}</div>
            </div>
            <div style="flex: 1;">
              <div class="signature-label">Date:</div>
              <div class="signature-line" style="min-width: 1.5in;">${data.rejectionStatementDate || '_________________________'}</div>
            </div>
          </div>
          <div class="signature-field">
            <div class="signature-label">Printed Name/Title:</div>
            <div class="signature-line">${data.rejectionStatementPrintedName || '_________________________'}</div>
          </div>
        </div>
        
        <div class="page-number">Page 9 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 10: Surplus Lines Compliance Certification
 */
function generatePage10(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P10`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Insurance Application</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Producer</div>
        </div>
      </div>
      <div class="main-content">
        <div class="section-title-bold" style="text-align: center; text-decoration: underline;">SURPLUS LINES COMPLIANCE CERTIFICATION</div>
        
        <div class="certification-content" style="margin-top: 0.3in;">
          <p>I, the retail or producing resident or non‐resident licensed producer/agent/broker, affirm I have expressly advised the insured prior to placement of the insurance that I was unable to obtain the full amount or kind of insurance necessary to protect the desired risk(s) from authorized insurers, as required by the risk state, currently writing this type of coverage in this State.</p>
          
          <p>In addition, I confirm that coverage was not procured for the purpose of securing a lower premium rate than would be accepted by an authorized insurer nor to secure any other competitive advantage.</p>
          
          <p>Under the penalty of suspension or revocation of my producer/agent/broker's license, the facts contained in this certification are true and correct.</p>
        </div>
        
        <div class="signature-section" style="margin-top: 0.4in;">
          <div class="signature-field">
            <div class="signature-label">TBD-AppID ${data.applicationId}</div>
            <div class="signature-line">${data.policyNumber || '_________________________'}</div>
          </div>
          <div class="signature-field">
            <div class="signature-label">Policy Number</div>
            <div class="signature-line">${data.policyNumber || '_________________________'}</div>
          </div>
          <div class="signature-field">
            <div class="signature-label">Signature of Licensed Retail/Producing Agent/Broker</div>
            <div class="signature-line">${data.surplusLinesSignature || '_________________________'}</div>
          </div>
          <div class="signature-field">
            <div class="signature-label">Date</div>
            <div class="signature-line" style="min-width: 1.5in;">${data.surplusLinesDate || '_________________________'}</div>
          </div>
        </div>
        
        <div class="page-number">Page 10 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 11: Loss Warranty Letter
 */
function generatePage11(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P11`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Loss Warranty Letter</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Applicant</div>
        </div>
      </div>
      <div class="main-content">
        <div class="header-section">
          <div class="header-left">
            <div class="logo-small">C&C</div>
            <div class="applicant-info">
              <div class="applicant-name-large">${data.companyName}</div>
              <div class="applicant-address">${data.applicantAddress}</div>
              <div class="applicant-city-state-zip">${data.applicantCity}, ${data.applicantState} ${data.applicantZip}</div>
              <div class="applicant-phone">${data.applicantPhone}</div>
              <div class="applicant-email">email: ${data.applicantEmail}</div>
              <div class="quote-id">Quote ID: ${data.applicationId}</div>
            </div>
          </div>
          <div class="header-right">
            <div class="logo-small">C&C</div>
            <div class="brand-name">Capital & Co</div>
            <div class="brand-subtitle">Insurance Services</div>
          </div>
        </div>
        
        <div class="warranty-content" style="margin-top: 0.3in;">
          <p>During the last Five (5) years, we warrant that with respect to the insurance being applied for:</p>
          
          <ol style="margin-left: 0.3in; margin-top: 0.1in;">
            <li>I/ we have not sustained a loss</li>
            <li>Have not had a claim made against us</li>
            <li>Have not been denied coverage or had coverage canceled by an insurance company</li>
            <li>Have no knowledge or a reason to anticipate a claims or loss.</li>
          </ol>
          
          <p style="margin-top: 0.2in;">If my business is less than five (5) years old, the above referenced warranty applies to work performed through all my prior business entities whether as an owner or an employee. The undersigned Applicant understands and agrees that all of the statements, information and responses provided in the Application for this policy are material to the risk sought to be insured, and that the entirety of the information provided in the Application forms a basis for the insurer to provide the requested insurance, and that said insurance is provided in reliance on such material representations.</p>
          
          <p>The undersigned Applicant further authorizes the Insurer or its representative to obtain directly or on Applicant's behalf, any and all loss runs or other such information identifying any claim, action or loss against the undersigned Applicant or the denial of coverage or cancelation of insurance. This authorization shall also include and encompass any prior business entity as provided above. The Insurer or its representative may contact the undersigned Applicant's Insurance Brokers, Agents, Insurers, Attorneys or other such individuals for this information and its release.</p>
          
          <p>I understand that this warranty and authorization for release of information as provided above will be incorporated into the insurance contract.</p>
        </div>
        
        <div class="signature-section" style="margin-top: 0.4in;">
          <div class="signature-field">
            <div class="signature-label"><strong>${data.companyName}</strong></div>
            <div class="signature-line">${data.lossWarrantyCompanySignature || '_________________________'}</div>
            <div style="display: flex; gap: 0.3in; margin-top: 0.05in;">
              <div class="signature-label" style="font-size: 8pt;">Company/ Member</div>
              <div class="signature-label" style="font-size: 8pt; margin-left: auto;">Date</div>
            </div>
            <div class="signature-line" style="min-width: 1.5in; margin-left: auto; margin-top: 0.05in;">${data.lossWarrantyDate || '_________________________'}</div>
          </div>
          <div class="signature-field" style="margin-top: 0.2in;">
            <div class="signature-label">Signature of Partner, Officer, Principal or Owner</div>
            <div class="signature-line">${data.lossWarrantySignature || '_________________________'}</div>
            <div class="signature-label" style="font-size: 8pt; margin-top: 0.05in;">Title</div>
            <div class="signature-line">${data.lossWarrantyTitle || '_________________________'}</div>
          </div>
        </div>
        
        <div class="warranty-footer" style="margin-top: 0.3in; font-size: 8pt; line-height: 1.5;">
          <p><strong>Warranty:</strong> The purpose of this no loss letter is to assist in the underwriting process information contained herein is specifically relied upon in determination of insurability. The undersigned, therefore, warrants that the information contained herein is true and accurate to the best of his/her knowledge, information and belief. This no loss letter shall be the basis of any insurance that may be issued and will be a part of such policy. It is understood that any misrepresentation or omission shall constitute grounds for immediate cancellation of coverage and denial of claims, if any. It is further understood that the applicant and or affiliated company is under a continuing obligation to immediately notify his/her underwriter through his/her broker of any material alteration of the information given.</p>
        </div>
        
        <div class="page-number">Page 11 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Generate Page 12: Invoice Statement
 */
function generatePage12(data: ApplicationPacketData): string {
  const qrCodeText = `${data.applicationId}`;
  const qrCodePageText = `${data.applicationId}P12`;
  
  return `
    <div class="page" style="page-break-after: always;">
      <div class="sidebar">
        <div class="logo-container">
          <div class="logo">C&C</div>
        </div>
        <div class="sidebar-title-vertical">Invoice Statement</div>
        <div class="qr-container">
          ${generateQRCodeHTML(qrCodeText, 80)}
          <div class="qr-text">${qrCodeText}</div>
          <div class="qr-page">${qrCodePageText}</div>
          <div class="applicant-icon">👤</div>
          <div class="applicant-label">Producer</div>
        </div>
      </div>
      <div class="main-content">
        <div class="invoice-header">
          <div class="invoice-field">
            <strong>Program:</strong> ${data.programName || 'Standard GL A-Rated'}
          </div>
          <div class="invoice-field">
            <strong>Applicant Name:</strong> ${data.companyName}
          </div>
          <div class="invoice-field">
            <strong>Application ID:</strong> ${data.applicationId}
          </div>
        </div>
        
        <div class="invoice-section" style="margin-top: 0.3in;">
          <div class="invoice-section-title">TOTAL COST OF POLICY*</div>
          <div class="invoice-row">
            <div class="invoice-label">Premium</div>
            <div class="invoice-value">${data.premium || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">State Tax</div>
            <div class="invoice-value">${data.stateTax || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">Association Dues</div>
            <div class="invoice-value">${data.associationDues || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">Policy Fee</div>
            <div class="invoice-value">${data.policyFee || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">Inspection Fee</div>
            <div class="invoice-value">${data.inspectionFee || '$0.00'}</div>
          </div>
          <div class="invoice-row-total">
            <div class="invoice-label"><strong>TOTAL COST OF POLICY*</strong></div>
            <div class="invoice-value"><strong>${data.totalCostOfPolicy || '$0.00'}</strong></div>
          </div>
        </div>
        
        <div class="invoice-section" style="margin-top: 0.3in;">
          <div class="invoice-section-title">TOTAL DEPOSIT*</div>
          <div class="invoice-row">
            <div class="invoice-label">15% Premium</div>
            <div class="invoice-value">${data.depositPremium || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">15% Association Dues</div>
            <div class="invoice-value">${data.depositAssociationDues || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">15% State Tax</div>
            <div class="invoice-value">${data.depositStateTax || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">15% Policy Fee</div>
            <div class="invoice-value">${data.depositPolicyFee || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">15% Inspection Fee</div>
            <div class="invoice-value">${data.depositInspectionFee || '$0.00'}</div>
          </div>
          <div class="invoice-row">
            <div class="invoice-label">15% AI Processing Fee</div>
            <div class="invoice-value">${data.aiProcessingFee || '$0.00'}</div>
          </div>
          <div class="invoice-row-total">
            <div class="invoice-label"><strong>TOTAL DEPOSIT*</strong></div>
            <div class="invoice-value"><strong>${data.totalDeposit || '$0.00'}</strong></div>
          </div>
        </div>
        
        <div class="invoice-section" style="margin-top: 0.3in;">
          <div class="invoice-section-title">TOTAL TO RETAIN*</div>
          <div class="invoice-row">
            <div class="invoice-label">15% Commission on Total (${data.totalCostOfPolicy || '$0.00'})</div>
            <div class="invoice-value">${data.totalToRetain || '$0.00'}</div>
          </div>
          <div class="invoice-row-total">
            <div class="invoice-label"><strong>TOTAL TO RETAIN*</strong></div>
            <div class="invoice-value"><strong>${data.totalToRetain || '$0.00'}</strong></div>
          </div>
        </div>
        
        <div class="invoice-section" style="margin-top: 0.3in;">
          <div class="invoice-section-title">TOTAL TO BE SENT</div>
          <div class="invoice-row">
            <div class="invoice-label"><strong>MAKE CHECK PAYABLE FOR</strong></div>
            <div class="invoice-value"><strong>${data.totalToBeSent || '$0.00'}</strong></div>
          </div>
        </div>
        
        <div class="payment-option" style="margin-top: 0.3in;">
          <strong>Payment Option:</strong> ${data.paymentOption || '3rd Party Finance'}
        </div>
        
        <div class="binding-statement" style="margin-top: 0.2in; font-size: 9pt;">
          <p>The binding of this insurance policy is an agreement to the above-referenced prices and its terms and conditions</p>
          <div class="signature-field" style="margin-top: 0.1in;">
            <div class="signature-label">Signature of Producer (Agent or Broker):</div>
            <div class="signature-line">${data.invoiceProducerSignature || '_________________________'}</div>
          </div>
        </div>
        
        <div class="invoice-disclaimer" style="margin-top: 0.2in; font-size: 8pt; font-style: italic;">
          <p>*Please note that any added agency broker fee or other charge, fee or cost assessed to the insured is your sole responsibility. All such amounts added in connection with this policy shall be in compliance with all applicable state and federal law.</p>
        </div>
        
        <div class="page-number">Page 12 of 12</div>
      </div>
    </div>
  `;
}

/**
 * Map form submission data to ApplicationPacketData format
 */
export function mapFormDataToPacketData(
  formData: any,
  submissionId: string,
  agency: any,
  quote?: any,
  submission?: any
): ApplicationPacketData {
  // Extract class code and description
  const classCodeWork = formData.classCodeWork || {};
  const classCodes = Object.keys(classCodeWork);
  const firstClassCode = classCodes[0] || '';
  const classCodeDescription = formData.carrierApprovedDescription || firstClassCode;
  
  // Calculate field employees
  const activeOwners = formData.activeOwnersInField || 0;
  const fieldEmployees = formData.fieldEmployees || 0;
  const numberOfFieldEmployees = activeOwners > 0 
    ? `Owner + ${fieldEmployees}` 
    : `${fieldEmployees}`;
  
  // Format dates
  const formDate = formData.effectiveDate 
    ? new Date(formData.effectiveDate).toLocaleDateString()
    : new Date().toLocaleDateString();
  
  const coverageDates = formData.effectiveDate && formData.expirationDate
    ? `${new Date(formData.effectiveDate).toLocaleDateString()} - ${new Date(formData.expirationDate).toLocaleDateString()}`
    : formData.effectiveDate
    ? `${new Date(formData.effectiveDate).toLocaleDateString()} - ${new Date(new Date(formData.effectiveDate).setFullYear(new Date(formData.effectiveDate).getFullYear() + 1)).toLocaleDateString()}`
    : '';
  
  // Format states of operation
  const statesOfOperation = Array.isArray(formData.statesOfOperation)
    ? formData.statesOfOperation.join(', ')
    : (formData.statesOfOperation || formData.state || '');
  
  // Format address
  const applicantAddress = formData.streetAddress 
    ? `${formData.streetAddress}${formData.aptSuite ? ', ' + formData.aptSuite : ''}`
    : '';
  
  // Format agency address
  const agencyAddress = agency?.address?.street || '';
  const agencyCity = agency?.address?.city || '';
  const agencyState = agency?.address?.state || '';
  const agencyZip = agency?.address?.zip || '';
  
  return {
    // Application Metadata
    applicationId: formData.applicationId || submissionId.substring(0, 7) || '0000000',
    submissionId: submissionId,
    formDate: formDate,
    
    // Agency Information
    agencyName: agency?.name || 'Gamaty Insurance Agency LLC DBA Capital & Co Insurance Services',
    agencyContactName: formData.agencyContactName || 'Eidan Gamaty',
    agencyAddress: agencyAddress,
    agencyCity: agencyCity,
    agencyState: agencyState,
    agencyZip: agencyZip,
    agencyPhone: agency?.phone || '(310) 284-2136',
    agencyEmail: agency?.email || 'eidan@capcoinsurance.com',
    
    // Applicant/Insured Information
    companyName: formData.companyName || formData.business_name || '',
    dba: formData.dba,
    contactPerson: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || formData.contactPerson || '',
    applicantAddress: applicantAddress,
    applicantCity: formData.city || '',
    applicantState: formData.state || '',
    applicantZip: formData.zipCode || '',
    applicantPhone: formData.phone || '',
    applicantEmail: formData.email || '',
    fein: formData.companyFEIN || formData.EIN || 'N/A',
    entityType: formData.entityType || '',
    yearsInBusiness: formData.yearsInBusiness || 0,
    yearsExperienceInTrades: formData.yearsExperienceInTrades || 0,
    statesOfOperation: statesOfOperation,
    workIn5Boroughs: formData.workIn5Boroughs || false,
    otherBusinessNames: formData.otherBusinessNames || 'No',
    paymentOption: formData.paymentOption || '3rd Party Finance',
    
    // Quote Information
    quoteType: quote?.type || 'General Liability',
    carrierName: quote?.carrierName || 'Sutton Specialty Insurance Company',
    coverageType: quote?.coverageType || 'Manuscript Occurrence',
    desiredCoverageDates: coverageDates,
    
    // General Liability Coverages
    aggregateLimit: formData.generalLiabilityLimit || '$1,000,000',
    occurrenceLimit: formData.generalLiabilityLimit || '$1,000,000',
    productsCompletedOpsLimit: formData.generalLiabilityLimit || '$1,000,000',
    personalAdvertisingInjuryLimit: formData.generalLiabilityLimit || '$1,000,000',
    fireLegalLimit: formData.fireLegalLimit || '$50,000',
    medPayLimit: formData.medicalExpenseLimit || '$5,000',
    selfInsuredRetention: formData.deductible || '$2,500',
    
    // Class Code & Gross Receipts
    classCode: classCodeDescription || firstClassCode,
    grossReceipts: formData.estimatedGrossReceipts ? `$${parseInt(formData.estimatedGrossReceipts).toLocaleString()}` : '$0',
    
    // Current Exposures
    estimatedTotalGrossReceipts: formData.estimatedGrossReceipts ? `$${parseInt(formData.estimatedGrossReceipts).toLocaleString()}` : '$0',
    estimatedSubContractingCosts: formData.estimatedSubcontractingCosts ? `$${parseInt(formData.estimatedSubcontractingCosts).toLocaleString()}` : '$0',
    estimatedMaterialCosts: formData.estimatedMaterialCosts ? `$${parseInt(formData.estimatedMaterialCosts).toLocaleString()}` : '$0',
    estimatedTotalPayroll: formData.totalPayrollAmount || '0',
    numberOfFieldEmployees: numberOfFieldEmployees,
    
    // Work Performed
    workDescription: formData.carrierApprovedDescription || '',
    percentageResidential: formData.residentialPercent || 0,
    percentageCommercial: formData.commercialPercent || 0,
    percentageNewConstruction: formData.newConstructionPercent || 0,
    percentageRemodel: formData.remodelPercent || 0,
    maxInteriorStories: formData.maxInteriorStories || 0,
    maxExteriorStories: formData.maxExteriorStories || 0,
    maxExteriorDepthBelowGrade: formData.maxExteriorDepthBelowGrade || 0,
    performOCIPWork: formData.performOCIPWork || false,
    ocipReceipts: formData.ocipReceipts,
    nonOCIPReceipts: formData.nonOCIPReceipts,
    lossesInLast5Years: formData.lossesInLast5Years || 0,
    
    // Work Experience Questions
    performHazardousWork: formData.performHazardousWork,
    hazardousWorkExplanation: formData.hazardousWorkExplanation,
    performMedicalFacilitiesWork: formData.performMedicalFacilitiesWork,
    medicalFacilitiesExplanation: formData.medicalFacilitiesExplanation,
    performStructuralWork: formData.performStructuralWork || false,
    performTractHomeWork: formData.workNewTractHomes,
    tractHomeExplanation: formData.tractHomeExplanation,
    workCondoConstruction: formData.workCondoConstruction,
    performCondoRepairOnly: formData.performCondoStructuralRepair,
    performRoofingOps: formData.performRoofingOps,
    roofingExplanation: formData.roofingExplanation,
    performWaterproofing: formData.performWaterproofing,
    waterproofingExplanation: formData.waterproofingExplanation,
    useHeavyEquipment: formData.useHeavyEquipment,
    heavyEquipmentExplanation: formData.heavyEquipmentExplanation,
    workOver5000SqFt: formData.workOver5000SqFt,
    workOver5000SqFtPercent: formData.workOver5000SqFtPercent,
    workOver5000SqFtExplanation: formData.workOver5000SqFtExplanation,
    workCommercialOver20000SqFt: formData.workCommercialOver20000SqFt,
    commercialOver20000SqFtPercent: formData.commercialOver20000SqFtPercent,
    commercialOver20000SqFtExplanation: formData.commercialOver20000SqFtExplanation,
    licensingActionTaken: formData.licensingActionTaken,
    licensingActionExplanation: formData.licensingActionExplanation,
    allowedLicenseUseByOthers: formData.allowedLicenseUseByOthers,
    licenseUseExplanation: formData.licenseUseExplanation,
    judgementsOrLiens: formData.judgementsOrLiens,
    judgementsExplanation: formData.judgementsExplanation,
    lawsuitsFiled: formData.lawsuitsFiled,
    lawsuitsExplanation: formData.lawsuitsExplanation,
    awareOfPotentialClaims: formData.awareOfPotentialClaims,
    potentialClaimsExplanation: formData.potentialClaimsExplanation,
    
    // Written Contract Questions
    haveWrittenContract: formData.haveWrittenContract,
    contractHasStartDate: formData.contractHasStartDate,
    contractStartDateExplanation: formData.contractStartDateExplanation,
    contractHasScopeOfWork: formData.contractHasScopeOfWork,
    contractScopeExplanation: formData.contractScopeExplanation,
    contractIdentifiesSubcontractedTrades: formData.contractIdentifiesSubcontractedTrades,
    contractSubcontractedTradesExplanation: formData.contractSubcontractedTradesExplanation,
    contractHasSetPrice: formData.contractHasSetPrice,
    contractSetPriceExplanation: formData.contractSetPriceExplanation,
    contractSignedByAllParties: formData.contractSignedByAllParties,
    contractSignedExplanation: formData.contractSignedExplanation,
    doSubcontractWork: formData.doSubcontractWork || formData.hasSubcontractors,
    alwaysCollectCertificatesFromSubs: formData.alwaysCollectCertificatesFromSubs,
    collectCertificatesExplanation: formData.collectCertificatesExplanation,
    requireSubsEqualInsuranceLimits: formData.requireSubsEqualInsuranceLimits,
    subsEqualLimitsExplanation: formData.subsEqualLimitsExplanation,
    requireSubsNameAsAdditionalInsured: formData.requireSubsNameAsAdditionalInsured,
    subsAdditionalInsuredExplanation: formData.subsAdditionalInsuredExplanation,
    haveStandardFormalAgreementWithSubs: formData.haveStandardFormalAgreementWithSubs,
    standardAgreementExplanation: formData.standardAgreementExplanation,
    agreementHasHoldHarmless: formData.agreementHasHoldHarmless,
    holdHarmlessExplanation: formData.holdHarmlessExplanation,
    requireSubsWorkersComp: formData.requireSubsWorkersComp,
    subsWorkersCompExplanation: formData.subsWorkersCompExplanation,
    
    // Policy Endorsements
    policyEndorsements: formData.policyEndorsements || 'Blanket AI + PW + WOS',
    
    // Application Agreement - Signatures
    applicantSignature: formData.applicantSignature,
    applicantSignatureDate: formData.applicantSignatureDate || formDate,
    applicantTitle: formData.applicantTitle,
    producerSignature: formData.producerSignature,
    producerSignatureDate: formData.producerSignatureDate || formDate,
    
    // Page 9: Disclosure of Premium
    terrorismCoveragePremium: formData.terrorismCoveragePremium || '$126.66',
    rejectionStatementSignature: formData.rejectionStatementSignature,
    rejectionStatementDate: formData.rejectionStatementDate,
    rejectionStatementPrintedName: formData.rejectionStatementPrintedName,
    
    // Page 10: Surplus Lines Compliance
    policyNumber: formData.policyNumber || quote?.policyNumber,
    surplusLinesSignature: formData.surplusLinesSignature,
    surplusLinesDate: formData.surplusLinesDate || formDate,
    
    // Page 11: Loss Warranty Letter
    lossWarrantyCompanySignature: formData.lossWarrantyCompanySignature,
    lossWarrantyDate: formData.lossWarrantyDate || formDate,
    lossWarrantySignature: formData.lossWarrantySignature,
    lossWarrantyTitle: formData.lossWarrantyTitle || formData.applicantTitle,
    
    // Page 12: Invoice Statement
    programName: formData.programName || submission?.programName || 'Standard GL A-Rated',
    premium: formData.premium || (quote?.finalAmountUSD ? `$${parseFloat(quote.finalAmountUSD.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    stateTax: formData.stateTax || (quote?.stateTax ? `$${parseFloat(quote.stateTax.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    associationDues: formData.associationDues || (quote?.associationDues ? `$${parseFloat(quote.associationDues.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    policyFee: formData.policyFee || (quote?.policyFee ? `$${parseFloat(quote.policyFee.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    inspectionFee: formData.inspectionFee || (quote?.inspectionFee ? `$${parseFloat(quote.inspectionFee.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    totalCostOfPolicy: formData.totalCostOfPolicy || (quote?.totalCost ? `$${parseFloat(quote.totalCost.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    depositPremium: formData.depositPremium || (quote?.depositPremium ? `$${parseFloat(quote.depositPremium.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    depositAssociationDues: formData.depositAssociationDues || (quote?.depositAssociationDues ? `$${parseFloat(quote.depositAssociationDues.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    depositStateTax: formData.depositStateTax || (quote?.depositStateTax ? `$${parseFloat(quote.depositStateTax.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    depositPolicyFee: formData.depositPolicyFee || (quote?.depositPolicyFee ? `$${parseFloat(quote.depositPolicyFee.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    depositInspectionFee: formData.depositInspectionFee || (quote?.depositInspectionFee ? `$${parseFloat(quote.depositInspectionFee.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    aiProcessingFee: formData.aiProcessingFee || '$0.00',
    totalDeposit: formData.totalDeposit || (quote?.totalDeposit ? `$${parseFloat(quote.totalDeposit.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    totalToRetain: formData.totalToRetain || (quote?.totalToRetain ? `$${parseFloat(quote.totalToRetain.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    totalToBeSent: formData.totalToBeSent || (quote?.totalToBeSent ? `$${parseFloat(quote.totalToBeSent.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
    invoiceProducerSignature: formData.invoiceProducerSignature || formData.producerSignature,
  };
}

/**
 * Optimize CSS by removing unnecessary whitespace and comments
 */
function optimizeCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/;}/g, '}')
    .trim();
}

/**
 * Minify HTML by removing unnecessary whitespace
 */
function minifyHTML(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/>\s+</g, '><') // Remove space between tags
    .trim();
}

/**
 * Generate the complete 12-page application packet HTML
 */
export function generateApplicationPacketHTML(data: ApplicationPacketData): string {
  // Generate all pages first
  const pages = [
    generatePage1(data),
    generatePage2(data),
    generatePage3(data),
    generatePage4(data),
    generatePage5(data),
    generatePage6(data),
    generatePage7(data),
    generatePage8(data),
    generatePage9(data),
    generatePage10(data),
    generatePage11(data),
    generatePage12(data)
  ].join('');
  
  const cssContent = `
    /* ============================================
       PROFESSIONAL DESIGN SYSTEM - CSS VARIABLES
       ============================================ */
    :root {
      /* Brand Colors */
      --primary-color: #4A9EFF;
      --primary-dark: #3a7fd4;
      --primary-light: #6bb0ff;
      --secondary-color: #1f2937;
      --accent-color: #10b981;
      --warning-color: #f59e0b;
      --error-color: #ef4444;
      
      /* Text Colors */
      --text-primary: #1f2937;
      --text-secondary: #6b7280;
      --text-tertiary: #9ca3af;
      --text-inverse: #ffffff;
      
      /* Background Colors */
      --bg-white: #ffffff;
      --bg-light: #f9fafb;
      --bg-medium: #f3f4f6;
      --bg-dark: #e5e7eb;
      
      /* Border Colors */
      --border-light: #e5e7eb;
      --border-medium: #d1d5db;
      --border-dark: #9ca3af;
      
      /* Spacing System */
      --spacing-xs: 0.1in;
      --spacing-sm: 0.15in;
      --spacing-md: 0.25in;
      --spacing-lg: 0.4in;
      --spacing-xl: 0.6in;
      
      /* Typography */
      --font-family: 'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
      --font-size-xs: 9pt;
      --font-size-sm: 10pt;
      --font-size-base: 11pt;
      --font-size-lg: 12pt;
      --font-size-xl: 14pt;
      --font-size-2xl: 16pt;
      
      /* Shadows */
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.15);
      --shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.1);
      --shadow-premium: 0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-family);
      font-size: var(--font-size-base);
      line-height: 1.7;
      color: var(--text-primary);
      background: var(--bg-white);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .page {
      width: 8.5in;
      min-height: 11in;
      padding: 0;
      margin: 0;
      display: flex;
      position: relative;
      background: #fff;
      page-break-after: always;
      /* Subtle texture for professional feel */
      background-image: 
        radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0);
      background-size: 20px 20px;
    }
    
    /* Professional watermark effect (very subtle) */
    .page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(74, 158, 255, 0.01) 0%, rgba(31, 41, 55, 0.01) 100%);
      pointer-events: none;
      z-index: 0;
    }
    
    .main-content {
      position: relative;
      z-index: 1;
    }
    
    .sidebar {
      width: 1.25in;
      background: linear-gradient(180deg, var(--bg-light) 0%, var(--bg-white) 100%);
      padding: 0.4in 0.25in;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      border-right: 2px solid var(--border-light);
      box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.02);
      z-index: 1;
    }
    
    .logo-container {
      margin-bottom: 0.25in;
    }
    
    .logo {
      width: 0.65in;
      height: 0.65in;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: var(--text-inverse);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 20pt;
      box-shadow: var(--shadow-premium), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      border: 2px solid rgba(255, 255, 255, 0.3);
      position: relative;
    }
    
    .logo::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      height: 30%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
      border-radius: 12px 12px 0 0;
      pointer-events: none;
    }
    
    .sidebar-title {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 15pt;
      font-weight: 700;
      color: #1f2937;
      margin: 0.4in 0;
      transform: rotate(180deg);
      letter-spacing: 1px;
    }
    
    .sidebar-title-vertical {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 17pt;
      font-weight: 700;
      color: #1f2937;
      margin: 0.4in 0;
      transform: rotate(180deg);
      letter-spacing: 1px;
    }
    
    .qr-container {
      position: absolute;
      bottom: 0.4in;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    
    .qr-code {
      background: var(--bg-white);
      padding: 0.1in;
      border-radius: 10px;
      box-shadow: var(--shadow-premium);
      border: 2px solid var(--border-light);
      position: relative;
      overflow: hidden;
    }
    
    .qr-code::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(74, 158, 255, 0.03) 0%, transparent 100%);
      pointer-events: none;
    }
    
    .qr-code img {
      width: 0.85in;
      height: 0.85in;
      display: block;
    }
    
    .qr-code-text-only {
      width: 0.85in;
      height: 0.85in;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-white);
      border: 2px solid var(--primary-color);
      border-radius: 8px;
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: var(--primary-color);
      text-align: center;
      padding: 0.05in;
      word-break: break-all;
      box-shadow: var(--shadow-sm);
    }
    
    .qr-text {
      font-size: 9pt;
      font-weight: 600;
      margin-top: 0.08in;
      color: #1f2937;
      letter-spacing: 0.5px;
    }
    
    .qr-page {
      font-size: 8pt;
      color: #6b7280;
      margin-top: 0.03in;
    }
    
    .applicant-icon {
      font-size: 20pt;
      margin-top: var(--spacing-xs);
      color: var(--primary-color);
      background: linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(74, 158, 255, 0.05) 100%);
      width: 0.5in;
      height: 0.5in;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      border: 2px solid var(--primary-color);
    }
    
    .applicant-label {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      margin-top: var(--spacing-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 0.03in 0.1in;
      background: var(--bg-light);
      border-radius: 12px;
      border: 1px solid var(--border-light);
    }
    
    .main-content {
      flex: 1;
      padding: 0.6in;
      padding-left: 0.5in;
      padding-right: 0.5in;
    }
    
    .header-info {
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      border-bottom: 3px solid var(--primary-color);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
    }
    
    .broker-name {
      font-size: var(--font-size-lg);
      font-weight: 700;
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
      letter-spacing: 0.5px;
      line-height: 1.5;
    }
    
    .applicant-name {
      font-size: var(--font-size-lg);
      font-weight: 700;
      margin-bottom: var(--spacing-xs);
      color: var(--text-primary);
      line-height: 1.5;
    }
    
    .application-id {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    
    .instructions {
      margin: var(--spacing-md) 0;
      font-size: var(--font-size-base);
      line-height: 1.8;
      color: var(--text-secondary);
      padding: var(--spacing-md);
      background: linear-gradient(135deg, rgba(74, 158, 255, 0.05) 0%, transparent 100%);
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
      box-shadow: var(--shadow-sm);
    }
    
    .instructions p {
      margin-bottom: var(--spacing-sm);
      text-align: justify;
    }
    
    .instructions p:first-child::before {
      content: 'ℹ';
      display: inline-block;
      margin-right: var(--spacing-xs);
      color: var(--primary-color);
      font-weight: 700;
      font-size: 12pt;
    }
    
    .checklist {
      margin: 0.25in 0;
    }
    
    .checklist-item {
      font-size: var(--font-size-base);
      margin: var(--spacing-sm) 0;
      padding: var(--spacing-sm) var(--spacing-md);
      padding-left: var(--spacing-lg);
      line-height: 1.8;
      color: var(--text-primary);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
      box-shadow: var(--shadow-sm);
      position: relative;
      font-weight: 500;
    }
    
    .checklist-item::before {
      content: '✓';
      position: absolute;
      left: var(--spacing-sm);
      top: 50%;
      transform: translateY(-50%);
      width: 0.2in;
      height: 0.2in;
      background: var(--primary-color);
      color: var(--text-inverse);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10pt;
      font-weight: 700;
      box-shadow: var(--shadow-sm);
    }
    
    .checklist-item:hover {
      background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-light) 100%);
      transform: translateX(3px);
      box-shadow: var(--shadow-md);
    }
    
    .submission-instructions,
    .binding-instructions {
      margin: var(--spacing-md) 0;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.8;
      padding: var(--spacing-sm) var(--spacing-md);
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-left: 4px solid var(--primary-color);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      border-top: 1px solid var(--border-light);
      border-right: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
    }
    
    .submission-instructions strong,
    .binding-instructions strong {
      color: var(--text-primary);
      font-weight: 700;
    }
    
    .header-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      border-bottom: 3px solid var(--primary-color);
      align-items: flex-start;
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-radius: 8px 8px 0 0;
      box-shadow: var(--shadow-premium);
      position: relative;
      overflow: hidden;
    }
    
    .header-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 50%, var(--primary-color) 100%);
    }
    
    .header-left,
    .header-right {
      flex: 1;
    }
    
    .logo-small {
      width: 0.5in;
      height: 0.5in;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: var(--text-inverse);
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18pt;
      margin-bottom: var(--spacing-sm);
      box-shadow: var(--shadow-md);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .agency-info {
      font-size: 10pt;
      line-height: 1.7;
      color: #374151;
    }
    
    .agency-info > div {
      margin-bottom: 0.06in;
    }
    
    .agency-name {
      font-weight: 700;
      font-size: 10.5pt;
      margin-bottom: 0.08in;
      color: #1f2937;
    }
    
    .brand-name {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
      margin-bottom: var(--spacing-xs);
      line-height: 1.3;
    }
    
    .brand-subtitle {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      font-weight: 500;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      font-size: 10pt;
    }
    
    .application-id-section {
      font-size: var(--font-size-base);
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm) var(--spacing-md);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-left: 4px solid var(--primary-color);
      border-radius: 8px;
      font-weight: 600;
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
      border-top: 1px solid var(--border-light);
      border-right: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
    }
    
    .two-column-section {
      display: flex;
      gap: 0.4in;
      margin-bottom: 0.3in;
      align-items: flex-start;
    }
    
    .column-left,
    .column-right {
      flex: 1;
    }
    
    .section-title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      margin-bottom: var(--spacing-sm);
      text-transform: uppercase;
      color: var(--text-primary);
      letter-spacing: 0.8px;
      line-height: 1.4;
    }
    
    .section-title-underline {
      font-size: var(--font-size-xl);
      font-weight: 700;
      margin: var(--spacing-md) 0 var(--spacing-sm) 0;
      text-transform: uppercase;
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 6px;
      text-decoration-color: var(--primary-color);
      color: var(--text-primary);
      letter-spacing: 0.8px;
      line-height: 1.4;
    }
    
    .section-title-uppercase {
      font-size: var(--font-size-xl);
      font-weight: 700;
      margin: var(--spacing-lg) 0 var(--spacing-md) 0;
      text-transform: uppercase;
      color: var(--text-primary);
      letter-spacing: 0.8px;
      padding: var(--spacing-xs) var(--spacing-sm);
      padding-bottom: var(--spacing-xs);
      border-bottom: 3px solid var(--primary-color);
      line-height: 1.4;
      background: linear-gradient(135deg, rgba(74, 158, 255, 0.05) 0%, transparent 100%);
      border-radius: 6px 6px 0 0;
      position: relative;
    }
    
    .section-title-uppercase::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 50%, var(--primary-color) 100%);
    }
    
    .field-row {
      font-size: var(--font-size-sm);
      margin: var(--spacing-sm) 0;
      padding: var(--spacing-xs) var(--spacing-sm);
      line-height: 1.8;
      color: var(--text-secondary);
      border-bottom: 1px dotted var(--border-light);
      position: relative;
      padding-left: var(--spacing-md);
    }
    
    .field-row::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: var(--primary-color);
      font-weight: 700;
      font-size: 10pt;
    }
    
    .field-row strong {
      color: var(--text-primary);
      font-weight: 600;
      letter-spacing: 0.3px;
      display: inline-block;
      min-width: 2.5in;
      margin-right: var(--spacing-xs);
    }
    
    .field-row:last-child {
      border-bottom: none;
    }
    
    .field-value {
      font-size: var(--font-size-sm);
      margin: var(--spacing-xs) 0;
      color: var(--text-primary);
      line-height: 1.7;
    }
    
    .field-value-large {
      font-size: var(--font-size-xl);
      font-weight: 700;
      margin-top: var(--spacing-sm);
      color: var(--text-primary);
      letter-spacing: 0.3px;
    }
    
    .quote-information-section,
    .applicant-information-section {
      margin: 0.3in 0;
    }
    
    .coverages-section {
      margin: 0.3in 0;
    }
    
    .coverages-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
      padding: var(--spacing-md);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-radius: 10px;
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-premium);
      position: relative;
    }
    
    .coverages-grid::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--primary-color) 0%, transparent 100%);
      border-radius: 10px 10px 0 0;
    }
    
    .coverage-item {
      font-size: var(--font-size-sm);
      padding: var(--spacing-xs) 0;
      line-height: 1.7;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-light);
    }
    
    .coverage-item:last-child {
      border-bottom: none;
    }
    
    .coverage-item strong {
      color: var(--text-primary);
      font-weight: 600;
      display: inline-block;
      min-width: 2.5in;
    }
    
    .class-code-section {
      display: flex;
      gap: 0.4in;
      margin: 0.3in 0;
      padding: 0.2in;
      background: #f9fafb;
      border-radius: 6px;
    }
    
    .class-code-left,
    .class-code-right {
      flex: 1;
    }
    
    .exposures-grid {
      margin: 0.2in 0;
    }
    
    .exposure-item {
      font-size: var(--font-size-sm);
      margin: var(--spacing-sm) 0;
      line-height: 1.8;
      color: var(--text-secondary);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-bottom: 1px solid var(--border-light);
      background: linear-gradient(135deg, var(--bg-white) 0%, var(--bg-light) 100%);
      border-radius: 6px;
      border-left: 2px solid var(--primary-color);
      position: relative;
    }
    
    .exposure-item::before {
      content: '●';
      position: absolute;
      left: var(--spacing-xs);
      color: var(--primary-color);
      font-size: 8pt;
    }
    
    .exposure-item:last-child {
      border-bottom: none;
    }
    
    .exposure-item strong {
      color: var(--text-primary);
      font-weight: 600;
      display: inline-block;
      min-width: 2.5in;
      margin-left: var(--spacing-sm);
    }
    
    .footnote {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      margin: var(--spacing-sm) 0;
      font-style: italic;
      line-height: 1.7;
      padding: var(--spacing-sm) var(--spacing-md);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-left: 3px solid var(--border-medium);
      border-radius: 6px;
      box-shadow: var(--shadow-sm);
      position: relative;
    }
    
    .footnote::before {
      content: '※';
      position: absolute;
      left: var(--spacing-xs);
      top: var(--spacing-xs);
      color: var(--text-tertiary);
      font-size: 10pt;
    }
    
    .work-description {
      margin: 0.2in 0;
    }
    
    .description-text {
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
      padding: var(--spacing-sm);
      background: var(--bg-white);
      border: 2px solid var(--border-medium);
      border-radius: 8px;
      min-height: 0.7in;
      line-height: 1.8;
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
      transition: border-color 0.2s;
    }
    
    .description-text:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
    }
    
    .work-percentages,
    .structural-details {
      margin: 0.2in 0;
    }
    
    .percentage-item,
    .detail-item {
      font-size: var(--font-size-sm);
      margin: var(--spacing-sm) 0;
      line-height: 1.8;
      color: var(--text-secondary);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--bg-white);
      border-left: 2px solid var(--primary-color);
      border-radius: 4px;
      position: relative;
    }
    
    .percentage-item::before,
    .detail-item::before {
      content: '▹';
      position: absolute;
      left: var(--spacing-xs);
      color: var(--primary-color);
      font-size: 8pt;
    }
    
    .percentage-item strong,
    .detail-item strong {
      color: var(--text-primary);
      font-weight: 600;
      display: inline-block;
      min-width: 2in;
      margin-left: var(--spacing-sm);
    }
    
    .ocip-section {
      margin: 0.2in 0;
    }
    
    .ocip-question,
    .ocip-followup,
    .ocip-receipts,
    .losses {
      font-size: 10pt;
      margin: 0.12in 0;
      line-height: 1.7;
      color: #374151;
    }
    
    .ocip-question strong,
    .ocip-followup strong,
    .ocip-receipts strong,
    .losses strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    .work-experience-questions {
      margin: 0.2in 0;
    }
    
    .question-item {
      margin: var(--spacing-md) 0;
      padding: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--border-light);
      background: linear-gradient(135deg, var(--bg-white) 0%, var(--bg-light) 100%);
      border-radius: 8px;
      border-left: 3px solid var(--primary-color);
      box-shadow: var(--shadow-sm);
      position: relative;
    }
    
    .question-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, var(--primary-color) 0%, var(--primary-light) 100%);
      border-radius: 8px 0 0 8px;
    }
    
    .question-item:last-child {
      border-bottom: none;
    }
    
    .question-text {
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-xs);
      line-height: 1.8;
      color: var(--text-secondary);
      text-align: justify;
    }
    
    .question-text strong {
      color: var(--text-primary);
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    
    .yes-no-options {
      font-size: var(--font-size-sm);
      margin: var(--spacing-xs) 0;
      padding: var(--spacing-xs) var(--spacing-sm);
      font-weight: 600;
      color: var(--text-primary);
      background: var(--bg-light);
      border-radius: 6px;
      display: inline-block;
      border: 1px solid var(--border-light);
    }
    
    .yes-no-options span {
      margin: 0 var(--spacing-xs);
      padding: 0 var(--spacing-xs);
    }
    
    .yes-no-options span[style*="underline"] {
      color: var(--primary-color);
      font-weight: 700;
    }
    
    .explanation-field {
      font-size: 10pt;
      margin-top: 0.1in;
      padding: 0.1in;
      padding-left: 0.15in;
      background: #f9fafb;
      border-left: 3px solid #d1d5db;
      border-radius: 4px;
      line-height: 1.7;
      color: #374151;
    }
    
    .explanation-field strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    .percentage-field {
      font-size: 10pt;
      margin-top: 0.1in;
      padding: 0.08in 0;
      color: #374151;
    }
    
    .percentage-field strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    .page-number {
      position: absolute;
      bottom: 0.4in;
      right: 0.6in;
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      font-weight: 600;
      padding: 0.06in 0.18in;
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-radius: 20px;
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-sm);
      letter-spacing: 0.5px;
    }
    
    /* Professional Badges */
    .badge {
      display: inline-block;
      padding: 0.05in 0.15in;
      border-radius: 20px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: var(--shadow-sm);
    }
    
    .badge-primary {
      background: var(--primary-color);
      color: var(--text-inverse);
      border: 1px solid var(--primary-dark);
    }
    
    .badge-success {
      background: var(--accent-color);
      color: var(--text-inverse);
      border: 1px solid #059669;
    }
    
    .badge-warning {
      background: var(--warning-color);
      color: var(--text-inverse);
      border: 1px solid #d97706;
    }
    
    .badge-secondary {
      background: var(--bg-medium);
      color: var(--text-primary);
      border: 1px solid var(--border-medium);
    }
    
    /* Application ID Badge */
    .application-id-badge {
      display: inline-block;
      padding: 0.08in 0.2in;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: var(--text-inverse);
      border-radius: 25px;
      font-size: var(--font-size-sm);
      font-weight: 700;
      letter-spacing: 1px;
      box-shadow: var(--shadow-premium), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      border: 2px solid rgba(255, 255, 255, 0.3);
      position: relative;
    }
    
    .application-id-badge::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      height: 40%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
      border-radius: 25px 25px 0 0;
      pointer-events: none;
    }
    
    .sub-question-header {
      font-size: var(--font-size-base);
      font-weight: 700;
      margin: var(--spacing-sm) 0 var(--spacing-xs) 0;
      color: var(--text-primary);
      padding: var(--spacing-sm) var(--spacing-md);
      background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-light) 100%);
      border-left: 4px solid var(--primary-color);
      border-radius: 6px;
      box-shadow: var(--shadow-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 10pt;
    }
    
    .sub-question-item {
      margin: var(--spacing-sm) 0;
      padding: var(--spacing-sm) var(--spacing-md);
      padding-left: var(--spacing-lg);
      background: var(--bg-white);
      border-left: 2px solid var(--border-medium);
      border-radius: 4px;
      position: relative;
    }
    
    .sub-question-item::before {
      content: '→';
      position: absolute;
      left: var(--spacing-sm);
      color: var(--primary-color);
      font-weight: 700;
    }
    
    .policy-endorsements-content {
      font-size: 11pt;
      margin-top: 0.15in;
      padding: 0.15in;
      background: #f9fafb;
      border-radius: 6px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .notice-content,
    .exclusions-content,
    .agreement-content,
    .terrorism-content {
      font-size: 10pt;
      line-height: 1.8;
      margin: 0.2in 0;
      color: #374151;
    }
    
    .notice-content p,
    .exclusions-content p,
    .agreement-content p,
    .terrorism-content p {
      margin: 0.15in 0;
      text-align: justify;
    }
    
    .initial-line {
      font-size: 10pt;
      margin: 0.2in 0;
      padding-top: 0.15in;
      padding-bottom: 0.1in;
      border-top: 1px solid #e5e7eb;
      color: #374151;
      font-weight: 500;
    }
    
    .signature-section {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      border-top: 3px solid var(--primary-color);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-radius: 8px;
      box-shadow: var(--shadow-premium);
      position: relative;
      overflow: hidden;
    }
    
    .signature-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 50%, var(--primary-color) 100%);
    }
    
    .signature-field {
      margin: var(--spacing-md) 0;
      padding: var(--spacing-sm);
      background: var(--bg-white);
      border-radius: 6px;
      border: 1px solid var(--border-light);
    }
    
    .signature-label {
      font-size: var(--font-size-sm);
      font-weight: 600;
      margin-bottom: var(--spacing-xs);
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 9pt;
    }
    
    .signature-line {
      font-size: var(--font-size-sm);
      border-bottom: 2px dotted var(--text-primary);
      min-width: 3.5in;
      padding-bottom: var(--spacing-xs);
      color: var(--text-primary);
      margin-top: var(--spacing-xs);
      background: var(--bg-white);
    }
    
    .signature-date {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      margin-top: var(--spacing-xs);
      font-style: italic;
    }
    
    .carrier-header {
      text-align: center;
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      border-bottom: 3px solid var(--primary-color);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-white) 100%);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
    }
    
    .carrier-name-large {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    
    .endorsement-notice {
      font-size: 10.5pt;
      font-weight: 700;
      margin: 0.12in 0;
      text-transform: uppercase;
      color: #dc2626;
      letter-spacing: 0.5px;
    }
    
    .carrier-name-medium {
      font-size: 13pt;
      font-weight: 700;
      margin: 0.12in 0;
      color: #1f2937;
    }
    
    .policy-type {
      font-size: 10.5pt;
      margin: 0.08in 0;
      color: #6b7280;
      font-weight: 500;
    }
    
    .document-title {
      font-size: 12pt;
      font-weight: 700;
      margin: 0.2in 0;
      color: #1f2937;
    }
    
    .section-title-bold {
      font-size: var(--font-size-xl);
      font-weight: 700;
      margin: var(--spacing-md) 0 var(--spacing-md) 0;
      text-transform: uppercase;
      color: var(--text-primary);
      letter-spacing: 0.8px;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-bottom: 3px solid var(--primary-color);
      background: var(--bg-light);
      border-radius: 8px 8px 0 0;
    }
    
    .premium-disclosure-content,
    .certification-content,
    .warranty-content {
      font-size: 10pt;
      line-height: 1.8;
      margin: 0.2in 0;
      color: #374151;
    }
    
    .premium-disclosure-content p,
    .certification-content p,
    .warranty-content p {
      margin: 0.15in 0;
      text-align: justify;
    }
    
    .premium-disclosure-content strong,
    .certification-content strong,
    .warranty-content strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    .rejection-statement-box {
      border: 3px solid var(--warning-color);
      padding: var(--spacing-md);
      margin: var(--spacing-md) 0;
      font-size: var(--font-size-sm);
      background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
      border-radius: 8px;
      line-height: 1.8;
      color: var(--text-primary);
      box-shadow: var(--shadow-md);
    }
    
    .applicant-name-large {
      font-size: 13pt;
      font-weight: 700;
      margin-bottom: 0.08in;
      color: #1f2937;
    }
    
    .applicant-address,
    .applicant-city-state-zip,
    .applicant-phone,
    .applicant-email,
    .quote-id {
      font-size: 10pt;
      margin: 0.05in 0;
      line-height: 1.6;
      color: #374151;
    }
    
    .warranty-footer {
      font-size: 9pt;
      line-height: 1.7;
      margin-top: 0.35in;
      padding: 0.15in;
      background: #f9fafb;
      border-left: 3px solid #d1d5db;
      border-radius: 4px;
      color: #374151;
    }
    
    .warranty-footer strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    .invoice-header {
      margin-bottom: 0.3in;
      padding-bottom: 0.2in;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .invoice-field {
      font-size: 10pt;
      margin: 0.08in 0;
      line-height: 1.6;
      color: #374151;
    }
    
    .invoice-field strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    .invoice-section {
      margin: 0.3in 0;
    }
    
    .invoice-section-title {
      font-size: var(--font-size-base);
      font-weight: 700;
      margin-bottom: var(--spacing-sm);
      text-transform: uppercase;
      color: var(--text-primary);
      letter-spacing: 0.8px;
      padding: var(--spacing-sm) var(--spacing-md);
      border-bottom: 3px solid var(--primary-color);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-medium) 100%);
      border-radius: 8px 8px 0 0;
      box-shadow: var(--shadow-sm);
      position: relative;
    }
    
    .invoice-section-title::before {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 50%, var(--primary-color) 100%);
    }
    
    .invoice-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-bottom: 1px solid var(--border-light);
      font-size: var(--font-size-sm);
      line-height: 1.7;
      color: var(--text-secondary);
      transition: background-color 0.2s;
    }
    
    .invoice-row:nth-child(even) {
      background: var(--bg-light);
    }
    
    .invoice-row:hover {
      background: var(--bg-medium);
    }
    
    .invoice-row-total {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-sm) var(--spacing-md);
      border-top: 3px solid var(--primary-color);
      margin-top: var(--spacing-xs);
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--text-primary);
      background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-medium) 100%);
      border-radius: 0 0 8px 8px;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    
    .invoice-row-total::before {
      content: '';
      position: absolute;
      top: -3px;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 50%, var(--primary-color) 100%);
    }
    
    .invoice-label {
      flex: 1;
      font-weight: 500;
    }
    
    .invoice-value {
      text-align: right;
      min-width: 1.3in;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .invoice-row-total .invoice-label {
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .invoice-row-total .invoice-value {
      font-weight: 700;
      font-size: var(--font-size-lg);
      color: var(--primary-color);
    }
    
    .payment-option {
      font-size: var(--font-size-sm);
      margin: var(--spacing-md) 0;
      padding: var(--spacing-sm) var(--spacing-md);
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 4px solid var(--accent-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-weight: 600;
      box-shadow: var(--shadow-sm);
      border-top: 1px solid var(--border-light);
      border-right: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
    }
    
    .payment-option strong {
      color: var(--accent-color);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .binding-statement {
      font-size: 10pt;
      margin: 0.25in 0;
      line-height: 1.7;
      color: #374151;
    }
    
    .invoice-disclaimer {
      font-size: 9pt;
      font-style: italic;
      margin-top: 0.25in;
      line-height: 1.6;
      color: #6b7280;
      padding: 0.1in;
      background: #f9fafb;
      border-radius: 4px;
    }
    
    @media print {
      .page {
        page-break-after: always;
      }
      .page:last-child {
        page-break-after: auto;
      }
    }
  `;
  
  // Optimize CSS and minify HTML to reduce size for PDFShift
  const optimizedCSS = optimizeCSS(cssContent);
  const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${optimizedCSS}</style></head><body>${pages}</body></html>`;
  
  // Minify the final HTML
  return minifyHTML(fullHTML);
}

