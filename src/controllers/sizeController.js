import sizeService from "../services/sizeService";

let handleCreateNewSize = async (req, res) => {
  try {
    let message = await sizeService.createNewSizeService(req.body);
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

let handleDeleteSize = async (req, res) => {
  try {
    let id = req.query.id;
    let message = await sizeService.deleteSizeService(id);
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

let handleUpdateSize = async (req, res) => {
  try {
    let message = await sizeService.updateSizeService(req.body);
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

let handleGetAllSize = async (req, res) => {
  try {
    let { limit, page, sort, name } = req.query;
    let message = await sizeService.getAllSizeService(
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

let handleGetAllSizeProductType = async (req, res) => {
  try {
    let { productTypeId } = req.query;
    let message = await sizeService.getAllSizeProductType(productTypeId);
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
  handleCreateNewSize,
  handleDeleteSize,
  handleUpdateSize,
  handleGetAllSize,
  handleGetAllSizeProductType,
};
