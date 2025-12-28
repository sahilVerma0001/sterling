import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import FormTemplate from "@/models/FormTemplate";
import RoutingLog from "@/models/RoutingLog";
import Quote from "@/models/Quote";

/**
 * GET /api/admin/submissions/[id]
 * Get submission details for admin (with routing logs and quotes)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    // Only system_admin can access admin APIs
    if (userRole !== "system_admin") {
      return NextResponse.json(
        { error: "Forbidden - System admin access required" },
        { status: 403 }
      );
    }

    await connectDB();
    
    // Import models to ensure they're registered for populate
    await import("@/models/FormTemplate");
    await import("@/models/Agency");
    await import("@/models/Carrier");

    const submission = await Submission.findById(params.id)
      .populate("templateId")
      .populate("agencyId", "name email")
      .lean();

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Get routing logs
    const routingLogs = await RoutingLog.find({
      submissionId: params.id,
    })
      .populate("carrierId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Get quotes
    const quotes = await Quote.find({
      submissionId: params.id,
    })
      .populate("carrierId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      submission: {
        ...submission,
        _id: submission._id.toString(),
        agencyId: submission.agencyId
          ? {
              _id: (submission.agencyId as any)._id.toString(),
              name: (submission.agencyId as any).name,
              email: (submission.agencyId as any).email,
            }
          : null,
        templateId: submission.templateId
          ? {
              _id: (submission.templateId as any)._id.toString(),
              industry: (submission.templateId as any).industry,
              subtype: (submission.templateId as any).subtype,
              title: (submission.templateId as any).title,
            }
          : null,
        programId: (submission as any).programId || null,
        programName: (submission as any).programName || null,
      },
      routingLogs: routingLogs.map((log: any) => ({
        ...log,
        _id: log._id.toString(),
        submissionId: log.submissionId.toString(),
        carrierId: log.carrierId
          ? {
              _id: (log.carrierId as any)._id.toString(),
              name: (log.carrierId as any).name,
              email: (log.carrierId as any).email,
            }
          : null,
      })),
      quotes: quotes.map((quote: any) => ({
        ...quote,
        _id: quote._id.toString(),
        submissionId: quote.submissionId.toString(),
        carrierId: quote.carrierId
          ? {
              _id: (quote.carrierId as any)._id.toString(),
              name: (quote.carrierId as any).name,
              email: (quote.carrierId as any).email,
            }
          : null,
      })),
    });
  } catch (error: any) {
    console.error("Submission details error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

