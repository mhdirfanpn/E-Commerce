const userHelpers = require("../helpers/userHelpers");
var db = require("../Model/connection");
const bcrypt = require("bcrypt");
const otp = require("../helpers/otpHelpers");
const client = require("twilio")(otp.accoundSid, otp.authToken);
const { ObjectID } = require("bson");

const landingPage = async (req, res) => {
  try {
    userHelpers.visitors();
    let cat = await userHelpers.catCount();
    let productArray = new Array();
    for (i = 0; i < cat.length; i++) {
      let prod = await userHelpers.getCategory(cat[i].name);
      productArray.push(prod);
    }
    let user = req.session.user;
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    }
    let proId = new Array();
    let banner = await userHelpers.getBanner();
    for (i = 0; i < banner.length; i++) {
      let prodId = await userHelpers.getProdId(banner[i].name);
      proId.push(prodId);
    }
    userHelpers.landingPage().then((productDetails) => {
      res.render("index", {
        productDetails,
        productArray,
        user,
        cartCount,
        wishlistCount,
        banner,
        proId,
      });
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const signupPage = (req, res) => {
  try {
    if (req.session.login) {
      res.redirect("/");
    } else {
      res.render("user/signup", {
        SignupErr: req.session.SignupErr,
        nav: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const loginPage = (req, res) => {
  try {
    if (req.session.login) {
      res.redirect("/");
    } else {
      res.render("user/login", { loginErr: req.session.loginErr, nav: true });
    }
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const getOtpage = (req, res) => {
  try {
    res.render("user/user-otpLogin", { nav: true });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const getOtplogin = (req, res) => {
  try {
    client.verify
      .services(otp.serviceId)
      .verifications.create({
        to: `+${req.query.phoneNumber}`,
        channel: req.query.channel,
      })
      .then((data) => {
        res.status(200).send(data);
      });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const getOtpverify = (req, res) => {
  try {
    client.verify
      .services(otp.serviceId)
      .verificationChecks.create({
        to: `+${req.query.phoneNumber}`,
        code: req.query.code,
      })
      .then(async (data) => {
        if (data.valid) {
          let Number = data.to.slice(3);
          let userData = await db.users.findOne({ phoneNumber: Number });
          console.log(userData);
          if (userData.phoneNumber == Number && userData.isBlocked==false) {
            req.session.user = userData;
            res.send({ value: "success" });
          } else {
            res.send({ value: "failed" });
          }
        } else {
          res.send({ value: "failed" });
        }
      });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.send(err);
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const userCategory = async (req, res) => {
  try {
    let user = req.session.user;
    let cartCount = null;
    let wishlistCount = null;
    if (user) {
      cartCount = await userHelpers.getCartCount(user._id);
      wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    }
    userHelpers.userCategory(req.params.id).then((cat) => {
      res.render("user/category", { cat, user, cartCount, wishlistCount });
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const userProduct = async (req, res) => {
  try {
    let user = req.session.user;
    let quantity = await userHelpers.getUserCart(user, req.params.id);
    let wishlistCount = null;
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    }
    userHelpers.userProduct(req.params.id).then((productDetails) => {
      let max = quantity[0]?.limit - productDetails.stock;
      res.render("user/product", {
        productDetails,
        wishlistCount,
        user,
        cartCount,
        quantity,
        max,
      });
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const signup = (req, res) => {
  try {
    userHelpers.userSignup(req.body).then((user) => {
      if (user) {
        req.session.SignupErr = "Email already exist";
        res.redirect("/signup");
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const userLogin = (req, res) => {
  try {
    userHelpers.userSignup(req.body).then((user) => {
      let blocked = user?.isBlocked;
      if (blocked) {
        req.session.loginErr = "You are blocked";
        res.redirect("/login");
      } else {
        if (user) {
          let userData = req.body;
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              req.session.login = true;
              req.session.user = user;
              res.redirect("/");
            } else {
              req.session.loginErr = "Invalid username or password";
              res.redirect("/login");
            }
          });
        } else {
          req.session.loginErr = "Invalid username or password";
          res.redirect("/login");
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const addToCart = async (req, res) => {
  try {
    let product = await userHelpers.getProducts(req.params.id);
    let user = req.session.user;
    let quantity = await userHelpers.getUserCart(user, req.params.id);
    let limit = product.stock - quantity[0]?.limit;
    userHelpers
      .addToCart(req.params.id, req.session.user._id, limit, product.price)
      .then(() => {
        res.json({ status: true, product, quantity });
      });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const addToWishlist = async (req, res) => {
  try {
    let product = await userHelpers.getProducts(req.params.id);
    let user = req.session.user;
    userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true, product });
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const getCartDetails = async (req, res) => {
  try {
    let user = req.session.user;
    let cartCount = null;
    if (user) {
      cartCount = await userHelpers.getCartCount(user._id);
      wishlistCount = await userHelpers.wishlistCount(user._id);
    }
    let product = await userHelpers.getCartProducts(user);
    let total = await userHelpers.getTotalAmount(user._id);
    if (total) {
      res.render("user/cart", {
        product,
        user,
        cartCount,
        total,
        wishlistCount,
      });
    } else {
      res.render("user/emptyCart");
    }
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const getWishlist = async (req, res) => {
  try {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    let user = req.session.user;
    if (user) {
      let u = await db.wishlist.findOne({ user: ObjectID(user._id) });
      if (u) {
        let products = await userHelpers.getWishProducts(user._id);
        let pro = products[0]?.output;
        wishlistCount = await userHelpers.getWishCount(user._id);
        if (products.length > 0) {
          res.render("user/wishlist", { user, pro, wishlistCount, cartCount });
        } else {
          res.render("user/emptyWish");
        }
      } else {
        res.render("user/emptyWish");
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const removeProductWishlist = (req, res) => {
  try {
    let user = req.session.user;
    let id = req.params.id;
    userHelpers.removeFromWishlist(user._id, id).then((respo) => {
      res.json(respo);
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const changeProductQuantity = (req, res) => {
  try {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelpers.getTotalAmount(req.body.user);
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const checkout = async (req, res) => {
  try {
    let user = req.session.user;
    let wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    let product = await userHelpers.getCartProducts(req.session.user);
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    await db.users.findOne({ _id: user._id }).then((users) => {
      res.render("user/check", {
        total,
        users,
        user,
        cartCount,
        product,
        wishlistCount,
      });
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const placeOrder = async (req, res) => {
  try {
    let user = req.session.user._id;
    let products = await userHelpers.getCartProducts(req.session.user._id);
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    let productArray = new Array();
    for (i = 0; i < products.length; i++) {
      let prod = await userHelpers.getProducts(products[i].item);
      productArray.push(prod.stock);
    }

    let verifyCoupon = await userHelpers.couponVerify(user);
    if (verifyCoupon.coupanId == req.body.couponName) {
      let discountAmount = (total * parseInt(verifyCoupon.percentage)) / 100;
      let amount = Math.round(total - discountAmount);
      userHelpers
        .placeOrder(req.body, products, amount, user, productArray)
        .then((response) => {
          let orderId = response._id;
          if (req.body["paymentMethod"] === "Cash on Delivery") {
            res.json({ codSuccess: true });
          } else if (req.body["paymentMethod"] === "razorpay") {
            userHelpers.generateRazorpay(orderId, amount).then((response) => {
              response.razorpay = true;
              res.json(response);
            });
          } else if (req.body["paymentMethod"] == "paypal") {
            userHelpers.conertRate(amount).then((data) => {
              // converting inr to usd
              convertedRate = Math.round(data);

              userHelpers
                .generatePayPal(orderId.toString(), convertedRate)
                .then((response) => {
                  response.insertedId = orderId;
                  response.payPal = true;
                  res.json(response);
                });
            });
          } else if (req.body["paymentMethod"] === "wallet") {
            userHelpers.walletPayment(user, orderId).then((response) => {
              response.wallet = true;
              res.json(response);
            });
          } else {
            res.render("user/error", { nav: true });
          }
        });
    } else {
      userHelpers
        .placeOrder(req.body, products, total, user, productArray)
        .then((response) => {
          let orderId = response._id;
          if (req.body["paymentMethod"] === "Cash on Delivery") {
            res.json({ codSuccess: true });
          } else if (req.body["paymentMethod"] === "razorpay") {
            userHelpers.generateRazorpay(orderId, total).then((response) => {
              response.razorpay = true;
              res.json(response);
            });
          } else if (req.body["paymentMethod"] == "paypal") {
            userHelpers.conertRate(total).then((data) => {
              // converting inr to usd
              convertedRate = Math.round(data);

              userHelpers
                .generatePayPal(orderId.toString(), convertedRate)
                .then((response) => {
                  response.insertedId = orderId;
                  response.payPal = true;
                  res.json(response);
                });
            });
          } else if (req.body["paymentMethod"] === "wallet") {
            userHelpers.walletPayment(user, orderId).then((response) => {
              response.wallet = true;
              res.json(response);
            });
          } else {
            res.render("user/error", { nav: true });
          }
        });
    }
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const successOrder = async (req, res) => {
  try {
    let wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    userHelpers.orderCount();
    let user = req.session.user;
    res.render("user/success", { user, count: true, wishlistCount });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const getUserOrders = async (req, res) => {
  try {
    let wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    let orders = await userHelpers.getUserOrders(req.session.user);
    res.render("user/order", {
      user: req.session.user,
      orders,
      count: true,
      wishlistCount,
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const deleteOrder = (req, res) => {
  try {
    let id = req.params.id;
    userHelpers.deleteOrder(id).then(() => {
      res.redirect("/orders");
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const getOrderProducts = async (req, res) => {
  try {
    let wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    let products = await userHelpers.getOrderProducts(req.params.id);
    let orders = await db.order.findOne({ _id: req.params.id });
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    console.log(products[0].Products);
    res.render("user/order-products", {
      user: req.session.user,
      products,
      orders,
      count: true,
      total,
      wishlistCount,
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const userProfile = async (req, res) => {
  try {
    let wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    let user = await userHelpers.getUser(req.session.user);
    res.render("user/dashboard", { user, wishlistCount });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const profileOrders = async (req, res) => {
  try {
    let orders = await userHelpers.getUserOrders(
      req.session.user,
    );
    let wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    res.render("user/myOrders", {
      wishlistCount,
      orders,
      user: req.session.user,
 
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const profileAddrss = async (req, res) => {
  try {
    let user = req.session.user;
    let wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    cartCount = await userHelpers.getCartCount(user);
    userHelpers.getUser(user).then((userDetails) => {
      res.render("user/myAddress", {
        user,
        userDetails,
        wishlistCount,
        cartCount,
      });
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const verifyPayment = (req, res) => {
  try {
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
          console.log("paymnet success");
          res.json({ status: true });
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, errorMessage: "" });
      });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const addAddress = (req, res) => {
  try {
    let user = req.session.user;
    userHelpers.addAddress(req.body, user);
    res.redirect("/profile/address");
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const deleteAddress = (req, res) => {
  try {
    let id = req.params.id;
    let user = req.session.user;
    userHelpers.deleteAddress(user, id).then((response) => {
      res.redirect("/profile/address");
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const deleteCartProduct = (req, res) => {
  try {
    let proId = req.params.id;
    let user = req.session.user;
    userHelpers.deleteCartProduct(proId, user).then((response) => {
      res.redirect("/cart");
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const deleteOrderProduct = async (req, res) => {
  try {
    let status = "Cancelled";
    let product = await userHelpers.getProducts(req.body.proId);
    userHelpers.changeStock(req.body, product);
    userHelpers.deleteOrderProduct(req.body, status).then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const profileDetails = async (req, res) => {
  try {
    let user = req.session.user;
    let wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    res.render("user/accountDetails", { user, count: true, wishlistCount });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const updateDetails = (req, res) => {
  try {
    let user = req.session.user;
    userHelpers.updateDetails(req.body, user).then(() => {
      res.redirect("/logout");
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const editAddress = (req, res) => {
  try {
    let user = req.session.user;
    let id = req.params.id;
    userHelpers.editAddress(user, id).then((response) => {
      res.render("user/editAddress", { response });
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const updateAddress = (req, res) => {
  try {
    let user = req.session.user;
    userHelpers.updateAddress(req.body, user).then(() => {
      res.redirect("/profile/address");
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const returnProduct = async (req, res) => {
  try {
    let user = req.session.user;
    let product = await userHelpers.getProducts(req.body.proId);
    let status = userHelpers.changeStatus(req.body);
    userHelpers.changeStock(req.body, product).then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const couponApply = async (req, res) => {
  try {
    let user = req.session.user._id;
    const date = new Date();
    let totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
    let coupanCode = req.body.coupon;
    if (coupanCode == "") {
      res.json({ noCoupon: true, totalAmount });
    } else {
      let couponres = await userHelpers.applyCoupon(
        req.body,
        user,
        date,
        totalAmount
      );
      if (couponres.verify) {
        let discountAmount =
          (totalAmount * parseInt(couponres.couponData.percentage)) / 100;
        let amount = totalAmount - discountAmount;
        couponres.totalAmount = totalAmount;
        couponres.discountAmount = Math.round(discountAmount);
        couponres.amount = Math.round(amount);
        res.json(couponres);
      } else {
        couponres.Total = totalAmount;
        res.json(couponres);
      }
    }
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

const cancelPayment = async (req, res) => {
  try {
    let cartCount = 0;
    let user = req.session.user;
    let wishlistCount = await userHelpers.wishlistCount(user._id);
    res.render("user/cancelPayment", { user, cartCount, wishlistCount });
  } catch (error) {
    console.log(error);
    res.render("user/error", { nav: true });
  }
};

module.exports = {
  landingPage,
  signupPage,
  loginPage,
  logout,
  getOtpage,
  getOtplogin,
  getOtpverify,
  userProduct,
  signup,
  userLogin,
  addToCart,
  getCartDetails,
  changeProductQuantity,
  checkout,
  placeOrder,
  successOrder,
  getUserOrders,
  deleteOrder,
  getOrderProducts,
  userProfile,
  profileOrders,
  profileAddrss,
  verifyPayment,
  addAddress,
  deleteAddress,
  deleteCartProduct,
  deleteOrderProduct,
  profileDetails,
  updateDetails,
  editAddress,
  updateAddress,
  returnProduct,
  couponApply,
  userCategory,
  addToWishlist,
  getWishlist,
  removeProductWishlist,
  cancelPayment,
};
