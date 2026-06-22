const router = require("express").Router();

router.get("/", (req, res) => {

    res.json({
        success: true,
        message: "WhatsApp Multi Session API"
    });

});

module.exports = router;