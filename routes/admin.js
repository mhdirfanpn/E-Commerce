var express = require("express");
const { Db } = require("mongodb");
var router = express.Router();
var adminController = require("../controller/adminController");
var db = require("../Model/connection");

//verify login

// const  = (req, res, next) => {
//   if (req.session.admin) {
//     next();
//   } else {
//     res.redirect("/admin/logout");
//   }
// };

router.get("/", adminController.loginPage);

router.post("/login", adminController.adminLogin);

router.get("/logout", adminController.logout);

//user

router.get("/users-list", adminController.userList);

router.get("/block-user/:id", adminController.blockUser);

router.get("/unblock-user/:id", adminController.unBlockUser);

//product

router.get("/products-list", adminController.productList);

router.get("/add-product", adminController.productForm);

router.post("/add-product", adminController.addProduct);

router.get("/delete-product/:id", adminController.deleteProduct);

router.get("/edit-product/:id", adminController.getProduct);

router.post("/edit-product/:id", adminController.updateProduct);

//category

router.get("/product-category", adminController.categories);

router.post("/add-category", adminController.addCategory);

router.get("/delete-category/:id", adminController.deleteCategory);

router.get("/edit-category/:id", adminController.getCategory);

router.post("/edit-category/:id", adminController.updateCategory);

//orders

router.get("/order-list", adminController.userOrders);

router.get("/order-details/:id", adminController.getOrderProducts);

router.post("/change-status", adminController.changeStatus);

router.post("/approve-refund", adminController.approveRefund);

//charts

router.get("/test", adminController.dailyRevenue);

router.get("/test1", adminController.getVisitorGraph);

router.get("/test2", adminController.orderCount);

router.get("/test3", adminController.paymentMethod);

//banner

router.get("/banner", adminController.banner);

router.get("/add-banner", adminController.addBanner);

router.post("/add-banner", adminController.updateBanner);

router.post("/edit-banner/:id", adminController.editBanner);

router.get("/getBanner/:id", adminController.getBanner);

router.get("/deleteBanner/:id", adminController.deleteBanner);

//coupan

router.get("/coupan", adminController.getCoupan);

router.get("/coupan-form", adminController.coupanForm);

router.post("/add-coupan", adminController.addCoupan);

//offer

router.get("/viewOffer", adminController.viewOffer);

router.post(
  "/admin-addCategoryOffer",
  adminController.addCategoryOffer
);

router.get(
  "/delete-offer/:id",
  adminController.removeCategoryOffer
);

//report

router.get("/get-Report", adminController.salesReport);

router.post("/sales-rep-mon", adminController.monthlySalesReport);

router.post("/sales-rep-daily", adminController.dailySalesReport);

router.post("/sales-rep-yearly", adminController.yearlySalesReport);

router.get("/error",(req,res)=>{
  res.render("admin/error",{layout: "admin-layout"})
})

module.exports = router;
