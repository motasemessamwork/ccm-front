module.exports = (
    req,
    res,
    next
) => {

    const prefix =
        `name-${req.user.id}-`;

    if (
        !req.params.id.startsWith(prefix)
    ) {

        return res.status(403).json({
            success: false,
            error: "Access denied"
        });

    }

    next();

};
