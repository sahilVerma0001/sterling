"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SubmissionDetails {
  submission: any;
  routingLogs: any[];
  quotes: any[];
}

// Component to display application form data
function ApplicationDataViewer({ data }: { data: any }) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") {
      if (Array.isArray(value)) return value.join(", ");
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatFieldName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const isImportantField = (key: string): boolean => {
    const importantFields = [
      "companyName",
      "estimatedGrossReceipts",
      "generalLiabilityLimit",
      "classCodeWork",
      "effectiveDate",
      "statesOfOperation",
      "carrierApprovedDescription",
    ];
    return importantFields.includes(key);
  };

  // Separate important and other fields
  const importantFields: [string, any][] = [];
  const otherFields: [string, any][] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (isImportantField(key)) {
      importantFields.push([key, value]);
    } else {
      otherFields.push([key, value]);
    }
  });

  return (
    <div className="space-y-6">
      {/* Important Fields Section */}
      {importantFields.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#4A4A4A] mb-4">Key Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importantFields.map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded border border-[#E0E0E0]">
                <span className="text-sm font-semibold text-[#6B6B6B] block mb-1">
                  {formatFieldName(key)}:
                </span>
                <p className="text-[#4A4A4A] break-words">
                  {key === "classCodeWork" && typeof value === "object" ? (
                    <div className="space-y-1">
                      {Object.entries(value as Record<string, any>).map(([code, percent]) => (
                        <div key={code} className="text-sm">
                          <span className="font-medium">{code}:</span> {percent}%
                        </div>
                      ))}
                    </div>
                  ) : (
                    formatValue(value)
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Fields Section */}
      {otherFields.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#4A4A4A] mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {otherFields.map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded border border-[#E0E0E0]">
                <span className="text-xs font-semibold text-[#6B6B6B] block mb-1">
                  {formatFieldName(key)}:
                </span>
                <p className="text-sm text-[#4A4A4A] break-words">
                  {formatValue(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSubmissionDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const submissionId = params?.id as string;

  const [data, setData] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}`);
      const data = await response.json();
      if (data.submission) {
        setData(data);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Error fetching submission:", err);
      setError("Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "ROUTED":
        return "bg-yellow-100 text-yellow-800";
      case "QUOTED":
        return "bg-purple-100 text-purple-800";
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

  if (error || !data) {
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
            <Link href="/admin/submissions" className="btn-sterling-secondary">
              ← Back to Submissions
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { submission, routingLogs, quotes } = data;

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/submissions"
            className="text-sm text-[#6B6B6B] hover:text-[#4A4A4A] inline-flex items-center gap-1"
          >
            ← Back to Submissions
          </Link>
        </div>

        <div className="card-sterling p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#4A4A4A]">Submission Details</h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                submission.status
              )}`}
            >
              {submission.status.replace("_", " ")}
            </span>
          </div>

          {/* Program Info */}
          {(submission.programName || submission.templateId) && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">Program Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {submission.programName && (
                  <>
                    <div>
                      <span className="text-sm text-[#6B6B6B]">Program Name:</span>
                      <p className="text-[#4A4A4A] font-medium">{submission.programName}</p>
                    </div>
                    {submission.programId && (
                      <div>
                        <span className="text-sm text-[#6B6B6B]">Program ID:</span>
                        <p className="text-[#4A4A4A] font-medium">{submission.programId}</p>
                      </div>
                    )}
                  </>
                )}
                {submission.templateId && (
                  <>
                    <div>
                      <span className="text-sm text-[#6B6B6B]">Industry:</span>
                      <p className="text-[#4A4A4A] font-medium">{submission.templateId.industry}</p>
                    </div>
                    <div>
                      <span className="text-sm text-[#6B6B6B]">Subtype:</span>
                      <p className="text-[#4A4A4A] font-medium">{submission.templateId.subtype}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Client Info */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-[#6B6B6B]">Name:</span>
                <p className="text-[#4A4A4A] font-medium">
                  {submission.clientContact?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-sm text-[#6B6B6B]">Email:</span>
                <p className="text-[#4A4A4A] font-medium">
                  {submission.clientContact?.email || "N/A"}
                </p>
              </div>
              {submission.clientContact?.phone && (
                <div>
                  <span className="text-sm text-[#6B6B6B]">Phone:</span>
                  <p className="text-[#4A4A4A] font-medium">
                    {submission.clientContact.phone}
                  </p>
                </div>
              )}
              {submission.clientContact?.EIN && (
                <div>
                  <span className="text-sm text-[#6B6B6B]">EIN:</span>
                  <p className="text-[#4A4A4A] font-medium">
                    {submission.clientContact.EIN}
                  </p>
                </div>
              )}
              {submission.clientContact?.businessAddress && (
                <div className="col-span-2">
                  <span className="text-sm text-[#6B6B6B]">Business Address:</span>
                  <p className="text-[#4A4A4A] font-medium">
                    {submission.clientContact.businessAddress.street}, {submission.clientContact.businessAddress.city}, {submission.clientContact.businessAddress.state} {submission.clientContact.businessAddress.zip}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Application Form Data */}
          {submission.payload && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">Application Details</h2>
              <div className="bg-[#F5F5F5] rounded-lg p-6 border border-[#E0E0E0]">
                <ApplicationDataViewer data={submission.payload} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mb-6 flex gap-3">
            <a
              href={`/api/admin/submissions/${submissionId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sterling-secondary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download PDF
            </a>
            {submission.status === "SUBMITTED" && (
              <Link
                href={`/admin/submissions/${submissionId}/quote`}
                className="btn-sterling"
              >
                Enter Quote
              </Link>
            )}
          </div>

          {/* Post Quote Action for ENTERED_BY_ADMIN quotes */}
          {quotes && quotes.length > 0 && quotes.some((q: any) => q.status === "ENTERED_BY_ADMIN") && (
            <div className="mb-6">
              <p className="text-sm text-[#6B6B6B] mb-2">Quotes ready to post:</p>
              {quotes
                .filter((q: any) => q.status === "ENTERED_BY_ADMIN")
                .map((quote: any) => (
                  <Link
                    key={quote._id}
                    href={`/admin/quotes/${quote._id}/post`}
                    className="btn-sterling-secondary mr-2 mb-2 inline-block"
                  >
                    Post Quote {quote.carrierId?.name || ""}
                  </Link>
                ))}
            </div>
          )}
        </div>

        {/* Routing Logs */}
        {routingLogs && routingLogs.length > 0 && (
          <div className="card-sterling p-6 mb-6">
            <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">Routing Logs</h2>
            <div className="space-y-2">
              {routingLogs.map((log: any) => (
                <div
                  key={log._id}
                  className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#4A4A4A]">
                        {log.carrierId?.name || "Unknown Carrier"}
                      </p>
                      <p className="text-sm text-[#6B6B6B]">{log.carrierId?.email}</p>
                      <p className="text-xs text-[#6B6B6B] mt-1">{log.notes}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        log.status === "SENT"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quotes */}
        {quotes && quotes.length > 0 && (
          <div className="card-sterling p-6">
            <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">Quotes</h2>
            <div className="space-y-4">
              {quotes.map((quote: any) => (
                <div
                  key={quote._id}
                  className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-[#4A4A4A]">
                        {quote.carrierId?.name || "Unknown Carrier"}
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        Final Amount: ${quote.finalAmountUSD.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          quote.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {quote.status}
                      </span>
                      {quote.binderPdfUrl && (
                        <a
                          href={quote.binderPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[#00BCD4] text-white text-xs rounded hover:bg-[#00ACC1] transition-colors"
                        >
                          📄 Download Binder
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

