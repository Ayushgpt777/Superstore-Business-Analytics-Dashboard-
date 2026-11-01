/**
 * User Store Utility
 * Manages user accounts stored in backend/data/users.json
 * 
 * Security Rules:
 * - NEVER store plain-text passwords.
 * - NEVER store reversible encrypted passwords.
 * - Use bcrypt with a unique salt (10 rounds) to generate secure password hashes.
 * - Store only password hashes in backend/data/users.json.
 * - Never expose password hashes in return values or API responses.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE_PATH = path.join(__dirname, '..', '..', 'data', 'users.json');

/**
 * Initializes users.json if it doesn't exist
 */
function initUserStore() {
  if (!fs.existsSync(USERS_FILE_PATH)) {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Reads all users from file
 * @returns {Array<Object>}
 */
function readUsers() {
  initUserStore();
  try {
    const raw = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[UserStore] Error reading users.json:', err.message);
    return [];
  }
}

/**
 * Writes users array to file
 * @param {Array<Object>} users
 */
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('[UserStore] Error writing users.json:', err.message);
    throw new Error('Failed to persist user credentials');
  }
}

/**
 * Sanitizes user object for client response (strips passwordHash)
 * @param {Object} user
 * @returns {Object}
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Finds user by username (case-insensitive)
 * @param {string} username
 * @returns {Object|null}
 */
function findByUsername(username) {
  if (!username) return null;
  const users = readUsers();
  const normalized = username.trim().toLowerCase();
  return users.find((u) => u.username.toLowerCase() === normalized) || null;
}

/**
 * Finds user by ID
 * @param {string} id
 * @returns {Object|null}
 */
function findById(id) {
  if (!id) return null;
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

/**
 * Creates and registers a new user with bcrypt password hashing
 * @param {Object} param0
 * @returns {Promise<Object>} Safe user object without passwordHash
 */
async function registerUser({ fullName, username, password }) {
  if (!fullName || !fullName.trim()) {
    throw new Error('Full Name is required');
  }
  if (!username || !username.trim()) {
    throw new Error('Username is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }

  const cleanUsername = username.trim();
  const cleanFullName = fullName.trim();

  if (cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const existing = findByUsername(cleanUsername);
  if (existing) {
    throw new Error(`Username '${cleanUsername}' is already taken. Please choose another.`);
  }

  // Generate bcrypt salt & hash (10 salt rounds)
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    fullName: cleanFullName,
    username: cleanUsername,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  const users = readUsers();
  users.push(newUser);
  writeUsers(users);

  console.log(`[UserStore] Registered new user: ${cleanUsername} (${cleanFullName})`);
  return sanitizeUser(newUser);
}

/**
 * Validates user credentials
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Safe user object without passwordHash
 */
async function authenticateUser(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  const user = findByUsername(username);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  return sanitizeUser(user);
}

/**
 * Updates user profile details (e.g. full name)
 * @param {string} userId
 * @param {Object} updates
 * @returns {Promise<Object>} Safe user object
 */
async function updateProfile(userId, { fullName }) {
  if (!userId) throw new Error('User ID is required');
  if (!fullName || !fullName.trim()) throw new Error('Full Name cannot be empty');

  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error('User not found');
  }

  users[index].fullName = fullName.trim();
  users[index].updatedAt = new Date().toISOString();
  writeUsers(users);

  return sanitizeUser(users[index]);
}

/**
 * Changes a user's password after verifying the current password
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<boolean>}
 */
async function changePassword(userId, currentPassword, newPassword) {
  if (!userId) throw new Error('User ID is required');
  if (!currentPassword) throw new Error('Current password is required');
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error('Current password entered is incorrect');
  }

  const saltRounds = 10;
  user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
  user.updatedAt = new Date().toISOString();
  writeUsers(users);

  return true;
}

module.exports = {
  initUserStore,
  findByUsername,
  findById,
  registerUser,
  authenticateUser,
  updateProfile,
  changePassword,
  sanitizeUser
};
