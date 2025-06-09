require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prismaClient");
const logger = require("../helper/logger");
const {
  validatePasswordStrength,
  validatePhoneNumber,
  validateUsernameLength,
} = require("../helper/authHelper");
const fetch = require("node-fetch-commonjs");
const NodeCache = require("node-cache");

async function sendSMS(to) {
  try {
    const baseUrl = "https://api.afromessage.com/api/challenge";
    const token = process.env.AFRO_SMS_SECRET_KEY;

    if (!token) {
      throw new Error(
        "AFRO_SMS_SECRET_KEY is not set in environment variables."
      );
    }

    //GET https://api.afromessage.com/api/send?from={IDENTIFIER_ID}&sender={YOUR_SENDER_NAME}&to={YOUR_RECIPIENT}&message={YOUR_MESSAGE}&callback={YOUR_CALLBACK}

    // GET https://api.afromessage.com/api/challenge?\from={YOUR_IDENTIFIER_ID}&sender={YOUR_SENDER_NAME}&to={YOUR_RECIPIENT}&pr={MESSAGE_PREFIX}&ps={MESSAGE_POSTFIX}&sb={SPACES_BEFORE}&sa={SPACES_AFTER}
    // &ttl={EXPIRATION_VALUE}&len={CODE_LENGTH}&t={CODE_TYPE}&callback={YOUR_ORIGINAL_MESSAGE}

    // const message = ` ${otp} , `;
    const url = new URL(baseUrl);

    url.searchParams.append("sender", "FortuneBets");
    url.searchParams.append("to", to);
    url.searchParams.append("pr","Welcome to Fortune bets, your OTP is")
    url.searchParams.append("ps","please don't share with anyone")
    url.searchParams.append("sb",4)
    url.searchParams.append("sa",4)
    url.searchParams.append("ttl",3600)
    url.searchParams.append("len",6)
    url.searchParams.append("t",0)
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    if (result.acknowledge === "success") {
      return {
        success: true,
        verificationId: result.response.verificationId,
        message: "OTP sent successfully",
      };
    } else {
      return {
        success: false,
        verificationId: null,
        message: result.response.errors[0],
      };
    }
  } catch (error) {
    logger.error("Failed to send SMS:", error.message);
    return "Failed to send SMS:", error.message;
  }
}

async function verifyOTP(to,otp){
  try {
    const baseUrl = "https://api.afromessage.com/api/verify";
    const token = process.env.AFRO_SMS_SECRET_KEY;

    if (!token) {
      throw new Error(
        "AFRO_SMS_SECRET_KEY is not set in environment variables."
      );
    }

    //GET https://api.afromessage.com/api/send?from={IDENTIFIER_ID}&sender={YOUR_SENDER_NAME}&to={YOUR_RECIPIENT}&message={YOUR_MESSAGE}&callback={YOUR_CALLBACK}

    // GET https://api.afromessage.com/api/challenge?\from={YOUR_IDENTIFIER_ID}&sender={YOUR_SENDER_NAME}&to={YOUR_RECIPIENT}&pr={MESSAGE_PREFIX}&ps={MESSAGE_POSTFIX}&sb={SPACES_BEFORE}&sa={SPACES_AFTER}
    // &ttl={EXPIRATION_VALUE}&len={CODE_LENGTH}&t={CODE_TYPE}&callback={YOUR_ORIGINAL_MESSAGE}

    // GET https://api.afromessage.com/api/verify?
    // to={YOUR_RECIPIENT}&vc={VERIFICATION_ID}&code={CODE_TO_VERIFY}
    // const message = ` ${otp} , `;
    const url = new URL(baseUrl);

   
    url.searchParams.append("to", to);
    url.searchParams.append("code",otp)
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    if (result.acknowledge === "success") {
      return {
        success: true,
        sentAt: result.response.sentAt,
        message: "User verified successfully",
      };
    } else {
      return {
        success: false,
        sentAt: null,
        message: result.response.errors[0],
      };
    }
  } catch (error) {
    logger.error("Failed to Verify user:", error.message);
    return "Failed to Verify user:", error.message;
  }
}
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1hr" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3d" } // Longer-lived refresh token
  );
};

