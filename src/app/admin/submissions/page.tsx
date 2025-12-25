"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Submission {
  _id: string;
  submissionId: string;
  agencyName: string;
  clientName: string;
  clientEmail: string;
  industry: string;
  subtype: string;
  programId?: string;
  programName?: string;
  status: string;
  createdAt: string;
  applicationPdfUrl?: string;
  submittedToCarrierAt?: string;
}

export default function AdminSubmissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      fetchSubmissions();
    }
  }, [status, statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const url = statusFilter !== "ALL" 
        ? `/api/admin/submissions?status=${statusFilter}`
        : "/api/admin/submissions";
      const response = await fetch(url);
      const data = await response.json();
      console.log("Admin submissions API response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      if (data.submissions) {
        setSubmissions(data.submissions);
        console.log(`Loaded ${data.submissions.length} submissions`);
      } else if (data.error) {
        console.error("API Error:", data.error);
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError(err.message || "Failed to load submissions");
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#4A4A4A] mb-2">All Applications</h1>
              <p className="text-[#6B6B6B]">View submitted applications and enter quotes</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-[#6B6B6B] font-medium">
                Filter by Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm text-[#4A4A4A] bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ROUTED">Routed</option>
                <option value="QUOTED">Quoted</option>
                <option value="BIND_REQUESTED">Bind Requested</option>
                <option value="BOUND">Bound</option>
                <option value="DECLINED">Declined</option>
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

        {submissions.length === 0 && !loading ? (
          <div className="card-sterling p-8 text-center">
            <p className="text-[#6B6B6B] mb-4">No submissions found.</p>
            <p className="text-sm text-[#6B6B6B]">
              Check the browser console (F12) for API response details.
            </p>
            <p className="text-xs text-[#6B6B6B] mt-2">
              Make sure you've run the seed script: <code className="bg-[#F5F5F5] px-2 py-1 rounded">npm run seed</code>
            </p>
          </div>
        ) : (
          <div className="card-sterling p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Agency
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Program
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Submitted
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5]"
                    >
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">
                        {submission.agencyName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">
                        <div className="font-medium">{submission.clientName || "N/A"}</div>
                        <div className="text-xs text-[#6B6B6B]">{submission.clientEmail || ""}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="font-medium text-[#4A4A4A]">
                          {submission.programName || submission.industry || "N/A"}
                        </div>
                        {submission.programId && (
                          <div className="text-xs text-[#6B6B6B]">
                            ID: {submission.programId}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            submission.status
                          )}`}
                        >
                          {submission.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B6B6B]">
                        <div>{new Date(submission.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-[#999]">
                          {new Date(submission.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href={`/admin/submissions/${submission._id}`}
                            className="text-sm text-[#00BCD4] hover:underline font-medium"
                          >
                            View
                          </Link>
                          <a
                            href={`/api/admin/submissions/${submission._id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#00BCD4] hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            PDF
                          </a>
                          {submission.status === "SUBMITTED" && (
                            <Link
                              href={`/admin/submissions/${submission._id}/quote`}
                              className="text-sm text-[#4CAF50] hover:underline font-medium"
                            >
                              Enter Quote
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

