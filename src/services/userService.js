import db from "../models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import emailService from "./emailService";
import { generalAccessToken, generalRefreshToken } from "./jwtSerivce";
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
import { v4 as uuidv4 } from "uuid";
const salt = bcrypt.genSaltSync(10);
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

let checkEmailUser = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: email },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkPhoneUser = (phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { phoneNumber: phoneNumber },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (error) {
      reject(error);
    }
  });
};

let loginService = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email || !password) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistEmail = await checkEmailUser(email);
        if (checkExistEmail) {
          let user = await db.User.findOne({
            where: { email: email, status: 1 },
            attributes: ["id", "password"],
            include: [
              {
                model: db.Role,
                as: "roleData",
                attributes: ["roleId", "roleName"],
              },
            ],
            raw: true,
            nest: true,
          });
          if (user) {
            let check = await bcrypt.compareSync(password, user.password);
            if (check) {
              delete user.password;
              const access_token = await generalAccessToken({
                id: user.id,
                role: user.roleData.roleId,
              });
              const refresh_token = await generalRefreshToken({
                id: user.id,
                role: user.roleData.roleId,
              });
              resolve({
                errCode: 0,
                message: "Login succeed",
                access_token,
                refresh_token,
              });
            } else {
              resolve({
                errCode: 4,
                message: "Wrong password",
              });
            }
          } else {
            resolve({
              errCode: 3,
              message: "User is not found",
            });
          }
        } else {
          resolve({
            errCode: 2,
            message: "Your email dosen't exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getUserInforService = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: userId, status: 1 },
          attributes: [
            "id",
            "userName",
            "email",
            "avatar",
            "password",
            "phoneNumber",
          ],
          include: [
            {
              model: db.Role,
              as: "roleData",
              attributes: ["roleId", "roleName"],
            },
          ],
          raw: true,
          nest: true,
        });
        if (user) {
          delete user.password;
          let favourites = await db.Favourite.findAll({
            where: { userId: user.id },
            attributes: {
              exclude: ["createdAt", "updatedAt", "id", "userId"],
            },
          });
          favourites = favourites.map((favourite) => favourite.productId);
          resolve({
            errCode: 0,
            message: "Get user infor succeed",
            user: user,
            favourites,
          });
        } else {
          resolve({
            errCode: 2,
            message: "User is not found",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let createNewUserService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.userName ||
        !data.password ||
        !data.roleId ||
        !data.phoneNumber
      ) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistEmail = await checkEmailUser(data.email);
        let checkExistPhoneUser = await checkPhoneUser(data.phoneNumber);
        if (checkExistEmail) {
          resolve({
            errCode: 2,
            message: "Your email is already in used",
          });
        } else if (checkExistPhoneUser) {
          resolve({
            errCode: 3,
            message: "Your phone number is already in used",
          });
        } else {
          let hashPasswordFromBcrypt = await hashUserPassword(data.password);
          let token = uuidv4();
          await db.User.create({
            userName: data.userName,
            password: hashPasswordFromBcrypt,
            email: data.email,
            avatar: data.avatar,
            phoneNumber: data.phoneNumber,
            birthday: data.birthday,
            tokenResgister: token,
            roleId: data.roleId,
          });
          if (data.address) {
            let user = await db.User.findOne({
              where: { email: data.email },
            });
            await db.Delivery_Address.create({
              userId: user.id,
              address: data.address,
            });
          }
          await emailService.sendLinkAuthenEmail({
            email: data.email,
            userName: data.userName,
            token: token,
          });
          resolve({
            errCode: 0,
            message: "Create a user succeed",
          });
        }
      }
    } catch (error) {
      if (error.name === "SequelizeForeignKeyConstraintError") {
        resolve({
          errCode: -2,
          message: "Error foreign key",
        });
      } else {
        reject(error);
      }
    }
  });
};

let checkEmailUserResgister = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: email, status: 1 },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};


let registerService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.userName || !data.password || !data.roleId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistEmail = await checkEmailUser(data.email);
        let checkExistEmailActive = await checkEmailUserResgister(data.email);
        if (checkExistEmailActive) {
          resolve({
            errCode: 2,
            message: "Your email is already in used",
          });
        } else {
          if (checkExistEmail) {
            await db.User.destroy({
              where: { email: data.email },
            });
          }
          let hashPasswordFromBcrypt = await hashUserPassword(data.password);
          let token = uuidv4();
          await db.User.create({
            userName: data.userName,
            password: hashPasswordFromBcrypt,
            email: data.email,
            roleId: data.roleId,
            tokenResgister: token,
          });
          await emailService.sendLinkAuthenEmail({
            email: data.email,
            userName: data.userName,
            token: token,
          });
          resolve({
            errCode: 0,
            message: "Create a user succeed",
          });
        }
      }
    } catch (error) {
      if (error.name === "SequelizeForeignKeyConstraintError") {
        resolve({
          errCode: -2,
          message: "Error foreign key",
        });
      } else {
        reject(error);
      }
    }
  });
};

