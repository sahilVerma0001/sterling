import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";

/**
 * POST /api/esign/sign
 * Mark documents as signed (simulates signer completing signature from signer portal)
 * Body: { submissionId, envelopeId, signer: { firstName, lastName, email } }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { submissionId, envelopeId, signer } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: "submissionId is required" },
        { status: 400 }
      );
    }

    if (!envelopeId) {
      return NextResponse.json(
        { error: "envelopeId is required" },
        { status: 400 }
      );
    }

    if (!signer || !signer.firstName || !signer.lastName || !signer.email) {
      return NextResponse.json(
        { error: "Signer information is required (firstName, lastName, email)" },
        { status: 400 }
      );
    }

    // Find submission
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check if documents exist
    if (!submission.signedDocuments || submission.signedDocuments.length === 0) {
      return NextResponse.json(
        { error: "No documents found for this submission" },
        { status: 400 }
      );
    }

    // Mark all documents as signed
    const signedAt = new Date();
    submission.signedDocuments = submission.signedDocuments.map((doc: any) => ({
      ...doc,
      signatureStatus: "SIGNED",
      signedAt: signedAt,
      signer: {
        firstName: signer.firstName,
        lastName: signer.lastName,
        email: signer.email,
      },
    }));

    // Mark e-signature as completed
    submission.esignCompleted = true;
    submission.esignCompletedAt = signedAt;

    // Save submission
    await submission.save();

    console.log(
      `✅ E-Sign completed for submission ${submissionId} by ${signer.email}`
    );

    return NextResponse.json({
      success: true,
      message: "Documents signed successfully",
      signedAt: signedAt.toISOString(),
      documentsSigned: submission.signedDocuments.length,
    });
  } catch (error: any) {
    console.error("E-sign sign API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign documents" },
      { status: 500 }
    );
  }
}