const generateUniqueReferralCode = async () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Helper function to generate a 4-character code
  const generateCode = () => {
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  let newCode;
  let existingUser;

  // Repeat the generation process until a unique code is found
  do {
    newCode = generateCode();
    existingUser = await prisma.user.findUnique({
      where: { referralCode: newCode },
    });
  } while (existingUser);

  return newCode;
};

const generateSixDigitNumber = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

exports.register = async (req, res) => {
  const { phoneNumber, username, password,otp, referralCode } = req.body;

  try {
    if (!phoneNumber || !username || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate phone number format
    const phoneNumberError = validatePhoneNumber(phoneNumber);
    if (phoneNumberError) {
      return res.status(400).json({ message: phoneNumberError });
    }

    const usernameError = validateUsernameLength(username);
    if (usernameError) {
      return res.status(400).json({ message: usernameError });
    }

    // Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { phoneNumber: phoneNumber }],
      },
    });

    if (user) {
      return res
        .status(400)
        .json({ message: "User with username or phone number already exists" });
    }
    // Format username
    const formattedUsername = username.trim().toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await verifyOTP(phoneNumber,otp)
    if (!result.success){
      return res.status(400).json({
        message:"Verification code incorrect or expired"
      })
    }
    // Generate a unique referral code
    const generateUniqueReferralCode = async () => {
      let code;
      let exists = true;
      while (exists) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const user = await prisma.user.findUnique({
          where: { referralCode: code },
        });
        if (!user) exists = false;
      }
      return code;
    };

    const newReferralCode = await generateUniqueReferralCode();

    // Check if referral code was used
    let referringUser;
    if (referralCode) {
      referringUser = await prisma.user.findUnique({ where: { referralCode } });
      if (!referringUser) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    // Attempt to create the new user
    const newUser = await prisma.user.create({
      data: {
        phoneNumber,
        username: formattedUsername, // Use the formatted username
        password: hashedPassword,
        referralCode: newReferralCode,
        referredBy: referralCode || null,
        otp: Number(otp),
        statistics: { create: {} },
        verified: true
      },
    });

    // If a referral code was used, update the referrer's record by increasing referredCount
    // and creating a referral record with bonusAwarded set to false.
    if (referringUser) {
      await prisma.user.update({
        where: { id: referringUser.id },
        data: {
          referredCount: { increment: 1 },
          referredUsers: {
            create: {
              referredUsername: newUser.username,
              referredPhone: newUser.phoneNumber,
              registrationDate: new Date(),
              bonusAwarded: false,  // Pending bonus; will be awarded once deposit reaches 25 birr
            },
          },
        },
      });
    }

    res.status(201).json({ success: true, message: result, user: newUser });
  } catch (error) {
    logger.error("Registration Error:", error);

    
    // Handle unique constraint violations
    if (error.code === "P2002") {
      // Prisma unique constraint violation error code
      const duplicatedField = error.meta.target;
      if (duplicatedField.includes("phoneNumber")) {
        return res
          .status(400)
          .json({ message: "User with this phone number already exists" });
      }
      if (duplicatedField.includes("username")) {
        return res
          .status(400)
          .json({ message: "User with this username already exists" });
      }
      if (duplicatedField.includes("referralCode")) {
        return res
          .status(400)
          .json({ message: "Referral code already in use" });
      }
    }
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.staffRegister = async (req, res) => {
  const { phoneNumber, username, email, password, role } = req.body;

  try {
    if (!phoneNumber || !username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role !== "ADMIN" && role !== "STAFF") {
      return res.status(400).json({ messsage: "Invalid role" });
    }

    const formattedUsername =
      username.charAt(0).toLowerCase() + username.slice(1);

    // Check if phone number or username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phoneNumber }, { username: formattedUsername }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this phone number, username, or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        phoneNumber,
        username: formattedUsername,
        email,
        password: hashedPassword,
        referralCode: await generateUniqueReferralCode(),
        otp: 1234000,
        verified: true,
        role, // Set the role to either ADMIN or STAFF
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: newUser,
    });
  } catch (error) {
    logger.error("Registration Error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    formattedUsername = username.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { username: formattedUsername },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.verified === false) {
      return res
        .status(401)
        .json({ message: "User not verified. Please contact support" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store the refresh token in the database for revocation purposes
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      },
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    logger.error("Login Error:", error);
    res.status(500).json({ messsage: "Login failed" });
  }
};

exports.staffLogin = async (req, res) => {
  const { username, password } = req.body;
  const formattedUsername =
    username.charAt(0).toLowerCase() + username.slice(1);

  try {
    if (!formattedUsername || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await prisma.user.findUnique({
      where: { username: formattedUsername },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the user is ADMIN or STAFF
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Insufficient privileges" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store the refresh token in the database for revocation purposes
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      },
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    logger.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

const usernameCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes
exports.checkUsernameAvailability = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  // Check cache first
  const cachedResult = usernameCache.get(username);
  if (cachedResult !== undefined) {
    return res.status(200).json({ available: cachedResult });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    const isAvailable = !user;
    // Cache the result
    usernameCache.set(username, isAvailable);

    return res.status(200).json({ available: isAvailable });
  } catch (error) {
    logger.error("Username Availability Check Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { phoneNumber: phoneNumber },
    });
    if (!user) {
      return res.status(400).json({
        message: "User with this phone number doesn't exist",
      });
    }

    const result = await sendSMS(phoneNumber);
    if(!result.success){
      res.status(400).json({success: false, message:"Failed to send OTP to your phone number"})
    }
    else{
    res.status(200).json({ success: true, message: result.message });
  }
  } catch (error) {
    logger.info("Failed to send OTP to your phone number",error)
    res.status(500).json({
      sucess: false,
      message: "Failed to send OTP, Please try again later",
    });
  }
};

exports.resendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { phoneNumber: phoneNumber },
    });
    if (!user) {
      return res.status(400).json({
        message: "User with this phone number doesn't exist",
      });
    }
    const result = await sendSMS(phoneNumber);
    if(!result.success){
      res.status(400).json({
        success: false,
        message: `Failed to resend OTP, Please try again later`,
      });
    }else{
      res.status(200).json({
        success: true,
        message: `OTP resent to your phone number`,
      });
    }

    
  } catch (error) {
    logger.info("Failed to resend OTP, Please try again later",error)
    res.status(500).json({
      sucess: false,
      message: "Failed to resend OTP, Please try again later",
    });
  }
};

