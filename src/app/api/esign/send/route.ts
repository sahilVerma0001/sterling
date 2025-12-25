import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import { ESignService } from "@/lib/services/esign";

/**
 * POST /api/esign/send
 * Send documents for e-signature
 * Body: { submissionId }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: "submissionId is required" },
        { status: 400 }
      );
    }

    // Call ESignService to send for signature
    const result = await ESignService.sendForSignature(submissionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send documents for signature" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      signingUrl: result.signingUrl,
      envelopeId: result.envelopeId,
      documentsSent: result.documentsSent,
      message: `${result.documentsSent} document(s) sent for signature`,
    });
  } catch (error: any) {
    console.error("E-sign send API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send documents for signature" },
      { status: 500 }
    );
  }
}



