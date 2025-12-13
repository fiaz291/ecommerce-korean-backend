const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');
const { getToken } = require('../utils/auth');
const axios = require('axios');

/**
 * Send Code (WhatsApp)
 * POST /api/user/sendCode
 */
const sendCode = async (req, res, next) => {
  const { phoneNumber, id } = req.body;

  try {
    let code = Math.random(5);
    
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.WHATS_APP_NUMBER}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: `Your verification code is ${code}`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATS_APP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json(
      createResponse({ success: true, data: response.data, status: true })
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json(
      createResponse({ success: false, error: error.response?.data, status: false })
    );
  }
};

/**
 * Verify Number
 * POST /api/user/verify-number
 */
const verifyNumber = async (req, res, next) => {
  const { code, id } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(400).json(
        createResponse({ error: 'User Not found', code: 2, status: false })
      );
    }
    
    if (user.verificationCode != code) {
      return res.status(400).json(
        createResponse({ error: 'Invalid verification code', code: 2, status: false })
      );
    }
    
    return res.status(200).json(
      createResponse({ success: true, message: 'code verified', status: true })
    );
  } catch (error) {
    console.error('Error verifying number:', error);
    return res.status(500).json(
      createResponse({ success: false, error: error.message, status: false })
    );
  }
};

/**
 * Social Signin
 * POST /api/user/socialSignin
 */
const socialSignin = async (req, res, next) => {
  const { provider, dataSet } = req.body;

  try {
    let userObj;
    if (provider === 'google') {
      const { data } = await getGoogleToken(dataSet.code);
      if (!data) {
        return res.status(500).json(
          createResponse({ error: 'Error while getting google user data', status: false })
        );
      }
      userObj = {
        socialId: data.sub,
        firstName: data.given_name,
        lastName: data.family_name,
        email: data.email,
        profilePicture: { url: data.picture }
      };
    } else if (provider === 'googlemobile') {
      userObj = dataSet;
    } else if (provider === 'facebook') {
      userObj = {
        socialId: dataSet.id,
        firstName: dataSet.first_name,
        lastName: dataSet.last_name,
        email: dataSet.email,
        profilePicture: { url: dataSet?.picture?.data?.url }
      };
    } else {
      return res.status(400).json(
        createResponse({ error: 'Invalid provider', status: false })
      );
    }

    let user = await prisma.user.findUnique({ where: { email: userObj.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          ...userObj,
          isVerified: true,
          password: 'ASSQWSDASDSADZXCZXCEQE@#@#@!@!WAS@!#@#'
        }
      });
    }

    const token = await getToken(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });
    
    delete user.password;
    return res.status(200).json(
      createResponse({ data: { ...user, token }, status: true })
    );
  } catch (error) {
    console.error('Error in social login:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal server error', status: false })
    );
  }
};

/**
 * Helper function to get Google token
 */
async function getGoogleToken(code) {
  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
      },
    });
    
    if (!data?.access_token) {
      throw new Error('Error while getting google Token');
    }
    
    return await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${data?.access_token}` },
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    throw error;
  }
}

module.exports = {
  sendCode,
  verifyNumber,
  socialSignin,
};

