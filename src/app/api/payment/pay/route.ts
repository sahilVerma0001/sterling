import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PaymentService } from "@/lib/services/payment";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";

/**
 * POST /api/payment/pay
 * Process a payment for a submission
 * Body: { submissionId, amount, method }
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

    // Only agency users can make payments
    const userRole = (session.user as any).role;
    if (userRole !== "agency_admin" && userRole !== "agency_user") {
      return NextResponse.json(
        { error: "Forbidden - Agency access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { submissionId, amount, method } = body;

    // Validate inputs
    if (!submissionId || !amount || !method) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: submissionId, amount, method",
        },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be a positive number",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify submission exists and belongs to user's agency
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found",
        },
        { status: 404 }
      );
    }

    const userAgencyId = (session.user as any).agencyId;
    if (submission.agencyId.toString() !== userAgencyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Submission does not belong to your agency",
        },
        { status: 403 }
      );
    }

    // ✅ CRITICAL: Check if e-signature is completed
    // UI LOGIC NOTE: If !submission.esignCompleted, API returns error: "E-Sign required before payment"
    // Frontend should:
    // - Disable payment button
    // - Show message: "Payment is locked until all documents are signed"
    // - Display: "Please complete the e-signature process before making a payment"
    if (!submission.esignCompleted) {
      return NextResponse.json(
        {
          success: false,
          error: "E-Signature must be completed before payment",
          message: "Please complete the e-signature process before making a payment.",
        },
        { status: 400 }
      );
    }

    // Process payment
    const paymentResult = await PaymentService.processPayment({
      submissionId,
      amount,
      method,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error || "Payment processing failed",
        },
        { status: 400 }
      );
    }

    // UI LOGIC NOTE: When payment succeeds (paymentStatus = "PAID"), 
    // UI should unlock "Request Bind" button
    // Conditions to check:
    // - submission.paymentStatus === "PAID"
    // - submission.esignCompleted === true
    // - Both conditions must be met to enable bind request
    return NextResponse.json({
      success: true,
      paymentStatus: paymentResult.paymentStatus,
      paymentDate: paymentResult.paymentDate,
      paymentAmount: paymentResult.paymentAmount,
      paymentMethod: paymentResult.paymentMethod,
      transactionId: paymentResult.transactionId,
      submissionId,
    });
  } catch (error: any) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process payment",
      },
      { status: 500 }
    );
  }
}

