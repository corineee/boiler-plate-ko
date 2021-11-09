const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; //10번 salting을 해준다.
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1, //같은 이메일이 없도록 1개만 생성
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    //유저와 관리자를 나눔
    type: Number,
    default: 0, //기본값을 0으로 설정
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

//user models을 저장하기전에 실행되는 것이다.
userSchema.pre("save", function (next) {
  //this는 위에 userSchema를 가리킨다.
  var user = this;
  //password를 바꿀 때만 bcrypt를 이용해 암호화 해준다.
  if (user.isModified("password")) {
    //비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err); //err가 나면 index.js의 user.save로 돌려보낸다.
        user.password = hash; //plain password를 hashing해준다.
        next();
      });
    });
  } else {
    next(); //다른 것을 변경했을 때 next를 넣어줘야 넘어간다.
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword 1234567 암호화된 비밀번호 ~~
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err), cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;

  // jsonwebtoken을 이용해서 token을 생성하기
  var token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
