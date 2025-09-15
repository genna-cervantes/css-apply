import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY! || '');

export interface EmailTemplate {
    subject: string;
    html: string;
}

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = {
            name: "CSS Apply",
            email: process.env.BREVO_FROM_EMAIL || "noreply@cssapply.com"
        };
        sendSmtpEmail.to = [{ email: to }];

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully:', result);
        // The Brevo API returns { response, body }, and the messageId is in body.messageId
        return { success: true, messageId: result.body?.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error };
    }
};

// Email templates for different application types
export const emailTemplates = {
    memberApplication: (userName: string, studentNumber: string): EmailTemplate => ({
        subject: "CSS Apply - Member Application Received",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb;">CSS Apply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for submitting your member application to CSS Apply! We have successfully received your application.
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
                    <p style="margin: 5px 0;"><strong>Student Number:</strong> ${studentNumber}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Member</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Our team will review your application and get back to you soon. Please keep an eye on your email for updates.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    If you have any questions, feel free to reach out to us.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSS Apply Team
                    </p>
                </div>
            </div>
        `
    }),

    committeeApplication: (userName: string, studentNumber: string, firstOption: string, secondOption: string): EmailTemplate => ({
        subject: "CSS Apply - Committee Staff Application Received",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb;">CSS Apply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for submitting your committee staff application to CSS Apply! We have successfully received your application.
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
                    <p style="margin: 5px 0;"><strong>Student Number:</strong> ${studentNumber}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Committee Staff</p>
                    <p style="margin: 5px 0;"><strong>First Choice:</strong> ${firstOption}</p>
                    <p style="margin: 5px 0;"><strong>Second Choice:</strong> ${secondOption}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    The meeting link for your interview is available in the application dashboard.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    If you have any questions, feel free to reach out to us.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSS Apply Team
                    </p>
                </div>
            </div>
        `
    }),

    executiveAssistantApplication: (userName: string, studentNumber: string, ebRole: string, firstOption: string, secondOption: string): EmailTemplate => ({
        subject: "CSS Apply - Executive Assistant Application Received",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb;">CSS Apply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for submitting your executive assistant application to CSS Apply! We have successfully received your application.
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
                    <p style="margin: 5px 0;"><strong>Student Number:</strong> ${studentNumber}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Executive Assistant</p>
                    <p style="margin: 5px 0;"><strong>EB Role:</strong> ${ebRole}</p>
                    <p style="margin: 5px 0;"><strong>First Choice:</strong> ${firstOption}</p>
                    <p style="margin: 5px 0;"><strong>Second Choice:</strong> ${secondOption}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    The meeting link for your interview is available in the application dashboard.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    If you have any questions, feel free to reach out to us.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSS Apply Team
                    </p>
                </div>
            </div>
        `
    })
};