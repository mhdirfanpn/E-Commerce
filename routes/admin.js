var express = require("express");
const { Db } = require("mongodb");
var router = express.Router();
var adminController = require("../controller/adminController");
var db = require("../Model/connection");

//verify login

const  veriLogin= (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/logout");
  }
};

router.get("/",adminController.loginPage);

router.post("/login", adminController.adminLogin);

router.get("/logout", adminController.logout);

//user

router.get("/users-list",veriLogin, adminController.userList);

router.get("/block-user/:id",veriLogin, adminController.blockUser);

router.get("/unblock-user/:id",veriLogin, adminController.unBlockUser);

//product

router.get("/products-list",veriLogin, adminController.productList);

router.get("/add-product",veriLogin, adminController.productForm);

router.post("/add-product",veriLogin, adminController.addProduct);

router.get("/delete-product/:id",veriLogin, adminController.deleteProduct);

router.get("/edit-product/:id",veriLogin, adminController.getProduct);

router.post("/edit-product/:id",veriLogin, adminController.updateProduct);

//category

router.get("/product-category",veriLogin, adminController.categories);

router.post("/add-category",veriLogin, adminController.addCategory);

router.get("/delete-category/:id",veriLogin, adminController.deleteCategory);

router.get("/edit-category/:id",veriLogin, adminController.getCategory);

router.post("/edit-category/:id",veriLogin, adminController.updateCategory);

//orders

router.get("/order-list",veriLogin, adminController.userOrders);

router.get("/order-details/:id",veriLogin, adminController.getOrderProducts);

router.post("/change-status",veriLogin, adminController.changeStatus);

router.post("/approve-refund",veriLogin, adminController.approveRefund);

//charts

router.get("/test",veriLogin, adminController.dailyRevenue);

router.get("/test1",veriLogin, adminController.getVisitorGraph);

router.get("/test2",veriLogin, adminController.orderCount);

router.get("/test3",veriLogin, adminController.paymentMethod);

//banner

router.get("/banner",veriLogin, adminController.banner);

router.get("/add-banner",veriLogin, adminController.addBanner);

router.post("/add-banner",veriLogin, adminController.updateBanner);

router.post("/edit-banner/:id",veriLogin, adminController.editBanner);

router.get("/getBanner/:id",veriLogin, adminController.getBanner);

router.get("/deleteBanner/:id",veriLogin, adminController.deleteBanner);

//coupan

router.get("/coupan",veriLogin, adminController.getCoupan);

router.get("/coupan-form",veriLogin, adminController.coupanForm);

router.post("/add-coupan",veriLogin, adminController.addCoupan);

//offer

router.get("/viewOffer",veriLogin, adminController.viewOffer);

router.post(
  "/admin-addCategoryOffer",veriLogin,
  adminController.addCategoryOffer
);

router.get(
  "/delete-offer/:id",veriLogin,
  adminController.removeCategoryOffer
);

//report

router.get("/get-Report",veriLogin, adminController.salesReport);

router.post("/sales-rep-mon",veriLogin, adminController.monthlySalesReport);

router.post("/sales-rep-daily",veriLogin, adminController.dailySalesReport);

router.post("/sales-rep-yearly",veriLogin, adminController.yearlySalesReport);

module.exports = router;
