import feedBackService from "../services/feedBackService";

let handleCreateNewFeedBack = async (req, res) => {
  try {
    let message = await feedBackService.createNewFeedBackService(req.body);
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

let handleDeleteFeedBack = async (req, res) => {
  try {
    let message = await feedBackService.deleteFeedbackService(
      req.query.feedbackId
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

let handleUpdateFeedBack = async (req, res) => {
  try {
    let message = await feedBackService.updateFeedbackService(req.body);
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

let handleGetAllFeedBack = async (req, res) => {
  try {
    let message = await feedBackService.getAllFeedbackService(
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
  handleCreateNewFeedBack,
  handleDeleteFeedBack,
  handleUpdateFeedBack,
  handleGetAllFeedBack,
};
