const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

function isPasswordHash(password) {
    return typeof password === "string" && /^\$2[aby]\$\d{2}\$/.test(password);
}

async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, storedPassword) {
    if (!storedPassword) {
        return false;
    }

    if (isPasswordHash(storedPassword)) {
        return bcrypt.compare(password, storedPassword);
    }

    return password === storedPassword;
}

module.exports = {
    comparePassword,
    hashPassword,
    isPasswordHash
};
