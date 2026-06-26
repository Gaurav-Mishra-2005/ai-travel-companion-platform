import { googleAuthService, registerService, loginService } from "../services/auth.service.js";

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const result = await googleAuthService(credential);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      data: result,
    });

  } catch (error) {
    console.error("Google Auth Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Registration controller for local authentication
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; 

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    const result = await registerService({ name, email, password });

    return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Login controller for local authentication
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const result = await loginService({ email, password });

    return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result
    });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(400).json({
        success: false,
        message: error.message,
        });
    }
};