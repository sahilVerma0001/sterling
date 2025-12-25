"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import StatusBadge from "@/components/agency/quotes/StatusBadge";
import StatusTimeline from "@/components/ui/StatusTimeline";
import {
  getESignStatus,
  getDocuments,
  getPaymentStatus,
} from "@/lib/client/api";

interface Quote {
  _id: string;
  submissionId: string;
  carrierId: string;
  carrierName: string;
  clientName: string;
  carrierQuoteUSD: number;
  brokerFeeAmountUSD: number;
  premiumTaxPercent?: number;
  premiumTaxAmountUSD?: number;
  policyFeeUSD?: number;
  finalAmountUSD: number;
  status: string;
  submissionStatus: string;
  esignCompleted: boolean;
  paymentStatus: string;
  createdAt: string;
  financePlan?: any;
  binderPdfUrl?: string;
}

interface Submission {
  _id: string;
  agencyId: string;
  templateId: {
    _id: string;
    name: string;
    industry: string;
    subcategory?: string;
  };
  payload: Record<string, any>;
  clientContact: {
    name: string;
    email: string;
    phone: string;
    EIN?: string;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  status: string;
  esignCompleted: boolean;
  esignCompletedAt?: string;
  paymentStatus: string;
  paymentDate?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  bindRequested?: boolean;
  bindRequestedAt?: string;
  bindApproved?: boolean;
  bindApprovedAt?: string;
  signedDocuments?: SignedDocument[];
  createdAt: string;
}

interface SignedDocument {
  documentType: "PROPOSAL" | "FINANCE_AGREEMENT" | "CARRIER_FORM";
  documentName: string;
  documentUrl: string;
  generatedAt: string;
  signatureStatus: "GENERATED" | "SENT" | "SIGNED" | "FAILED";
  sentForSignatureAt?: string;
  signedAt?: string;
}

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [documents, setDocuments] = useState<SignedDocument[]>([]);
  const [esignStatus, setEsignStatus] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Individual loading states for each button
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [generatingFinanceAgreement, setGeneratingFinanceAgreement] = useState(false);
  const [generatingCarrierForm, setGeneratingCarrierForm] = useState(false);
  const [sendingEsign, setSendingEsign] = useState(false);
  const [paying, setPaying] = useState(false);
  const [binding, setBinding] = useState(false);
  const [signingUrl, setSigningUrl] = useState<string | undefined>();
  
  // Broker fee editing
  const [editingBrokerFee, setEditingBrokerFee] = useState(false);
  const [brokerFeeInput, setBrokerFeeInput] = useState("");
  const [savingBrokerFee, setSavingBrokerFee] = useState(false);

  // Prepare submission data for StatusTimeline - MUST be before any early returns
  const timelineSubmissionData = useMemo(() => {
    if (!submission || !quote) return null;
    
    return {
      quoteStatus: quote.status,
      signedDocuments: documents,
      esignCompleted: submission.esignCompleted,
      paymentStatus: submission.paymentStatus,
      bindRequested: submission.bindRequested,
      bindApproved: submission.bindApproved,
    };
  }, [submission, quote, documents]);

  // Fetch all data
  useEffect(() => {
    if (quoteId) {
      fetchData();
    }
  }, [quoteId]);

  // Initialize broker fee input when quote loads
  useEffect(() => {
    if (quote) {
      setBrokerFeeInput(quote.brokerFeeAmountUSD?.toFixed(2) || "0.00");
    }
  }, [quote]);

