import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import FormTemplate from "@/models/FormTemplate";

/**
 * GET /api/agency/submissions
 * Get all submissions for the authenticated agency
 * Query params: status, startDate, endDate
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

    await connectDB();
    
    // Ensure FormTemplate model is registered before population
    await import("@/models/FormTemplate");

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const query: any = {
      agencyId: (session.user as any).agencyId,
    };

    // Filter by status
    if (status && status !== "ALL") {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the entire end date
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Fetch submissions with template info
    const submissions = await Submission.find(query)
      .populate("templateId", "industry subtype title")
      .sort({ createdAt: -1 })
      .lean();

    // Format response
    const formattedSubmissions = submissions.map((sub: any) => ({
      _id: sub._id.toString(),
      submissionId: sub._id.toString(),
      industry: sub.templateId?.industry || "Unknown",
      subtype: sub.templateId?.subtype || "Unknown",
      templateTitle: sub.templateId?.title || "Unknown",
      clientName: sub.clientContact?.name || "N/A",
      clientEmail: sub.clientContact?.email || "N/A",
      clientPhone: sub.clientContact?.phone || "N/A",
      status: sub.status,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      fileCount: sub.files?.length || 0,
      state: sub.state || "N/A",
    }));

    return NextResponse.json({
      submissions: formattedSubmissions,
      count: formattedSubmissions.length,
    });
  } catch (error: any) {
    console.error("Submissions API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
