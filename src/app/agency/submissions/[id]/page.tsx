"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SubmissionDetails {
  _id: string;
  agencyId: string;
  templateId: any;
  payload: Record<string, any>;
  files: Array<{
    fieldKey: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
  status: string;
  clientContact: {
    name: string;
    phone: string;
    email: string;
    EIN?: string;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  ccpaConsent: boolean;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export default function SubmissionDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const submissionId = params?.id as string;

  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && submissionId) {
      fetchSubmission();
    }
  }, [status, submissionId]);

  const fetchSubmission = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agency/submissions/${submissionId}`);
      const data = await response.json();

      if (data.submission) {
        setSubmission(data.submission);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Error fetching submission:", err);
      setError("Failed to load submission details");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <header className="bg-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/agency/dashboard" className="text-xl font-bold text-[#4A4A4A]">
              Sterling Portal
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-sterling p-8">
            <h1 className="text-2xl font-bold text-[#4A4A4A] mb-4">Error</h1>
            <p className="text-red-600 mb-4">{error || "Submission not found"}</p>
            <Link href="/agency/dashboard" className="btn-sterling-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/agency/dashboard"
            className="text-sm text-[#6B6B6B] hover:text-[#4A4A4A] inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="card-sterling p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#4A4A4A]">
              Submission Details
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                submission.status
              )}`}
            >
              {submission.status.replace("_", " ")}
            </span>
          </div>

          {/* Submission Info */}
          <div className="mb-8 p-4 bg-[#F5F5F5] rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#6B6B6B]">Submission ID:</span>
                <span className="ml-2 font-mono text-[#4A4A4A]">
                  {submission._id}
                </span>
              </div>
              <div>
                <span className="text-[#6B6B6B]">Industry:</span>
                <span className="ml-2 text-[#4A4A4A]">
                  {submission.templateId?.industry || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[#6B6B6B]">Subtype:</span>
                <span className="ml-2 text-[#4A4A4A]">
                  {submission.templateId?.subtype || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[#6B6B6B]">State:</span>
                <span className="ml-2 text-[#4A4A4A]">{submission.state || "N/A"}</span>
              </div>
              <div>
                <span className="text-[#6B6B6B]">Created:</span>
                <span className="ml-2 text-[#4A4A4A]">
                  {new Date(submission.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#6B6B6B]">Updated:</span>
                <span className="ml-2 text-[#4A4A4A]">
                  {new Date(submission.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Client Contact */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">Client Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-[#6B6B6B]">Name:</span>
                <p className="text-[#4A4A4A] font-medium">
                  {submission.clientContact.name}
                </p>
              </div>
              <div>
                <span className="text-sm text-[#6B6B6B]">Email:</span>
                <p className="text-[#4A4A4A] font-medium">
                  {submission.clientContact.email}
                </p>
              </div>
              <div>
                <span className="text-sm text-[#6B6B6B]">Phone:</span>
                <p className="text-[#4A4A4A] font-medium">
                  {submission.clientContact.phone}
                </p>
              </div>
              {submission.clientContact.EIN && (
                <div>
                  <span className="text-sm text-[#6B6B6B]">EIN:</span>
                  <p className="text-[#4A4A4A] font-medium">
                    {submission.clientContact.EIN}
                  </p>
                </div>
              )}
              <div className="md:col-span-2">
                <span className="text-sm text-[#6B6B6B]">Business Address:</span>
                <p className="text-[#4A4A4A] font-medium">
                  {submission.clientContact.businessAddress.street}
                  <br />
                  {submission.clientContact.businessAddress.city},{" "}
                  {submission.clientContact.businessAddress.state}{" "}
                  {submission.clientContact.businessAddress.zip}
                </p>
              </div>
              {submission.ccpaConsent && (
                <div className="md:col-span-2">
                  <span className="text-sm text-[#6B6B6B]">CCPA Consent:</span>
                  <p className="text-green-600 font-medium">✓ Granted</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Data */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">Form Data</h2>
            <div className="bg-[#F5F5F5] rounded-lg p-4">
              <pre className="text-sm text-[#4A4A4A] overflow-x-auto">
                {JSON.stringify(submission.payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Files */}
          {submission.files && submission.files.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">
                Uploaded Files ({submission.files.length})
              </h2>
              <div className="space-y-2">
                {submission.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#4A4A4A]">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">
                        {formatFileSize(file.fileSize)} • {file.mimeType}
                      </p>
                    </div>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-sterling-secondary text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}






