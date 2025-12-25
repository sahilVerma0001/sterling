"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FinanceOption from "@/components/FinanceOption";

interface Quote {
  _id: string;
  submissionId: string;
  carrierName: string;
  clientName: string;
  carrierQuoteUSD: number;
  // No wholesale fee - removed per user request
  brokerFeeAmountUSD: number;
  premiumTaxPercent?: number;
  premiumTaxAmountUSD?: number;
  policyFeeUSD?: number;
  finalAmountUSD: number;
  status: string;
  submissionStatus: string;
  esignCompleted?: boolean;
  paymentStatus?: string;
  binderPdfUrl?: string;
  createdAt: string;
}

export default function AgencyQuotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [brokerFee, setBrokerFee] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchQuotes();
    }
  }, [status, filterStatus]);

  // Get filter from URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get("status");
      if (statusParam) {
        // Map URL param to filter value
        if (statusParam === "POSTED") {
          setFilterStatus("POSTED");
        } else if (statusParam === "APPROVED") {
          setFilterStatus("APPROVED");
        } else {
          setFilterStatus(statusParam);
        }
      }
    }
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") {
        params.append("status", filterStatus);
      }
      
      console.log("📡 Fetching quotes with filter:", filterStatus);
      const response = await fetch(`/api/agency/quotes?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Quotes fetch failed:", errorData);
        throw new Error(errorData.error || "Failed to fetch quotes");
      }
      
      const data = await response.json();
      console.log("✅ Quotes fetched:", data.count || 0);
      
      if (data.quotes) {
        setQuotes(data.quotes);
      } else {
        console.warn("⚠️  No quotes in response");
        setQuotes([]);
      }
    } catch (err: any) {
      console.error("❌ Error fetching quotes:", err.message);
      setError("Failed to load quotes: " + err.message);
      setQuotes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleEditBrokerFee = (quote: Quote) => {
    setEditingQuoteId(quote._id);
    setBrokerFee(quote.brokerFeeAmountUSD.toString());
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingQuoteId(null);
    setBrokerFee("");
    setError("");
  };

  const handleSaveBrokerFee = async (quoteId: string) => {
    setSubmitting(true);
    setError("");

    const feeAmount = parseFloat(brokerFee);
    if (isNaN(feeAmount) || feeAmount < 0) {
      setError("Broker fee must be a non-negative number");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/agency/quotes/${quoteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brokerFeeAmountUSD: feeAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quote");
      }

      // Refresh quotes
      await fetchQuotes();
      setEditingQuoteId(null);
      setBrokerFee("");
    } catch (err: any) {
      console.error("Quote update error:", err);
      setError(err.message || "Failed to update quote");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateFinalAmount = (quote: Quote, newBrokerFee?: number) => {
    const brokerFeeAmount = newBrokerFee !== undefined ? newBrokerFee : quote.brokerFeeAmountUSD;
    // No wholesale fee - removed per user request
    const taxAmount = quote.premiumTaxAmountUSD || 0;
    const policyFee = quote.policyFeeUSD || 0;
    return quote.carrierQuoteUSD + taxAmount + policyFee + brokerFeeAmount;
  };

  const handleApproveQuote = async (quoteId: string) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/agency/quotes/${quoteId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve quote");
      }

      // If we're viewing posted quotes, redirect to approved quotes
      if (filterStatus === "POSTED") {
        router.push("/agency/quotes?status=APPROVED");
      } else {
        // Refresh quotes
        await fetchQuotes();
      }
    } catch (err: any) {
      console.error("Quote approval error:", err);
      setError(err.message || "Failed to approve quote");
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ENTERED":
        return "bg-blue-100 text-blue-800";
      case "POSTED":
        return "bg-purple-100 text-purple-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "BIND_REQUESTED":
        return "bg-orange-100 text-orange-800";
      case "BOUND":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/agency/dashboard" className="text-xl font-bold text-[#4A4A4A]">
              Sterling Portal
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/agency/dashboard"
            className="text-sm text-[#6B6B6B] hover:text-[#4A4A4A] inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#4A4A4A] mb-2">Quotes</h1>
              <p className="text-[#6B6B6B]">View and manage quotes for your submissions</p>
            </div>
            {/* Filter Dropdown */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-sterling focus-sterling"
              >
                <option value="ALL">All Quotes</option>
                <option value="POSTED">Posted Quotes</option>
                <option value="APPROVED">Approved Quotes</option>
                <option value="BIND_REQUESTED">Bind Requested</option>
                <option value="BOUND">Bound Policies</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Quotes List */}
        {quotes.length === 0 ? (
          <div className="card-sterling p-8 text-center">
            <p className="text-[#6B6B6B]">
              No quotes available. Quotes will appear here after admin creates them.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => {
              const isEditing = editingQuoteId === quote._id;
              const previewFinalAmount = isEditing
                ? calculateFinalAmount(quote, parseFloat(brokerFee) || 0)
                : quote.finalAmountUSD;

              return (
                <div key={quote._id} className="card-sterling p-6">
                  {quote.status === "APPROVED" && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-blue-800 font-semibold mb-2">
                            ✓ Quote Approved - Ready for Workflow
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`${quote.esignCompleted ? "text-green-600" : "text-gray-500"}`}>
                              {quote.esignCompleted ? "✓" : "○"} E-Sign
                            </span>
                            <span className={`${quote.paymentStatus === "PAID" ? "text-green-600" : "text-gray-500"}`}>
                              {quote.paymentStatus === "PAID" ? "✓" : "○"} Payment
                            </span>
                            <span className="text-gray-500">○ Bind Request</span>
                          </div>
                          {!quote.esignCompleted && (
                            <p className="text-xs text-blue-700 mt-2">
                              Next: Generate documents and complete e-signature
                            </p>
                          )}
                          {quote.esignCompleted && quote.paymentStatus !== "PAID" && (
                            <p className="text-xs text-blue-700 mt-2">
                              Next: Complete payment to proceed
                            </p>
                          )}
                          {quote.esignCompleted && quote.paymentStatus === "PAID" && (
                            <p className="text-xs text-green-700 mt-2 font-semibold">
                              Ready: Request bind to complete the process
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/agency/quotes/${quote._id}`}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors whitespace-nowrap"
                        >
                          Manage Workflow →
                        </Link>
                      </div>
                    </div>
                  )}
                  {quote.status === "BOUND" && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-green-800 font-semibold mb-2">
                            ✓ Policy Bound Successfully
                          </p>
                          <p className="text-sm text-green-700">
                            Your policy has been bound and is now active. Coverage is in effect.
                          </p>
                        </div>
                        <Link
                          href={`/agency/quotes/${quote._id}`}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors whitespace-nowrap"
                        >
                          View Policy →
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#4A4A4A] mb-1">
                        {quote.clientName}
                      </h3>
                      <p className="text-sm text-[#6B6B6B]">
                        Carrier: {quote.carrierName}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        quote.status
                      )}`}
                    >
                      {quote.status}
                    </span>
                  </div>

                  {/* Quote Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#6B6B6B]">Carrier Quote:</span>
                        <span className="font-semibold text-[#4A4A4A]">
                          ${quote.carrierQuoteUSD.toFixed(2)}
                        </span>
                      </div>
                      {quote.premiumTaxAmountUSD && quote.premiumTaxAmountUSD > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#6B6B6B]">
                            Premium Tax{quote.premiumTaxPercent ? ` (${quote.premiumTaxPercent}%)` : ''}:
                          </span>
                          <span className="font-semibold text-[#4A4A4A]">
                            ${quote.premiumTaxAmountUSD.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {quote.policyFeeUSD && quote.policyFeeUSD > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#6B6B6B]">Policy Fee:</span>
                          <span className="font-semibold text-[#4A4A4A]">
                            ${quote.policyFeeUSD.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B6B6B]">Broker Fee:</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[#6B6B6B]">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={brokerFee}
                              onChange={(e) => setBrokerFee(e.target.value)}
                              className="input-sterling focus-sterling w-24 text-right"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveBrokerFee(quote._id)}
                              disabled={submitting}
                              className="btn-sterling text-sm px-3 py-1"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn-sterling-secondary text-sm px-3 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#4A4A4A]">
                              ${quote.brokerFeeAmountUSD.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleEditBrokerFee(quote)}
                              className="text-sm text-[#C4A882] hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-l border-[#E0E0E0] pl-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-[#4A4A4A]">
                          Final Amount:
                        </span>
                        <span className="text-2xl font-bold text-[#C4A882]">
                          ${previewFinalAmount.toFixed(2)}
                        </span>
                      </div>
                      {quote.status === "POSTED" && (
                        <div className="mt-4 space-y-2">
                          {quote.binderPdfUrl && (
                            <a
                              href={quote.binderPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors font-medium mb-2"
                            >
                              <span>📄</span>
                              <span>Download Binder PDF</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleApproveQuote(quote._id)}
                            disabled={submitting}
                            className="btn-sterling w-full disabled:opacity-50"
                          >
                            {submitting ? "Approving..." : "Approve Quote"}
                          </button>
                        </div>
                      )}
                      {quote.status === "APPROVED" && (
                        <div className="mt-4 space-y-3">
                          <Link
                            href={`/agency/quotes/${quote._id}`}
                            className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center font-semibold transition-colors"
                          >
                            View Quote Details & Workflow
                          </Link>
                          <FinanceOption
                            quoteId={quote._id}
                            finalAmountUSD={previewFinalAmount}
                            esignCompleted={quote.esignCompleted || false}
                            paymentStatus={quote.paymentStatus || "PENDING"}
                            submissionId={quote.submissionId}
                          />
                        </div>
                      )}
                      {quote.status === "BOUND" && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 font-semibold mb-2">
                            ✓ Policy Bound Successfully
                          </p>
                          <p className="text-sm text-green-700">
                            Your policy has been bound and is now active.
                          </p>
                          <Link
                            href={`/agency/quotes/${quote._id}`}
                            className="mt-3 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-semibold transition-colors"
                          >
                            View Policy Details →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Binder PDF Download */}
                  {quote.binderPdfUrl && (
                    <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                      <a
                        href={quote.binderPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors font-medium"
                      >
                        <span>📄</span>
                        <span>Download Binder PDF</span>
                      </a>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E0E0E0] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/agency/submissions/${quote.submissionId}`}
                        className="text-sm text-[#C4A882] hover:underline"
                      >
                        View Submission Details
                      </Link>
                      {quote.status === "APPROVED" && (
                        <Link
                          href={`/agency/quotes/${quote._id}`}
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          Manage Quote Workflow →
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-[#6B6B6B]">
                      Created: {new Date(quote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

