/**
 * Auth Controller
 * Handles user registration, login, logout, profile updates, and password changes.
 */

const { registerUser, authenticateUser, updateProfile: updateUserProfile, changePassword: changeUserPassword } = require('../utils/userStore');

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { fullName, username, password, confirmPassword } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match. Please verify.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const safeUser = await registerUser({ fullName, username, password });

    // Establish server-side session immediately upon registration
    req.session.user = {
      id: safeUser.id,
      fullName: safeUser.fullName,
      username: safeUser.username
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Superstore Analytics.',
      user: safeUser
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { username, password, rememberMe } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your username.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    const safeUser = await authenticateUser(username.trim(), password);

    // Configure session duration based on Remember Me
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = 2 * 60 * 60 * 1000; // 2 hours
    }

    req.session.user = {
      id: safeUser.id,
      fullName: safeUser.fullName,
      username: safeUser.username
    };

    res.status(200).json({
      success: true,
      message: 'Login successful! Redirecting to dashboard...',
      user: safeUser
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to log out.' });
    }
    res.clearCookie('superstore.sid');
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });
}

/**
 * GET /api/auth/me
 */
function getCurrentUser(req, res) {
  if (req.session && req.session.user) {
    return res.status(200).json({
      authenticated: true,
      user: req.session.user
    });
  }
  return res.status(200).json({
    authenticated: false,
    user: null
  });
}

/**
 * PUT /api/auth/profile
 */
async function updateProfile(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { fullName } = req.body;
    const updated = await updateUserProfile(req.session.user.id, { fullName });

    // Update active session
    req.session.user.fullName = updated.fullName;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/auth/password
 */
async function changePassword(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
    }

    await changeUserPassword(req.session.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword
};
