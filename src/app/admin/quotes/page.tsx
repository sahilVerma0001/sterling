"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Quote {
  _id: string;
  submissionId: string;
  carrierName: string;
  clientName: string;
  carrierQuoteUSD: number;
  wholesaleFeePercent: number;
  wholesaleFeeAmountUSD: number;
  brokerFeeAmountUSD: number;
  finalAmountUSD: number;
  status: string;
  createdAt: string;
}

export default function AdminQuotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
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
      fetchQuotes();
    }
  }, [status]);

  const fetchQuotes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/quotes");
      const data = await response.json();
      if (data.quotes) {
        setQuotes(data.quotes);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Error fetching quotes:", err);
      setError("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  const handlePostQuote = async (quoteId: string) => {
    if (!confirm("Are you sure you want to post this quote? It will become visible to the agency.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Quote posted successfully!");
        fetchQuotes(); // Refresh the list
      } else {
        alert(data.error || "Failed to post quote");
      }
    } catch (err: any) {
      console.error("Error posting quote:", err);
      alert("Failed to post quote");
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
          <h1 className="text-3xl font-bold text-[#4A4A4A] mb-2">All Quotes</h1>
          <p className="text-[#6B6B6B]">View and manage all quotes</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {quotes.length === 0 && !loading ? (
          <div className="card-sterling p-8 text-center">
            <p className="text-[#6B6B6B]">No quotes found.</p>
          </div>
        ) : (
          <div className="card-sterling p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Carrier
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Carrier Quote
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Wholesale Fee
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Broker Fee
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Final Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr
                      key={quote._id}
                      className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5]"
                    >
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">
                        {quote.clientName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">
                        {quote.carrierName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">
                        ${quote.carrierQuoteUSD.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">
                        ${quote.wholesaleFeeAmountUSD.toFixed(2)} ({quote.wholesaleFeePercent}%)
                      </td>
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">
                        ${quote.brokerFeeAmountUSD.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-[#4A4A4A]">
                        ${quote.finalAmountUSD.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            quote.status
                          )}`}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B6B6B]">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/submissions/${quote.submissionId}`}
                            className="text-sm text-[#C4A882] hover:underline"
                          >
                            View
                          </Link>
                          {quote.status === "ENTERED" && (
                            <button
                              onClick={() => handlePostQuote(quote._id)}
                              className="text-sm text-blue-600 hover:underline font-semibold"
                            >
                              Post Quote
                            </button>
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

