import productTypeService from "../services/productTypeService";

let handleCreateNewProductType = async (req, res) => {
  try {
    let message = await productTypeService.createNewProductTypeService(
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

let handleDeleteProductType = async (req, res) => {
  try {
    let id = req.query.id;
    let message = await productTypeService.deleteProductTypeService(id);
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

let handleUpdateProductType = async (req, res) => {
  try {
    let message = await productTypeService.updateProductTypeService(req.body);
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

let handleGetAllProductType = async (req, res) => {
  try {
    let { limit, page, sort, name, pagination } = req.query;
    let message = await productTypeService.getAllProductTypeService(
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

module.exports = {
  handleCreateNewProductType,
  handleDeleteProductType,
  handleUpdateProductType,
  handleGetAllProductType,
};

// so trigger curron tran
