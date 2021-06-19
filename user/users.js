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
      // console.log(pathFile);
      // const url = await User.updateAvatar(userId, pathFile);
      if (req.file) {
        const { file } = req;
        // console.log(file);
        const img = await jimp.read(pathFile);
        // console.log(pathFile);
        const imgName = Date.now() + '_' + file.originalname;
        await img
          .autocrop()
          .cover(
            250,
            250,
            jimp.HORIZONTAL_ALIGN_CENTER || jimp.VERTICAL_ALIGN_MIDDLE,
          )
          .writeAsync(pathFile);
        await fs.rename(file.path, path.join(IMG_DIR, imgName));

        const url = `/avatars/${imgName}`;
        await User.updateAvatar(userId, url);
      }
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {
          avatarURL: pathFile,
        },
      });
    } catch (e) {
      next(e);
    }
  },
);

module.exports = router;
