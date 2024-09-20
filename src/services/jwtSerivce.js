const jwt = require("jsonwebtoken");
require("dotenv").config();

export const generalAccessToken = (payload) => {
  const accessToken = jwt.sign(
    {
      ...payload,
    },
    process.env.ACCESS_KEY,
    { expiresIn: process.env.ACCESS_TIME }
  );

  return accessToken;
};

export const generalRefreshToken = (payload) => {
  const refreshToken = jwt.sign(
    {
      ...payload,
    },
    process.env.REFRESH_KEY,
    { expiresIn: process.env.REFRESH_TIME }
  );

  return refreshToken;
};

export const refreshTokenService = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      jwt.verify(token, process.env.REFRESH_KEY, async function (err, user) {
        if (err) {
          resolve({
            errCode: -4,
            message: "User access denied",
          });
        }
        if (user) {
          const accessToken = await generalAccessToken({
            id: user?.id,
            role: user?.role,
          });
          resolve({
            errCode: 0,
            access_token: accessToken,
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
