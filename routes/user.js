var express = require("express");
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
var userController = require("../controller/userController");
const { Db } = require("mongodb");
const swal = require("sweetalert");

//verify login

const verifyLogin = async(req, res, next) => {
  let user=req.session.user
  userHelpers.findUser(user).then((userData)=>{
    if (user && !userData.isBlocked) {
      next();
    } else {

      res.redirect("/logout");
    }
  })
};


//home

router.get("/", userController.landingPage);

//login $ logout

router.get("/signup", userController.signupPage);

router.post("/signup", userController.signup);

router.get("/login", userController.loginPage);

router.post("/login", userController.userLogin);

router.get("/logout", userController.logout);



router.get("/otp_page", userController.getOtpage);



router.get("/otp_login", userController.getOtplogin);



router.get("/otp_verify", userController.getOtpverify);

//categories

router.get("/category/:id", userController.userCategory);

//product

router.get("/product/:id", userController.userProduct);

//cart

router.get("/addToCart/:id", verifyLogin, userController.addToCart)

router.get("/cart", verifyLogin, userController.getCartDetails);

router.post(
  "/change-product-quantity",
  verifyLogin,
  userController.changeProductQuantity
);

router.get(
  "/delete-cart-product/:id",
  verifyLogin,
  userController.deleteCartProduct
);

//wish-list

router.get("/addToWishlist/:id", verifyLogin, userController.addToWishlist)

router.get("/wishlist", verifyLogin, userController.getWishlist);


router.get('/removeFrom-Wish/:id',verifyLogin,userController.removeProductWishlist)


//order

router.get("/checkout", verifyLogin, userController.checkout)

router.post("/place-order", verifyLogin, userController.placeOrder);

router.get("/order-success", verifyLogin, userController.successOrder);

router.get("/orders", verifyLogin, userController.getUserOrders);

router.get("/delete-order/:id", verifyLogin, userController.deleteOrder);

router.get("/order-products/:id", verifyLogin, userController.getOrderProducts);

router.post("/verify-payment", verifyLogin, userController.verifyPayment);

router.post(
  "/delete-order-product",
  verifyLogin,
  userController.deleteOrderProduct
);

router.post(
  "/return-product",
  verifyLogin,
  userController.returnProduct
);

router.get("/cancel-payment",verifyLogin,userController.cancelPayment)

//profile

router.get("/profile", verifyLogin, userController.userProfile);

router.get("/profile/orders", verifyLogin, userController.profileOrders);

router.get("/profile/address", verifyLogin, userController.profileAddrss);

router.post("/add-address", verifyLogin, userController.addAddress);

router.get("/delete-address/:id", verifyLogin, userController.deleteAddress);

router.get("/profile/edit", verifyLogin, userController.profileDetails);

router.post("/update-details", verifyLogin, userController.updateDetails);

router.get("/edit-address/:id", verifyLogin, userController.editAddress);

router.post("/edit-address", verifyLogin, userController.updateAddress);

//coupan

router.post("/apply-coupan",verifyLogin,userController.couponApply);


module.exports = router;
