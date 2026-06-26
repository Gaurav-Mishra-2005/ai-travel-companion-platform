import {getProfileService, updateProfileService} from "../services/user.service.js";

export const getProfile = async (req, res) => {
  try {
    const user = await getProfileService(req.user._id);

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, picture } = req.body;

    const updatedUser = await updateProfileService( req.user._id, { name, picture });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
