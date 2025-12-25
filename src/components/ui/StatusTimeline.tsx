"use client";

import React from "react";

// Simple icon components (replacing lucide-react)
const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

interface StatusTimelineProps {
  submission: {
    quoteStatus?: string;
    signedDocuments?: Array<any>;
    esignCompleted?: boolean;
    paymentStatus?: string;
    bindRequested?: boolean;
    bindApproved?: boolean;
  };
  className?: string;
}

export default function StatusTimeline({ submission, className = "" }: StatusTimelineProps) {
  const steps = [
    {
      label: "Quote Approved",
      done: submission?.quoteStatus === "APPROVED" || 
            submission?.quoteStatus === "PAYMENT_RECEIVED" ||
            submission?.quoteStatus === "BIND_REQUESTED" ||
            submission?.quoteStatus === "BOUND",
    },
    {
      label: "Documents Generated",
      done: (submission?.signedDocuments?.length || 0) >= 2,
    },
    {
      label: submission?.esignCompleted === true 
        ? "E‑Signature Completed" 
        : "Awaiting E‑Signature",
      done: submission?.esignCompleted === true,
    },
    {
      label: "Payment Completed",
      done: submission?.paymentStatus === "PAID",
    },
    {
      label: submission?.bindApproved ? "Policy Bound" : "Bind Requested",
      done: submission?.bindRequested === true || submission?.bindApproved === true,
    },
  ];

  return (
    <div className={`space-y-3 bg-white shadow p-4 rounded-md border ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Status Timeline</h3>
      <div className="space-y-4">
        {steps.map((s, index) => (
          <div key={index} className="flex items-center gap-3">
            {s.done ? (
              <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
            ) : (
              <Clock className="text-gray-400 w-5 h-5 flex-shrink-0" />
            )}
            <span
              className={
                s.done ? "font-medium text-green-600" : "text-gray-600"
              }
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
