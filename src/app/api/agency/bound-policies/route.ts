import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import Quote from "@/models/Quote";

/**
 * GET /api/agency/bound-policies
 * Get all bound policies for the authenticated agency
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only agency users can access
    const userRole = (session.user as any).role;
    if (userRole !== "agency_admin" && userRole !== "agency_user") {
      return NextResponse.json(
        { error: "Forbidden - Agency access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const agencyId = (session.user as any).agencyId;

    // Ensure models are registered
    await import("@/models/Carrier");

    // Fetch submissions where bindApproved = true AND belongs to this agency
    const submissions = await Submission.find({
      agencyId,
      bindApproved: true,
    })
      .populate("templateId", "industry subcategory")
      .sort({ bindApprovedAt: -1 }) // Most recently approved first
      .lean();

    // Get quotes for these submissions
    const submissionIds = submissions.map((s) => s._id);
    const quotes = await Quote.find({
      submissionId: { $in: submissionIds },
    })
      .populate("carrierId", "name")
      .lean();

    // Create a map of submissionId -> quote for easy lookup
    const quoteMap = new Map();
    quotes.forEach((quote: any) => {
      quoteMap.set(quote.submissionId.toString(), quote);
    });

    // Combine submission and quote data
    const boundPolicies = submissions.map((submission: any) => {
      const quote = quoteMap.get(submission._id.toString());
      return {
        _id: submission._id.toString(),
        clientContact: submission.clientContact,
        templateId: submission.templateId
          ? {
              _id: submission.templateId._id.toString(),
              industry: submission.templateId.industry,
              subcategory: submission.templateId.subcategory,
            }
          : null,
        status: submission.status,
        bindRequested: submission.bindRequested,
        bindRequestedAt: submission.bindRequestedAt,
        bindApproved: submission.bindApproved,
        bindApprovedAt: submission.bindApprovedAt,
        bindStatus: submission.bindStatus,
        esignCompleted: submission.esignCompleted,
        esignCompletedAt: submission.esignCompletedAt,
        paymentStatus: submission.paymentStatus,
        paymentDate: submission.paymentDate,
        paymentAmount: submission.paymentAmount,
        paymentMethod: submission.paymentMethod,
        quote: quote
          ? {
              _id: quote._id.toString(),
              carrierId: quote.carrierId._id.toString(),
              carrierName: quote.carrierId.name,
              carrierQuoteUSD: quote.carrierQuoteUSD,
              wholesaleFeeAmountUSD: quote.wholesaleFeeAmountUSD,
              brokerFeeAmountUSD: quote.brokerFeeAmountUSD,
              finalAmountUSD: quote.finalAmountUSD,
              status: quote.status,
            }
          : null,
        createdAt: submission.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      policies: boundPolicies,
      count: boundPolicies.length,
    });
  } catch (error: any) {
    console.error("Agency bound policies error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch bound policies",
      },
      { status: 500 }
    );
  }
}

