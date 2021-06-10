const express = require('express');
const router = express.Router();
const Contacts = require('../../model/index');
const { HttpCode } = require('./helpers/constants');
const {
  validateCreateContact,
  validateUpdateContact,
  validateupdateStatusContact,
} = require('./validation/contact-validation');

router.get('/', async (_req, res, next) => {
  try {
    const contacts = await Contacts.listContacts();

    return res.json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        contacts,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const contact = await Contacts.getContactById(req.params.contactId);
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

router.post('/', validateCreateContact, async (req, res, next) => {
  try {
    const contact = await Contacts.addContact(req.body);
    res.status(HttpCode.CREATE).json({
      status: 'success',
      code: HttpCode.CREATE,
      data: {
        contact,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.delete('/:contactId', async (req, res, next) => {
  try {
    const contact = await Contacts.removeContact(req.params.contactId);
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

router.patch('/:contactId', validateUpdateContact, async (req, res, next) => {
  try {
    const contact = await Contacts.updateContact(
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
});

router.patch(
  '/:contactId/favorite',
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
