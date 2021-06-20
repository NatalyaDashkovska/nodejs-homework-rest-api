const User = require('../../../user/index');

describe('Unit testing user authorisation', () => {
  let req, res, next;
  beforeEach(async () => {
    req = {
      user: {
        email: 'a@gmail.com',
        password: '123456789',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(data => data),
    };
    next = jest.fn();
  });
  test('user signup with all parameters', async () => {
    const { email, password } = req.user;

    // //   console.log(User);
    const user = User.addUser({ email, password });
    console.log(
      '🚀 ~ file: authorisation.test.js ~ line 8 ~ test ~ user',
      user,
    );
  });
  test('user signup without password', async () => {
    const { email } = req.user;

    // //   console.log(User);

    const user2 = await User.addUser({ email });
    console.log(
      '🚀 ~ file: authorisation.test.js ~ line 28 ~ test ~ user2',
      user2,
    );
  });
  test('user signup without email', async () => {
    const { password } = req.user;

    // //   console.log(User);

    const user3 = await User.addUser({ password });
    console.log(
      '🚀 ~ file: authorisation.test.js ~ line 28 ~ test ~ user2',
      user3,
    );
  });
});
