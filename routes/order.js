const router = require("express").Router();
const axios = require("axios");
const Order = require("../models/Order"); // Import the new Order model

// Function to send transactional email to the admin via Brevo for a new order
async function sendOrderEmailToAdmin(orderData) {
    const payload = {
        sender: {
            name: "VibelyArt New Order",
            email: process.env.BREVO_VERIFIED_SENDER // Must be a verified sender
        },
        to: [{
            email: process.env.ADMIN_EMAIL, // Admin email for notifications
            name: "VibelyArt Admin"
        }],
        subject: "🎉 New Video Order Received on VibelyArt!",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h1 style="color: #28a745;">New Video Order Details</h1>
                <p>A new video order has been placed on your VibelyArt website. Here are the details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Video ID:</td><td style="padding: 10px; border: 1px solid #ddd;">${orderData.videoID}</td></tr>
                    <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Customer Name:</td><td style="padding: 10px; border: 1px solid #ddd;">${orderData.name}</td></tr>
                    <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email Address:</td><td style="padding: 10px; border: 1px solid #ddd;">${orderData.emailAddress}</td></tr>
                    <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone Number:</td><td style="padding: 1px 0px; border: 1px solid #ddd;">${orderData.phoneNumber}</td></tr>
                </table>
                <p style="margin-top: 30px; font-size: 0.9em; color: #777;">This email was sent automatically from your website when a new order was placed.</p>
            </div>
        `
    };

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            payload,
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Order notification email sent successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error sending order email:", error?.response?.data || error.message);
        throw new Error("Failed to send order email notification");
    }
}

// POST - Submit video order
router.post("/", async (req, res) => {
    try {
        const { videoID, name, emailAddress, phoneNumber } = req.body;

        // Validate required fields based on the OrderSchema
        if (!videoID || !name || !emailAddress || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "All fields (videoID, name, emailAddress, phoneNumber) are required for an order."
            });
        }

        const newOrder = new Order({ videoID, name, emailAddress, phoneNumber });
        const savedOrder = await newOrder.save();

        try {
            await sendOrderEmailToAdmin({ videoID, name, emailAddress, phoneNumber });
        } catch (emailError) {
            console.warn("Email notification failed for new order:", emailError.message); // Log but don't stop the response
            return res.status(500).json({
                success: false,
                message: "Order saved successfully, but failed to send email notification to admin.",
                error: emailError.message,
                data: savedOrder
            });
        }

        res.status(201).json({
            success: true,
            message: "Video order placed successfully and admin notified.",
            data: savedOrder
        });

    } catch (err) {
        console.error("Error processing video order:", err);
        res.status(500).json({
            success: false,
            message: "Failed to process video order.",
            error: err.message
        });
    }
});

module.exports = router;