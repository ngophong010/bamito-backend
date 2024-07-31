import userService from "../services/userService";
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

let handleCheckEmail = async (req, res) => {
  try {
    const { email } = req.query;
    let message = await userService.checkEmailUser(email);
    if (message) {
      return res.status(200).json({
        errCode: 0,
        message: message,
      });
    } else {
      return res.status(200).json({
        errCode: 1,
        message: "Email not found",
      });
    }
  } catch (error) {
    console.log("hi", error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleCreateNewUser = async (req, res) => {
  try {
    let message = await userService.createNewUserService(req.body);
    if (message.errCode === 0) {
      return res.status(201).json(message);
    } else {
      return res.status(400).json(message);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleRegister = async (req, res) => {
  try {
    let message = await userService.registerService(req.body);
    if (message.errCode === 0) {
      return res.status(201).json(message);
    } else {
      return res.status(400).json(message);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleAuthenRegister = async (req, res) => {
  try {
    let token = req.query.token;
    let message = await userService.autherRegister(token);
    if (message.errCode === 0)
      return res.redirect(`${process.env.URL_REACT}/login`);
    else return res.redirect(`${process.env.URL_REACT}/not-found`);
  } catch (error) {
    console.log(error);
    res.redirect(`${process.env.URL_REACT}/not-found`);
  }
};

let handleLogin = async (req, res) => {
  try {
    let data = req.body;
    let message = await userService.loginService(data.email, data.password);
    if (message.errCode === 0) {
      let { access_token, refresh_token } = message;
      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "None",
      });
      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "None",
      });
      return res.status(200).json(message);
    } else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleGetUserInfor = async (req, res) => {
  try {
    let userId = req.query.userId;
    let message = await userService.getUserInforService(userId);
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleSendOtpCode = async (req, res) => {
  try {
    let email = req.body.email;
    let message = await userService.sendOtpCodeService(email);
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleChangePassword = async (req, res) => {
  try {
    let data = req.body;
    let message = await userService.changePasswordService(data);
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleChangeProfilePassword = async (req, res) => {
  try {
    let data = req.body;
    let message = await userService.changePasswordProfileService(data);
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleDeleteUser = async (req, res) => {
  try {
    let id = req.query.id;
    let message = await userService.deleteUserService(id);
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleUpdateUser = async (req, res) => {
  try {
    let data = req.body;
    let fileData = req.file;
    data.avatarUrl = fileData?.path;
    data.avatarId = fileData?.filename;
    let message = await userService.updateUserService(data);
    if (message.errCode === 0) return res.status(200).json(message);
    else {
      if (fileData) {
        cloudinary.uploader.destroy(fileData.filename);
      }
      return res.status(400).json(message);
    }
  } catch (error) {
    let fileData = req.file;
    if (fileData) {
      cloudinary.uploader.destroy(fileData.filename);
    }
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleGetUser = async (req, res) => {
  try {
    let id = req.query.id;
    let message = await userService.getUserService(id);
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleGetAllUser = async (req, res) => {
  try {
    let { limit, page, sort, name } = req.query;
    let message = await userService.getAllUser(+limit, +page, sort, name);
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

let handleGetAllRole = async (req, res) => {
  try {
    let message = await userService.getAllRoleService();
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

module.exports = {
  handleLogin,
  handleRegister,
  handleAuthenRegister,
  handleCreateNewUser,
  handleSendOtpCode,
  handleChangePassword,
  handleDeleteUser,
  handleUpdateUser,
  handleGetUser,
  handleGetAllUser,
  handleChangeProfilePassword,
  handleGetAllRole,
  handleGetUserInfor,
  handleCheckEmail,
};
