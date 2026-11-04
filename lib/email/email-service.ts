// Madi Sankhuwasabha Sarokar Samaj (Kathmandu)
// Transactional Email & Notification Service

export interface EmailRecipient {
  email: string;
  name: string;
}

export interface EmailPayload {
  to: EmailRecipient;
  subject: string;
  html: string;
  text: string;
}

/**
 * Checks whether outbound email delivery is enabled.
 */
function isEmailEnabled(): boolean {
  return process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM_ADDRESS || 'Madi SSS <no-reply@madisss.org.np>';
}

function getAdminAlertEmail(): string {
  return process.env.ADMIN_ALERT_EMAIL || 'secretariat@madisss.org.np';
}

/**
 * Dispatches an email message safely without throwing unhandled exceptions.
 * If sending fails or provider is not configured, logs diagnostic status and returns safely.
 */
export async function sendEmailSafely(payload: EmailPayload): Promise<{ delivered: boolean; error?: string }> {
  if (!isEmailEnabled()) {
    console.log(`[Email Service - Mock/Disabled] To: ${maskEmail(payload.to.email)} | Subject: ${payload.subject}`);
    return { delivered: true };
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.startsWith('re_staging_mock')) {
    // Graceful staging simulation
    console.log(`[Email Service - Simulated] Dispatched to ${maskEmail(payload.to.email)}: "${payload.subject}"`);
    return { delivered: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: payload.to.email,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Email Service] Provider returned error: ${res.status} - ${errText}`);
      return { delivered: false, error: `Provider error: ${res.status}` };
    }

    console.log(`[Email Service] Successfully delivered email to ${maskEmail(payload.to.email)}`);
    return { delivered: true };
  } catch (err: any) {
    console.warn(`[Email Service] Delivery failed gracefully: ${err.message}`);
    return { delivered: false, error: err.message };
  }
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.***';
  const name = parts[0];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : '***';
  return `${maskedName}@${parts[1]}`;
}

// -------------------------------------------------------------
// Bilingual Transactional Templates
// -------------------------------------------------------------

/**
 * 1. Membership Application Received Confirmation
 */
export async function sendMembershipReceivedEmail(params: {
  fullName: string;
  email: string;
  membershipType: string;
  applicationId: string;
}): Promise<void> {
  const subject = 'मादी सरोकार समाज - सदस्यता आवेदन प्राप्त भएको जानकारी | Membership Application Received';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #01366E; padding: 24px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">मादी (संखुवासभा) सरोकार समाज, काठमाडौं</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #fed7aa;">Madi Sankhuwasabha Sarokar Samaj, Kathmandu</p>
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p style="font-size: 15px; font-weight: bold;">आदरणीय ${params.fullName} ज्यू,</p>
        <p>मादी संखुवासभा सरोकार समाजको <strong>${params.membershipType}</strong> सदस्यताका लागि तपाईंले पेश गर्नुभएको अनलाइन आवेदन संस्थाको सचिवालयमा सफलतापूर्वक प्राप्त भएको छ।</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px;">
          <div><strong>आवेदन कोड (Application ID):</strong> ${params.applicationId}</div>
          <div><strong>सदस्यता वर्ग:</strong> ${params.membershipType}</div>
          <div><strong>अवस्था:</strong> समीक्षाधीन (Under Review)</div>
        </div>
        <p style="font-size: 13px; color: #475569;">
          कार्यसमितिको बैठकबाट प्रमाणीकरण भएपश्चात तपाईंलाई थप जानकारी इमेल वा फोन मार्फत गराइनेछ।
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; font-style: italic;">
          Dear ${params.fullName}, your online application for ${params.membershipType} membership has been received and is currently under review by our executive secretariat.
        </p>
      </div>
    </div>
  `;

  await sendEmailSafely({
    to: { email: params.email, name: params.fullName },
    subject,
    html,
    text: `मादी सरोकार समाज - सदस्यता आवेदन प्राप्त भयो। आवेदन कोड: ${params.applicationId}`,
  });
}

/**
 * 2. Membership Status Update (Approved / Rejected / More Info)
 */
export async function sendMembershipStatusEmail(params: {
  fullName: string;
  email: string;
  status: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED';
  adminNotes?: string;
}): Promise<void> {
  const statusTitles = {
    APPROVED: 'सदस्यता आवेदन स्वीकृत भएको बधाई सन्देश | Membership Approved',
    REJECTED: 'सदस्यता आवेदन सम्बन्धी जानकारी | Membership Application Status',
    MORE_INFO_REQUESTED: 'सदस्यता आवेदन सम्बन्धी थप विवरण आवश्यक | Additional Information Needed',
  };

  const subject = `मादी सरोकार समाज - ${statusTitles[params.status]}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #01366E; padding: 24px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">मादी (संखुवासभा) सरोकार समाज, काठमाडौं</h2>
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p style="font-size: 15px; font-weight: bold;">नमस्ते ${params.fullName} ज्यू,</p>
        ${
          params.status === 'APPROVED'
            ? `<p style="color: #047857; font-weight: bold;">बधाई छ! तपाईंको मादी सरोकार समाजको सदस्यता आवेदन कार्यसमितिबाट स्वीकृत भएको छ।</p>
               <p>समाजको आगामी साधारण सभा, कार्यक्रम तथा सामाजिक गतिविधिहरूमा यहाँको सक्रिय सहभागिताको अपेक्षा गर्दछौं।</p>`
            : params.status === 'MORE_INFO_REQUESTED'
            ? `<p style="color: #b45309; font-weight: bold;">तपाईंको सदस्यता आवेदन प्रमाणीकरणका लागि केही थप विवरण आवश्यक परेको छ।</p>
               <p>कृपया सचिवालयमा सम्पर्क राखी आवश्यक विवरण उपलब्ध गराइदिनुहुन अनुरोध छ।</p>`
            : `<p>तपाईंको सदस्यता आवेदन हालको लागि स्वीकृत हुन सकेन। थप जानकारीका लागि संस्थाको सचिवालयमा सम्पर्क गर्नुहोला।</p>`
        }
        ${params.adminNotes ? `<div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; margin: 12px 0;"><strong>सचिवालय टिप्पणी:</strong> ${params.adminNotes}</div>` : ''}
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">मादी (संखुवासभा) सरोकार समाज, काठमाडौं सचिवालय</p>
      </div>
    </div>
  `;

  await sendEmailSafely({
    to: { email: params.email, name: params.fullName },
    subject,
    html,
    text: `मादी सरोकार समाज सदस्यता स्थिति: ${params.status}`,
  });
}

/**
 * 3. Feedback / Grievance Received Confirmation
 */
export async function sendFeedbackReceivedEmail(params: {
  fullName: string;
  email: string;
  subjectText: string;
  category: string;
}): Promise<void> {
  const subject = 'मादी सरोकार समाज - सन्देश प्राप्त भएको जानकारी | Grievance / Feedback Received';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #01366E; padding: 20px; text-align: center; color: white;">
        <h3 style="margin: 0;">मादी (संखुवासभा) सरोकार समाज, काठमाडौं</h3>
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p>नमस्ते ${params.fullName} ज्यू,</p>
        <p>तपाईंले समाजको सचिवालयमा पठाउनुभएको सुझाव/गुनासो ("${params.subjectText}") सुरक्षित रूपमा दर्ता भएको छ।</p>
        <p style="font-size: 13px; color: #475569;">
          हाम्रो कार्यदलले यस सन्देशको अध्ययन गरी आवश्यक कारबाही तथा सम्बोधन गर्नेछ।
        </p>
      </div>
    </div>
  `;

  await sendEmailSafely({
    to: { email: params.email, name: params.fullName },
    subject,
    html,
    text: `तपाईंको सन्देश प्राप्त भएको छ। विषय: ${params.subjectText}`,
  });
}

/**
 * 4. Admin Alert for New Membership Application
 */
export async function sendAdminMembershipAlert(params: {
  fullName: string;
  membershipType: string;
  madiAddress: string;
}): Promise<void> {
  const adminEmail = getAdminAlertEmail();
  const subject = `[CMS Alert] नयाँ सदस्यता आवेदन दर्ता भयो - ${params.fullName} (${params.membershipType})`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3 style="color: #01366E;">नयाँ सदस्यता आवेदन अलर्ट</h3>
      <p>नयाँ आवेदकले सदस्यता फारम पेश गर्नुभएको छ:</p>
      <ul>
        <li><strong>नाम:</strong> ${params.fullName}</li>
        <li><strong>प्रकार:</strong> ${params.membershipType}</li>
        <li><strong>मादी ठेगाना:</strong> ${params.madiAddress}</li>
      </ul>
      <p>अनुमोदनका लागि सीएमएस एडमिन प्यानलमा जानुहोस्: <a href="https://madisss.org.np/ne/admin/membership">सदस्यता इनबक्स खोल्नुहोस्</a></p>
    </div>
  `;

  await sendEmailSafely({
    to: { email: adminEmail, name: 'Secretariat Admin' },
    subject,
    html,
    text: `नयाँ सदस्यता आवेदन: ${params.fullName} (${params.membershipType})`,
  });
}

/**
 * 5. Admin Alert for New Feedback / Grievance
 */
export async function sendAdminFeedbackAlert(params: {
  fullName: string;
  category: string;
  subjectText: string;
}): Promise<void> {
  const adminEmail = getAdminAlertEmail();
  const subject = `[CMS Alert] नयाँ सन्देश दर्ता: [${params.category}] ${params.subjectText}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3 style="color: #01366E;">नयाँ सुझाव / गुनासो अलर्ट</h3>
      <p><strong>प्रेषक:</strong> ${params.fullName}</p>
      <p><strong>वर्ग:</strong> ${params.category}</p>
      <p><strong>विषय:</strong> ${params.subjectText}</p>
      <p><a href="https://madisss.org.np/ne/admin/feedback">गुनासो इनबक्स खोल्नुहोस्</a></p>
    </div>
  `;

  await sendEmailSafely({
    to: { email: adminEmail, name: 'Secretariat Admin' },
    subject,
    html,
    text: `नयाँ सन्देश दर्ता भयो: [${params.category}] ${params.subjectText} from ${params.fullName}`,
  });
}

