import cartService from "../services/cartService";

let handleCreateNewCart = async (req, res) => {
  try {
    let message = await cartService.createNewCartService(req.body);
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

let handleAddProductToCart = async (req, res) => {
  try {
    let message = await cartService.AddProductToCartService(req.body);
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

let handleGetAllProductCart = async (req, res) => {
  try {
    let message = await cartService.getAllProductCartService(req.query.userId);
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

let handleUpdateProductCart = async (req, res) => {
  try {
    let message = await cartService.UpdateProductCartService(req.body);
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

let handleDeleteProductCart = async (req, res) => {
  try {
    let message = await cartService.deleteProductCartService(
      req.query.userId,
      req.query.productId,
      req.query.sizeId
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

module.exports = {
  handleCreateNewCart,
  handleAddProductToCart,
  handleGetAllProductCart,
  handleUpdateProductCart,
  handleDeleteProductCart,
};
