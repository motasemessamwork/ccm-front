const router = require("express").Router();

const upload =
    require("../middleware/upload");

const auth =
    require("../middleware/auth");

const controller =
    require("../controllers/message.controller");

router.post(
    "/send",
    auth,
    controller.sendMessage
);

router.post(
    "/send-file",
    auth,
    upload.single("attachment"),
    controller.sendFile
);

module.exports = router;