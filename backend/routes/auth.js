const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserFileModel');

const router = express.Router();
const SALT_ROUNDS = 10;

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { lastName, firstName, patronymic, birthDate, residence, walletAddress, email, password } = req.body;

    if (!lastName || !firstName || !birthDate || !residence || !walletAddress || !email || !password) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.save({
      lastName,
      firstName,
      patronymic: patronymic || '',
      birthDate: new Date(birthDate),
      residence,
      walletAddress,
      email,
      password: hashedPassword,   // сохраняем хеш
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, lastName: newUser.lastName, firstName: newUser.firstName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: newUser.id,
        lastName: newUser.lastName,
        firstName: newUser.firstName,
        patronymic: newUser.patronymic,
        email: newUser.email,
        walletAddress: newUser.walletAddress,
        residence: newUser.residence,
        birthDate: newUser.birthDate
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Сравниваем введённый пароль с хешем из базы
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, lastName: user.lastName, firstName: user.firstName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен',
      token,
      user: {
        id: user.id,
        lastName: user.lastName,
        firstName: user.firstName,
        patronymic: user.patronymic,
        email: user.email,
        walletAddress: user.walletAddress,
        residence: user.residence,
        birthDate: user.birthDate
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;