  // Handle broker fee update
  const handleUpdateBrokerFee = async () => {
    if (!quote) return;
    
    const newFee = parseFloat(brokerFeeInput);
    if (isNaN(newFee) || newFee < 0) {
      toast.error("Invalid broker fee amount");
      return;
    }

    try {
      setSavingBrokerFee(true);
      const res = await fetch(`/api/agency/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerFeeAmountUSD: newFee }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update broker fee");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Broker fee updated successfully!");
        setEditingBrokerFee(false);
        // Refresh quote data
        await fetchData();
      } else {
        throw new Error(data.error || "Failed to update broker fee");
      }
    } catch (err: any) {
      toast.error("Error updating broker fee", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setSavingBrokerFee(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch quote
      const quoteRes = await fetch(`/api/agency/quotes/${quoteId}`, { cache: "no-store" });
      if (!quoteRes.ok) throw new Error("Failed to fetch quote");
      const quoteData = await quoteRes.json();
      setQuote(quoteData.quote);

      const submissionId = quoteData.quote.submissionId;

      // Fetch submission
      const submissionRes = await fetch(`/api/agency/submissions/${submissionId}`, {
        cache: "no-store",
      });
      if (!submissionRes.ok) throw new Error("Failed to fetch submission");
      const submissionData = await submissionRes.json();
      setSubmission(submissionData.submission);

      // Fetch documents
      const docsData = await getDocuments(submissionId);
      if (docsData.documents) {
        setDocuments(docsData.documents);
      }

      // Fetch e-sign status
      const esignData = await getESignStatus(submissionId);
      if (esignData.documents) {
        setEsignStatus(esignData);
      }

      // Fetch payment status
      const paymentData = await getPaymentStatus(submissionId);
      if (paymentData.paymentStatus) {
        setPaymentStatus(paymentData);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error("Failed to load quote details", {
        description: err.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate required documents count
  const requiredDocumentsCount = useMemo(() => {
    let count = 2; // Proposal + Carrier Forms (always required)
    if (quote?.financePlan) {
      count += 1; // Finance Agreement (if finance plan exists)
    }
    return count;
  }, [quote]);

  // Button visibility and enablement rules - EXACT BUSINESS LOGIC
  // Documents disabled when: submission.esignCompleted === true
  const canGenerateDocuments = quote?.status === "APPROVED" && submission?.esignCompleted !== true;
  const hasAllDocuments = documents.length >= requiredDocumentsCount;
  // E-sign disabled when: documents not generated OR submission.esignCompleted === true
  const canEsign = hasAllDocuments && submission?.esignCompleted !== true;
  // Payment disabled when: !submission.esignCompleted
  const canPay = submission?.esignCompleted === true && submission?.paymentStatus !== "PAID";
  // Bind Request disabled when: paymentStatus !== "PAID" OR esignCompleted === false
  const canBind = submission?.esignCompleted === true && submission?.paymentStatus === "PAID" && !submission?.bindRequested;

  // Generate document handlers with proper error handling
  const handleGenerateProposal = async () => {
    if (!quote || !submission) return;
    try {
      setGeneratingProposal(true);
      
      // Step 1: Generate and store document (if not already generated)
      const proposalDoc = documents.find(d => d.documentType === "PROPOSAL");
      if (!proposalDoc) {
        // Generate documents (this will store Proposal PDF)
        const generateRes = await fetch(`/api/agency/quotes/${quoteId}/generate-documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!generateRes.ok) {
          const errorData = await generateRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate documents");
        }

        // Refresh data to get updated documents
        await fetchData();
      }

      // Step 2: Download the PDF
      const res = await fetch(`/api/agency/quotes/${quoteId}/proposal-pdf`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download proposal");
      }

      // Get PDF blob and download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Proposal PDF generated and downloaded!");
    } catch (err: any) {
      toast.error("Error generating proposal.", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setGeneratingProposal(false);
    }
  };

  const handleGenerateFinanceAgreement = async () => {
    if (!submission) return;
    try {
      setGeneratingFinanceAgreement(true);
      const res = await fetch("/api/documents/generate-finance-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission._id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate finance agreement");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Finance Agreement generated!");
        await fetchData();
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to generate finance agreement");
      }
    } catch (err: any) {
      toast.error("Error generating finance agreement.", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setGeneratingFinanceAgreement(false);
    }
  };

