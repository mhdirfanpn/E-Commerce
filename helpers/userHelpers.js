var db = require("../Model/connection");
const bcrypt = require("bcrypt");
const { ObjectID } = require("bson");
const Razorpay = require("razorpay");
const CC = require("currency-converter-lt");
const moment = require("moment");

//razorpay instanceuserfound

var instance = new Razorpay({
  key_id: "rzp_test_JfiruKTJHf8QRk",
  key_secret: "eyVKi376gF3mxfs1nLwWWmwf",
});

//paypal instance

const paypal = require("paypal-rest-sdk");
const { response } = require("express");
paypal.configure({
  mode: "sandbox",
  client_id:
    "AXfaHlwleuIu4_FKrQvK-V1LlxYy5fIh_VDs6xqcIyfeU1UOIPdhFVZheDsv1vnBihPxOul_CsqiGsEK",
  client_secret:
    "ELI-0HDxljGrSOJ27iqbnyl1Tndef0VKR_JIa0Q8LC3T30DtY9ETBL9ePGXzuhKpUbjb-0n6iP-tk9Gn",
});

const userSignup = (userData) => {
  return new Promise(async (resolve, reject) => {
    await db.users.findOne({ email: userData.email }).then((user) => {
      resolve(user);
      if (user) {
      } else {
        let userPassword = userData.password;
        bcrypt.hash(userPassword, 10).then((result) => {
          userData.password = result;
          userData.isBlocked = false;
          userData.wallet = 0;

          db.users(userData)
            .save()
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              reject(err);
            });
        });
      }
    });
  });
};

