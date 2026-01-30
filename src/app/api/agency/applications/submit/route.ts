import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import Agency from "@/models/Agency";
import { generateApplicationPacketHTML, mapFormDataToPacketData, loadCapitalCoLogo } from "@/lib/services/pdf/ApplicationPacketPDF";
import { savePDFToStorage } from "@/lib/services/pdf/storage";

/**
 * Generate unique application number
 */
function generateApplicationNumber(): string {
  const prefix = "APP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * POST /api/agency/applications/submit
 * Submit application (no premium calculation)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { programId, programName, formData, carrierEmail } = await req.json();

    if (!programId || !formData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get agency details
    const agency = await Agency.findById(user.agencyId);
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Generate application number
    const applicationNumber = generateApplicationNumber();

    // Prepare client contact from form data
    const clientContact = {
      name: formData.companyName || "Unknown",
      phone: formData.phone || "",
      email: formData.email || "",
      EIN: formData.companyFEIN || "",
      businessAddress: {
        street: formData.streetAddress || "",
        city: formData.city || "",
        state: formData.state || "",
        zip: formData.zipCode || "00000", // Default zip if not provided
      },
    };

    // Create submission (application)
    const submission = await Submission.create({
      agencyId: user.agencyId,
      templateId: null, // No template for this form
      payload: formData,
      files: [],
      status: "SUBMITTED",
      clientContact,
      ccpaConsent: true,
      state: formData.state || "CA",
      programId,
      programName: programName || "Advantage Contractor GL",
      carrierEmail: carrierEmail || process.env.DEFAULT_CARRIER_EMAIL || "carrier@example.com",
      submittedToCarrierAt: new Date(),
    });

    // Generate Application PDF and send to carrier
    let pdfUrl = "";
    let pdfBuffer: Buffer | undefined;
    
    try {
      console.log("📄 Starting PDF generation...");
      
      // Load Capital & Co logo SVG
      const capitalCoLogoSVG = await loadCapitalCoLogo();

      // Map form data to packet data format (no quote yet for new submissions)
      let packetData;
      try {
        packetData = mapFormDataToPacketData(
          formData,
          submission._id.toString(),
          agency,
          undefined, // No quote yet for new submissions
          submission,
          capitalCoLogoSVG
        );
        console.log("✅ Form data mapped successfully");
      } catch (mapError: any) {
        console.error("❌ Error mapping form data:", mapError?.message);
        throw new Error(`Failed to map form data: ${mapError?.message}`);
      }

      console.log("📄 Generating 12-page application packet HTML...");
      let htmlContent: string;
      try {
        htmlContent = await generateApplicationPacketHTML(packetData);
        console.log(`📄 HTML content length: ${htmlContent.length} characters`);
      } catch (htmlError: any) {
        console.error("❌ Error generating HTML:", htmlError?.message);
        throw new Error(`Failed to generate HTML: ${htmlError?.message}`);
      }

      // Generate PDF using production service (PDFShift)
      console.log("📄 Generating PDF using PDFShift...");
      try {
        const { generatePDFFromHTML } = await import('@/lib/services/pdf/PDFService');
        pdfBuffer = await generatePDFFromHTML({
          html: htmlContent,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px',
          },
        });
        console.log(`📄 PDF generated - Size: ${pdfBuffer.length} bytes`);
      } catch (pdfGenError: any) {
        console.error("❌ PDF generation failed:", pdfGenError?.message);
        // Don't throw - allow submission to continue without PDF
        throw pdfGenError; // Re-throw to be caught by outer catch
      }

      // Save PDF to storage (skip in serverless environments like Vercel)
      if (pdfBuffer) {
        try {
          // In Vercel/serverless, filesystem is read-only, so skip file storage
          // PDF can be regenerated on-demand from submission data
          if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            console.log("⚠️ Skipping PDF file storage in serverless environment");
            console.log("📄 PDF can be regenerated on-demand from submission data");
            // Submission will succeed without PDF URL - PDF can be generated later
            await submission.save();
          } else {
            // Local development - save to filesystem
            const fileName = `application-${submission._id.toString()}.pdf`;
            console.log(`📄 Saving PDF to storage: ${fileName}`);
            pdfUrl = await savePDFToStorage(pdfBuffer, fileName);
            console.log(`📄 PDF saved successfully: ${pdfUrl}`);

            // Update submission with PDF URL
            submission.applicationPdfUrl = pdfUrl;
            await submission.save();
            console.log("✅ PDF generation and save completed successfully");
          }
        } catch (saveError: any) {
          console.error("❌ PDF save error (non-fatal):", saveError?.message);
          // Continue - PDF generation succeeded but save failed
          // In production/serverless, PDF can be regenerated on-demand
          console.log("⚠️ Submission will continue without PDF URL - can be regenerated later");
          // Save submission without PDF URL
          await submission.save().catch((saveErr) => {
            console.error("❌ Failed to save submission:", saveErr?.message);
            // This is non-fatal - submission was already created
          });
        }
      }
    } catch (pdfError: any) {
      console.error("❌ PDF generation error (non-fatal):", pdfError);
      console.error("❌ Error message:", pdfError?.message);
      console.error("❌ Error stack:", pdfError?.stack);
      // Continue even if PDF fails - submission should still succeed
      // PDF can be regenerated later from the submission data
      console.log("⚠️ Continuing submission without PDF - can be regenerated later");
    }

    // Send email to carrier with PDF attachment
    try {
      const { sendApplicationToCarrier } = await import("@/lib/services/email/EmailService");
      
      await sendApplicationToCarrier({
        carrierEmail: submission.carrierEmail || "",
        agencyName: agency.name || "Unknown Agency",
        companyName: formData.companyName || "Unknown Company",
        programName: programName || "Advantage Contractor GL",
        submittedDate: new Date().toLocaleDateString(),
        applicantEmail: formData.email || "",
        applicantPhone: formData.phone || "",
        pdfBuffer,
      });

      console.log(`✅ Application email sent to carrier: ${submission.carrierEmail}`);
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Continue even if email fails - admin can manually send
    }

    return NextResponse.json({
      success: true,
      application: {
        id: submission._id.toString(),
        applicationNumber,
        status: submission.status,
        submittedAt: submission.createdAt,
        pdfUrl: pdfUrl || null,
        pdfGenerated: !!pdfUrl,
      },
    });
  } catch (error: any) {
    console.error("Application submit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agency/applications/submit?applicationId=xxx
 * Get application details
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const searchParams = req.nextUrl.searchParams;
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing applicationId" },
        { status: 400 }
      );
    }

    await connectDB();

    const submission = await Submission.findOne({
      _id: applicationId,
      agencyId: user.agencyId,
    });

    if (!submission) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({
      application: {
        id: submission._id.toString(),
        programId: submission.programId,
        programName: submission.programName,
        status: submission.status,
        clientContact: submission.clientContact,
        formData: submission.payload,
        submittedAt: submission.createdAt,
        pdfUrl: submission.applicationPdfUrl,
      },
    });
  } catch (error: any) {
    console.error("Application fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch application" },
      { status: 500 }
    );
  }
}

