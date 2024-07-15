import voucherService from "../services/voucherService";
const cloudinary = require("cloudinary").v2;

let handleCreateNewVoucher = async (req, res) => {
  try {
    let data = req.body;
    let fileData = req.file;
    data.urlImage = fileData?.path;
    data.imageId = fileData?.filename;
    let message = await voucherService.createNewVoucherService(data);
    if (message.errCode === 0) return res.status(201).json(message);
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
      message: "Error form the server!!!",
    });
  }
};

let handleDeleteVoucher = async (req, res) => {
  try {
    let id = req.query.id;
    let message = await voucherService.deleteVoucherService(id);
    if (message.errCode === 0) return res.status(200).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error form the server!!!",
    });
  }
};

let handleUpdateVoucher = async (req, res) => {
  try {
    let data = req.body;
    let fileData = req.file;
    data.imageUrl = fileData?.path;
    data.imageId = fileData?.filename;
    let message = await voucherService.updateVoucherService(data);
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
      message: "Error form the server!!!",
    });
  }
};

let handleGetAllVoucher = async (req, res) => {
  try {
    let { limit, page, sort, name, pagination } = req.query;
    let message = await voucherService.getAllVoucherService(
      +limit,
      +page,
      sort,
      name,
      pagination
    );
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

let handleGetAllVoucherUser = async (req, res) => {
  try {
    let message = await voucherService.getAllVoucherUserService();
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
  handleCreateNewVoucher,
  handleDeleteVoucher,
  handleUpdateVoucher,
  handleGetAllVoucher,
  handleGetAllVoucherUser,
};
