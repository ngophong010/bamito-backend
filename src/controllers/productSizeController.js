import productSizeService from "../services/productSizeService";

let handleCreateNewProductSize = async (req, res) => {
  try {
    let message = await productSizeService.createNewProductSizeService(
      req.body
    );
    if (message.errCode === 0) return res.status(201).json(message);
    else return res.status(400).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error form the server!!!",
    });
  }
};

let handleDeleteProductSize = async (req, res) => {
  try {
    let id = req.query.id;
    let message = await productSizeService.deleteProductSizeService(id);
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

let handleUpdateProductSize = async (req, res) => {
  try {
    let message = await productSizeService.updateProductSizeService(req.body);
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

let handleGetAllProductSize = async (req, res) => {
  try {
    let { productId, limit, page, sort } = req.query;
    let message = await productSizeService.getAllProductSizeService(
      productId,
      +limit,
      +page,
      sort
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
  handleCreateNewProductSize,
  handleDeleteProductSize,
  handleUpdateProductSize,
  handleGetAllProductSize,
};