let autherRegister = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!token) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let user = await db.User.findOne({
          where: { tokenResgister: token },
          raw: false,
        });
        if (!user) {
          resolve({
            errCode: 2,
            message: "Token incorrect",
          });
        } else {
          user.status = 1;
          await user.save();
          resolve({
            errCode: 0,
            message: "Account activation successful",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

function generateOTP(length) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

let handleSendSMSOtpCodeService = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const otp = generateOTP(6);
      let user = await db.User.findOne({
        where: { id: id },
        raw: false,
      });
      let phone = await user?.phoneNumber?.substring(1);

      const res = await client.messages
        .create({
          body: `Your verification code is: ${otp}`,
          from: '+16812488858',
          to: `+84${phone}`
        })

      if (res.errorCode !== null) {
        resolve({
          errCode: 1,
          message: "Send sms failed!!!",
        });
      }
      user.otpCode = otp;
      user.timeOtp = new Date().getTime() + 180 * 1000;
      await user.save();
      resolve({
        errCode: 0,
        message: "Send otp sms successfully!!!",
      });
    } catch (error) {
      reject(error);
    }
  });
}

let sendOtpCodeService = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistEmail = await checkEmailUser(email);
        if (!checkExistEmail) {
          resolve({
            errCode: 2,
            message: "Email dosen't exist",
          });
        } else {
          let otpCode = Math.floor(Math.random() * 90000) + 10000;
          let user = await db.User.findOne({
            where: { email: email },
            raw: false,
          });

          user.otpCode = otpCode;
          user.timeOtp = new Date().getTime() + 180 * 1000;
          await user.save();

          await emailService.sendOtpResetPassword({
            email: email,
            otpCode: otpCode,
            userName: user.dataValues.userName,
          });
          resolve({
            errCode: 0,
            message: "Send email succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let changePasswordService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.otpCode || !data.email || !data.password) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let user = await db.User.findOne({
          where: { email: data.email },
          raw: false,
        });
        if (!user) {
          resolve({
            errCode: 4,
            message: "User not found",
          });
        } else {
          if (user.dataValues.otpCode !== +data.otpCode) {
            resolve({
              errCode: 2,
              message: "OTP code incorrect",
            });
          } else {
            let currentTime = new Date().getTime();
            let checkTimeOtp = user.dataValues.timeOtp - currentTime;
            if (checkTimeOtp >= 0) {
              let hashPasswordFromBcrypt = await hashUserPassword(
                data.password
              );
              user.password = hashPasswordFromBcrypt;
              await user.save();
              resolve({
                errCode: 0,
                message: "Change password succeed",
              });
            } else {
              resolve({
                errCode: 3,
                message: "OTP code time up",
              });
            }
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let changePasswordProfileService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.currentPassword || !data.newPassword) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: data.id },
          raw: false,
        });
        if (!user) {
          resolve({
            errCode: 2,
            message: "User not found",
          });
        } else {
          let check = await bcrypt.compareSync(
            data.currentPassword,
            user.password
          );
          if (check) {
            if (data.currentPassword === data.newPassword) {
              resolve({
                errCode: 4,
                message: "The new password matches the current password",
              });
            } else {
              let hashPasswordFromBcrypt = await hashUserPassword(
                data.newPassword
              );
              user.password = hashPasswordFromBcrypt;
              await user.save();
              resolve({
                errCode: 0,
                message: "Change password succeed",
              });
            }
          } else {
            resolve({
              errCode: 3,
              message: "Current password incorrect",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let deleteUserService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: id },
        });
        if (!user) {
          resolve({
            errCode: 2,
            message: "User isn't exist",
          });
        } else {
          if (user.avatarId && user.avatar) {
            cloudinary.uploader.destroy(user.avatarId);
          }
          await db.User.destroy({
            where: { id: id },
          });
          resolve({
            errCode: 0,
            message: "Delete user succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkEmailUserUpdate = (email, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        where: { status: 1 },
      });
      users = users.filter((user) => user.id !== +id);
      let result;
      for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
          result = true;
          break;
        } else {
          result = false;
        }
      }
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

