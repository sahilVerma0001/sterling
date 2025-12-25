"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface BoundPolicy {
  _id: string;
  clientContact: {
    name: string;
    email: string;
    phone: string;
  };
  agencyId: {
    _id: string;
    name: string;
  } | null;
  templateId: {
    _id: string;
    industry: string;
    subcategory?: string;
  } | null;
  status: string;
  bindRequested: boolean;
  bindRequestedAt: string;
  bindApproved: boolean;
  bindApprovedAt: string;
  bindStatus: string;
  esignCompleted: boolean;
  esignCompletedAt?: string;
  paymentStatus: string;
  paymentDate?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  quote: {
    _id: string;
    carrierId: string;
    carrierName: string;
    carrierQuoteUSD: number;
    wholesaleFeeAmountUSD: number;
    brokerFeeAmountUSD: number;
    finalAmountUSD: number;
    status: string;
  } | null;
  createdAt: string;
}

export default function AdminBoundPoliciesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [policies, setPolicies] = useState<BoundPolicy[]>([]);
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
    if (status === "authenticated") {
      fetchBoundPolicies();
    }
  }, [status]);

  const fetchBoundPolicies = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/bound-policies", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bound policies");
      }

      setPolicies(data.policies || []);
    } catch (err: any) {
      console.error("Fetch bound policies error:", err);
      setError(err.message || "Failed to load bound policies");
      toast.error("Failed to load bound policies", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bound policies...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Approved Bind Policies</h1>
          <p className="text-gray-600 mt-2">
            View all policies that have been bound and approved
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Policies List */}
        {policies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              No bound policies found. Policies will appear here after they are approved.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {policies.map((policy) => (
              <div
                key={policy._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {policy.clientContact.name}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ✓ Policy Bound
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Agency:</span>{" "}
                        {policy.agencyId?.name || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Client Email:</span>{" "}
                        {policy.clientContact.email}
                      </div>
                      <div>
                        <span className="font-medium">Client Phone:</span>{" "}
                        {policy.clientContact.phone}
                      </div>
                      {policy.templateId && (
                        <div>
                          <span className="font-medium">Industry:</span>{" "}
                          {policy.templateId.industry}
                          {policy.templateId.subcategory && (
                            <span> - {policy.templateId.subcategory}</span>
                          )}
                        </div>
                      )}
                      {policy.quote && (
                        <>
                          <div>
                            <span className="font-medium">Carrier:</span>{" "}
                            {policy.quote.carrierName}
                          </div>
                          <div>
                            <span className="font-medium">Final Amount:</span>{" "}
                            <span className="font-semibold text-green-600">
                              ${policy.quote.finalAmountUSD.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="font-medium">Bound At:</span>{" "}
                        {new Date(policy.bindApprovedAt).toLocaleString()}
                      </div>
                      {policy.paymentDate && (
                        <div>
                          <span className="font-medium">Payment Date:</span>{" "}
                          {new Date(policy.paymentDate).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {policy.esignCompleted && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      ✓ E-Sign Complete
                    </span>
                  )}
                  {policy.paymentStatus === "PAID" && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      ✓ Payment Received
                    </span>
                  )}
                  {policy.paymentAmount && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Amount: ${policy.paymentAmount.toFixed(2)}
                    </span>
                  )}
                  {policy.paymentMethod && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Method: {policy.paymentMethod}
                    </span>
                  )}
                </div>

                {/* Quote Details */}
                {policy.quote && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Quote Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Carrier Quote:</span>
                        <p className="font-semibold">
                          ${policy.quote.carrierQuoteUSD.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Wholesale Fee:</span>
                        <p className="font-semibold">
                          ${policy.quote.wholesaleFeeAmountUSD.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Broker Fee:</span>
                        <p className="font-semibold">
                          ${policy.quote.brokerFeeAmountUSD.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Final Amount:</span>
                        <p className="font-semibold text-green-600">
                          ${policy.quote.finalAmountUSD.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Link
                    href={`/admin/submissions/${policy._id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Submission Details →
                  </Link>
                  {policy.quote && (
                    <Link
                      href={`/admin/quotes/${policy.quote._id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Quote Details →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {policies.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">Total Bound Policies</p>
                <p className="text-2xl font-bold text-green-600">{policies.length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  $
                  {policies
                    .reduce((sum, p) => sum + (p.quote?.finalAmountUSD || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    policies.filter((p) => {
                      const approvedDate = new Date(p.bindApprovedAt);
                      const now = new Date();
                      return (
                        approvedDate.getMonth() === now.getMonth() &&
                        approvedDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

