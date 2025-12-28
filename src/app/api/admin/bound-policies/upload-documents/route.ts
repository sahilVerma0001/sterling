import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sendEmail } from "@/lib/services/email/EmailService";

/**
 * POST /api/admin/bound-policies/upload-documents
 * Upload final policy documents for a bound policy
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

    // Only system admin can upload documents
    const userRole = (session.user as any).role;
    if (userRole !== "system_admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const formData = await req.formData();
    const submissionId = formData.get("submissionId") as string;
    const finalBinderFile = formData.get("finalBinder") as File | null;
    const finalPolicyFile = formData.get("finalPolicy") as File | null;
    const certificateFile = formData.get("certificate") as File | null;

    if (!submissionId) {
      return NextResponse.json(
        { error: "submissionId is required" },
        { status: 400 }
      );
    }

    // Fetch submission
    const submission = await Submission.findById(submissionId).populate("agencyId", "name");

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verify submission is bound
    if (!submission.bindApproved || submission.status !== "BOUND") {
      return NextResponse.json(
        { error: "Submission must be bound before uploading final documents" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "final-documents");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      console.error("Error creating uploads directory:", err);
    }

    // Initialize finalPolicyDocuments if it doesn't exist
    if (!submission.finalPolicyDocuments) {
      submission.finalPolicyDocuments = {
        finalBinderPdfUrl: undefined,
        finalPolicyPdfUrl: undefined,
        certificateOfInsuranceUrl: undefined,
      };
    }

    const uploadedFiles: string[] = [];

    // Upload Final Binder PDF
    if (finalBinderFile) {
      const bytes = await finalBinderFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `final-binder-${submissionId}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      submission.finalPolicyDocuments.finalBinderPdfUrl = `/uploads/final-documents/${fileName}`;
      submission.finalPolicyDocuments.finalBinderUploadedAt = new Date();
      uploadedFiles.push("Final Binder PDF");
    }

    // Upload Final Policy PDF
    if (finalPolicyFile) {
      const bytes = await finalPolicyFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `final-policy-${submissionId}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      submission.finalPolicyDocuments.finalPolicyPdfUrl = `/uploads/final-documents/${fileName}`;
      submission.finalPolicyDocuments.finalPolicyUploadedAt = new Date();
      uploadedFiles.push("Final Policy PDF");
    }

    // Upload Certificate of Insurance
    if (certificateFile) {
      const bytes = await certificateFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `certificate-${submissionId}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      submission.finalPolicyDocuments.certificateOfInsuranceUrl = `/uploads/final-documents/${fileName}`;
      submission.finalPolicyDocuments.certificateUploadedAt = new Date();
      uploadedFiles.push("Certificate of Insurance");
    }

    // Set uploaded by admin ID
    submission.finalPolicyDocuments.uploadedByAdminId = (session.user as any).id;

    // Save submission
    submission.markModified("finalPolicyDocuments");
    await submission.save();

    console.log("✅ Final policy documents uploaded successfully");
    console.log(`   Submission ID: ${submissionId}`);
    console.log(`   Files uploaded: ${uploadedFiles.join(", ")}`);
    console.log(`   Final Policy Documents:`, JSON.stringify(submission.finalPolicyDocuments, null, 2));

    // Send email notification to agency (mock mode)
    try {
      await sendEmail({
        to: submission.clientContact.email,
        subject: `Final Policy Documents Available - ${submission.clientContact.name}`,
        html: `
          <h2>Final Policy Documents Available</h2>
          <p>Dear ${submission.clientContact.name},</p>
          <p>Your final policy documents have been uploaded and are now available for download.</p>
          <p><strong>Documents uploaded:</strong></p>
          <ul>
            ${uploadedFiles.map(file => `<li>${file}</li>`).join("")}
          </ul>
          <p>Please log in to your portal to download the documents.</p>
          <p>Best regards,<br>Sterling Wholesale Insurance</p>
        `,
        text: `Final policy documents are now available for ${submission.clientContact.name}. Documents: ${uploadedFiles.join(", ")}`,
      });
      console.log("📧 Email notification sent to agency");
    } catch (emailError) {
      console.error("Email notification error:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Documents uploaded successfully",
      uploadedFiles,
    });
  } catch (error: any) {
    console.error("Upload documents error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload documents" },
      { status: 500 }
    );
  }
}

