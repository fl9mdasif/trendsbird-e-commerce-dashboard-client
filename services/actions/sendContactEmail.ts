"use server";

export async function sendContactEmail(formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}) {
    const { name, email, phone, subject, message } = formData;

    try {
        const response = await fetch("https://api.useplunk.com/v1/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.PLUNK_SECRET_KEY}`,
            },
            body: JSON.stringify({
                to: process.env.ADMIN_EMAIL,
                subject: `Contact: ${subject || "New Message from Sultan Bazar"}`,
                body: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #B5451B; border-bottom: 2px solid #B5451B; padding-bottom: 10px;">New Contact Message</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                        <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                            <p><strong>Message:</strong></p>
                            <p>${message}</p>
                        </div>
                        <p style="font-size: 12px; color: #777; margin-top: 20px; text-align: center; border-top: 1px solid #eee; pt: 10px;">
                            This message was sent from the Sultan Bazar contact form.
                        </p>
                    </div>
                `,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Plunk Error:", result);
            return { success: false, error: result.message || "Failed to send email" };
        }

        return { success: true };
    } catch (error) {
        console.error("Contact Form Error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
