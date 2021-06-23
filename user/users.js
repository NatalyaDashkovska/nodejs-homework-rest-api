const express = require('express');
const router = express.Router();
const User = require('./index');
const { HttpCode } = require('../routes/api/helpers/constants');
const jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const IMG_DIR = path.join(process.cwd(), 'public', 'avatars');
const guard = require('../routes/api/helpers/guard');
const {
  validateSingup,
  validateLogin,
  validateSubscriptionUpdate,
  validateSendVerifyToken,
} = require('../routes/api/validation/user-validation');
const upload = require('../routes/api/helpers/multer');

router.post('/signup', validateSingup, async (req, res, next) => {
  const { email, password, subscription } = req.body;
  //   console.log(User);
  const user = await User.findUserByEmail(email);
  if (user) {
    return next({
      status: HttpCode.CONFLICT,
      data: 'Conflict',
      message: 'This email is already in use',
    });
  }
  try {
    const newUser = await User.addUser({ email, password, subscription });
    // console.log(newUser);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscription: newUser.subscription,
        avatar: newUser.avatar,
      },
    });
  } catch (e) {
    next(e);
  }
});
router.post('/login', validateLogin, async (req, res, next) => {
  const { password, email } = req.body;

  try {
    const token = await User.login({ email, password });
    if (token) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {
          token,
        },
      });
    }
    next({
      status: HttpCode.UNAUTHORIZED,
      message: 'Invalid creadentials',
    });
  } catch (e) {
    next(e);
  }
});
router.post('/logout', guard, async (req, res, next) => {
  const id = req.user.id;
  await User.logout(id);
  return res.status(HttpCode.NO_CONTENT).json({
    status: 'success',
    code: HttpCode.NO_CONTENT,
  });
});

router.get('/current', guard, async (req, res, next) => {
  try {
    const id = req.user.id;
    // console.log(req);
    const user = await User.current(id);
    return res
      .status(HttpCode.OK)
      .json({ status: 'success', code: HttpCode.OK, data: user });
  } catch (e) {
    next(e);
  }
});

router.patch(
  '/subscription',
  guard,
  validateSubscriptionUpdate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const updatedUser = await User.updateSubscriptionById(userId, req.body);

      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {
          email: updatedUser.email,
          subscription: updatedUser.subscription,
        },
      });
    } catch (e) {
      next(e);
    }
  },
);
router.patch(
  '/avatars',
  guard,
  upload.single('avatar'),
  async (req, res, next) => {
try {
      const userId = req.user.id;
      const pathFile = req.file.path;

      const url = await User.updateAvatar(userId, pathFile);

      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {
          avatarURL: url,
        },
      });
  
} catch (error) {
  next(error);
}
  },
);

router.get('/verify/:verificationToken', async (req, res, next) => {
  try {
    const result = await User.verify(req.params);
    if (result) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        message: 'Verification successful',
      });
    } else {
      return res.status(HttpCode.NOT_FOUND).json({
        status: 'Not Found',
        code: HttpCode.NOT_FOUND,
        message: 'User not found',
      });
    }
  } catch (e) {
    next(e);
  }
});

router.post('/verify/', validateSendVerifyToken, async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findUserByEmail(email);
  if (!user) {
    return next({
      status: HttpCode.CONFLICT,
      data: 'Conflict',
      message: 'This email is not registered',
    });
  }
  if (user.verify) {
    return next({
      status: HttpCode.BAD_REQUEST,
      data: 'Bad request',
      message: 'Verification has already been passed',
    });
  }
  try {
    const verificationToken = user.verificationToken;

    await User.sendEmailToUser({ email }, verificationToken);

    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      message: 'Verification email sent',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
