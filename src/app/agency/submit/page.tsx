"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Industry {
  name: string;
  subtypes: {
    name: string;
    stateSpecific: boolean;
    templateId: string;
  }[];
  hasStateSpecific: boolean;
}

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isCAOperations, setIsCAOperations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      const stateParam = isCAOperations ? "?state=CA" : "";
      fetch(`/api/industries${stateParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.industries) {
            setIndustries(data.industries);
            setError("");
          } else if (data.error) {
            setError(data.error);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching industries:", err);
          setError("Failed to load industries. Please try again.");
          setLoading(false);
        });
    }
  }, [status, isCAOperations]);

  useEffect(() => {
    setSelectedSubtype("");
    setSelectedTemplateId("");
  }, [selectedIndustry]);

  const handleContinue = () => {
    if (!selectedIndustry || !selectedSubtype || !selectedTemplateId) {
      setError("Please select both industry and subtype to continue.");
      return;
    }
    router.push(`/agency/submit/${selectedTemplateId}`);
  };

  const selectedIndustryData = industries.find((ind) => ind.name === selectedIndustry);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/agency/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl blur-sm opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-600/30">
                  SP
                </div>
              </div>
              <span className="text-gray-900 font-bold text-lg tracking-tight">Sterling Portal</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{session?.user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <Link
                href="/agency/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg hover:bg-gray-50 transition-all"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/agency/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-12 relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-full mb-4">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-semibold text-indigo-700">New Submission</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Create Insurance Application
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Select your industry and coverage type to get started with your submission. We'll guide you through the process step by step.
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Select Coverage</p>
                  <p className="text-xs text-gray-600">Choose industry type</p>
                </div>
              </div>
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Application Form</p>
                  <p className="text-xs text-gray-500">Fill details</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 lg:p-12">
            {/* CA Operations Toggle */}
            <div className="mb-10 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full -mr-16 -mt-16"></div>
              <label className="relative flex items-start gap-4 cursor-pointer">
                <div className="relative flex items-center h-6 mt-1">
                  <input
                    type="checkbox"
                    checked={isCAOperations}
                    onChange={(e) => setIsCAOperations(e.target.checked)}
                    className="w-6 h-6 text-indigo-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-base font-bold text-gray-900">California Operations</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Enable this option if you're submitting for California-specific operations. This will prioritize CA-compliant form templates.
                  </p>
                </div>
              </label>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Industry Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Industry Type
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    setSelectedSubtype("");
                    setSelectedTemplateId("");
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                >
                  <option value="">Select an industry...</option>
                  {industries.map((industry) => (
                    <option key={industry.name} value={industry.name}>
                      {industry.name}
                      {industry.hasStateSpecific && isCAOperations && " (CA Available)"}
                    </option>
                  ))}
                </select>
                {loading && (
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                    Loading industries...
                  </p>
                )}
              </div>

              {/* Subtype Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Coverage Subtype
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubtype}
                  onChange={(e) => {
                    const subtypeName = e.target.value;
                    setSelectedSubtype(subtypeName);
                    const subtype = selectedIndustryData?.subtypes.find((s) => s.name === subtypeName);
                    if (subtype) {
                      setSelectedTemplateId(subtype.templateId);
                    }
                  }}
                  disabled={!selectedIndustryData || selectedIndustryData.subtypes.length === 0}
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                >
                  <option value="">Select coverage type...</option>
                  {selectedIndustryData?.subtypes.map((subtype) => (
                    <option key={subtype.name} value={subtype.name}>
                      {subtype.name}
                      {subtype.stateSpecific && " (CA-Specific)"}
                    </option>
                  ))}
                </select>
                {selectedIndustryData?.hasStateSpecific && (
                  <p className="text-xs text-blue-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    CA-specific templates are prioritized when available
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-fade-in-up">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleContinue}
                disabled={!selectedIndustry || !selectedSubtype || !selectedTemplateId || loading}
                className="relative flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-base hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 disabled:shadow-none group overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Continue to Application
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200 p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Assistance?</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                If you're unsure which industry or coverage type to select, our support team is here to help. Contact your Sterling Wholesale Insurance representative for personalized guidance.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  View Documentation
                </Link>
                <span className="text-gray-400">or</span>
                <a
                  href="mailto:support@sterlingwholesale.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