exports.changeForgottenPassword = async (req, res) => {
  const { phoneNumber, otp, newPassword, confirmPassword } = req.body;

  try {
    if (!phoneNumber || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const user = await prisma.user.findFirst({
      where: { phoneNumber: phoneNumber },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
const checkOTP = await verifyOTP(phoneNumber,otp)
    if (!checkOTP.success) {
      return res.status(404).json({ message: "OTP provided is not correct" });
    }

    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { phoneNumber: phoneNumber },
      data: { password: hashedPassword, otp:Number(otp) },
    });

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password" });
  }
};

exports.sendOTP = async (req, res) => {
  const { phoneNumber, username } = req.body;
  
  try {
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number required" });
    }

        // Validate phone number format
        const phoneNumberError = validatePhoneNumber(phoneNumber);
        if (phoneNumberError) {
          return res.status(400).json({ message: phoneNumberError });
        }
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ username: username }, { phoneNumber: phoneNumber }],
          },
        });

        
    
        if (user) {
          return res
            .status(400)
            .json({ message: "user with username or phone number already exists" });
        }

        const sendOtp = await sendSMS(phoneNumber)
        if(!sendOtp.success){
          res.status(400).json({
            success: false,
            message:"We currently don't support safaricom."
          })
        }
        else{
          res.status(200).json({
            success: true,
            message: "OTP sent Successfully",
          });
        }




  } catch (error) {
    logger.info("Failed to Send OTP", error)
    res.status(500).json({ success: false, message: "Failed to Send OTP" });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, user) => {
        if (err) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        // Check if the refresh token exists in the database
        const tokenRecord = await prisma.refreshToken.findUnique({
          where: { token: refreshToken },
        });
        if (!tokenRecord) {
          return res.status(403).json({ message: "Refresh token not found" });
        }

        const accessToken = generateToken(user); // Generate a new access token
        return res.status(200).json({ accessToken });
      }
    );
  } catch (error) {
    logger.error("Refresh Token Error:", error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Find and delete the refresh token from the database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    // Delete the token from the database to invalidate it
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    logger.error("Logout Error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};
