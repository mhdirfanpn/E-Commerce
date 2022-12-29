const { MongoGridFSChunkError, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const db = mongoose.createConnection("mongodb://localhost:27017/Evara");

db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  console.log("dataBase Connected");
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: Number,
  password: String,
  isBlocked: Boolean,
  wallet:Number,
  userAddress: [
    {
      name: String,
      addressLine: String,
      city: String,
      state: String,
      zipCode: String,
      phone: String,
      email: String,
    },
  ],
});

const adminSchema = new mongoose.Schema({
  email: String,
  password: Number,
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  Oprice:Number,
  price: Number,
  category: String,
  cat:String,
  date: String,
  stock:Number,
  stockStatus:String,
  discountPercentage:Number,
  categoryDiscount:Number,
  offerPrice:Number,
});

const categorytSchema = new mongoose.Schema({
  name: String,
  offer:Number,
  ExpiryDate:String,
  offerApply:Boolean
});

const bannerSchema = new mongoose.Schema({
  name: String,
  description:String,
});

const cartSchema = new mongoose.Schema({
  user: mongoose.Types.ObjectId,
  cartProducts: [
    {
      item: mongoose.Types.ObjectId,
      quantity: Number,
      status: String,
      price:Number,
    },
  ],
  coupon:mongoose.Types.ObjectId,
});

const wishlistSchema = new mongoose.Schema({
  user: mongoose.Types.ObjectId,
  products: [
    {
      item: mongoose.Types.ObjectId,
    },
  ],
});

const orderSchema = new mongoose.Schema({
  user: mongoose.Types.ObjectId,
  paymentMethod: String,
  status: String,
  date: Date,
  orderDate:String,
  orderMonth:String,
  orderYear:String,
  totalAmount: Number,
  deliveryDetails: [
    {
      mobile: Number,
      address: String,
      pincode: Number,
      state: String,
      city: String,
      name: String,
    },
  ],
  products: [
    {
      item: mongoose.Types.ObjectId,
      quantity: Number,
      status: String,
      price:Number,
    },
  ],
});

const visitorSchema = new mongoose.Schema({
  name: String,
  count: Number,
  date: String,
});

const orderCountSchema = new mongoose.Schema({
  name: String,
  count: Number,
  date: String,
});

const coupanShema=new mongoose.Schema({
  coupanId: String,
  coupanName: String,
  max: Number,
  price: Number,
  expiryDate: String,
  percentage: Number,
  userData:[
    {
      userId: mongoose.Types.ObjectId,
    }
  ]
})

module.exports = {
  users: db.model("user", userSchema),
  admin: db.model("admin", adminSchema),
  product: db.model("product", productSchema),
  category: db.model("category", categorytSchema),
  cart: db.model("cart", cartSchema),
  order: db.model("order", orderSchema),
  Visitor: db.model("Visitor", visitorSchema),
  orderCount: db.model("orderCount", orderCountSchema),
  banner: db.model("banner",bannerSchema),
  coupan:db.model("coupan", coupanShema),
  wishlist:db.model("wishlist",wishlistSchema)
};