let checkPhoneNumberUpdate = (phoneNumber, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll();
      users = users.filter(
        (user) =>
          user.id !== +id &&
          user.phoneNumber !== "" &&
          user.phoneNumber !== null
      );
      let result;
      for (let i = 0; i < users.length; i++) {
        if (users[i].phoneNumber === phoneNumber) {
          result = true;
          break;
        } else {
          result = false;
        }
      }
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

let updateUserService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.email || !data.userName || !data.roleId) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let checkExistEmail = await checkEmailUserUpdate(data.email, data.id);
        let checkUserPhoneNumberUpdate = await checkPhoneNumberUpdate(
          data.phoneNumber,
          data.id
        );
        if (checkExistEmail) {
          resolve({
            errCode: 3,
            message: "Email is already in used",
          });
        } else if (checkUserPhoneNumberUpdate) {
          resolve({
            errCode: 5,
            message: "Phone number is already in used",
          });
        } else {
          let user = await db.User.findOne({
            where: { id: data.id },
            raw: false,
          });
          if (user) {
            user.email = data.email;
            user.userName = data.userName;
            user.phoneNumber = data.phoneNumber;
            user.birthday = data.birthday;
            user.roleId = data.roleId;
            if (data.avatarUrl && data.avatarId) {
              cloudinary.uploader.destroy(user.avatarId);
              user.avatar = data.avatarUrl;
              user.avatarId = data.avatarId;
            }
            if (data.password) {
              let hashPasswordFromBcrypt = await hashUserPassword(
                data.password
              );
              user.password = hashPasswordFromBcrypt;
            }
            if (data.address) {
              let deliveryAddress = await db.Delivery_Address.findOne({
                where: { userId: data.id },
                raw: false,
              });
              if (!deliveryAddress) {
                await db.Delivery_Address.create({
                  userId: data.id,
                  address: data.address,
                });
              } else {
                deliveryAddress.address = data.address;
                await deliveryAddress.save();
              }
            }
            await user.save();
            resolve({
              errCode: 0,
              message: "Update user succeed",
            });
          } else {
            resolve({
              errCode: 2,
              message: "User isn't exist",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getUserService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          message: "Missing required parameter!!!",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: id },
          attributes: {
            exclude: [
              "password",
              "avatarId",
              "timeOtp",
              "roleId",
              "tokenResgister",
              "status",
              "createdAt",
              "updatedAt",
            ],
          },
          include: [
            {
              model: db.Role,
              as: "roleData",
              attributes: ["roleId", "roleName"],
            },
          ],
          raw: true,
          nest: true,
        });
        if (user) {
          let addresses = await db.Delivery_Address.findAll({
            where: { userId: id },
            attributes: ["address"],
          });
          let result = addresses.map((address) => address.address);
          user.deliveryAddressData = result;
          resolve({
            errCode: 0,
            message: "Get user succeed",
            data: user,
          });
        } else {
          resolve({
            errCode: 2,
            message: "User isn't exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Pagination
let getAllUser = (limit, page, sort, name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = {};
      if (!limit) limit = +process.env.LIMIT_MANAGE;
      if (!page) page = 1;
      if (!sort) sort = ["id", "DESC"];
      name === "undefined" ? (name = undefined) : name;
      if (name) filter.userName = { [Op.substring]: name };

      let skip = (page - 1) * limit;
      const { count, rows } = await db.User.findAndCountAll({
        limit: limit,
        offset: skip,
        order: [sort],
        where: filter,
        attributes: {
          exclude: [
            "password",
            "avatarId",
            "createdAt",
            "updatedAt",
            "tokenResgister",
            "otpCode",
            "timeOtp",
            "roleId",
          ],
        },
        include: [
          {
            model: db.Role,
            as: "roleData",
            attributes: ["roleId", "roleName"],
          },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        total: count,
        currentPage: page,
        totalPage: Math.ceil(count / limit),
        data: rows,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// let getAllUser = (limit, page) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let users = await db.User.findAll({
//         attributes: {
//           exclude: [
//             "password",
//             "avatarId",
//             "createdAt",
//             "updatedAt",
//             "tokenResgister",
//             "otpCode",
//             "timeOtp",
//             "roleId",
//           ],
//         },
//         include: [
//           {
//             model: db.Role,
//             as: "roleData",
//             attributes: ["roleId", "roleName"],
//           },
//           {
//             model: db.Delivery_Address,
//             as: "deliveryAddressData",
//             attributes: ["address"],
//           },
//         ],
//         raw: true,
//         nest: true,
//       });
//       resolve({
//         errCode: 0,
//         data: users,
//         message: "Get all user succeed",
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

let getAllRoleService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let roles = await db.Role.findAll({
        attributes: {
          exclude: ["createdAt", "updatedAt", "id"],
        },
      });
      resolve({
        errCode: 0,
        data: roles,
        message: "Get all role succeed",
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  loginService,
  createNewUserService,
  sendOtpCodeService,
  changePasswordService,
  deleteUserService,
  updateUserService,
  getUserService,
  getAllUser,
  changePasswordProfileService,
  getAllRoleService,
  registerService,
  autherRegister,
  getUserInforService,
  handleSendSMSOtpCodeService,
  checkEmailUser
};
