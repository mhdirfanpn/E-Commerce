var db = require("../Model/connection");
const { ObjectID } = require("bson");
const { category } = require("../Model/connection");
const { orders } = require("@paypal/checkout-server-sdk");

const adminLogin = (adminData) => {
  return new Promise(async (resolve, reject) => {
    await db.admin
      .findOne({ email: adminData.email })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const userList = (pageNum, docCount, perPage) => {
  return new Promise(async (resolve, reject) => {
    let docCount;
    await db.users
      .find()
      .sort({ $natural: -1 })
      .countDocuments()
      .then((documents) => {
        docCount = documents;
        return db.users
          .find()
          .sort({ $natural: -1 })
          .skip((pageNum - 1) * perPage)
          .limit(perPage);
      })
      .then((response) => {
        orders.docCount = docCount;
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const productList = (pageNum, docCount, perPage) => {
  return new Promise(async (resolve, reject) => {
    let docCount;

    await db.product
      .find()
      .sort({ $natural: -1 })
      .countDocuments()
      .then((documents) => {
        docCount = documents;
        return db.product
          .find()
          .sort({ $natural: -1 })
          .skip((pageNum - 1) * perPage)
          .limit(perPage);
      })

      .then((productDetails) => {
        productDetails.docCount = docCount;
        resolve(productDetails);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const productCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    let cat = await db.category
      .findOne({ _id: ObjectID(id) })
      .then((response) => {
        resolve(response);
      });
  });
};

const addProduct = (prodDetails) => {
  const date = new Date();
  prodDetails.date = date.toDateString().slice(3);
  return new Promise((resolve, reject) => {
    db.product(prodDetails)
      .save()
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const deleteProduct = (prodId) => {
  return new Promise((resolve, reject) => {
    db.product
      .deleteOne({ _id: prodId })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getProduct = (prodId) => {
  return new Promise(async (resolve, reject) => {
    await db.product
      .findOne({ _id: ObjectID(prodId) })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

let updateProduct = (prodId, prodDetails) => {
  return new Promise((resolve, reject) => {
    db.product
      .updateOne(
        { _id: prodId },
        {
          $set: {
            name: prodDetails.name,
            description: prodDetails.description,
            price: prodDetails.price,
            category: prodDetails.category,
            stock: prodDetails.stock,
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

const blockUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await db.users
      .updateOne(
        { _id: userId },
        {
          $set: {
            isBlocked: true,
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

const unBlockUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await db.users
      .updateOne(
        { _id: userId },
        {
          $set: {
            isBlocked: false,
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

const categories = (req, res) => {
  return new Promise(async (resolve, reject) => {
    await db.category
      .find()
      .sort({ $natural: -1 })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const addCategory = (categoryDetails) => {
  return new Promise(async (resolve, reject) => {
    let category = await db.category.findOne({ name: categoryDetails.name });
    if (!category) {
      db.category(categoryDetails)
        .save()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

const deleteCategory = (catId) => {
  return new Promise((resolve, reject) => {
    db.category
      .deleteOne({ _id: catId })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getCategory = (catId) => {
  return new Promise(async (resolve, reject) => {
    await db.category
      .findOne({ _id: catId })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateCategory = (catId, categoryDetails) => {
  return new Promise((resolve, reject) => {
    db.category
      .updateOne(
        { _id: catId },
        {
          $set: {
            name: categoryDetails.name,
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

const productForm = () => {
  return new Promise(async (resolve, reject) => {
    await db.category
      .find()
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const userOrders = (pageNum, docCount, perPage) => {
  return new Promise(async (resolve, reject) => {
    let docCount;

    await db.order
      .find()
      .sort({ $natural: -1 })
      .countDocuments()
      .then((documents) => {
        docCount = documents;
        return db.order
          .find()
          .sort({ $natural: -1 })
          .skip((pageNum - 1) * perPage)
          .limit(perPage);
      })
      .then((orders) => {
        orders.docCount = docCount;
        resolve(orders);
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
            as: "product",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            status: 1,
            Product: { $arrayElemAt: ["$product", 0] },
          },
        },
      ])
      .then((orderItems) => {
        resolve(orderItems);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const changeStatus = (body) => {
  let stat = body.status;
  let id = body.id;
  let proId = body.proId;
  return new Promise(async (resolve, reject) => {
    await db.order
      .updateOne(
        { _id: ObjectID(id.trim()), "products.item": ObjectID(proId.trim()) },
        {
          $set: {
            "products.$.status": stat,
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

const refundStatus = (body) => {
  return new Promise(async (resolve, reject) => {
    await db.order
      .updateOne(
        {
          _id: ObjectID(body.orderId.trim()),
          "products.item": ObjectID(body.prodId),
        },
        {
          $set: {
            "products.$.status": body.status,
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

const approveRefund = (body) => {
  let status = "refunded";
  let orderId = body.orderId;
  let prodId = body.prodId;
  let userId = body.user;
  let price = body.price;
  let quantity = body.quantity;

  return new Promise(async (resolve, reject) => {
    let amount = parseInt(price * quantity);
    let uDet = await db.users.findOne({ _id: ObjectID(userId.trim()) });
    let uWallet = parseInt(uDet.wallet);

    await db.users
      .updateOne(
        { _id: ObjectID(userId.trim()) },
        {
          $set: {
            wallet: amount + uWallet,
          },
        }
      )
      .then((response) => {});
  });
};

const getUser = (order) => {
  return new Promise(async (resolve, reject) => {
    await db.order
      .find({ user: ObjectID("order$user".trim()) })
      .then((response) => {});
  });
};

const addBanner = (bannerDetails) => {
  return new Promise(async (resolve, reject) => {
    await db.banner.find({}).then((response) => {
      if (response) {
        db.banner.deleteOne();
      }
    });
    db.banner(bannerDetails)
      .save()
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const banners = () => {
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

const getBanner = (banId) => {
  return new Promise(async (resolve, reject) => {
    await db.banner
      .findOne({ _id: ObjectID(banId) })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

let editBanner = (banId, bannerDetails) => {
  return new Promise((resolve, reject) => {
    db.banner
      .updateOne(
        { _id: banId },
        {
          $set: {
            name: bannerDetails.name,
            description: bannerDetails.description,
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

const deleteBanner = (banId) => {
  return new Promise((resolve, reject) => {
    db.banner
      .deleteOne({ _id: banId })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const addCoupan = (coupanDetails) => {
  return new Promise((resolve, reject) => {
    db.coupan(coupanDetails)
      .save()
      .then((response) => {
        resolve(response);
      });
  });
};

const getCoupan = () => {
  return new Promise(async (resolve, reject) => {
    await db.coupan.find().then((response) => {
      resolve(response);
    });
  });
};

const getMonthlySalesReport = (month) => {
  return new Promise(async (resolve, reject) => {
    await db.order
      .aggregate([
        {
          $match: {
            orderMonth: month,
          },
        },
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $match: { "products.status": "Delivered" },
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
            _id: "$output.category",
            totalAmount: {
              $sum: "$products.price",
            },
          },
        },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
          },
        },
      ])
      .then((response) => {
        resolve(response);
      });
  });
};

const getDailySalesReport = (start, end) => {
  return new Promise(async (resolve, reject) => {
    await db.order
      .aggregate([
        {
          $match: { orderDate: { $gte: start, $lte: end } },
        },
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $match: { "products.status": "Delivered" },
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
            _id: "$output.category",
            totalAmount: {
              $sum: "$products.price",
            },
          },
        },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
          },
        },
      ])
      .then((response) => {
        resolve(response);
      });
  });
};

const getYearlySalesReport = (year) => {
  return new Promise(async (resolve, reject) => {
    let YearlyReport = await db.order.aggregate([
      {
        $match: { orderYear: year },
      },
      {
        $unwind: {
          path: "$products",
        },
      },
      {
        $match: { "products.status": "Delivered" },
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
          _id: "$output.category",
          totalAmount: {
            $sum: "$products.price",
          },
        },
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
        },
      },
    ]);

    resolve(YearlyReport);
  });
};

const addCategoryOffer = ({ category, offerPercentage, expDate }) => {
  let categoryOffer = parseInt(offerPercentage);
  offer = categoryOffer;

  return new Promise((resolve, reject) => {
    db.category
      .updateOne(
        { name: category },
        {
          $set: {
            offer: offer,
            ExpiryDate: expDate,
            offerApply: true,
          },
        },
        { upsert: true }
      )
      .then(() => {
        resolve(category);
      });
  });
};

const getProductForOffer = (category) => {
  return new Promise(async (resolve, reject) => {
    await db.product.find({ category: category }).then((products) => {
      resolve(products);
    });
  });
};

const addOfferToProduct = ({ category, offerPercentage }, product) => {
  let offerP = parseInt(offerPercentage);
  offerPercentage = offerP;
  let productPricee = parseInt(product.Oprice);
  product.price = productPricee;

  let offerPrice = Math.round((offerPercentage / 100) * product.price);
  let totalPrice = product.price - offerPrice;
  totalPrice = Math.round(totalPrice);
  return new Promise((resolve, reject) => {
    db.product
      .updateOne(
        { _id: product._id, category: category },
        {
          $set: {
            discountPercentage: offerPercentage,
            categoryDiscount: offerPrice,
            price: totalPrice,
            Oprice: product.price,
          },
        }
      )
      .then(() => {
        resolve();
      });
  });
};

const removeCategoryOffer = (catId) => {
  return new Promise(async (resolve, reject) => {
    let catDet = await db.category.findOne({ _id: ObjectID(catId) });
    let category = catDet.name;
    db.category
      .updateOne(
        { _id: ObjectID(catId) },
        {
          $unset: {
            ExpiryDate: "",
            offerApply: "",
            offer: "",
          },
        }
      )
      .then((response) => {
        db.product
          .updateMany(
            { category: category },
            {
              $unset: {
                categoryDiscount: "",
                discountPercentage: "",
                offerPrice: "",
              },
            }
          )
          .then((respo) => {
            resolve(respo);
          });
      });
  });
};

const totalAmount = () => {
  return new Promise(async (resolve, reject) => {
    await db.order
      .aggregate([
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $match: { "products.status": "Delivered" },
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

        { $group: { _id: null, sum: { $sum: "$products.price" } } },
        { $project: { _id: 0 } },
      ])
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const productDetails = () => {
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

const dailyRevenue = () => {
  return new Promise(async (resolve, reject) => {
    let sales = await db.order
      .aggregate([
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $match: { "products.status": "Delivered" },
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
            _id: { $dateToString: { format: "%d", date: "$date" } },
            totalAmount: { $sum: "$products.price" },
          },
        },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getVisitorGraph = () => {
  return new Promise(async (resolve, reject) => {
    var visit = await db.Visitor.aggregate([
      {
        $project: { date: 1, count: 1 },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ])
      .then((respo) => {
        var date = new Array();
        var total = new Array();
        for (let index = 0; index < respo.length; index++) {
          date[index] = respo[index].date;
          total[index] = respo[index].count;
        }
        resolve({ total, date });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const orderCount = () => {
  return new Promise(async (resolve, reject) => {
    var visit = await db.orderCount
      .aggregate([
        {
          $project: { date: 1, count: 1 },
        },
        {
          $sort: {
            date: 1,
          },
        },
      ])
      .then((respo) => {
        var date = new Array();
        var total = new Array();
        for (let index = 0; index < respo.length; index++) {
          date[index] = respo[index].date;
          total[index] = respo[index].count;
        }
        resolve({ total, date });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const paymentMethod = () => {
  return new Promise(async (resolve, reject) => {
    await db.order
      .aggregate([
        {
          $project: {
            paymentMethod: 1,
            _id: 0,
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            count: {
              $sum: 1,
            },
          },
        },
      ])
      .then((response) => {
        resolve(response);
      });
  });
};

module.exports = {
  adminLogin,
  userList,
  productList,
  deleteProduct,
  getProduct,
  addProduct,
  updateProduct,
  blockUser,
  unBlockUser,
  categories,
  addCategory,
  deleteCategory,
  updateCategory,
  getCategory,
  productForm,
  userOrders,
  getOrderProducts,
  changeStatus,
  getUser,
  addBanner,
  banners,
  deleteBanner,
  addCoupan,
  getCoupan,
  getBanner,
  editBanner,
  approveRefund,
  refundStatus,
  getMonthlySalesReport,
  getDailySalesReport,
  getYearlySalesReport,
  getDailySalesReport,
  productCategory,
  addCategoryOffer,
  getProductForOffer,
  addOfferToProduct,
  removeCategoryOffer,
  totalAmount,
  productDetails,
  dailyRevenue,
  getVisitorGraph,
  orderCount,
  paymentMethod,
};