  const handleGenerateCarrierForms = async () => {
    if (!quote || !submission) return;
    try {
      setGeneratingCarrierForm(true);
      
      // Step 1: Generate and store document (if not already generated)
      const carrierDoc = documents.find(d => d.documentType === "CARRIER_FORM");
      if (!carrierDoc) {
        // Generate documents (this will store Carrier Forms PDF)
        const generateRes = await fetch(`/api/agency/quotes/${quoteId}/generate-documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!generateRes.ok) {
          const errorData = await generateRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate documents");
        }

        // Refresh data to get updated documents
        await fetchData();
      }

      // Step 2: Download the PDF
      const res = await fetch(`/api/agency/quotes/${quoteId}/carrier-forms-pdf`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download carrier forms");
      }

      // Get PDF blob and download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carrier-forms-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Carrier Forms PDF generated and downloaded!");
    } catch (err: any) {
      toast.error("Error generating carrier forms.", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setGeneratingCarrierForm(false);
    }
  };

  // E-Sign handlers with proper error handling
  const handleSendForEsign = async () => {
    if (!submission || !quote) return;
    try {
      setSendingEsign(true);
      
      // Step 1: Generate documents if needed
      console.log("📄 Generating documents if needed...");
      const generateRes = await fetch(`/api/agency/quotes/${quoteId}/generate-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!generateRes.ok) {
        const errorData = await generateRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate documents");
      }

      const generateData = await generateRes.json();
      if (generateData.documentsGenerated > 0) {
        toast.success(`${generateData.documentsGenerated} document(s) generated`);
        // Refresh data to get updated documents
        await fetchData();
      }

      // Step 2: Send documents for e-signature
      console.log("📝 Sending documents for e-signature...");
      const res = await fetch("/api/esign/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission._id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send for e-signature");
      }

      const data = await res.json();
      if (data.success) {
        setSigningUrl(data.signingUrl);
        toast.success("Documents sent for e-signature!");
        if (data.signingUrl) {
          // Redirect to signing page
          window.open(data.signingUrl, '_blank');
        }
        await fetchData();
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to send for e-signature");
      }
    } catch (err: any) {
      toast.error("Unable to send for signature", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setSendingEsign(false);
    }
  };

  // Payment handler with proper error handling
  const handlePayNow = async () => {
    if (!submission || !quote) return;
    try {
      setPaying(true);
      const res = await fetch("/api/payment/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission._id,
          amount: quote.finalAmountUSD,
          method: "CARD",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Payment failed");
      }

      const data = await res.json();
      if (data.success || data.paymentStatus === "PAID") {
        toast.success("Payment successful!");
        await fetchData();
        router.refresh();
      } else {
        throw new Error(data.error || "Payment failed");
      }
    } catch (err: any) {
      toast.error("Error processing payment.", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setPaying(false);
    }
  };

  // Bind request handler with proper error handling
  const handleRequestBind = async () => {
    if (!submission) return;
    try {
      setBinding(true);
      const res = await fetch("/api/bind/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission._id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Bind request failed");
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Bind request sent!");
        await fetchData();
        router.refresh();
      } else {
        throw new Error(data.error || "Bind request failed");
      }
    } catch (err: any) {
      toast.error("Error requesting bind.", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setBinding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quote details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quote || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">Quote not found</p>
            <Link
              href="/agency/quotes"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              ← Back to Quotes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if quote is approved for workflow UI
  const showWorkflowUI = quote.status === "APPROVED" || quote.status === "BIND_REQUESTED" || quote.status === "BOUND";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/agency/quotes"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Quotes
          </Link>
          <h2 className="text-2xl font-bold">Quote Details</h2>
          <p className="text-gray-600 mt-2">
            Quote ID: {quoteId} • Client: {submission?.clientContact?.name || "N/A"}
          </p>
        </div>

        {/* Status Timeline */}
        {timelineSubmissionData && (
          <StatusTimeline submission={timelineSubmissionData} />
        )}

        {/* Status Badges */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Current Status</h3>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={submission.status} type="submission" />
            <StatusBadge status={quote.status} type="quote" />
            {submission.esignCompleted === true ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ✓ E‑Signature Complete
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                ⏳ Awaiting Signature
              </span>
            )}
            {submission.signedDocuments && submission.signedDocuments.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {submission.signedDocuments.filter((d: any) => d.signatureStatus === "SIGNED").length} / {submission.signedDocuments.length} Documents Signed
              </span>
            )}
            {paymentStatus?.paymentStatus === "PAID" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                ✓ PAYMENT RECEIVED
              </span>
            )}
            {quote.status === "BIND_REQUESTED" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                ⏳ Bind Requested
              </span>
            )}
            {quote.status === "BOUND" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ✓ Policy Bound
              </span>
            )}
            {submission.bindRequested && !submission.bindApproved && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                ⏳ Bind Request Submitted (Pending Admin Approval)
              </span>
            )}
            {submission.bindApproved && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ✓ Policy Bound (✓)
              </span>
            )}
          </div>
        </div>

        {/* Quote Breakdown & Broker Fee */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Quote Breakdown</h3>
            {quote.status === "POSTED" && (
              <button
                onClick={() => setEditingBrokerFee(!editingBrokerFee)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {editingBrokerFee ? "Cancel" : "Edit Broker Fee"}
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Carrier Quote:</span>
              <span className="font-semibold">${quote.carrierQuoteUSD.toFixed(2)}</span>
            </div>
            
            {quote.premiumTaxAmountUSD && quote.premiumTaxAmountUSD > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">
                  Premium Tax{quote.premiumTaxPercent ? ` (${quote.premiumTaxPercent}%)` : ''}:
                </span>
                <span className="font-semibold">${quote.premiumTaxAmountUSD.toFixed(2)}</span>
              </div>
            )}
            
            {quote.policyFeeUSD && quote.policyFeeUSD > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Policy Fee:</span>
                <span className="font-semibold">${quote.policyFeeUSD.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Broker Fee:</span>
              {editingBrokerFee && quote.status === "POSTED" ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={brokerFeeInput}
                    onChange={(e) => setBrokerFeeInput(e.target.value)}
                    className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                    disabled={savingBrokerFee}
                  />
                  <button
                    onClick={handleUpdateBrokerFee}
                    disabled={savingBrokerFee}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {savingBrokerFee ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <span className="font-semibold">${quote.brokerFeeAmountUSD?.toFixed(2) || "0.00"}</span>
              )}
            </div>
            
            <div className="flex justify-between items-center py-3 border-t-2 border-gray-400 mt-2">
              <span className="text-lg font-bold">Total Amount:</span>
              <span className="text-lg font-bold text-blue-600">${quote.finalAmountUSD.toFixed(2)}</span>
            </div>
          </div>

          {/* Document Downloads */}
          <div className="mt-4 pt-4 border-t space-y-2">
            {quote.binderPdfUrl && (
              <a
                href={quote.binderPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BCD4] text-white rounded hover:bg-[#00ACC1] transition-colors mr-2"
              >
                <span>📄</span>
                <span>Download Binder PDF</span>
              </a>
            )}
            {quote.status === "POSTED" || quote.status === "APPROVED" ? (
              <>
                <button
                  onClick={handleGenerateProposal}
                  disabled={generatingProposal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                >
                  <span>📋</span>
                  <span>{generatingProposal ? "Generating..." : "Download Proposal PDF"}</span>
                </button>
                <button
                  onClick={handleGenerateCarrierForms}
                  disabled={generatingCarrierForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>📝</span>
                  <span>{generatingCarrierForm ? "Generating..." : "Download Carrier Forms PDF"}</span>
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Actions */}
          <div className="p-4 border rounded-md shadow bg-white space-y-6">
            <h3 className="text-lg font-semibold">Actions</h3>

            {/* DOCUMENT GENERATION */}
            {showWorkflowUI && (
              <div className="space-y-2">
                <h4 className="font-medium">Document Generation</h4>
                {!canGenerateDocuments && (
                  <p className="text-sm text-gray-500 mb-2">
                    {submission.esignCompleted === true
                      ? "Documents already sent for signature"
                      : "Quote must be approved to generate documents"}
                  </p>
                )}
                <button
                  onClick={handleGenerateProposal}
                  disabled={generatingProposal || !canGenerateDocuments || documents.some(d => d.documentType === "PROPOSAL")}
                  className="w-full md:w-auto rounded-md px-4 py-2 font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingProposal ? "Generating..." : "Generate Proposal PDF"}
                </button>
                {quote?.financePlan && (
                  <button
                    onClick={handleGenerateFinanceAgreement}
                    disabled={generatingFinanceAgreement || !canGenerateDocuments || documents.some(d => d.documentType === "FINANCE_AGREEMENT")}
                    className="w-full md:w-auto rounded-md px-4 py-2 font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {generatingFinanceAgreement ? "Generating..." : "Generate Finance Agreement PDF"}
                  </button>
                )}
                <button
                  onClick={handleGenerateCarrierForms}
                  disabled={generatingCarrierForm || !canGenerateDocuments || documents.some(d => d.documentType === "CARRIER_FORM")}
                  className="w-full md:w-auto rounded-md px-4 py-2 font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingCarrierForm ? "Generating..." : "Generate Carrier Forms PDF"}
                </button>
              </div>
            )}

            {/* E-SIGNATURE */}
            {showWorkflowUI && (
              <div className="space-y-2">
                <h4 className="font-medium">E‑Signature</h4>
                {!canEsign && (
                  <p className="text-sm text-gray-500 mb-2">
                    {!hasAllDocuments
                      ? `Generate all required documents (${documents.length}/${requiredDocumentsCount})`
                      : submission.esignCompleted === true
                      ? "E-Signature already completed"
                      : "Documents not ready"}
                  </p>
                )}
                <button
                  disabled={!canEsign || sendingEsign}
                  onClick={handleSendForEsign}
                  className="w-full md:w-auto rounded-md px-4 py-2 font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingEsign ? "Sending..." : "Send for Signature"}
                </button>
                {submission.clientContact?.email && (
                  <p className="text-xs text-gray-500 mt-1">
                    📧 Documents will be sent to: <span className="font-medium">{submission.clientContact.email}</span> ({submission.clientContact.name || "Insured"})
                  </p>
                )}
                {submission.esignCompleted === true && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ E-Signature completed on {submission.esignCompletedAt ? new Date(submission.esignCompletedAt).toLocaleString() : "N/A"}
                  </p>
                )}
              </div>
            )}

            {/* PAYMENT */}
            {showWorkflowUI && (
              <div className="space-y-2">
                <h4 className="font-medium">Payment</h4>
                {submission.esignCompleted === true ? (
                  submission.paymentStatus === "PAID" ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-semibold">✓ Payment Completed</p>
                      {paymentStatus?.paymentDate && (
                        <p className="text-sm text-green-700 mt-1">
                          Paid on {new Date(paymentStatus.paymentDate).toLocaleString()}
                        </p>
                      )}
                      {paymentStatus?.paymentAmount && (
                        <p className="text-sm text-green-700 mt-1">
                          Amount: ${paymentStatus.paymentAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        Total Amount: <span className="font-semibold">${quote.finalAmountUSD.toFixed(2)}</span>
                      </p>
                      <button
                        disabled={!canPay || paying}
                        onClick={handlePayNow}
                        className="w-full md:w-auto rounded-md px-4 py-2 font-medium shadow-sm bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {paying ? "Processing..." : "Make Payment"}
                      </button>
                    </>
                  )
                ) : (
                  <p className="text-sm text-red-500">
                    ⚠️ Complete e-signature before making payment
                  </p>
                )}
              </div>
            )}

            {/* BIND REQUEST */}
            {showWorkflowUI && (
              <div className="space-y-2">
                <h4 className="font-medium">Bind Request</h4>
                {submission.bindApproved ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-600 font-semibold">✓ Policy Bound</p>
                    {submission.bindApprovedAt && (
                      <p className="text-sm text-green-700 mt-1">
                        Approved on {new Date(submission.bindApprovedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : submission.bindRequested ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-semibold">⏳ Bind Request Sent</p>
                    {submission.bindRequestedAt && (
                      <p className="text-sm text-yellow-700 mt-1">
                        Requested on {new Date(submission.bindRequestedAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-sm text-yellow-700 mt-2">
                      Pending admin approval
                    </p>
                  </div>
                ) : (
                  <>
                    {!canBind && (
                      <p className="text-sm text-gray-500 mb-2">
                        {!submission.esignCompleted
                          ? "Complete e-signature first"
                          : submission.paymentStatus !== "PAID"
                          ? "Complete payment first"
                          : "All requirements must be met"}
                      </p>
                    )}
                    <button
                      disabled={!canBind || binding}
                      onClick={handleRequestBind}
                      className="w-full md:w-auto rounded-md px-4 py-2 font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {binding ? "Submitting..." : "Request Bind"}
                    </button>
                  </>
                )}
              </div>
            )}

            {!showWorkflowUI && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">
                  Quote must be approved before accessing workflow features.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Document Status */}
          <div className="p-4 border rounded-md shadow bg-white">
            <h3 className="font-semibold mb-3">Document Status</h3>
            
            {/* Binder PDF */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Binder PDF</span>
                  <p className="text-xs text-gray-500 mt-1">Available for download</p>
                </div>
                {quote.binderPdfUrl ? (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✓ Available
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    Not Available
                  </span>
                )}
              </div>
            </div>

            {/* Proposal PDF Status */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Proposal PDF</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const proposalDoc = documents.find(d => d.documentType === "PROPOSAL");
                      if (!proposalDoc) return "Not generated";
                      if (proposalDoc.signatureStatus === "SIGNED") return "Signed";
                      if (proposalDoc.signatureStatus === "SENT") return "Sent for signature";
                      return "Generated";
                    })()}
                  </p>
                </div>
                {(() => {
                  const proposalDoc = documents.find(d => d.documentType === "PROPOSAL");
                  if (!proposalDoc) {
                    return (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Not Generated
                      </span>
                    );
                  }
                  if (proposalDoc.signatureStatus === "SIGNED") {
                    return (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        ✓ Signed
                      </span>
                    );
                  }
                  if (proposalDoc.signatureStatus === "SENT") {
                    return (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        📧 Sent
                      </span>
                    );
                  }
                  return (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Generated
                    </span>
                  );
                })()}
              </div>
              {documents.find(d => d.documentType === "PROPOSAL")?.documentUrl && (
                <a
                  href={documents.find(d => d.documentType === "PROPOSAL")?.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  Download →
                </a>
              )}
            </div>

            {/* Carrier Forms PDF Status */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Carrier Forms PDF</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const carrierDoc = documents.find(d => d.documentType === "CARRIER_FORM");
                      if (!carrierDoc) return "Not generated";
                      if (carrierDoc.signatureStatus === "SIGNED") return "Signed";
                      if (carrierDoc.signatureStatus === "SENT") return "Sent for signature";
                      return "Generated";
                    })()}
                  </p>
                </div>
                {(() => {
                  const carrierDoc = documents.find(d => d.documentType === "CARRIER_FORM");
                  if (!carrierDoc) {
                    return (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Not Generated
                      </span>
                    );
                  }
                  if (carrierDoc.signatureStatus === "SIGNED") {
                    return (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        ✓ Signed
                      </span>
                    );
                  }
                  if (carrierDoc.signatureStatus === "SENT") {
                    return (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        📧 Sent
                      </span>
                    );
                  }
                  return (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Generated
                    </span>
                  );
                })()}
              </div>
              {documents.find(d => d.documentType === "CARRIER_FORM")?.documentUrl && (
                <a
                  href={documents.find(d => d.documentType === "CARRIER_FORM")?.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  Download →
                </a>
              )}
            </div>

            {/* Summary */}
            {documents.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-600">
                  {documents.filter(d => d.signatureStatus === "SIGNED").length} of {documents.length} documents signed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
