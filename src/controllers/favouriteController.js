import favouriteService from "../services/favouriteService";

let handleCreateNewFavourite = async (req, res) => {
  try {
    let message = await favouriteService.createNewFavouriteService(req.body);
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

let handleDeleteFavourite = async (req, res) => {
  try {
    let { userId, productId } = req.query;
    let message = await favouriteService.deleteFavouriteService(
      userId,
      productId
    );
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

let handleUpdateFavourite = async (req, res) => {
  try {
    let message = await favouriteService.updateFavouriteService(req.body);
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

let handleGetAllFavourite = async (req, res) => {
  try {
    let userId = req.query.userId;
    let message = await favouriteService.getAllFavouriteService(userId);
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

module.exports = {
  handleCreateNewFavourite,
  handleDeleteFavourite,
  handleUpdateFavourite,
  handleGetAllFavourite,
};
