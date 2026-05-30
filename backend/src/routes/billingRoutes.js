const { Router } = require('express');
const auth = require('../middlewares/auth');
const requireNotRoleId = require('../middlewares/requireNotRoleId');
const billingController = require('../controllers/billingController');
const razorpaySync = require('../controllers/razorpaySyncController');

const router = Router();
const blockRole4 = requireNotRoleId(4);

router.get('/payment-history', auth, blockRole4, billingController.getPaymentHistory);
router.get('/payment-gateways', auth, blockRole4, billingController.getPaymentGateways);
router.get('/plan-comparison', auth, blockRole4, billingController.getPlanComparison);
router.get('/address', auth, blockRole4, billingController.getBillingAddress);
router.get('/addresses', auth, blockRole4, billingController.getBillingAddresses);
router.put('/address', auth, blockRole4, billingController.upsertBillingAddress);
router.post('/quote', auth, blockRole4, billingController.createQuote);
router.post('/checkout-session', auth, blockRole4, billingController.createCheckoutSession);
router.post('/checkout/confirm', auth, blockRole4, billingController.confirmCheckoutSession);
router.get('/checkout/resume', auth, blockRole4, billingController.resumeCheckoutSession);

// Razorpay sync — read-only views of the live Razorpay account (plus refund).
// Same auth + non-role-4 guard as the rest of billing.
router.get('/razorpay/account',                 auth, blockRole4, razorpaySync.getAccountSummary);
router.get('/razorpay/payments',                auth, blockRole4, razorpaySync.listPayments);
router.get('/razorpay/payments/:id',            auth, blockRole4, razorpaySync.fetchPayment);
router.post('/razorpay/payments/:id/refund',    auth, blockRole4, razorpaySync.issueRefund);
router.get('/razorpay/orders',                  auth, blockRole4, razorpaySync.listOrders);
router.get('/razorpay/refunds',                 auth, blockRole4, razorpaySync.listRefunds);
router.get('/razorpay/settlements',             auth, blockRole4, razorpaySync.listSettlements);

module.exports = router;
