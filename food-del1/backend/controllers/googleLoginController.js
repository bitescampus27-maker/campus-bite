import { OAuth2Client } from "google-auth-library";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// YOUR GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID =
  "800915697216-e1melaunt3rna55vmfa18e0v50e2ta5m.apps.googleusercontent.com";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const googleLoginUser = async (req, res) => {
  try {
    const { token } = req.body;

    // --- STEP 1: Validate Token Presence ---
    if (!token) {
      console.log("GOOGLE LOGIN ERROR: No token received from frontend");
      return res.json({ success: false, message: "Google token missing" });
    }

    // --- STEP 2: Verify Google Token ---
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (err) {
      console.log("GOOGLE TOKEN VERIFY ERROR:", err.message || err);
      return res.json({ success: false, message: "Invalid Google token" });
    }

    // --- STEP 3: Extract User Info ---
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.json({
        success: false,
        message: "Google login failed: email missing",
      });
    }

    // --- STEP 4: Find or Create User ---
    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name,
        email,
        password: "google-auth", // dummy password
        image: picture,
      });
    }

    // --- STEP 5: Create JWT Token ---
    const authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // --- STEP 6: Return Success ---
    res.json({
      success: true,
      token: authToken,
      user,
    });
  } catch (error) {
    console.log("GOOGLE LOGIN ERROR:", error.message || error);
    res.json({ success: false, message: "Google Login Failed" });
  }
};

export default googleLoginUser;
