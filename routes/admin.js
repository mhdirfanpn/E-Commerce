var express = require("express");
const { Db } = require("mongodb");
var router = express.Router();
var adminController = require("../controller/adminController");
var db = require("../Model/connection");

//verify login

const verifiLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/logout");
  }
};

router.get("/", adminController.loginPage);

router.post("/login", adminController.adminLogin);

router.get("/logout", adminController.logout);

//user

router.get("/users-list", adminController.userList);

router.get("/block-user/:id", verifiLogin, adminController.blockUser);

router.get("/unblock-user/:id", verifiLogin, adminController.unBlockUser);

//product

router.get("/products-list", verifiLogin, adminController.productList);

router.get("/add-product", verifiLogin, adminController.productForm);

router.post("/add-product", verifiLogin, adminController.addProduct);

router.get("/delete-product/:id", verifiLogin, adminController.deleteProduct);

router.get("/edit-product/:id", verifiLogin, adminController.getProduct);

router.post("/edit-product/:id", verifiLogin, adminController.updateProduct);

//category

router.get("/product-category", verifiLogin, adminController.categories);

router.post("/add-category", verifiLogin, adminController.addCategory);

router.get("/delete-category/:id", verifiLogin, adminController.deleteCategory);

router.get("/edit-category/:id", verifiLogin, adminController.getCategory);

router.post("/edit-category/:id", verifiLogin, adminController.updateCategory);

//orders

router.get("/order-list", verifiLogin, adminController.userOrders);

router.get("/order-details/:id", verifiLogin, adminController.getOrderProducts);

router.post("/change-status", verifiLogin, adminController.changeStatus);

router.post("/approve-refund", verifiLogin, adminController.approveRefund);

//charts

router.get("/test", verifiLogin, adminController.dailyRevenue);

router.get("/test1", verifiLogin, adminController.getVisitorGraph);

router.get("/test2", verifiLogin, adminController.orderCount);

router.get("/test3", verifiLogin, adminController.paymentMethod);

//banner

router.get("/banner", verifiLogin, adminController.banner);

router.get("/add-banner", verifiLogin, adminController.addBanner);

router.post("/add-banner", verifiLogin, adminController.updateBanner);

router.post("/edit-banner/:id", verifiLogin, adminController.editBanner);

router.get("/getBanner/:id", verifiLogin, adminController.getBanner);

router.get("/deleteBanner/:id", verifiLogin, adminController.deleteBanner);

//coupan

router.get("/coupan", verifiLogin, adminController.getCoupan);

router.get("/coupan-form", verifiLogin, adminController.coupanForm);

router.post("/add-coupan", verifiLogin, adminController.addCoupan);

//offer

router.get("/viewOffer", verifiLogin, adminController.viewOffer);

router.post(
  "/admin-addCategoryOffer",
  verifiLogin,
  adminController.addCategoryOffer
);

router.get(
  "/delete-offer/:id",
  verifiLogin,
  adminController.removeCategoryOffer
);

//report

router.get("/get-Report", verifiLogin, adminController.salesReport);

router.post("/sales-rep-mon", adminController.monthlySalesReport);

router.post("/sales-rep-daily", adminController.dailySalesReport);

router.post("/sales-rep-yearly", adminController.yearlySalesReport);

router.get("/error",(req,res)=>{
  res.render("admin/error",{layout: "admin-layout"})
})

module.exports = router;
