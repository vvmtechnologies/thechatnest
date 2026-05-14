const { Router } = require('express');
const auth = require('../middlewares/auth');
const requireNotRoleId = require('../middlewares/requireNotRoleId');
const controller = require('../controllers/contactUsController');
const { validateCreateContactRequest } = require('../middlewares/contactUsValidation');
const { publicFormLimiter } = require('../middlewares/rateLimiters');

const router = Router();
const blockRole4 = requireNotRoleId(4);

// Server-side honeypot — the form ships a hidden "website" input that
// humans never see. Any non-empty value means we're looking at a bot.
// We answer 200 so the bot thinks it succeeded and doesn't retry, but
// we never persist or notify anyone.
const honeypotGuard = (req, res, next) => {
  const trap = req.body?.website || req.body?.honeypot;
  if (trap && String(trap).trim()) {
    return res.status(200).json({
      status: 'success',
      message: 'Contact request submitted',
    });
  }
  next();
};

router
  .route('/')
  .post(publicFormLimiter, honeypotGuard, validateCreateContactRequest, controller.createContactRequest)
  .get(auth, blockRole4, controller.getContactRequests);

router
  .route('/:id')
  .get(auth, blockRole4, controller.getContactRequestById);

module.exports = router;
