"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Carrier {
  _id: string;
  name: string;
  email: string;
  wholesaleFeePercent: number;
}

interface Submission {
  _id: string;
  clientContact: {
    name: string;
    email: string;
  };
  status: string;
  templateId?: {
    industry: string;
    subtype: string;
  } | null;
  programId?: string;
  programName?: string;
}

export default function AdminQuotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const submissionId = params?.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState("");
  const [carrierQuoteUSD, setCarrierQuoteUSD] = useState("");
  
  // Premium breakdown fields
  const [premiumTaxPercent, setPremiumTaxPercent] = useState("");
  const [premiumTaxAmountUSD, setPremiumTaxAmountUSD] = useState("");
  const [policyFeeUSD, setPolicyFeeUSD] = useState("");
  // Broker fee comes from application form, not admin input
  
  // Policy details (will be auto-populated from application form)
  const [generalLiabilityLimit, setGeneralLiabilityLimit] = useState("");
  const [aggregateLimit, setAggregateLimit] = useState("");
  const [fireLegalLimit, setFireLegalLimit] = useState("");
  const [medicalExpenseLimit, setMedicalExpenseLimit] = useState("");
  const [deductible, setDeductible] = useState("");
  
  // Endorsements (will be auto-populated from application form)
  const [selectedEndorsements, setSelectedEndorsements] = useState<string[]>([]);
  
  // Broker fee from application form
  const [brokerFeeFromForm, setBrokerFeeFromForm] = useState<number>(0);
  
  // Dates and other
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [carrierReference, setCarrierReference] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Available endorsements
  const availableEndorsements = [
    "Blanket Additional Insured",
    "Blanket Waiver of Subrogation",
    "Blanket Primary Wording",
    "Blanket Per Project Aggregate",
    "Blanket Completed Operations Aggregate",
    "Acts of Terrorism",
    "Notice of Cancellation to Third Parties",
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      // Only system_admin can access admin pages
      if (userRole !== "system_admin") {
        router.push("/agency/dashboard");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && submissionId) {
      fetchData();
    }
  }, [status, submissionId]);

  // Auto-populate limits, endorsements, and broker fee from application form
  useEffect(() => {
    if (submission && (submission as any).payload) {
      const formData = (submission as any).payload;
      
      // Get broker fee from form
      const brokerFee = parseFloat(formData.brokerFee) || 0;
      setBrokerFeeFromForm(brokerFee);
      
      // Get limits from form
      // Coverage limits come as "1M / 1M / 1M" format - parse to extract general liability and aggregate
      if (formData.coverageLimits) {
        const limitsStr = formData.coverageLimits;
        // Format: "1M / 1M / 1M" = "Per Occurrence / General Aggregate / Products Aggregate"
        // For now, set both to the same value or parse if needed
        setGeneralLiabilityLimit(limitsStr);
        setAggregateLimit(limitsStr);
      }
      
      // Fire Legal Limit and Medical Expense Limit may have dollar signs
      if (formData.fireLegalLimit) {
        // Remove dollar signs and commas for storage
        const cleanValue = formData.fireLegalLimit.replace(/[$,]/g, '');
        setFireLegalLimit(cleanValue);
      }
      if (formData.medicalExpenseLimit) {
        // Remove dollar signs and commas for storage
        const cleanValue = formData.medicalExpenseLimit.replace(/[$,]/g, '');
        setMedicalExpenseLimit(cleanValue);
      }
      if (formData.deductible) {
        // Remove dollar signs and commas for storage
        const cleanValue = formData.deductible.replace(/[$,]/g, '');
        setDeductible(cleanValue);
      }
      
      // Get endorsements from form
      const formEndorsements: string[] = [];
      if (formData.blanketAdditionalInsured) formEndorsements.push("Blanket Additional Insured");
      if (formData.blanketWaiverOfSubrogation) formEndorsements.push("Blanket Waiver of Subrogation");
      if (formData.blanketPrimaryWording) formEndorsements.push("Blanket Primary Wording");
      if (formData.blanketPerProjectAggregate) formEndorsements.push("Blanket Per Project Aggregate");
      if (formData.blanketCompletedOpsAggregate) formEndorsements.push("Blanket Completed Operations Aggregate");
      if (formData.actsOfTerrorism) formEndorsements.push("Acts of Terrorism");
      if (formData.noticeOfCancellationToThirdParties) formEndorsements.push("Notice of Cancellation to Third Parties");
      
      if (formEndorsements.length > 0) {
        setSelectedEndorsements(formEndorsements);
      }
    }
  }, [submission]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch submission
      const subRes = await fetch(`/api/admin/submissions/${submissionId}`);
      const subData = await subRes.json();
      if (subData.submission) {
        setSubmission(subData.submission);
      }

      // Fetch carriers
      const carriersRes = await fetch(`/api/admin/submissions/${submissionId}/carriers`);
      const carriersData = await carriersRes.json();
      console.log("Carriers API response:", carriersData);
      if (carriersData.carriers) {
        setCarriers(carriersData.carriers);
        if (carriersData.carriers.length > 0) {
          setSelectedCarrierId(carriersData.carriers[0]._id);
        } else {
          setError("No carriers available. Please ensure carriers are seeded and the submission has been routed.");
        }
      } else if (carriersData.error) {
        console.error("Carriers API error:", carriersData.error);
        setError(`Failed to load carriers: ${carriersData.error}`);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to load submission data");
    } finally {
      setLoading(false);
    }
  };

  const selectedCarrier = carriers.find((c) => c._id === selectedCarrierId);

  // Calculate tax amount when tax percent changes
  useEffect(() => {
    if (carrierQuoteUSD && premiumTaxPercent) {
      const carrierQuote = parseFloat(carrierQuoteUSD);
      const taxPercent = parseFloat(premiumTaxPercent);
      if (!isNaN(carrierQuote) && !isNaN(taxPercent) && carrierQuote > 0) {
        const taxAmount = (carrierQuote * taxPercent) / 100;
        setPremiumTaxAmountUSD(taxAmount.toFixed(2));
      } else {
        setPremiumTaxAmountUSD("");
      }
    } else {
      setPremiumTaxAmountUSD("");
    }
  }, [carrierQuoteUSD, premiumTaxPercent]);

  const calculateBreakdown = () => {
    if (!carrierQuoteUSD || !selectedCarrier) return null;

    const carrierQuote = parseFloat(carrierQuoteUSD);
    if (isNaN(carrierQuote) || carrierQuote <= 0) return null;
    
    const brokerFee = brokerFeeFromForm; // From application form
    const taxAmount = parseFloat(premiumTaxAmountUSD) || 0;
    const policyFee = parseFloat(policyFeeUSD) || 0;
    
    // No wholesale fee - removed per user request
    const finalAmount = carrierQuote + brokerFee + taxAmount + policyFee;

    return {
      carrierQuote,
      brokerFeeAmount: brokerFee,
      premiumTaxAmount: taxAmount,
      policyFeeAmount: policyFee,
      finalAmount,
    };
  };

  const breakdown = calculateBreakdown();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!selectedCarrierId || !carrierQuoteUSD) {
      setError("Please select a carrier and enter quote amount");
      setSubmitting(false);
      return;
    }

    const quoteAmount = parseFloat(carrierQuoteUSD);
    if (isNaN(quoteAmount) || quoteAmount <= 0) {
      setError("Quote amount must be greater than 0");
      setSubmitting(false);
      return;
    }

    try {
      // Prepare limits object
      const limits = {
        generalLiability: generalLiabilityLimit || undefined,
        aggregateLimit: aggregateLimit || undefined,
        fireLegalLimit: fireLegalLimit || undefined,
        medicalExpenseLimit: medicalExpenseLimit || undefined,
        deductible: deductible || undefined,
      };

      // Note: The API uses [id] as the dynamic segment, which represents submissionId
      const response = await fetch(`/api/admin/quotes/${submissionId}/enter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carrierId: selectedCarrierId,
          carrierQuoteUSD: quoteAmount,
          premiumTaxPercent: premiumTaxPercent || undefined,
          premiumTaxAmountUSD: premiumTaxAmountUSD || undefined,
          policyFeeUSD: policyFeeUSD || undefined,
          brokerFeeAmountUSD: brokerFeeFromForm || undefined,
          limits: Object.keys(limits).some(k => limits[k as keyof typeof limits]) ? limits : undefined,
          endorsements: selectedEndorsements.length > 0 ? selectedEndorsements : undefined,
          effectiveDate: effectiveDate || undefined,
          expirationDate: expirationDate || undefined,
          policyNumber: policyNumber || undefined,
          carrierReference: carrierReference || undefined,
          specialNotes: specialNotes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create quote");
      }

      setSuccess(true);
      // Redirect to submission details page
      setTimeout(() => {
        router.push(`/admin/submissions/${submissionId}`);
      }, 2000);
    } catch (err: any) {
      console.error("Quote creation error:", err);
      setError(err.message || "Failed to create quote");
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-[#6B6B6B]">Loading...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <header className="bg-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/admin/dashboard" className="text-xl font-bold text-[#4A4A4A]">
              Sterling Portal - Admin
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-sterling p-8">
            <h1 className="text-2xl font-bold text-[#4A4A4A] mb-4">Error</h1>
            <p className="text-red-600 mb-4">{error || "Submission not found"}</p>
            <Link href="/admin/dashboard" className="btn-sterling-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="card-sterling p-8 max-w-md text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">Quote Created & Sent!</h2>
          <p className="text-[#6B6B6B] mb-4">
            Quote has been created, binder PDF generated, and notification sent to the broker.
            <br />
            <br />
            Redirecting to submission details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="text-xl font-bold text-[#4A4A4A]">
              Sterling Portal - Admin
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#6B6B6B]">
                {session?.user?.name || session?.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-[#6B6B6B] hover:text-[#4A4A4A]"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/admin/submissions/${submissionId}`}
            className="text-sm text-[#6B6B6B] hover:text-[#4A4A4A] inline-flex items-center gap-1"
          >
            ← Back to Submission
          </Link>
        </div>

        <div className="card-sterling p-8">
          <h1 className="text-3xl font-bold text-[#4A4A4A] mb-2">Enter Quote</h1>
          <p className="text-[#6B6B6B] mb-8">
            Create a quote for: {submission.clientContact.name}
            {submission.programName ? (
              <> ({submission.programName})</>
            ) : submission.templateId ? (
              <> ({submission.templateId.industry} - {submission.templateId.subtype})</>
            ) : (
              <> (Application)</>
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Carrier Selection */}
            <div>
              <label
                htmlFor="carrier"
                className="block text-sm font-semibold text-[#4A4A4A] mb-2"
              >
                Carrier <span className="text-red-500">*</span>
              </label>
              <select
                id="carrier"
                value={selectedCarrierId}
                onChange={(e) => setSelectedCarrierId(e.target.value)}
                className="input-sterling focus-sterling w-full"
                required
              >
                <option value="">-- Select Carrier --</option>
                {carriers.map((carrier) => (
                  <option key={carrier._id} value={carrier._id}>
                    {carrier.name}
                  </option>
                ))}
              </select>
              {carriers.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No carriers found. This submission may not have been routed yet.
                </p>
              )}
            </div>

            {/* Carrier Quote Amount */}
            <div>
              <label
                htmlFor="carrierQuote"
                className="block text-sm font-semibold text-[#4A4A4A] mb-2"
              >
                Carrier Quote Amount (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]">
                  $
                </span>
                <input
                  id="carrierQuote"
                  type="number"
                  step="0.01"
                  min="0"
                  value={carrierQuoteUSD}
                  onChange={(e) => setCarrierQuoteUSD(e.target.value)}
                  required
                  className="input-sterling focus-sterling w-full pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Premium Breakdown Section */}
            <div className="border-t border-[#E0E0E0] pt-6">
              <h3 className="text-lg font-bold text-[#4A4A4A] mb-4">Premium Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Premium Tax */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Premium Tax (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={premiumTaxPercent}
                      onChange={(e) => setPremiumTaxPercent(e.target.value)}
                      className="input-sterling focus-sterling flex-1"
                      placeholder="0.00"
                    />
                    <span className="text-[#6B6B6B] self-center">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Premium Tax Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={premiumTaxAmountUSD}
                      readOnly
                      className="input-sterling w-full pl-8 bg-gray-50"
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>

                {/* Policy Fee */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Policy Fee (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={policyFeeUSD}
                      onChange={(e) => setPolicyFeeUSD(e.target.value)}
                      className="input-sterling focus-sterling w-full pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Broker Fee - Display only (from application form) */}
                {brokerFeeFromForm > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                      Broker Fee (USD) <span className="text-xs text-[#6B6B6B]">(from application)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]">$</span>
                      <input
                        type="text"
                        value={brokerFeeFromForm.toFixed(2)}
                        readOnly
                        className="input-sterling w-full pl-8 bg-gray-50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Policy Limits Section */}
            <div className="border-t border-[#E0E0E0] pt-6">
              <h3 className="text-lg font-bold text-[#4A4A4A] mb-4">Policy Limits</h3>
              
              <div className="mb-2">
                <p className="text-xs text-[#6B6B6B] italic">
                  * Policy limits and endorsements are pre-filled from the application form. You can edit if needed.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    General Liability Limit <span className="text-xs text-[#6B6B6B]">(from application)</span>
                  </label>
                  <input
                    type="text"
                    value={generalLiabilityLimit}
                    onChange={(e) => setGeneralLiabilityLimit(e.target.value)}
                    className="input-sterling focus-sterling w-full"
                    placeholder="e.g., 1M / 1M / 1M"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Aggregate Limit <span className="text-xs text-[#6B6B6B]">(from application)</span>
                  </label>
                  <input
                    type="text"
                    value={aggregateLimit}
                    onChange={(e) => setAggregateLimit(e.target.value)}
                    className="input-sterling focus-sterling w-full"
                    placeholder="e.g., 2M"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Fire Legal Limit <span className="text-xs text-[#6B6B6B]">(from application)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]">$</span>
                    <input
                      type="text"
                      value={fireLegalLimit}
                      onChange={(e) => setFireLegalLimit(e.target.value)}
                      className="input-sterling focus-sterling w-full pl-8"
                      placeholder="e.g., 100,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Medical Expense Limit <span className="text-xs text-[#6B6B6B]">(from application)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]">$</span>
                    <input
                      type="text"
                      value={medicalExpenseLimit}
                      onChange={(e) => setMedicalExpenseLimit(e.target.value)}
                      className="input-sterling focus-sterling w-full pl-8"
                      placeholder="e.g., 5,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Deductible
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]">$</span>
                    <input
                      type="text"
                      value={deductible}
                      onChange={(e) => setDeductible(e.target.value)}
                      className="input-sterling focus-sterling w-full pl-8"
                      placeholder="e.g., 2,500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endorsements Section */}
            <div className="border-t border-[#E0E0E0] pt-6">
              <h3 className="text-lg font-bold text-[#4A4A4A] mb-2">Included Endorsements</h3>
              <p className="text-xs text-[#6B6B6B] italic mb-4">
                Pre-filled from application form. You can modify if needed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableEndorsements.map((endorsement) => (
                  <label key={endorsement} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEndorsements.includes(endorsement)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEndorsements([...selectedEndorsements, endorsement]);
                        } else {
                          setSelectedEndorsements(selectedEndorsements.filter((e) => e !== endorsement));
                        }
                      }}
                      className="w-4 h-4 text-[#00BCD4] border-gray-300 rounded focus:ring-[#00BCD4]"
                    />
                    <span className="text-sm text-[#4A4A4A]">{endorsement}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Policy Details Section */}
            <div className="border-t border-[#E0E0E0] pt-6">
              <h3 className="text-lg font-bold text-[#4A4A4A] mb-4">Policy Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="input-sterling focus-sterling w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="input-sterling focus-sterling w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="input-sterling focus-sterling w-full"
                    placeholder="Carrier policy number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Carrier Reference/Quote #
                  </label>
                  <input
                    type="text"
                    value={carrierReference}
                    onChange={(e) => setCarrierReference(e.target.value)}
                    className="input-sterling focus-sterling w-full"
                    placeholder="Carrier quote reference"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">
                    Special Notes / Conditions
                  </label>
                  <textarea
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    rows={4}
                    className="input-sterling focus-sterling w-full"
                    placeholder="Any special conditions, notes, or requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Breakdown Preview */}
            {breakdown && (
              <div className="p-6 bg-gradient-to-br from-[#F5F5F5] to-[#E9E9E9] rounded-lg border-2 border-[#E0E0E0]">
                <h3 className="text-lg font-bold text-[#4A4A4A] mb-4">
                  Quote Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B]">Carrier Quote:</span>
                    <span className="font-semibold text-[#4A4A4A]">
                      ${breakdown.carrierQuote.toFixed(2)}
                    </span>
                  </div>
                  {breakdown.premiumTaxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#6B6B6B]">Premium Tax:</span>
                      <span className="font-semibold text-[#4A4A4A]">
                        ${breakdown.premiumTaxAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {breakdown.policyFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#6B6B6B]">Policy Fee:</span>
                      <span className="font-semibold text-[#4A4A4A]">
                        ${breakdown.policyFeeAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {breakdown.brokerFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#6B6B6B]">Broker Fee:</span>
                      <span className="font-semibold text-[#4A4A4A]">
                        ${breakdown.brokerFeeAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 mt-3 border-t-2 border-[#00BCD4] flex justify-between">
                    <span className="text-xl font-bold text-[#4A4A4A]">
                      Total Cost:
                    </span>
                    <span className="text-xl font-bold text-[#00BCD4]">
                      ${breakdown.finalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || carriers.length === 0}
                className="btn-sterling disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating Quote..." : "Create Quote"}
              </button>
              <Link
                href={`/admin/submissions/${submissionId}`}
                className="btn-sterling-secondary"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

