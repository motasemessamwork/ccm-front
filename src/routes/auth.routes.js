const router =
    require("express")
        .Router();

const auth =
    require("../middleware/auth");

const controller =
    require("../controllers/auth.controller");

router.post(
    "/signup",
    controller.signup
);

router.post(
    "/login",
    controller.login
);

router.post(
    "/logout",
    auth,
    controller.logout
);

module.exports =
    router;
