/**
 * Proposal PDF Generator
 * Generates a professional proposal document for the insured to review and sign
 */

interface ProposalData {
  // Quote Information
  quoteNumber: string;
  proposalDate: string;
  
  // Insured Information
  companyName: string;
  dba?: string;
  firstName: string;
  lastName: string;
  entityType: string;
  companyFEIN: string;
  phone: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Agency Information
  agencyName: string;
  agencyEmail?: string;
  agencyPhone?: string;
  
  // Carrier Information
  carrierName: string;
  carrierReference?: string;
  
  // Policy Information
  programName: string;
  effectiveDate: string;
  expirationDate: string;
  
  // Premium Breakdown
  carrierQuoteUSD: number;
  // No wholesale fee - removed per user request
  premiumTaxPercent?: number;
  premiumTaxAmountUSD?: number;
  policyFeeUSD?: number;
  brokerFeeAmountUSD?: number;
  finalAmountUSD: number;
  
  // Limits
  limits?: {
    generalLiability?: string;
    aggregateLimit?: string;
    fireLegalLimit?: string;
    medicalExpenseLimit?: string;
    deductible?: string;
  };
  
  // Endorsements
  endorsements?: string[];
  
  // Special Notes
  specialNotes?: string;
}

export function generateProposalHTML(data: ProposalData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #2c3e50;
      padding: 30px;
      background: #ffffff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 4px solid #00BCD4;
    }
    
    .header h1 {
      font-size: 32px;
      color: #1a1a1a;
      margin-bottom: 8px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #6B6B6B;
      font-weight: 400;
    }
    
    .quote-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .quote-info-item {
      flex: 1;
    }
    
    .quote-info-label {
      font-size: 9px;
      color: #6B6B6B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .quote-info-value {
      font-size: 13px;
      color: #1a1a1a;
      font-weight: 600;
    }
    
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .section-header {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #00BCD4;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .section-content {
      padding: 0 5px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .info-item {
      margin-bottom: 10px;
    }
    
    .info-label {
      font-size: 9px;
      color: #6B6B6B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    
    .info-value {
      font-size: 11px;
      color: #1a1a1a;
      font-weight: 500;
    }
    
    .premium-breakdown {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      margin-top: 15px;
    }
    
    .premium-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .premium-row:last-child {
      border-bottom: none;
    }
    
    .premium-row.total {
      margin-top: 10px;
      padding-top: 15px;
      border-top: 2px solid #00BCD4;
      font-weight: 700;
      font-size: 13px;
    }
    
    .premium-label {
      color: #4A4A4A;
      font-size: 11px;
    }
    
    .premium-value {
      color: #1a1a1a;
      font-weight: 600;
      font-size: 11px;
    }
    
    .premium-row.total .premium-label,
    .premium-row.total .premium-value {
      font-size: 13px;
      color: #00BCD4;
    }
    
    .limits-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 10px;
    }
    
    .endorsements-list {
      list-style: none;
      margin-top: 10px;
    }
    
    .endorsements-list li {
      padding: 5px 0;
      padding-left: 20px;
      position: relative;
      font-size: 11px;
      color: #4A4A4A;
    }
    
    .endorsements-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #00BCD4;
      font-weight: 700;
    }
    
    .signature-section {
      margin-top: 40px;
      padding-top: 25px;
      border-top: 2px solid #e0e0e0;
      page-break-inside: avoid;
    }
    
    .signature-box {
      margin-top: 30px;
      margin-bottom: 20px;
    }
    
    .signature-line {
      border-bottom: 2px solid #1a1a1a;
      width: 300px;
      margin-bottom: 8px;
      padding-bottom: 5px;
    }
    
    .signature-label {
      font-size: 10px;
      color: #6B6B6B;
      margin-top: 5px;
    }
    
    .footer {
      position: fixed;
      bottom: 20px;
      left: 30px;
      right: 30px;
      text-align: center;
      font-size: 8px;
      color: #6B6B6B;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
    }
    
    .notice {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin-top: 20px;
      border-radius: 4px;
      font-size: 10px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Insurance Proposal</h1>
    <div class="subtitle">Sterling Wholesale Insurance</div>
  </div>
  
  <div class="quote-info">
    <div class="quote-info-item">
      <div class="quote-info-label">Proposal Number</div>
      <div class="quote-info-value">${data.quoteNumber}</div>
    </div>
    <div class="quote-info-item">
      <div class="quote-info-label">Date</div>
      <div class="quote-info-value">${data.proposalDate}</div>
    </div>
    <div class="quote-info-item">
      <div class="quote-info-label">Program</div>
      <div class="quote-info-value">${data.programName}</div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-header">Insured Information</div>
    <div class="section-content">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Company Name</div>
          <div class="info-value">${data.companyName}</div>
        </div>
        ${data.dba ? `
        <div class="info-item">
          <div class="info-label">DBA</div>
          <div class="info-value">${data.dba}</div>
        </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">Entity Type</div>
          <div class="info-value">${data.entityType}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Company FEIN</div>
          <div class="info-value">${data.companyFEIN}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Contact Name</div>
          <div class="info-value">${data.firstName} ${data.lastName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Phone</div>
          <div class="info-value">${data.phone}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${data.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Address</div>
          <div class="info-value">${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-header">Agency Information</div>
    <div class="section-content">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Agency Name</div>
          <div class="info-value">${data.agencyName}</div>
        </div>
        ${data.agencyEmail ? `
        <div class="info-item">
          <div class="info-label">Agency Email</div>
          <div class="info-value">${data.agencyEmail}</div>
        </div>
        ` : ''}
        ${data.agencyPhone ? `
        <div class="info-item">
          <div class="info-label">Agency Phone</div>
          <div class="info-value">${data.agencyPhone}</div>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-header">Carrier Information</div>
    <div class="section-content">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Carrier Name</div>
          <div class="info-value">${data.carrierName}</div>
        </div>
        ${data.carrierReference ? `
        <div class="info-item">
          <div class="info-label">Carrier Reference</div>
          <div class="info-value">${data.carrierReference}</div>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-header">Policy Information</div>
    <div class="section-content">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Effective Date</div>
          <div class="info-value">${data.effectiveDate}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Expiration Date</div>
          <div class="info-value">${data.expirationDate}</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-header">Premium Breakdown</div>
    <div class="section-content">
      <div class="premium-breakdown">
        <div class="premium-row">
          <span class="premium-label">Carrier Quote:</span>
          <span class="premium-value">$${data.carrierQuoteUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        ${data.premiumTaxAmountUSD ? `
        <div class="premium-row">
          <span class="premium-label">Premium Tax${data.premiumTaxPercent ? ` (${data.premiumTaxPercent}%)` : ''}:</span>
          <span class="premium-value">$${data.premiumTaxAmountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        ` : ''}
        ${data.policyFeeUSD ? `
        <div class="premium-row">
          <span class="premium-label">Policy Fee:</span>
          <span class="premium-value">$${data.policyFeeUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        ` : ''}
        ${data.brokerFeeAmountUSD ? `
        <div class="premium-row">
          <span class="premium-label">Broker Fee:</span>
          <span class="premium-value">$${data.brokerFeeAmountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        ` : ''}
        <div class="premium-row total">
          <span class="premium-label">Total Premium:</span>
          <span class="premium-value">$${data.finalAmountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  </div>
  
  ${data.limits ? `
  <div class="section">
    <div class="section-header">Policy Limits</div>
    <div class="section-content">
      <div class="limits-grid">
        ${data.limits.generalLiability ? `
        <div class="info-item">
          <div class="info-label">General Liability</div>
          <div class="info-value">${data.limits.generalLiability}</div>
        </div>
        ` : ''}
        ${data.limits.aggregateLimit ? `
        <div class="info-item">
          <div class="info-label">Aggregate Limit</div>
          <div class="info-value">${data.limits.aggregateLimit}</div>
        </div>
        ` : ''}
        ${data.limits.fireLegalLimit ? `
        <div class="info-item">
          <div class="info-label">Fire Legal Limit</div>
          <div class="info-value">$${data.limits.fireLegalLimit}</div>
        </div>
        ` : ''}
        ${data.limits.medicalExpenseLimit ? `
        <div class="info-item">
          <div class="info-label">Medical Expense Limit</div>
          <div class="info-value">$${data.limits.medicalExpenseLimit}</div>
        </div>
        ` : ''}
        ${data.limits.deductible ? `
        <div class="info-item">
          <div class="info-label">Deductible</div>
          <div class="info-value">$${data.limits.deductible}</div>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
  ` : ''}
  
  ${data.endorsements && data.endorsements.length > 0 ? `
  <div class="section">
    <div class="section-header">Included Endorsements</div>
    <div class="section-content">
      <ul class="endorsements-list">
        ${data.endorsements.map(endorsement => `<li>${endorsement}</li>`).join('')}
      </ul>
    </div>
  </div>
  ` : ''}
  
  ${data.specialNotes ? `
  <div class="section">
    <div class="section-header">Special Notes</div>
    <div class="section-content">
      <div class="info-value">${data.specialNotes}</div>
    </div>
  </div>
  ` : ''}
  
  <div class="signature-section">
    <div class="section-header">Acknowledgment & Signature</div>
    <div class="section-content">
      <p style="font-size: 11px; color: #4A4A4A; margin-bottom: 20px;">
        By signing below, I acknowledge that I have reviewed this proposal and understand the terms, conditions, and premium outlined above. I authorize the agency to proceed with binding this coverage upon my approval.
      </p>
      
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Insured Signature</div>
      </div>
      
      <div style="margin-top: 20px;">
        <div class="signature-line" style="width: 200px;"></div>
        <div class="signature-label">Date</div>
      </div>
    </div>
  </div>
  
  <div class="notice">
    <strong>Important Notice:</strong> This is a proposal document. Coverage is subject to carrier approval and binding. Premium and terms are subject to change based on final underwriting review.
  </div>
  
  <div class="footer">
    <p>This proposal is generated by Sterling Wholesale Insurance Portal</p>
    <p>© ${new Date().getFullYear()} Sterling Wholesale Insurance. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

