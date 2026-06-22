const jwt = require("jsonwebtoken");

const db =
    require("../config/database");

module.exports = async (
    req,
    res,
    next
) => {

    try {

        let token;

        const auth =
            req.headers.authorization;

        if (
            auth &&
            auth.startsWith("Bearer ")
        ) {

            token =
                auth.replace(
                    "Bearer ",
                    ""
                );

        } else if (
            req.query.token
        ) {

            token =
                req.query.token;

        }

        if (!token) {

            return res.status(401).json({
                success: false,
                error: "Unauthorized"
            });

        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        const [users] =
            await db.execute(
                `
                SELECT token_version
                FROM users
                WHERE id = ?
                `,
                [decoded.id]
            );

        if (
            !users.length
        ) {

            return res.status(401).json({
                success: false,
                error: "User not found"
            });

        }

        if (
            users[0].token_version !==
            decoded.tokenVersion
        ) {

            return res.status(401).json({
                success: false,
                error: "Token expired"
            });

        }

        req.user =
            decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            success: false,
            error: "Invalid token"
        });

    }

};