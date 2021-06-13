const express = require('express');
const router = express.Router();
const Contacts = require('../../model/index');
const { HttpCode } = require('./helpers/constants');

const {
  validateCreateContact,
  validateUpdateContact,
  validateupdateStatusContact,
} = require('./validation/contact-validation');

const guard = require('./helpers/guard');

router.get('/', guard, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contacts = await Contacts.listContacts(userId, req.query);

    return res.json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        ...contacts,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', guard, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.getContactById(userId, req.params.contactId);
    if (contact) {
      // console.log(contact);
      return res.json({
        status: 'success',
        code: HttpCode.OK,
        data: {
          contact: contact,
        },
      });
    } else {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'Contact is not found',
        data: 'Not found',
      });
    }
  } catch (e) {
    next(e);
  }
});

router.post('/', guard, validateCreateContact, async (req, res, next) => {
  const userId = req.user.id;
  try {
    const contact = await Contacts.addContact(req.body, userId);
    res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        contact,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.delete('/:contactId', guard, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.removeContact(userId, req.params.contactId);
    if (contact) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {
          contact,
        },
      });
    } else {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'Contact is not found',
        data: 'Not found',
      });
    }
  } catch (e) {
    next(e);
  }
});

router.patch(
  '/:contactId',
  guard,
  validateUpdateContact,
  async (req, res, next) => {
    const userId = req.user.id;
    try {
      const contact = await Contacts.updateContact(
        userId,
        req.params.contactId,
        req.body,
      );
      if (contact) {
        return res.status(HttpCode.OK).json({
          status: 'success',
          code: HttpCode.OK,
          data: {
            contact,
          },
        });
      } else {
        return next({
          status: HttpCode.NOT_FOUND,
          message: 'Contact is not found',
          data: 'Not found',
        });
      }
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  '/:contactId/favorite',
  guard,
  validateupdateStatusContact,
  async (req, res, next) => {
    if (Object.values(req.body).length === 0) {
      return next({
        status: HttpCode.BAD_REQUEST,
        message: 'missing field favorite',
        data: 'missing field favorite',
      });
    }
    try {
      const contact = await Contacts.updateStatusContact(
        req.params.contactId,
        req.body,
      );
      if (contact) {
        return res.status(HttpCode.OK).json({
          status: 'success',
          code: HttpCode.OK,
          data: {
            contact,
          },
        });
      } else {
        return next({
          status: HttpCode.NOT_FOUND,
          message: 'Contact is not found',
          data: 'Not found',
        });
      }
    } catch (e) {
      next(e);
    }
  },
);

module.exports = router;
