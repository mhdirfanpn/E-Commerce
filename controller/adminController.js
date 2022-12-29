const db = require("../Model/connection");
const { ObjectID } = require("bson");
const adminHelpers = require("../helpers/adminHelpers");
const FaxResponse = require("twilio/lib/twiml/FaxResponse");
const { category } = require("../Model/connection");

const loginPage = async (req, res) => {
  try {
    let adminIn = req.session.admin;
    if (adminIn) {
      res.header("cache-control", "private,no-cache,no-store,must revalidate");
      let orders = await adminHelpers.userOrders();
      let totalAmount = await adminHelpers.totalAmount();
      let category = await adminHelpers.categories();
      let products = await adminHelpers.productDetails();
      let dayr = await adminHelpers.dailyRevenue();
      res.render("admin/index", {
        adminIn,
        layout: "admin-layout",
        totalAmount,
        orders,
        category,
        products,
        dayr,
      });
    } else {
      res.render("admin/admin-login", { layout: "admin-layout", nav: true });
    }
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const adminLogin = (req, res) => {
  try {
    let adminData = req.body;
    adminHelpers.adminLogin(adminData).then((response) => {
      if (adminData.password == response.password) {
        req.session.adminLogin = true;
        req.session.admin = response;
        res.redirect("/admin");
      } else {
        res.redirect("/admin");
      }
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.send(err);
      } else {
        res.redirect("/admin");
      }
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const productPage = (req, res) => {
  try {
    res.redirect("/users-list", { layout: "admin-layout" });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const updateCategory = (req, res) => {
  try {
    adminHelpers.updateCategory(req.params.id, req.body).then((response) => {
      let image = req.files;
      let prodId = req.params.id;
      req.files?.categoryImage?.mv(
        "./public/category-images/" + prodId + ".jpg",
        (err, done) => {
          if (!err) {
            console.log("product updated");
          } else {
            console.log(err);
          }
        }
      );
      res.redirect("/admin/product-category");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const userList = (req, res) => {
  try {
  console.log('hello');
    adminHelpers.userList().then((userDetails) => {
    
      res.render("admin/user-list", {
        layout: "admin-layout",userDetails,
      });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const productList = async (req, res) => {
  
    // let docCount;
    // const perPage = 10;
    // const pageNum = req.query.page;
    let productDetails = await adminHelpers.productList(
      // pageNum,
      // docCount,
      // perPage
    );
    res.render("admin/product-list", {
      layout: "admin-layout",
      productDetails,
      // currentPage: pageNum,
      // totalDocuments: productDetails.docCount,
      // pages: Math.ceil(productDetails.docCount / perPage),
    });
};

const productForm = (req, res) => {
  try {
    adminHelpers.productForm().then((category) => {
      res.render("admin/add-products", { category, layout: "admin-layout" });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const addProduct = async (req, res) => {
  try {
    req.body.Oprice = req.body.price;
    adminHelpers.addProduct(req.body).then((response) => {
      let imageName = response._id;
      req.files?.Image1?.mv("./public/productImages/" + imageName + "0.jpg");
      req.files?.Image2?.mv("./public/productImages/" + imageName + "1.jpg");
      req.files?.Image3?.mv("./public/productImages/" + imageName + "2.jpg");
      req.files?.Image4?.mv("./public/productImages/" + imageName + "3.jpg");
      res.redirect("/admin/products-list");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const deleteProduct = (req, res) => {
  try {
    adminHelpers.deleteProduct(req.params.id).then((response) => {
      res.redirect("/admin/products-list");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const getProduct = async (req, res) => {
  try {
    let categories = await adminHelpers.categories();
    adminHelpers.getProduct(req.params.id).then((product) => {
      res.render("admin/edit-product", {
        product,
        categories,
        layout: "admin-layout",
      });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const updateProduct = (req, res) => {
  try {
    let imageName = req.params.id;
    adminHelpers.updateProduct(req.params.id, req.body).then((response) => {
      req.files?.Image1?.mv("./public/productImages/" + imageName + "0.jpg");
      req.files?.Image2?.mv("./public/productImages/" + imageName + "1.jpg");
      req.files?.Image3?.mv("./public/productImages/" + imageName + "2.jpg");
      req.files?.Image4?.mv("./public/productImages/" + imageName + "3.jpg");
      res.redirect("/admin/products-list");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const blockUser = (req, res) => {
  try {
    adminHelpers.blockUser(req.params.id).then((response) => {
      res.redirect("/admin/users-list");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const unBlockUser = (req, res) => {
  try {
    adminHelpers.unBlockUser(req.params.id).then((response) => {
      res.redirect("/admin/users-list");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const categories = (req, res) => {
  try {
    adminHelpers.categories().then((categoryDetails) => {
      res.render("admin/product-category", {
        categoryDetails,
        layout: "admin-layout",
      });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const addCategory = (req, res) => {
  try {
    adminHelpers.addCategory(req.body).then((response) => {
      let image = req.files?.categoryImage;
      let id = response._id;
      image.mv("./public/category-images/" + id + ".jpg", (err, done) => {
        if (!err) {
          res.redirect("/admin/product-category");
        } else {
          console.log("error=>", err);
        }
      });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const deleteCategory = (req, res) => {
  try {
    adminHelpers.deleteCategory(req.params.id).then((response) => {
      res.redirect("/admin/product-category");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const getCategory = (req, res) => {
  try {
    adminHelpers.getCategory(req.params.id).then((category) => {
      res.render("admin/edit-category", { category, layout: "admin-layout" });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const userOrders = (req, res) => {
  try {
    let docCount;
    const perPage = 10;
    const pageNum = req.query.page;
    adminHelpers.userOrders(pageNum, docCount, perPage).then((order) => {
      res.render("admin/order", {
        order,
        layout: "admin-layout",
        currentPage: pageNum,
        totalDocuments: order.docCount,
        pages: Math.ceil(order.docCount / perPage),
      });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const getOrderProducts = async (req, res) => {
  try {
    let products = await adminHelpers.getOrderProducts(req.params.id);
    let orderDetails = await db.order.findOne({ _id: req.params.id });
    res.render("admin/order-products", {
      products,
      orderDetails,
      layout: "admin-layout",
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const changeStatus = (req, res) => {
  try {
    adminHelpers.changeStatus(req.body).then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const approveRefund = (req, res) => {
  try {
    adminHelpers.approveRefund(req.body);
    adminHelpers.refundStatus(req.body).then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const dailyRevenue = async (req, res) => {
  try {
    await adminHelpers.dailyRevenue().then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const monthlyRevenue = async (req, res) => {
  try {
    await adminHelpers.monthlyRevenue().then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const getVisitorGraph = async (req, res) => {
  try {
    await adminHelpers.getVisitorGraph().then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const orderCount = async (req, res) => {
  try {
    await adminHelpers.orderCount().then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const paymentMethod = async (req, res) => {
  try {
    await adminHelpers.paymentMethod().then((response) => {
      res.json(response);
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const banner = (req, res) => {
  try {
    adminHelpers.banners().then((banner) => {
      res.render("admin/banner", {
        banner,
        layout: "admin-layout",
      });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const addBanner = (req, res) => {
  try {
    adminHelpers.productForm().then((category) => {
      res.render("admin/addbanner", { category, layout: "admin-layout" });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const updateBanner = (req, res) => {
  try {
    adminHelpers.addBanner(req.body).then((response) => {
      let image = req.files?.Image;
      let id = response?._id;
      image.mv("./public/addBanner/" + id + ".jpg", (err, done) => {
        if (!err) {
          res.redirect("/admin/banner");
        } else {
          console.log("error=>", err);
          res.render("admin/error",{layout: "admin-layout"})
        }
      });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const getBanner = async (req, res) => {
  try {
    let category = await adminHelpers.categories();
    adminHelpers.getBanner(req.params.id).then((bannerDetails) => {
      res.render("admin/edit-banner", {
        bannerDetails,
        category,
        layout: "admin-layout",
      });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const editBanner = (req, res) => {
  try {
    let imageName = req.params.id;
    adminHelpers.editBanner(req.params.id, req.body).then((response) => {
      req.files?.Image?.mv("./public/addBanner/" + imageName + ".jpg");
      res.redirect("/admin/banner");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const deleteBanner = (req, res) => {
  try {
    adminHelpers.deleteBanner(req.params.id).then((response) => {
      res.redirect("/admin/banner");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const getCoupan = (req, res) => {
  try {
    adminHelpers.getCoupan().then((coupan) => {
      res.render("admin/coupan-list", { layout: "admin-layout", coupan });
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const coupanForm = (req, res) => {
  try {
    res.render("admin/coupan-form", { layout: "admin-layout" });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const addCoupan = (req, res) => {
  try {
    adminHelpers.addCoupan(req.body).then((response) => {
      res.redirect("/admin/coupan");
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
};

const salesReport = (req, res) => {
  try {
    res.render("admin/selectReportPeriod", {
      layout: "admin-layout",
      result: 0,
      startMon: 0,
      endMon: 0,
      startDate: 0,
      endDate: 0,
      date: 0,
    });
  } catch (error) {
    console.log(error);
    res.render("admin/error",{layout: "admin-layout"})
  }
 
};

const monthlySalesReport = async (req, res) => {
  try {
    let mon = req.body.month;
    let month = "2022-" + req.body.month;
  
    let result = await adminHelpers.getMonthlySalesReport(month);
    res.render("admin/selectReportPeriod", {
      layout: "admin-layout",
      result,
      mon,
      monthly: false,
      date: false,
      year: false,
    });
  } catch (error) {
    res.render("admin/error",{layout: "admin-layout"})
  }

};

const dailySalesReport = async (req, res) => {
  try {
    let startDate = req.body.start.slice(8, 10);
    let endDate = req.body.end.slice(8, 10);
    let startMon = req.body.start.slice(5, 7);
    let endMon = req.body.end.slice(5, 7);
  
    let result = await adminHelpers.getDailySalesReport(
      req.body.start,
      req.body.end
    );
  
    res.render("admin/selectReportPeriod", {
      layout: "admin-layout",
      result,
      startMon,
      endMon,
      startDate,
      endDate,
      date: true,
      monthly: true,
      mon: true,
      year: false,
    });
  } catch (error) {
    res.render("admin/error",{layout: "admin-layout"})
  }

};

const yearlySalesReport = async (req, res) => {
  try {
    let year = req.body.year;
    let result = await adminHelpers.getYearlySalesReport(year);
    res.render("admin/selectReportPeriod", {
      layout: "admin-layout",
      result,
      year,
      yearly: true,
      monthly: false,
      date: false,
    });
  } catch (error) {
    res.render("admin/error",{layout: "admin-layout"})
  }

};

const viewOffer = async (req, res) => {
  try {
    let category = await adminHelpers.categories();
    res.render("admin/viewOffer", { layout: "admin-layout", category });
  } catch (error) {
    res.render("admin/error",{layout: "admin-layout"})
  }

};

const addCategoryOffer = (req, res) => {
  try {
    console.log(req.body);
    adminHelpers.addCategoryOffer(req.body).then((category) => {
      adminHelpers.getProductForOffer(category).then((products) => {
        products.forEach((element) => {
          adminHelpers.addOfferToProduct(req.body, element);
        });
        res.redirect("/admin/viewOffer");
      });
    });
  } catch (error) {
    res.render("admin/error",{layout: "admin-layout"})
  }

};

const removeCategoryOffer = (req, res) => {
  try {
    let id = req.params.id;
    adminHelpers.removeCategoryOffer(id);
    res.redirect("/admin/viewOffer");
  } catch (error) {
    res.render("admin/error",{layout: "admin-layout"})
  }

};

module.exports = {
  loginPage,
  productPage,
  productList,
  logout,
  updateCategory,
  adminLogin,
  userList,
  productForm,
  addProduct,
  deleteProduct,
  getProduct,
  updateProduct,
  blockUser,
  unBlockUser,
  categories,
  addCategory,
  deleteCategory,
  getCategory,
  userOrders,
  getOrderProducts,
  changeStatus,
  dailyRevenue,
  monthlyRevenue,
  getVisitorGraph,
  orderCount,
  paymentMethod,
  banner,
  addBanner,
  updateBanner,
  deleteBanner,
  getCoupan,
  coupanForm,
  addCoupan,
  getBanner,
  editBanner,
  approveRefund,
  salesReport,
  monthlySalesReport,
  dailySalesReport,
  yearlySalesReport,
  viewOffer,
  addCategoryOffer,
  removeCategoryOffer,
};
