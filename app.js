var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var admin = require("firebase-admin");
var moment = require("moment");
var helmet = require("helmet");
var _ = require("lodash");
// set up session
var session = require("express-session");
var FileStore = require("session-file-store")(session);

var fireConfig = require("./config/firebaseConfig");
var schemas = require("./function/schemas");
var middleware = require("./function/middleware");
var findUser = require("./function/checkUser");

var app = express();

app.set("trust proxy", 1); // trust first proxy

var db = fireConfig.firestore();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const identityKey = "skey";
const secretKey = "neversaynever";

app.use(
  session({
    name: identityKey,
    secret: secretKey, // 用來對session id相關的cookie進行簽名
    store: new FileStore(), // 本地儲存session（文字檔案，也可以選擇其他store，比如redis的）
    saveUninitialized: false, // 是否自動儲存未初始化的會話，建議false
    resave: false, // 是否每次都重新儲存會話，建議false
    cookie: {
      maxAge: 3600 * 1000 // 有效期，單位是毫秒 1hour
      // expires: expiryDate
    }
  })
);

// 登入介面
app.post("/login", function(req, res, next) {
  var sess = req.session;
  var user = findUser(req.body.username, req.body.password);

  if (user) {
    req.session.regenerate(function(err) {
      if (err) {
        return res.json({ ret_code: 2, ret_msg: "登录失败" });
      }

      req.session.loginUser = user.name;
      req.session.nickname = user.nickname;
      res.json({ ret_code: 0, ret_msg: "登录成功" });
    });
  } else {
    res.json({ ret_code: 1, ret_msg: "账号或密码错误" });
  }
});

// 退出登入
app.get("/logout", function(req, res, next) {
  // 備註：這裡用的 session-file-store 在destroy 方法裡，並沒有銷燬cookie 所以客戶端的 cookie 還是存在，導致的問題
  // --> 退出登陸後，服務端檢測到cookie 然後去查詢對應的 session 檔案，報錯 session-file-store 本身的bug
  req.session.destroy(function(err) {
    if (err) {
      res.json({ ret_code: 2, ret_msg: "退出登入失敗" });
      return;
    }
    // req.session.loginUser = null;
    res.clearCookie(identityKey);
    res.redirect("/");
  });
});

app.get("/", async function(req, res, next) {
  var sess = req.session;
  var loginUser = sess.loginUser;
  var nickname = sess.nickname;
  var isLogined = !!loginUser;

  if (loginUser) {
    // Read data from Firebase Cloud Firestore
    const accRef = db.collection("account");
    const userDoc = await accRef.get();
    const docSnapshots = userDoc.docs;
    var datas = [];
    for (var i in docSnapshots) {
      const doc = docSnapshots[i].data();
      doc.id = docSnapshots[i].id;
      datas.push(doc);
    }

    var dataGrouped = _.groupBy(datas, function(data) {
      return data.date;
    });

    // Calculate Charles expense
    const sum = datas.reduce((acc, cur) => {
      if (cur.pay === "Charles") {
        acc += cur.price;
      }
      return acc;
    }, 0);

    // Calculate Chris expense
    const owe = datas.reduce((acc, cur) => {
      if (cur.pay === "Chris") {
        acc += cur.price;
      }
      return acc;
    }, 0);

    res.render("home", {
      isLogined: isLogined,
      user: nickname,
      result: dataGrouped,
      sum: sum,
      owe: owe
    });
  } else {
    res.render("home", { isLogined: isLogined });
  }
});

app.post("/api/add", middleware(schemas.accPOST), function(req, res, next) {
  var data = req.body;
  var total = `${data.typeSelect}${data.amount}`;

  let addDoc = db
    .collection("account")
    .doc(`${moment().unix()}_${Math.floor(Math.random() * 10000)}`)
    .set({
      date: data.date,
      item: data.text,
      pay: data.createBy,
      price: parseInt(total)
    })
    .then(ref => {
      // console.log("Added document with ID: ", ref.id);
    });
  res.json({ message: "Resource created" });
});

app.delete("/api/delete", async function(req, res, next) {
  var data = req.body;
  let deleteDoc = await db
    .collection("account")
    .doc(`${data.key}`)
    .delete();
  res.send("done");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
