const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    deleteUserSessions
} = require(
    "../services/userSessionCleanup.service"
);

const db =
    require("../config/database");

// const fs = require("fs");
// const path = require("path");

// const sessions = require("../storage/sessions");

exports.signup = async (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;

    const [exists] =
        await db.execute(
            `
            SELECT id
            FROM users
            WHERE email = ?
               OR name = ?
            `,
            [email, name]
        );

    if (exists.length) {

        return res.status(400).json({
            success: false,
            error: "User already exists"
        });

    }

    const hash =
        await bcrypt.hash(
            password,
            10
        );

    await db.execute(
        `
        INSERT INTO users
        (
            name,
            email,
            password
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
        `,
        [
            name,
            email,
            hash
        ]
    );

    res.json({
        success: true
    });

};


exports.login = async (req, res) => {

    const {
        email,
        password
    } = req.body;

    const [users] =
        await db.execute(
            `
            SELECT *
            FROM users
            WHERE email = ?
            `,
            [email]
        );

    if (!users.length) {

        return res.status(401).json({
            success: false
        });

    }

    const user =
        users[0];

    const valid =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!valid) {

        return res.status(401).json({
            success: false
        });

    }

    // Invalidate all previous tokens
    await db.execute(
        `
        UPDATE users
        SET token_version =
            token_version + 1
        WHERE id = ?
        `,
        [user.id]
    );

    // Update local object with new version
    user.token_version++;

    const token =
        jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                tokenVersion:
                    user.token_version
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d"
            }
        );

    res.json({
        success: true,
        token
    });

};

exports.logout = async (req, res) => {

    try {


        await db.execute(
            `
            UPDATE users
            SET token_version =
                token_version + 1
            WHERE id = ?
            `,
            [req.user.id]
        );

        const deletedSessions =
            await deleteUserSessions(
                req.user.id
            );

        return res.json({
            success: true,
            message:
                "Logged out successfully",
            deletedSessions
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

};
