import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, attachmentName, attachmentContent, uploadedFiles } = await request.json();

    const cleanTo = to?.trim();
    
    if (!cleanTo || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields. Make sure 'To', 'Subject', and 'Body' are provided." },
        { status: 400 }
      );
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      return NextResponse.json(
        { error: "SMTP configuration is missing in .env file." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions: any = {
      from: SMTP_FROM,
      to: cleanTo,
      subject,
      text: body, // using plain text for simplicity
      html: body.replace(/\n/g, "<br>"), // Simple convert to html
    };

    if (attachmentName && attachmentContent) {
      mailOptions.attachments = [
        {
          filename: attachmentName,
          content: attachmentContent,
        },
      ];
    }

    if (uploadedFiles && Array.isArray(uploadedFiles)) {
      if (!mailOptions.attachments) mailOptions.attachments = [];
      
      for (const file of uploadedFiles) {
        if (!file.content) continue;
        
        // Strip the data URL prefix if present (e.g., "data:image/png;base64,...")
        let base64Data = file.content;
        if (base64Data.includes("base64,")) {
          base64Data = base64Data.split("base64,")[1];
        }
        
        mailOptions.attachments.push({
          filename: file.name,
          content: base64Data,
          encoding: 'base64',
          contentType: file.type
        });
      }
    }

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error("Email sending error:", error);
    
    const message = error.message === "No recipients defined" 
      ? "Invalid or missing recipient email address. Please check the 'To' field in your Send Email node."
      : error.message || "Failed to send email";
      
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
