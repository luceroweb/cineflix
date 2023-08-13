const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("./../Utils/CustomError");
const util = require("util");
const sendEmail = require("./../Utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email & password is present in request body
  if (!email || !password) {
    const error = new CustomError(
      "Please prove your email ID and pasword to login!",
      400
    );
    return next(error);
  }

  //Check if user exists with given email
  const user = await User.findOne({ email }).select("+password");

  //Check if the user isists & password matches
  if (
    !user ||
    !(await await user.comparePasswordInDb(password, user.password))
  ) {
    const error = new CustomError("Incorrect email or password", 400);
    return next(error);
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
  //1. Read the token & check if it exists
  const testToken = req.headers.authorization;
  let token;

  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(new CustomError("You are not logged in!", 401));
  }

  //2. validate the token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );

  //3. Check if the user exists
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const error = new CustomError(
      "The user with the given token does not exists.",
      401
    );
    next(error);
  }

  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);

  //4. If the user changed password after the token was issued
  if (isPasswordChanged) {
    const error = new CustomError(
      "The password has been changed recently. Please login again.",
      401
    );
    return next(error);
  }

  //5. Allow user to access route
  req.user = user;
  next();
});

exports.restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new CustomError(
        "You do not have permission to peform this action",
        403
      );
      next(error);
    }
    next();
  };
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  //1. GER USER BASED ON POSTED EMAIL
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new CustomError(
      "We could not find the user with given email.",
      404
    );
    next(error);
  }

  //2. GENERATE A RANDOM RESET TOKEN
  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //3. SEND THE TOKEN BACK TO THE USER EMAIL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Cineflix have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid for only 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Cineflix password change request recived",
      message,
    });

    res.status(200).json({
      status: "success",
      message: `Password reset link send to the user's email address`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new CustomError(
        "There was an error sending password reset email. Please try again later.",
        500
      )
    );
  }

  next();
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  //1. IF THE USER EXISTS WITH THE GIVEN TOKEN & TOKEN HAS NOT EXPIRED
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError("Token is invalid or has expired!", 400);
    next(error);
  }

  //2. RESET THE USER'S PASSWORD
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();

  user.save();

  //3. LOGIN THE USER
  const loginToken = signToken(user._id);

  res.status(200).json({
    status: "success",
    token: loginToken,
  });

  next();
});
