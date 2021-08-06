const bcrpyt = require('bcrypt');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).redirect('/login');
  } catch (error) {
    const errors = validationResult(req);

    errors.array().map((error) => {
      req.flash('error', `${error.msg} <br />`);
    });

    res.status(400).redirect('/register');
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    await User.findOne({ email }, (err, user) => {
      if (user) {
        bcrpyt.compare(password, user.password, (err, same) => {
          //user sessions
          if (same) {
            req.session.userId = user._id;
            res.status(200).redirect('/users/dashboard');
          } else {
            req.flash('error', 'Your password is not correct');
            res.status(400).redirect('/login');
          }
        });
      } else {
        req.flash('error', 'User is not exist!');
        res.status(400).redirect('/login');
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.logoutUser = async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getDashboardPage = async (req, res) => {
  const user = await User.findById({ _id: req.session.userId }).populate(
    'courses'
  );
  const categories = await Category.find();

  const users = await User.find();

  const courses = await Course.find({
    teacher: req.session.userId,
  });

  res.status(200).render('dashboard', {
    pageName: 'dashboard',
    user,
    users,
    categories,
    courses,
  });
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndRemove({ _id: req.params.id });
    await Course.deleteMany({ teacher: user._id });

    req.flash('error', `${user.name} has been removed successfully`);
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
