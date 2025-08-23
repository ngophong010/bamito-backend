import productService from "../services/productService";
const cloudinary = require("cloudinary").v2;

let handleCreateNewProduct = async (req, res) => {
  try {
    let data = req.body;
    let fileData = req.file;
    data.imageUrl = fileData?.path;
    data.imageId = fileData?.filename;
    let message = await productService.createNewProductService(data);
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

let handleDeleteProduct = async (req, res) => {
  try {
    let id = req.query.id;
    let message = await productService.deleteProductService(id);
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

let handleUpdateProduct = async (req, res) => {
  try {
    let data = req.body;
    let fileData = req.file;
    data.imageUrl = fileData?.path;
    data.imageId = fileData?.filename;
    let message = await productService.updateProductService(data);
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

let handleGetAllProduct = async (req, res) => {
  try {
    let { limit, page, sort, name } = req.query;
    let message = await productService.getAllProductService(
      +limit,
      +page,
      sort,
      name
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

let handleGetAllProductOfTheProductType = async (req, res) => {
  try {
    let { limit, page, sort, productTypeId, filter } = req.query;

    sort !== "undefined" &&
    sort !== "" &&
    sort !== "null" &&
    sort !== undefined &&
    sort !== null
      ? (sort = JSON.parse(sort))
      : (sort = undefined);

    filter !== "undefined" &&
    filter !== "" &&
    filter !== null &&
    filter !== undefined &&
    filter !== null
      ? (filter = JSON.parse(filter))
      : (filter = undefined);

    let message = await productService.getAllProductOfTheProductTypeService(
      productTypeId,
      +limit,
      +page,
      sort,
      filter
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

let getProduct = async (req, res) => {
  try {
    let { productId } = req.query;
    let message = await productService.getProductService(productId);
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

let handleGetAllProuctFeedback = async (req, res) => {
  try {
    let message = await productService.getAllProuctFeedbackService(
      req.query.userId
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

let handleGetAllProuctSaleOff = async (req, res) => {
  try {
    let message = await productService.getAllProductSaleOffService(
      +req.query.limit,
      +req.query.page
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

let handleGetAllProuctFavourite = async (req, res) => {
  try {
    let message = await productService.getAllProductFavouriteService(
      +req.query.limit,
      +req.query.page,
      req.query.userId
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

let handleGetNameProduct = async (req, res) => {
  try {
    let message = await productService.handleGetNameProductService(
      req.query.productId
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

module.exports = {
  handleCreateNewProduct,
  handleDeleteProduct,
  handleUpdateProduct,
  handleGetAllProduct,
  handleGetAllProductOfTheProductType,
  getProduct,
  handleGetAllProuctFeedback,
  handleGetAllProuctSaleOff,
  handleGetAllProuctFavourite,
  handleGetNameProduct,
};
