import { OAuth2Client } from "google-auth-library";

import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Authentication Service - Verifies Google Token, creates/gets user, and returns JWT
export const googleAuthService = async (credential) => {

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
  throw new Error("Invalid Google Token");
 }

  const {
    sub,
    name,
    email,
    picture,
  } = payload;

  let user = await User.findOne({ email });

    if (!user) {
    user = await User.create({
        googleId: sub,
        name,
        email,
        picture,
        provider: "google",
    });
    }
    else if (!user.googleId) {
    user.googleId = sub;
    user.picture = picture;
    user.provider = "google";
    await user.save();
    }

  const token = generateToken(user);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    provider: user.provider,
    role: user.role,
  };


  return {
    user: userResponse,
    token,
  };
};

// Registration service for local authentication
export const registerService = async ({ name, email, password, }) => {
  email = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  if (name.trim().length < 2) {
    throw new Error("Name must be at least 2 characters long");
  }
  if (password.length < 6) {
  throw new Error("Password must be at least 6 characters long");
}

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    provider: "local",
  });

  const token = generateToken(user);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    provider: user.provider,
    role: user.role,
  };


  return {
    user: userResponse,
    token,
  };
};

// Login service for local authentication
export const loginService = async ({email, password}) => {

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.password) {
    throw new Error("User registered with Google. Please use Google login.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    provider: user.provider,
    role: user.role,
  };


  return {
    user: userResponse,
    token,
  };
};