const jwt = require("jsonwebtoken");
import db from "../models/index";
import _ from "lodash";
require("dotenv").config();

const authAdmin = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_KEY, function (err, user) {
    if (err) {
      console.log(err);
      return res.status(404).json({
        errCode: -2,
        message: "User access denied",
      });
    }
    let { role } = user;
    if (role === "R1") {
      next();
    } else {
      return res.status(400).json({
        errCode: -2,
        message: "User access denied",
      });
    }
  });
};

const commonAuthUser = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const userId =
    req.query.userId || req.body.userId || req.body.id || req.query.id;

  jwt.verify(token, process.env.ACCESS_KEY, function (err, user) {
    if (err) {
      console.log(err);
      return res.status(404).json({
        errCode: -2,
        message: "User access denied",
      });
    }
    let { role, id } = user;

    if (role === "R1" || id === +userId) {
      next();
    } else {
      return res.status(400).json({
        errCode: -2,
        message: "User access denied",
      });
    }
  });
};

const orderAuthUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const orderId = req.query.orderId || req.body.orderId;
    const userId =
      req.query.userId || req.body.userId || req.body.id || req.query.id;
    jwt.verify(token, process.env.ACCESS_KEY, async function (err, user) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          errCode: -2,
          message: "User access denied",
        });
      }

      let { role, id } = user;

      if (orderId) {
        let order = await db.Order.findAll({
          where: { userId: +id, orderId: orderId },
        });
        if (role !== "R1") {
          if (!order || order.length === 0) {
            return res.status(400).json({
              errCode: -2,
              message: "User access denied",
            });
          }
        }
      }

      if (role === "R1" || id === +userId) {
        next();
      } else {
        return res.status(400).json({
          errCode: -2,
          message: "User access denied",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      errCode: -1,
      message: "Error form the server!!!",
    });
  }
};

const feebbackAuthUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const feebbackId = req.query.feedbackId || req.body.feedbackId;
    const userId =
      req.query.userId || req.body.userId || req.body.id || req.query.id;
    jwt.verify(token, process.env.ACCESS_KEY, async function (err, user) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          errCode: -2,
          message: "User access denied",
        });
      }

      let { role, id } = user;

      if (feebbackId) {
        let feedback = await db.Feedback.findOne({
          where: { id: +feebbackId, userId: +id },
        });
        if (role !== "R1") {
          if (!feedback || _.isEmpty(feedback)) {
            return res.status(400).json({
              errCode: -2,
              message: "User access denied",
            });
          }
        }
      }

      if (role === "R1" || id === +userId) {
        next();
      } else {
        return res.status(400).json({
          errCode: -2,
          message: "User access denied",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      errCode: -1,
      message: "Error form the server!!!",
    });
  }
};

module.exports = {
  orderAuthUser,
  authAdmin,
  commonAuthUser,
  feebbackAuthUser,
};
