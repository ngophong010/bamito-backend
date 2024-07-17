import { refreshTokenService } from "../services/jwtSerivce";
import jwt from "jsonwebtoken";

const refreshToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    const access_token = req.cookies.access_token;

    console.log("access_token: ", access_token);
    console.log("refresh_token: ", refresh_token);

    if (refresh_token && access_token) {
      jwt.verify(access_token, process.env.ACCESS_KEY, (err, decodedAccess) => {
        if (err && err.name === "TokenExpiredError") {
          jwt.verify(
            refresh_token,
            process.env.REFRESH_KEY,
            async (err, decodedRefreshToken) => {
              if (err) {
                return res.status(400).json({
                  errCode: -4,
                  message: "Refresh_token expired",
                });
              }

              let result = await refreshTokenService(refresh_token);
              if (result.errCode === 0) {
                res.cookie("access_token", result.access_token, {
                  httpOnly: true,
                  secure: true,
                  path: "/",
                  sameSite: "None",
                });
                req.cookies.access_token = result.access_token;
                next();
              } else {
                return res.status(400).json(result);
              }
            }
          );
        } else if (err) {
          return res.status(400).json({
            errCode: -3,
            message: "Invalid access token",
          });
        } else {
          next();
        }
      });
    } else {
      return res.status(400).json({
        errCode: -3,
        message: "No tokens available",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: -1,
      message: "Error from the server!!!",
    });
  }
};

export default refreshToken;
