import { refreshTokenService } from "../services/jwtSerivce";
import { jwtDecode } from "jwt-decode";

const refreshToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    const access_token = req.cookies.access_token;
    if (refresh_token && access_token) {
      const decodedAccess = jwtDecode(access_token);
      const decodedRefreshToken = jwtDecode(refresh_token);
      const currentTime = new Date();
      if (decodedAccess?.exp < currentTime.getTime() / 1000) {
        if (decodedRefreshToken?.exp > currentTime.getTime() / 1000) {
          let result = await refreshTokenService(refresh_token);
          if (result.errCode === 0) {
            res.cookie("access_token", result.access_token, {
              httpOnly: true,
              secure: false,
              path: "/",
              sameSite: "strict",
            });
            req.cookies.access_token = result.access_token;
            next();
          } else {
            return res.status(400).json(result);
          }
        } else {
          return res.status(400).json({
            errCode: -4,
            message: "Refresh_token expired",
          });
        }
      } else {
        next();
      }
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
