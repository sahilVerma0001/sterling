"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Program {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
}

interface Industry {
  id: string;
  name: string;
  icon: string;
  featured?: boolean;
  featuredText?: string;
  programs: Program[];
}

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>("construction");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const industries: Industry[] = [
    {
      id: "construction",
      name: "Construction",
      icon: "construction",
      featured: true,
      featuredText: "New Lower Rates for Standard GL!",
      programs: [
        { 
          id: "advantage-contractor", 
          name: "Advantage Contractor General Liability",
          badge: "NEW All 50 States!",
          badgeColor: "teal"
        },
        { 
          id: "plus-contractor", 
          name: "Plus Contractor General Liability"
        },
        { 
          id: "standard-contractor", 
          name: "Standard Contractor General Liability",
          badge: "NEW Lower Rates!",
          badgeColor: "teal"
        },
        { 
          id: "builders-risk", 
          name: "Builders Risk"
        }
      ]
    },
    {
      id: "property",
      name: "Property",
      icon: "property",
      programs: [
        { id: "investor-property", name: "Investor Property" },
        { id: "builders-renovation", name: "Builder's Renovation" },
        { id: "vacant-land", name: "Vacant Land" },
        { id: "vacant-package", name: "Vacant Package" },
        { id: "1-8-dwelling", name: "1-8 Unit Dwelling" }
      ]
    },
    {
      id: "hospitality",
      name: "Hospitality",
      icon: "hospitality",
      programs: [
        { id: "hospitality", name: "Hospitality" }
      ]
    },
    {
      id: "trucking",
      name: "Trucking",
      icon: "trucking",
      programs: [
        { id: "domestic-long-haul", name: "Domestic Long Haul" },
        { id: "cargo", name: "Cargo" },
        { id: "physical-damage", name: "Physical Damage" }
      ]
    },
    {
      id: "excess",
      name: "Excess",
      icon: "excess",
      programs: [
        { id: "excess-everything", name: "Excess for Everything" },
        { id: "construction-excess", name: "Construction Excess Liability" },
        { id: "petroleum-excess", name: "Petroleum Distribution Excess Liability" }
      ]
    }
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const handleIndustryClick = (industryId: string) => {
    if (expandedIndustry === industryId) {
      setExpandedIndustry(null);
    } else {
      setExpandedIndustry(industryId);
    }
  };

  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
  };

  const handleContinue = () => {
    if (selectedProgram) {
      // Navigate to quote/application page
      router.push(`/agency/quote/${selectedProgram}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Matching ISC */}
      <aside className={`${sidebarCollapsed ? 'w-[60px]' : 'w-[90px]'} bg-[#3A3C3F] flex flex-col items-center py-6 fixed h-full z-50 transition-all duration-300`}>
        {/* Sterling Premium Logo */}
        <Link href="/agency/dashboard" className="mb-8 group flex flex-col items-center">
          {/* Logo Icon */}
          <div className="relative mb-3">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-[#0097A7] rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all"></div>
            
            {/* Logo Container */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#1A1F2E] via-[#2A3240] to-[#1A1F2E] rounded-xl flex items-center justify-center shadow-2xl border border-[#00BCD4]/20 group-hover:border-[#00BCD4]/40 transition-all overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-transparent"></div>
              </div>
              
              {/* Premium Logo Design - Abstract Geometric */}
              <svg className="relative w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Shield Shape */}
                <path 
                  d="M50 10 L80 25 L80 55 Q80 75 50 90 Q20 75 20 55 L20 25 Z" 
                  fill="url(#logoGradient1)" 
                  className="drop-shadow-lg"
                />
                
                {/* Inner Diamond */}
                <path 
                  d="M50 25 L65 40 L50 70 L35 40 Z" 
                  fill="url(#logoGradient2)"
                  className="drop-shadow-md"
                />
                
                {/* Center Accent Line */}
                <path 
                  d="M50 30 L50 65" 
                  stroke="#FFFFFF" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="drop-shadow-sm"
                />
                
                {/* Horizontal Accent */}
                <path 
                  d="M40 47 L60 47" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  opacity="0.8"
                />
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0097A7" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Corner Accents */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
            </div>
          </div>

          {/* Company Name */}
          <div className="text-center px-2">
            <p className="text-[9px] font-semibold text-gray-400 leading-tight tracking-wide uppercase group-hover:text-gray-300 transition-colors" style={{ letterSpacing: '0.05em' }}>
              Sterling
            </p>
            <p className="text-[8px] font-medium text-gray-500 leading-tight group-hover:text-gray-400 transition-colors">
              Wholesale Insurance
            </p>
          </div>
        </Link>

        {/* Toggle Arrow */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="mb-auto p-2 text-[#00BCD4] hover:bg-[#00BCD4]/10 rounded-lg transition-all"
        >
          <svg className={`w-6 h-6 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bottom Links */}
        <div className="flex flex-col gap-6 mt-auto">
          <a
            href="https://onlinemga.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="text-[9px] font-medium">OMGA</span>
          </a>

          <Link
            href="/agency/dashboard"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="text-[9px] font-medium">Broker Center</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarCollapsed ? 'ml-[60px]' : 'ml-[90px]'} transition-all duration-300`}>
        <main className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="text-center pt-16 pb-8">
            <h1 className="text-5xl font-normal text-gray-900 mb-4">Marketplace</h1>
            <p className="text-lg text-gray-500">Select industries</p>
          </div>

          {/* Industry Cards Grid */}
          <div className="flex-1 px-8 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {industries.map((industry) => {
                  const isExpanded = expandedIndustry === industry.id;
                  
                  return (
                    <div
                      key={industry.id}
                      className={`relative transition-all duration-300 ${
                        isExpanded ? 'col-span-1' : ''
                      }`}
                    >
                      {/* Industry Card Header */}
                      <div
                        onClick={() => handleIndustryClick(industry.id)}
                        className={`cursor-pointer bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
                          isExpanded
                            ? 'border-[#00BCD4] shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Featured Banner */}
                        {industry.featured && !isExpanded && (
                          <div className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] px-4 py-3 text-white text-center">
                            <p className="text-sm font-semibold leading-tight">
                              {industry.featuredText}
                            </p>
                          </div>
                        )}

                        {/* Card Header */}
                        <div className={`flex items-center gap-3 p-4 ${industry.featured && !isExpanded ? '' : 'pt-6'}`}>
                          {/* Icon */}
                          <div className="relative flex-shrink-0">
                            {industry.icon === "construction" && (
                              <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l9-9 9 9M5 12l7-7 7 7" />
                              </svg>
                            )}
                            {industry.icon === "property" && (
                              <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            )}
                            {industry.icon === "hospitality" && (
                              <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                            {industry.icon === "trucking" && (
                              <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12M8 7v13M8 7V4m12 3l4 6v7h-4m0 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-12 0a2 2 0 11-4 0m4 0H4" />
                              </svg>
                            )}
                            {industry.icon === "excess" && (
                              <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={1.5} />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
                              </svg>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-base font-semibold text-gray-900 flex-1">
                            {industry.name}
                          </h3>
                        </div>
                      </div>

                      {/* Expanded Programs List */}
                      {isExpanded && (
                        <div className="mt-4 space-y-2">
                          {industry.programs.map((program) => (
                            <label
                              key={program.id}
                              className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00BCD4] hover:bg-gray-50 transition-all group"
                            >
                              {/* Checkbox (acts as radio) */}
                              <input
                                type="checkbox"
                                checked={selectedProgram === program.id}
                                onChange={() => handleProgramSelect(program.id)}
                                className="w-5 h-5 mt-0.5 text-[#00BCD4] border-gray-300 rounded focus:ring-[#00BCD4] focus:ring-2 cursor-pointer"
                              />

                              {/* Program Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-gray-900 group-hover:text-[#00BCD4] transition-colors">
                                    {program.name}
                                  </span>
                                  {program.badge && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                      program.badgeColor === 'teal'
                                        ? 'bg-[#00BCD4] text-white'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {program.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end px-8 pb-8">
            <button
              onClick={handleContinue}
              disabled={!selectedProgram}
              className={`px-8 py-3 rounded-lg text-base font-medium transition-all ${
                selectedProgram
                  ? 'bg-[#00BCD4] text-white hover:bg-[#00ACC1] shadow-lg shadow-[#00BCD4]/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
