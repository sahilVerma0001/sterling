import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import FormTemplate from "@/models/FormTemplate";

/**
 * GET /api/agency/submissions/[id]
 * Get a single submission with full details
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

    await connectDB();

    // Ensure models are registered before populate
    await import("@/models/FormTemplate");

    const submission = await Submission.findOne({
      _id: params.id,
      agencyId: (session.user as any).agencyId,
    })
      .populate("templateId")
      .lean();

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      submission: {
        ...submission,
        _id: submission._id.toString(),
        agencyId: submission.agencyId.toString(),
        templateId: submission.templateId
          ? {
              ...submission.templateId,
              _id: (submission.templateId as any)._id.toString(),
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Submission details API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch submission" },
      { status: 500 }
    );
  }
}






