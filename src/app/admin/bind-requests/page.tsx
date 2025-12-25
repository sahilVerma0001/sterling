"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface BindRequestSubmission {
  _id: string;
  clientContact: {
    name: string;
    email: string;
    phone: string;
  };
  agencyId: {
    _id: string;
    name: string;
  };
  status: string;
  bindRequested: boolean;
  bindRequestedAt: string;
  bindApproved: boolean;
  bindApprovedAt?: string;
  esignCompleted: boolean;
  paymentStatus: string;
  paymentDate?: string;
  createdAt: string;
}

export default function AdminBindRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<BindRequestSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);

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
    if (status === "authenticated") {
      fetchBindRequests();
    }
  }, [status]);

  const fetchBindRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/bind-requests", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bind requests");
      }

      setSubmissions(data.submissions || []);
    } catch (err: any) {
      console.error("Fetch bind requests error:", err);
      setError(err.message || "Failed to load bind requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBind = async (submissionId: string) => {
    if (!confirm("Are you sure you want to approve this bind request? This action cannot be undone.")) {
      return;
    }

    setApproving(submissionId);
    try {
      const response = await fetch("/api/bind/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to approve bind request");
      }

      // Refresh the list
      await fetchBindRequests();
      toast.success("Bind request approved successfully!", {
        description: "Policy is now bound and active.",
      });
    } catch (err: any) {
      console.error("Approve bind error:", err);
      toast.error("Failed to approve bind request", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setApproving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bind requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Bind Requests</h1>
          <p className="text-gray-600 mt-2">
            Review and approve bind requests from agencies
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Bind Requests List */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              No pending bind requests. All bind requests have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {submission.clientContact.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Agency:</span>{" "}
                        {submission.agencyId.name}
                      </div>
                      <div>
                        <span className="font-medium">Client Email:</span>{" "}
                        {submission.clientContact.email}
                      </div>
                      <div>
                        <span className="font-medium">Client Phone:</span>{" "}
                        {submission.clientContact.phone}
                      </div>
                      <div>
                        <span className="font-medium">Requested At:</span>{" "}
                        {new Date(submission.bindRequestedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      Bind Requested
                    </span>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {submission.esignCompleted && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      ✓ E-Sign Complete
                    </span>
                  )}
                  {submission.paymentStatus === "PAID" && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      ✓ Payment Received
                    </span>
                  )}
                  {submission.paymentDate && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Paid: {new Date(submission.paymentDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Link
                    href={`/admin/submissions/${submission._id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Submission Details →
                  </Link>
                  <button
                    onClick={() => handleApproveBind(submission._id)}
                    disabled={approving === submission._id || submission.bindApproved}
                    className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                      approving === submission._id || submission.bindApproved
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {approving === submission._id ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Approving...
                      </span>
                    ) : submission.bindApproved ? (
                      "✓ Approved"
                    ) : (
                      "Approve Bind"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



