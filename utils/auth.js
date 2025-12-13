const { SignJWT } = require('jose');

/**
 * Generate JWT token for user
 */
const getToken = async (user) => {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
  
  const token = await new SignJWT({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .setNotBefore('0s')
    .sign(secretKey);

  return token;
};

module.exports = {
  getToken,
};

