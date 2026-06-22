const fs = require("fs");
const mime = require("mime-types");
const { MessageMedia } = require("whatsapp-web.js");

const sessions = require("../storage/sessions");

/*
|--------------------------------------------------------------------------
| Send Message
|--------------------------------------------------------------------------
*/
exports.sendMessage = async (req, res) => {

    try {

        const sessionId =
            `name-${req.user.id}-1`;

        const session =
            sessions[sessionId];

        if (!session) {

            return res.status(404).json({
                success: false,
                error: "session not found"
            });

        }

        if (!session.ready) {

            return res.status(400).json({
                success: false,
                error: "session not authenticated"
            });

        }

        const {
            phone,
            phones,
            message
        } = req.body;

        if (!message) {

            return res.status(400).json({
                success: false,
                error: "message required"
            });

        }

        const targets = [];

        if (phone) {
            targets.push(phone);
        }

        if (Array.isArray(phones)) {
            targets.push(...phones);
        }

        if (targets.length === 0) {

            return res.status(400).json({
                success: false,
                error: "phone or phones required"
            });

        }

        const results = [];

        for (const target of targets) {

            try {

                 console.log(
                    "State:",
                    await session.client.getState()
                );

                console.log(
                    "Ready:",
                    session.ready
                );

                console.log(
                    "Info:",
                    session.client.info
                );

                console.log("Before getNumberId");
                
                const numberId =
                    await session.client.getNumberId(target);

                console.log("After getNumberId");


                if (!numberId) {

                    results.push({
                        phone: target,
                        success: false,
                        error: "not on whatsapp"
                    });

                    continue;
                }

                const result =
                    await session.client.sendMessage(
                        `${target}@c.us`,
                        message
                    );

                console.log("After sendMessage");


                results.push({
                    phone: target,
                    success: true,
                    messageId: result.id.id
                });

            } catch (err) {

                results.push({
                    phone: target,
                    success: false,
                    error: err.message
                });

            }

        }

        return res.json({
            success: true,
            total: targets.length,
            sent: results.filter(x => x.success).length,
            failed: results.filter(x => !x.success).length,
            results
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

};

/*
|--------------------------------------------------------------------------
| Send Attachment
|--------------------------------------------------------------------------
*/
exports.sendFile = async (req, res) => {

    try {

        const sessionId =
            `name-${req.user.id}-1`;

        const session =
            sessions[sessionId];

        if (!session) {

            return res.status(404).json({
                success: false,
                error: "session not found"
            });

        }

        if (!session.ready) {

            return res.status(400).json({
                success: false,
                error: "session not authenticated"
            });

        }

        const {
            phone,
            caption
        } = req.body;

        if (!phone) {

            return res.status(400).json({
                success: false,
                error: "phone required"
            });

        }

        if (!req.file) {

            return res.status(400).json({
                success: false,
                error: "attachment required"
            });

        }

        const numberId =
            await session.client.getNumberId(phone);

        if (!numberId) {

            return res.status(400).json({
                success: false,
                error: "number not on whatsapp"
            });

        }

        const media = new MessageMedia(
            mime.lookup(req.file.originalname) ||
            "application/octet-stream",

            fs.readFileSync(
                req.file.path,
                {
                    encoding: "base64"
                }
            ),

            req.file.originalname
        );

        const result =
            await session.client.sendMessage(
                numberId._serialized,
                media,
                {
                    caption: caption || "",
                    sendMediaAsDocument: true
                }
            );

        try {

            fs.unlinkSync(req.file.path);

        } catch (err) {

            console.error(
                "Failed to delete uploaded file:",
                err.message
            );

        }

        return res.json({
            success: true,
            phone,
            fileName: req.file.originalname,
            messageId: result.id.id
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

};