import User from "../models/user.model.js";

export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password -__v -googleId");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateProfileService = async (userId, { name, picture }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (name) {
    user.name = name;
  }
  if (picture) {
    user.picture = picture;
  }

  await user.save();

  const updatedUser = await User.findById(userId).select("-password -__v -googleId");
  return updatedUser;
};