const router = require("express").Router();

const auth =
    require(
        "../middleware/auth"
    );

const sessionOwner =
    require("../middleware/sessionOwner");

const controller =
    require("../controllers/session.controller");

router.get(
    "/qr",
    auth,
    controller.getQr
);

router.get(
    "/status",
    auth,
    controller.getStatus
);

router.get(
    "/qr/page",
    auth,
    controller.getQrPage
);

// router.get(
//     "/test",
//     auth,
//     controller.test
// );

router.get(
    "/:id/test",
    auth,
    sessionOwner,
    async (req, res) => {

        try {

            const session =
                sessions[req.params.id];

            if (!session) {

                return res.status(404).json({
                    success: false,
                    error: "Session not found"
                });

            }

            const state =
                await session.client.getState();

            res.json({
                success: true,
                sessionId: req.params.id,
                user: req.user.name,
                state
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                error: err.message
            });

        }

    }
);

module.exports = router;