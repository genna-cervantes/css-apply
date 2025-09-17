import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY! || '');

export interface EmailTemplate {
    subject: string;
    html: string;
}

// Capitalize the first letter of each word in a string
const capitalizeWords = (input: string): string => {
    if (!input) return input;
    return input.replace(/\b\w/g, (ch) => ch.toUpperCase());
};

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = {
            name: "CSSApply",
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
        subject: "CSSApply - Member Application Received",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for submitting your member application to CSSApply! We have successfully received your application.
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
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    committeeApplication: (userName: string, studentNumber: string, firstOption: string, secondOption: string, meetingLink?: string, interviewer?: string): EmailTemplate => ({
        subject: "CSSApply - Committee Staff Application Received",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for submitting your committee staff application to CSSApply! We have successfully received your application.
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
                    <p style="margin: 5px 0;"><strong>Student Number:</strong> ${studentNumber}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Committee Staff</p>
                    <p style="margin: 5px 0;"><strong>First Choice:</strong> ${capitalizeWords(firstOption)} Committee</p>
                    <p style="margin: 5px 0;"><strong>Second Choice:</strong> ${capitalizeWords(secondOption)} Committee</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
                </div>
                
                ${meetingLink ? `
                <div style="background-color: #e0f2fe; border: 2px solid #0284c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #0284c7; margin-top: 0;">📅 Interview Information:</h3>
                    <p style="margin: 5px 0; color: #0c4a6e;"><strong>Interviewer:</strong> ${interviewer ? capitalizeWords(interviewer) : `${capitalizeWords(firstOption)} Committee Head`}</p>
                    <p style="margin: 5px 0; color: #0c4a6e;"><strong>Meeting Link:</strong></p>
                    <div style="margin: 10px 0;">
                        <a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Join Google Meet Interview
                        </a>
                    </div>
                    <p style="margin: 10px 0 0 0; color: #0c4a6e; font-size: 14px;">
                        <em>Please schedule your interview time through the application dashboard, then use this link to join your interview.</em>
                    </p>
                </div>
                ` : `
                <p style="color: #4b5563; line-height: 1.6;">
                    Please proceed to schedule your interview through the application dashboard. The meeting link will be provided once you select your interview time.
                </p>
                `}
                
                <p style="color: #4b5563; line-height: 1.6;">
                    If you have any questions, feel free to reach out to us.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    executiveAssistantApplication: (userName: string, studentNumber: string, ebRole: string, firstOption: string, secondOption: string, meetingLink?: string, interviewer?: string): EmailTemplate => ({
        subject: "CSSApply - Executive Assistant Application Received",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for submitting your executive assistant application to CSSApply! We have successfully received your application.
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
                    <p style="margin: 5px 0;"><strong>Student Number:</strong> ${studentNumber}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Executive Assistant</p>
                    <p style="margin: 5px 0;"><strong>EB Role:</strong> ${capitalizeWords(ebRole)}</p>
                    <p style="margin: 5px 0;"><strong>First Choice:</strong> ${capitalizeWords(firstOption)}</p>
                    <p style="margin: 5px 0;"><strong>Second Choice:</strong> ${capitalizeWords(secondOption)}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
                </div>
                
                ${meetingLink ? `
                <div style="background-color: #e0f2fe; border: 2px solid #0284c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #0284c7; margin-top: 0;">📅 Interview Information:</h3>
                    <p style="margin: 5px 0; color: #0c4a6e;"><strong>Interviewer:</strong> ${interviewer ? capitalizeWords(interviewer) : `${capitalizeWords(firstOption)} Executive Board Member`}</p>
                    <p style="margin: 5px 0; color: #0c4a6e;"><strong>Meeting Link:</strong></p>
                    <div style="margin: 10px 0;">
                        <a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Join Google Meet Interview
                        </a>
                    </div>
                    <p style="margin: 10px 0 0 0; color: #0c4a6e; font-size: 14px;">
                        <em>Please schedule your interview time through the application dashboard, then use this link to join your interview.</em>
                    </p>
                </div>
                ` : `
                <p style="color: #4b5563; line-height: 1.6;">
                    Please proceed to schedule your interview through the application dashboard. The meeting link will be provided once you select your interview time.
                </p>
                `}
                
                <p style="color: #4b5563; line-height: 1.6;">
                    If you have any questions, feel free to reach out to us.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),


    // Acceptance notification templates
    memberAccepted: (userName: string, userId: string): EmailTemplate => ({
        subject: "CSSApply - Congratulations! Your Member Application Has Been Accepted",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Congratulations ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We are thrilled to inform you that your member application has been <strong style="color: #059669;">ACCEPTED</strong>! 
                    Welcome to the Computer Science Society!
                </p>
                
                <div style="background-color: #f0fdf4; border: 2px solid #059669; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #059669; margin-top: 0;">🎉 Acceptance Details:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Member ID:</strong> ${userId.toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Member</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">ACCEPTED</span></p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Your Member ID (<strong>${userId.toUpperCase()}</strong>) is now your official identifier within the organization. 
                    Please keep this information safe as you'll need it for future activities and events.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We look forward to seeing you at our upcoming events and activities. Welcome to the CSS family!
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    committeeAccepted: (userName: string, userId: string, committee: string): EmailTemplate => ({
        subject: "CSSApply - Congratulations! Your Committee Staff Application Has Been Accepted",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Congratulations ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We are thrilled to inform you that your committee staff application has been <strong style="color: #059669;">ACCEPTED</strong>! 
                    Welcome to the Computer Science Society Committee Staff!
                </p>
                
                <div style="background-color: #f0fdf4; border: 2px solid #059669; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #059669; margin-top: 0;">🎉 Acceptance Details:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Member ID:</strong> ${userId.toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Committee Staff</p>
                    <p style="margin: 5px 0;"><strong>Committee:</strong> ${capitalizeWords(committee)} Committee</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">ACCEPTED</span></p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Your Member ID (<strong>${userId.toUpperCase()}</strong>) is now your official identifier within the organization. 
                    Please keep this information safe as you'll need it for committee activities and events.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    As a member of the ${capitalizeWords(committee)} Committee, you'll be involved in exciting projects and initiatives. 
                    We look forward to working with you!
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    executiveAssistantAccepted: (userName: string, userId: string, ebRole: string): EmailTemplate => ({
        subject: "CSSApply - Congratulations! Your Executive Assistant Application Has Been Accepted",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Congratulations ${userName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We are thrilled to inform you that your executive assistant application has been <strong style="color: #059669;">ACCEPTED</strong>! 
                    Welcome to the Computer Science Society Executive Board!
                </p>
                
                <div style="background-color: #f0fdf4; border: 2px solid #059669; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #059669; margin-top: 0;">🎉 Acceptance Details:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Member ID:</strong> ${userId.toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Executive Assistant</p>
                    <p style="margin: 5px 0;"><strong>EB Role:</strong> ${capitalizeWords(ebRole)}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">ACCEPTED</span></p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Your Member ID (<strong>${userId.toUpperCase()}</strong>) is now your official identifier within the organization. 
                    Please keep this information safe as you'll need it for executive board activities and events.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    As an Executive Assistant for ${capitalizeWords(ebRole)}, you'll play a crucial role in supporting our leadership team. 
                    We look forward to working with you!
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    // Rejection notification templates
    committeeRejected: (userName: string, committee: string): EmailTemplate => ({
        subject: "CSSApply - Committee Staff Application Update",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName},</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for your interest in joining the Computer Science Society Committee Staff. 
                    After careful consideration, we regret to inform you that your application for the 
                    <strong>${capitalizeWords(committee)} Committee</strong> has not been successful this time.
                </p>
                
                <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">📋 Application Update:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Committee Staff</p>
                    <p style="margin: 5px 0;"><strong>Committee:</strong> ${capitalizeWords(committee)} Committee</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">NOT SELECTED</span></p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    This decision was not easy to make, as we received many qualified applications. 
                    We encourage you to apply again in the future and to stay involved with CSS activities.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We appreciate your interest in CSS and wish you the best in your academic journey.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    executiveAssistantRejected: (userName: string, ebRole: string): EmailTemplate => ({
        subject: "CSSApply - Executive Assistant Application Update",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName},</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for your interest in joining the Computer Science Society Executive Board. 
                    After careful consideration, we regret to inform you that your application for 
                    <strong>${capitalizeWords(ebRole)} Executive Assistant</strong> has not been successful this time.
                </p>
                
                <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">📋 Application Update:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Executive Assistant</p>
                    <p style="margin: 5px 0;"><strong>EB Role:</strong> ${capitalizeWords(ebRole)}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">NOT SELECTED</span></p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    This decision was not easy to make, as we received many qualified applications. 
                    We encourage you to apply again in the future and to stay involved with CSS activities.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We appreciate your interest in CSS and wish you the best in your academic journey.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    // Redirection notification templates
    committeeRedirected: (userName: string, originalCommittee: string, redirectedCommittee: string): EmailTemplate => ({
        subject: "CSSApply - Committee Staff Application Redirected",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName},</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We have reviewed your committee staff application and would like to offer you an opportunity 
                    with a different committee that we believe would be a better fit for your skills and interests.
                </p>
                
                <div style="background-color: #fef3c7; border: 2px solid #d97706; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #d97706; margin-top: 0;">🔄 Application Redirected:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Committee Staff</p>
                    <p style="margin: 5px 0;"><strong>Original Committee:</strong> ${capitalizeWords(originalCommittee)} Committee</p>
                    <p style="margin: 5px 0;"><strong>Redirected to:</strong> ${capitalizeWords(redirectedCommittee)} Committee</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">REDIRECTED</span></p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    This redirection is based on our assessment of your qualifications and the current needs 
                    of our committees. We believe you will have a great opportunity to contribute to the 
                    <strong>${capitalizeWords(redirectedCommittee)} Committee</strong>.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Please let us know if you accept this redirection or if you have any questions about this change.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    executiveAssistantRedirected: (userName: string, originalEbRole: string, redirectedEbRole: string): EmailTemplate => ({
        subject: "CSSApply - Executive Assistant Application Redirected",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>
                
                <h2 style="color: #1f2937;">Hello ${userName},</h2>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We have reviewed your executive assistant application and would like to offer you an opportunity 
                    with a different EB role that we believe would be a better fit for your skills and interests.
                </p>
                
                <div style="background-color: #fef3c7; border: 2px solid #d97706; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #d97706; margin-top: 0;">🔄 Application Redirected:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Executive Assistant</p>
                    <p style="margin: 5px 0;"><strong>Original EB Role:</strong> ${capitalizeWords(originalEbRole)}</p>
                    <p style="margin: 5px 0;"><strong>Redirected to:</strong> ${capitalizeWords(redirectedEbRole)}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">REDIRECTED</span></p>
                </div>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    This redirection is based on our assessment of your qualifications and the current needs 
                    of our executive board. We believe you will have a great opportunity to contribute as 
                    <strong>${capitalizeWords(redirectedEbRole)} Executive Assistant</strong>.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    Please let us know if you accept this redirection or if you have any questions about this change.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    // Evaluation notification templates
    committeeEvaluating: (userName: string, committee: string): EmailTemplate => ({
        subject: "CSSApply - Committee Staff Application Under Evaluation",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>

                <h2 style="color: #1f2937;">Hello ${userName},</h2>

                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for your interest in joining the Computer Science Society Committee Staff. 
                    We are pleased to inform you that your application for the 
                    <strong>${capitalizeWords(committee)} Committee</strong> is now under evaluation.
                </p>
                
                <div style="background-color: #f3e8ff; border: 2px solid #7c3aed; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #7c3aed; margin-top: 0;">📋 Evaluation Status:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Committee Staff</p>
                    <p style="margin: 5px 0;"><strong>Committee:</strong> ${capitalizeWords(committee)} Committee</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #7c3aed; font-weight: bold;">UNDER EVALUATION</span></p>
                </div>

                <p style="color: #4b5563; line-height: 1.6;">
                    Our team is currently reviewing your application, including your qualifications, 
                    experience, and fit for the committee. This process typically takes a few days.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We will notify you as soon as we have completed our evaluation. 
                    Thank you for your patience during this process.
                </p>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    }),

    executiveAssistantEvaluating: (userName: string, ebRole: string): EmailTemplate => ({
        subject: "CSSApply - Executive Assistant Application Under Evaluation",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #134687; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 1px;">CSSApply</h1>
                </div>

                <h2 style="color: #1f2937;">Hello ${userName},</h2>

                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for your interest in joining the Computer Science Society Executive Board. 
                    We are pleased to inform you that your application for 
                    <strong>${capitalizeWords(ebRole)} Executive Assistant</strong> is now under evaluation.
                </p>
                
                <div style="background-color: #f3e8ff; border: 2px solid #7c3aed; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #7c3aed; margin-top: 0;">📋 Evaluation Status:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                    <p style="margin: 5px 0;"><strong>Application Type:</strong> Executive Assistant</p>
                    <p style="margin: 5px 0;"><strong>EB Role:</strong> ${capitalizeWords(ebRole)}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #7c3aed; font-weight: bold;">UNDER EVALUATION</span></p>
                </div>

                <p style="color: #4b5563; line-height: 1.6;">
                    Our team is currently reviewing your application, including your qualifications, 
                    experience, and fit for the executive board position. This process typically takes a few days.
                </p>
                
                <p style="color: #4b5563; line-height: 1.6;">
                    We will notify you as soon as we have completed our evaluation. 
                    Thank you for your patience during this process.
                </p>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 14px;">
                        Best regards,<br>
                        CSSApply Team
                    </p>
                </div>
            </div>
        `
    })
};