const userLogin = (userData) => {
  return new Promise(async (resolve, reject) => {
    await db.users
      .findOne({ email: userData.email })
      .then((user) => {
        resolve(user);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const userCategory = async (catId) => {
  let product = await db.product.findOne({ _id: catId });
  return new Promise(async (resolve, reject) => {
    await db.product.find({ category: product.category }).then((response) => {
      resolve(response);
    });
  });
};

const userProduct = (prodId) => {
  return new Promise(async (resolve, reject) => {
    await db.product
      .findOne({ _id: prodId })
      .then((productDetails) => {
        resolve(productDetails);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const landingPage = () => {
  return new Promise(async (resolve, reject) => {
    await db.product
      .find()
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getBanner = () => {
  return new Promise(async (resolve, reject) => {
    await db.banner
      .find()
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getProdId = (banner) => {
  return new Promise(async (resolve, reject) => {
    await db.product.findOne({ category: banner }).then((response) => {
      resolve(response);
    });
  });
};

const addToCart = (proId, user, limit, price) => {
  proObj = {
    item: proId,
    quantity: 1,
    status: "placed",
    price: price,
  };
  return new Promise(async (resolve, reject) => {
    let productDetails = await db.product.findOne({ _id: proId });
    db.cart
      .aggregate([
        { $match: { user: user } },
        {
          $unwind: "$cartProducts",
        },
        {
          $project: {
            item: "$cartProducts.item",
            quantity: "$cartProducts.quantity",
            price: "$cartProducts.price",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            price: 1,
          },
        },
      ])
      .then((response) => {});
    let userCart = await db.cart.findOne({ user: user });
    if (userCart) {
      let proExist = userCart.cartProducts.findIndex(
        (cartProducts) => cartProducts.item == proId
      );
      if (proExist != -1 && limit > 0) {
        db.cart
          .updateOne(
            { user: user, "cartProducts.item": proId },

            {
              $inc: {
                "cartProducts.$.quantity": 1,
                "cartProducts.$.price": price,
              },
            }
          )
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        if (proExist == -1) {
          db.cart
            .updateOne(
              { user: user },
              {
                $push: {
                  cartProducts: proObj,
                },
              }
            )
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        }
      }
    } else {
      let cartObj = {
        user: user,
        cartProducts: [proObj],
      };
      const cart = await db.cart(cartObj);
      await cart
        .save()
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

const addToWishlist = (proId, user) => {
  proObj = {
    item: proId,
  };
  return new Promise(async (resolve, reject) => {
    let userWishlist = await db.wishlist.findOne({ user: user });
    if (userWishlist) {
      let proExist = userWishlist.products.findIndex(
        (products) => products.item == proId
      );
      if (proExist != -1) {
        response.status = false;
        resolve(response);
      } else {
        db.wishlist
          .updateOne(
            { user: user },
            {
              $push: {
                products: proObj,
              },
            }
          )
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      }
    } else {
      let cartObj = {
        user: user,
        products: [proObj],
      };
      const wishlist = await db.wishlist(cartObj);
      await wishlist
        .save()
        .then((wish) => {
          resolve(wish);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

const getWishProducts = (userId) => {
  return new Promise(async (resolve, reject) => {
    await db.wishlist
      .aggregate([
        {
          $match: { user: ObjectID(userId) },
        },
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "products.item",
            foreignField: "_id",
            as: "output",
          },
        },
        {
          $unwind: {
            path: "$output",
          },
        },
        {
          $group: {
            _id: "$_id",
            output: {
              $addToSet: "$output",
            },
          },
        },
      ])
      .then((respo) => {
        resolve(respo);
      });
  });
};

const getWishCount = (userId) => {
  return new Promise(async (resolve, reject) => {
    let count = 0;
    let wish = await db.wishlist.findOne({ user: ObjectID(userId) });
    if (wish) {
      count = wish.products.length;
    }
    resolve(count);
  });
};

const removeFromWishlist = (uId, prodId) => {
  return new Promise(async (resolve, reject) => {
    db.wishlist
      .updateOne(
        { user: ObjectID(uId) },
        {
          $pull: {
            products: { item: ObjectID(prodId) },
          },
        }
      )
      .then((response) => {
        resolve(response);
      });
  });
};

const getCartProducts = (user) => {
  let userId = user._id;

  return new Promise((resolve, reject) => {
    db.cart
      .aggregate([
        {
          $match: { user: ObjectID(userId) },
        },
        {
          $unwind: "$cartProducts",
        },
        {
          $project: {
            item: "$cartProducts.item",
            quantity: "$cartProducts.quantity",
            status: "$cartProducts.status",
            price: "$cartProducts.price",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "cartItems",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            status: 1,
            price: 1,
            Product: { $arrayElemAt: ["$cartItems", 0] },
          },
        },
      ])
      .then((cartItems) => {
        resolve(cartItems);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getCartCount = async (userId) => {
  return new Promise(async (resolve, reject) => {
    let count = 0;
    let cart = await db.cart.findOne({ user: userId });
    if (cart) {
      count = cart.cartProducts.length;
    }
    resolve(count);
  }).catch((err) => {
    reject(err);
  });
};

const wishlistCount = async (userId) => {
  return new Promise(async (resolve, reject) => {
    let count = 0;
    let wishlistCount = await db.wishlist.findOne({ user: userId });
    if (wishlistCount) {
      count = wishlistCount.products.length;
    }
    resolve(count);
  }).catch((err) => {
    reject(err);
  });
};

const changeProductQuantity = (details) => {
  details.count = parseInt(details.count);
  details.quantity = parseInt(details.quantity);

  return new Promise((resolve, reject) => {
    if (details.count == -1 && details.quantity == 1) {
      let id = details.product;
      db.cart
        .updateOne(
          { _id: details.cart, "cartProducts.item": details.product },
          {
            $pull: { cartProducts: { item: id } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      db.cart
        .updateOne(
          { _id: details.cart, "cartProducts.item": details.product },
          {
            $inc: { "cartProducts.$.quantity": details.count },
          }
        )
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

const getTotalAmount = (userId) => {
  return new Promise((resolve, reject) => {
    let total = db.cart
      .aggregate([
        {
          $match: { user: ObjectID(userId) },
        },
        {
          $unwind: "$cartProducts",
        },
        {
          $project: {
            item: "$cartProducts.item",
            quantity: "$cartProducts.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "cartItems",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            Product: { $arrayElemAt: ["$cartItems", 0] },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                   "$quantity","$Product.price" ],
              },
            },
          },
        },
      ])
      .then((total) => {
        resolve(total[0]?.total);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const placeOrder = (order, products, total, user, productArray) => {
  return new Promise(async (resolve, reject) => {
    let userId = user;
    let status =
      order.paymentMethod === "Cash on Delivery" ? "placed" : "placed";
    let Details = {
      state: order.state,
      city: order.city,
      mobile: order.contactNumber,
      address: order.address,
      pincode: order.pin,
      name: order.name,
    };

    let orderObj = {
      date: new Date().toISOString(),
      orderDate: moment().format("YYYY-MM-D"),
      orderMonth: moment().format("YYYY-MM"),
      orderYear: moment().format("YYYY"),
      user: userId,
      totalAmount: total,
      status: status,
      user: userId,
      paymentMethod: order.paymentMethod,
      products: products,
      deliveryDetails: [Details],
    };
    if (order.couponName) {
      let USERID = {
        userId: user,
      };
      await db.coupan.updateOne(
        { coupanId: order.couponName },
        {
          $push: {
            userData: [USERID],
          },
        }
      );
    }

    db.order(orderObj)
      .save()
      .then((orderDetails) => {
        db.cart.deleteOne({ user: user._id }).then(() => {});
        for (i = 0; i < products.length; i++) {
          db.product
            .updateOne(
              { _id: ObjectID(products[i].item) },
              {
                $set: {
                  stock: productArray[i] - products[i].quantity,
                },
              }
            )
            .then((response) => {});
        }
        resolve(orderDetails);
      });
  });
};

const getUserOrders = (user, pageNum, docCount, perPage) => {
  return new Promise(async (resolve, reject) => {
    4;
    let docCount;
    await db.order
      .find({ user: user._id })
      .sort({ $natural: -1 })
      .then((orders) => {
        orders.docCount = docCount;
        resolve(orders);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const deleteOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    db.order
      .deleteOne({ _id: orderId })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getOrderProducts = (orderId) => {
  return new Promise((resolve, reject) => {
    db.order
      .aggregate([
        {
          $match: { _id: ObjectID(orderId) },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
            status: "$products.status",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "products",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            status: 1,
            Products: { $arrayElemAt: ["$products", 0] },
          },
        },
      ])
      .then((orderDetails) => {
        resolve(orderDetails);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const conertRate = (totalinr) => {
  let fromCurrency = "INR";
  let toCurrency = "USD";
  let amountToConvert = totalinr;
  let currencyConverter = new CC({
    from: fromCurrency,
    to: toCurrency,
    amount: amountToConvert,
  });
  return new Promise(async (resolve, reject) => {
    await currencyConverter
      .convert()
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const generatePayPal = (orderId, totalPrice) => {
  return new Promise((resolve, reject) => {
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://evara.ga/order-success",
        cancel_url: "http://evara.ga//cancel-payment",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Red Sox Hat",
                sku: "001",
                price: totalPrice,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: totalPrice,
          },
          description: "Hat for the best team ever",
        },
      ],
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        resolve(payment);
      }
    });
  });
};

const generateRazorpay = (orderId, total) => {
  return new Promise((resolve, reject) => {
    var options = {
      amount: total * 100,
      currency: "INR",
      receipt: "" + orderId,
    };

    instance.orders.create(options, (err, order) => {
      if (err) {
        console.log("error=>", err);
      } else {
        resolve(order);
      }
    });
  });
};

const walletPayment = (uId, oId) => {
  return new Promise(async (resolve, reject) => {
    let order = await db.order.findOne({ _id: ObjectID(oId) });

    await db.order.updateOne(
      { _id: ObjectID(oId) },
      {
        $set: {
          status: "placed",
        },
      }
    );
    let uDet = await db.users.findOne({ _id: ObjectID(uId) });
    let uWallet = parseInt(uDet.wallet);

    await db.users
      .updateOne(
        { _id: ObjectID(uId) },
        {
          $set: {
            wallet: uWallet - order.totalAmount,
          },
        }
      )
      .then((response) => {
        resolve(response);
      });
  });
};

const verifyPayment = (details) => {
  return new Promise((resolve, reject) => {
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "eyVKi376gF3mxfs1nLwWWmwf");
    hmac.update(
      details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
    );
    hmac = hmac.digest("hex");
    if (hmac == details["payment[razorpay_signature]"]) {
      resolve();
    } else {
      reject();
    }
  });
};

const changePaymentStatus = (orderId) => {
  return new Promise(async (resolve, reject) => {
    await db.order.findOne({ _id: ObjectID(orderId) }).then((response) => {});
    db.order
      .updateOne(
        { _id: ObjectID(orderId) },
        {
          $set: {
            status: "placed",
          },
        }
      )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const addAddress = (address, user) => {
  return new Promise(async (resolve, reject) => {
    let Address = {
      name: address.name,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
      email: address.email,
    };

    db.users
      .updateOne(
        { _id: ObjectID(user._id) },

        {
          $push: {
            userAddress: Address,
          },
        }
      )
      .then((response) => {})
      .catch((err) => {
        console.log("err=>", err);
      });
  });
};

const getUser = (user) => {
  return new Promise(async (resolve, reject) => {
    await db.users.findOne({ _id: ObjectID(user._id) }).then((response) => {
      resolve(response);
    });
  });
};

const deleteAddress = (user, id) => {
  return new Promise(async (resolve, reject) => {
    await db.users
      .updateOne(
        { _id: user._id },
        {
          $pull: { userAddress: { _id: id } },
        }
      )
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const deleteCartProduct = (proId, user) => {
  return new Promise((resolve, reject) => {
    db.cart
      .updateOne(
        { user: user._id },
        {
          $pull: { cartProducts: { item: proId } },
        }
      )
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const deleteOrderProduct = (body, stat) => {
  let orderId = body.orderId;
  let proId = body.proId;
  return new Promise((resolve, reject) => {
    db.order
      .updateOne(
        {
          _id: ObjectID(orderId.trim()),
          "products.item": ObjectID(proId.trim()),
        },
        {
          $set: { "products.$.status": stat },
        }
      )
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateDetails = async (body, user) => {
  let passw = await bcrypt.hash(body.password, 10);
  return new Promise(async (resolve, reject) => {
    db.users
      .updateOne(
        { _id: ObjectID(user._id) },
        {
          $set: {
            name: body.name,
            phoneNumber: body.phone,
            email: body.email,
            password: passw,
          },
        }
      )
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const editAddress = (user, adId) => {
  return new Promise((resolve, reject) => {
    db.users
      .aggregate([
        {
          $match: { _id: ObjectID(user._id) },
        },
        {
          $unwind: "$userAddress",
        },
        {
          $project: {
            name: "$userAddress.name",
            addressLine: "$userAddress.addressLine",
            city: "$userAddress.city",
            state: "$userAddress.state",
            zipCode: "$userAddress.zipCode",
            phone: "$userAddress.phone",
            email: "$userAddress.email",
            _id: "$userAddress._id",
          },
        },
        {
          $project: {
            name: 1,
            addressLine: 1,
            city: 1,
            state: 1,
            zipCode: 1,
            phone: 1,
            email: 1,
            _id: 1,
          },
        },
        {
          $match: { _id: ObjectID(adId) },
        },
      ])
      .then((orderDetails) => {
        resolve(orderDetails);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateAddress = async (userDetails, user) => {
  let id = userDetails.addressId;
  return new Promise((resolve, reject) => {
    db.users
      .updateOne(
        { _id: ObjectID(user._id), "userAddress._id": ObjectID(id.trim()) },
        {
          $set: {
            "userAddress.$.name": userDetails.name,
            "userAddress.$.addressLine": userDetails.addressLine,
            "userAddress.$.city": userDetails.city,
            "userAddress.$.state": userDetails.state,
            "userAddress.$.zipCode": userDetails.zipCode,
            "userAddress.$.phone": userDetails.phone,
            "userAddress.$.email": userDetails.email,
          },
        }
      )
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const visitors = async () => {
  let date = new Date().getDate();
  let visitors = await db.Visitor.findOne({ name: "localhost" + date });
  if (visitors == null) {
    const beginCount = new db.Visitor({
      name: "localhost" + date,
      count: 1,
      date: date,
    });
    beginCount.save();
  } else {
    visitors.count += 1;
    visitors.save();
  }
};

const orderCount = async () => {
  let date = new Date().getDate();
  let visitors = await db.orderCount.findOne({ name: "localhost" + date });
  if (visitors == null) {
    const beginCount = new db.orderCount({
      name: "localhost" + date,
      count: 1,
      date: date,
    });
    beginCount.save();
  } else {
    visitors.count += 1;
    visitors.save();
  }
};

const findUser = (user) => {
  let userId = user?._id;
  return new Promise(async (resolve, reject) => {
    await db.users.findOne({ _id: ObjectID(userId) }).then((userData) => {
      resolve(userData);
    });
  });
};

const getProducts = (proId) => {
  return new Promise(async (resolve, reject) => {
    await db.product.findOne({ _id: ObjectID(proId) }).then((response) => {
      resolve(response);
    });
  });
};

const changeStock = (body, productDetails) => {
  let orderId = body.orderId;
  body.quantity = parseInt(body.quantity);
  return new Promise(async (resolve, reject) => {
    db.product
      .updateOne(
        { _id: ObjectID(body.proId) },
        {
          $set: {
            stock: productDetails.stock + body.quantity,
          },
        }
      )
      .then((response) => {
        resolve(response);
      });
  });
};

const changeStatus = (body) => {
  let orderId = body.orderId.trim();
  let proId = body.proId;
  return new Promise(async (resolve, reject) => {
    await db.order.findOne({ _id: ObjectID(orderId) }).then((response) => {});
    db.order
      .updateOne(
        {
          _id: ObjectID(orderId.trim()),
          "products.item": ObjectID(proId.trim()),
        },
        {
          $set: { "products.$.status": "return" },
        }
      )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getUserCart = (user, id) => {
  return new Promise(async (resolve, reject) => {
    db.cart
      .aggregate([
        {
          $match: { user: ObjectID(user?._id) },
        },
        {
          $unwind: "$cartProducts",
        },
        {
          $project: {
            limit: "$cartProducts.quantity",
            item: "$cartProducts.item",
          },
        },
        {
          $match: { item: ObjectID(id) },
        },
      ])
      .then((response) => {
        resolve(response);
      });
  });
};

const applyCoupon = (details, userId, date, totalAmount) => {
  return new Promise(async (resolve, reject) => {
    let response = {};

    let coupon = await db.coupan.findOne({ coupanId: details.coupon });
    if (coupon) {
      const expDate = new Date(coupon.expiryDate);

      response.couponData = coupon;

      let userFound = await db.coupan.findOne({
        coupanId: details.coupon,
        userData: { $elemMatch: { userId: userId } },
      });
      if (userFound) {
        response.used = "Coupon Already Applied";
        resolve(response);
      } else {
        if (date <= expDate) {
          response.dateValid = true;
          resolve(response);
          let total = totalAmount;
          if (total >= coupon.price) {
            response.verifyMinAmount = true;
            resolve(response);

            if (total <= coupon.max) {
              response.verifyMaxAmount = true;
              resolve(response);
            } else {
              response.maxAmountMsg =
                "Your Maximum Purchase should be " + coupon.max;
              response.maxAmount = true;
              resolve(response);
            }
          } else {
            response.minAmountMsg =
              "Your Minimum purchase should be " + coupon.price;
            response.minAmount = true;
            resolve(response);
          }
        } else {
          response.invalidDateMsg = "Coupon Expired";
          response.invalidDate = true;
          response.Coupenused = false;
          resolve(response);
        }
      }
    } else {
      response.invalidCoupon = true;
      response.invalidCouponMsg = "Invalid Coupon";
      resolve(response);
    }

    if (
      response.dateValid &&
      response.verifyMaxAmount &&
      response.verifyMinAmount
    ) {
      response.verify = true;
      db.cart
        .updateOne(
          { user: ObjectID(userId) },
          {
            $set: {
              coupon: ObjectID(coupon._id),
            },
          }
        )
        .then((response) => {});
      resolve(response);
    }
  });
};

const couponVerify = (user) => {
  return new Promise(async (resolve, reject) => {
    let userCart = await db.cart.findOne({ user: ObjectID(user) });

    if (userCart?.coupon) {
      let couponData = await db.coupan.findOne({
        _id: ObjectID(userCart.coupon),
      });
      resolve(couponData);
    }
    resolve(userCart);
  });
};

const getCategory = (catName) => {
  return new Promise(async (resolve, reject) => {
    await db.product.findOne({ category: catName }).then((response) => {
      resolve(response);
    });
  });
};

const catCount = () => {
  return new Promise(async (resolve, reject) => {
    let category = await db.category.find().then((response) => {
      resolve(response);
    });
  });
};

module.exports = {
  userSignup,
  userLogin,
  userProduct,
  landingPage,
  addToCart,
  getCartProducts,
  getCartCount,
  changeProductQuantity,
  getTotalAmount,
  placeOrder,
  getUserOrders,
  deleteOrder,
  getOrderProducts,
  generateRazorpay,
  verifyPayment,
  changePaymentStatus,
  addAddress,
  getUser,
  deleteAddress,
  deleteCartProduct,
  deleteOrderProduct,
  updateDetails,
  editAddress,
  updateAddress,
  visitors,
  generatePayPal,
  conertRate,
  orderCount,
  findUser,
  getProducts,
  changeStock,
  getUserCart,
  getBanner,
  applyCoupon,
  couponVerify,
  userCategory,
  getCategory,
  catCount,
  getProdId,
  addToWishlist,
  getWishProducts,
  getWishCount,
  removeFromWishlist,
  wishlistCount,
  walletPayment,
  changeStatus,
};
