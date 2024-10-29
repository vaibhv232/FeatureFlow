require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Gemini SDK

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to convert image files to generative parts
const fileToGenerativePart = (filePath, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
};

// Function to generate testing instructions using Gemini API
const generateTestInstructions = async (prompt, images) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the image parts
    const imageParts = images.map((image) =>
      fileToGenerativePart(
        path.join(__dirname, "../uploads", image.filename),
        `image/${image.mimetype.split("/")[1]}`
      )
    );

    // Define sample test cases (multi-shot prompt)
    const sampleTestCases = `
      Example Test Case 1:
      - **Description**: Testing the user login functionality.
      - **Pre-conditions**: The user should have a valid username and password.
      - **Testing Steps**:
        1. Open the login page.
        2. Enter a valid username.
        3. Enter a valid password.
        4. Click on the 'Login' button.
      - **Expected Result**: The user should be successfully logged in and redirected to the homepage.
  
      Example Test Case 2:
      - **Description**: Testing the 'Add to Cart' functionality on an e-commerce website.
      - **Pre-conditions**: The user should be logged in and viewing a product page.
      - **Testing Steps**:
        1. Select the desired product size and color.
        2. Click the 'Add to Cart' button.
        3. Navigate to the cart page.
      - **Expected Result**: The selected product should appear in the cart with correct details (size, color, and quantity).
  
      Now, please provide a detailed, step-by-step guide for the following feature(s):
      `;

    // Combine user prompt, example test cases, and image parts
    const fullPrompt = `${sampleTestCases}${prompt}
      Output should describe a detailed, step-by-step guide on how to test each functionality. Each test case should include:
      - **Description**: What the test case is about.
      - **Pre-conditions**: What needs to be set up or ensured before testing.
      - **Testing Steps**: Clear, step-by-step instructions on how to perform the test.
      - **Expected Result**: What should happen if the feature works correctly.
      `;

    // Combine prompt with image parts
    const result = await model.generateContent([fullPrompt, ...imageParts]);
    return result.response.text();
  } catch (error) {
    console.error(
      "Error generating instructions from Gemini API:",
      error.message
    );
    throw error;
  }
};

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Endpoint to handle file and text input, and send the request to the Gemini API
app.post(
  "/api/generate-instructions",
  upload.array("images", 5),
  async (req, res) => {
    const context = req.body.context || "";
    const images = req.files;

    if (!images.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    try {
      // Generate prompt by combining context and images
      let prompt = context;
      prompt +=
        "\nPlease describe step-by-step testing instructions for the features shown in the following images:";

      // Call Gemini API to generate the test instructions
      const instructions = await generateTestInstructions(prompt, images);

      res.json({ instructions });
    } catch (error) {
      console.error("Error communicating with Gemini API:", error.message);
      res
        .status(500)
        .json({ message: "Failed to generate instructions. Try again later." });
    }
  }
);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
