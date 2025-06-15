const router = require("express").Router();
const tourism_enquiry = require("../models/Tourismenquiry");

// @desc: API Health Check
router.get("/", (req, res) => {
  res.status(200).send("Welcome to tourism_enquiry routes REST API");
});

// @desc: Create Tourism Enquiry
router.post("/", async (req, res) => {
  try {
    // Trimmed and normalized input
    const {
      name = "",
      email = "",
      phone = "",
      interest = "",
      travelDate = "",
      message = "",
    } = req.body;

    const trimmedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      interest: interest.trim(),
      travelDate: travelDate.trim(),
      message: message.trim(),
    };

    const {
      name: tName,
      email: tEmail,
      phone: tPhone,
      interest: tInterest,
      travelDate: tTravelDate,
    } = trimmedData;

    // Validate required fields
    if (!tName || !tEmail || !tPhone || !tInterest || !tTravelDate) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Phone, Interest, and Travel Date are required.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Optional phone number validation
    // const phoneRegex = /^\d{10,15}$/;
    // if (!phoneRegex.test(tPhone)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Phone number should be between 10 and 15 digits.",
    //   });
    // }

    // Check for duplicate enquiry based on name, email, and travelDate
    const duplicate = await tourism_enquiry.findOne({
      name: tName,
      email: tEmail,
      travelDate: tTravelDate,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Duplicate enquiry already submitted for this travel date.",
      });
    }

    // Save new enquiry
    const enquiry = new tourism_enquiry(trimmedData);
    const saved = await enquiry.save();

    return res.status(201).json({
      success: true,
      message: "Tourism enquiry submitted successfully!",
      data: saved,
    });
  } catch (error) {
    console.error("[TOURISM_ENQUIRY_ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

module.exports = router;
