const sessions = require("../storage/sessions");

const {
    deleteUserSessions
} = require("../services/userSessionCleanup.service");

const {
    createSession
} = require("../services/whatsapp.service");

/*
|--------------------------------------------------------------------------
| Get QR
|--------------------------------------------------------------------------
*/
exports.getQr = async (req, res) => {

    const sessionId =
        `name-${req.user.id}-1`;

    if (!sessions[sessionId]) {

        return res.status(404).json({
            success: false,
            error: "Session not found"
        });

    }

    res.json({
        success: true,
        ready: sessions[sessionId].ready,
        qr: sessions[sessionId].qr
    });

};

/*
|--------------------------------------------------------------------------
| Get Status
|--------------------------------------------------------------------------
*/
exports.getStatus = (req, res) => {

    const sessionId =
        `name-${req.user.id}-1`;

    const session =
        sessions[sessionId];

    if (!session) {

        return res.status(404).json({
            success: false,
            error: "Session not found"
        });

    }

    res.json({
        success: true,
        ready: session.ready
    });

};

/*
|--------------------------------------------------------------------------
| List Sessions
|--------------------------------------------------------------------------
*/
exports.listSessions = (req, res) => {

    const prefix =
        `name-${req.user.id}-`;

    const data =
        Object.keys(sessions)
            .filter(id =>
                id.startsWith(prefix)
            )
            .map(id => ({
                sessionId: id,
                ready: sessions[id].ready
            }));

    res.json({
        success: true,
        sessions: data
    });

};

/*
|--------------------------------------------------------------------------
| QR Page
|--------------------------------------------------------------------------
*/
exports.getQrPage = async (req, res) => {

    const userId =
        req.user.id;

    const username =
        req.user.name;

    const token =
        req.query.token || "";

    const sessionId =
        `name-${userId}-1`;

    if (!sessions[sessionId]) {

        await deleteUserSessions(userId);

        await createSession(sessionId);

    }

    if (sessions[sessionId].ready) {

        return res.send(`
            <html>
                <body style="font-family:sans-serif;text-align:center;padding:40px">
                    <h2>✅ Session ${sessionId} authenticated</h2>
                </body>
            </html>
        `);

    }

    const qr = "";

    res.send(`
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>QR - ${sessionId}</title>
            </head>

            <body style="
                font-family:sans-serif;
                text-align:center;
                padding:40px;
                background:#f5f5f5
            ">

                <h2>
                    Scan QR for ${username}
                </h2>

                <img
                    id="qrimg"
                    src="${qr}"
                    width="300"
                    height="300"
                    style="
                        display:block;
                        margin:20px auto;"
                />

                <p id="status">
                    Generating QR...
                </p>

                <p id="timer">
                    Refreshing in
                    <b id="count">3</b>s
                </p>

                <script>

                    let count = 3;

                    setInterval(() => {

                        count--;

                        document.getElementById("count").innerText = count;

                        if (count <= 0) {

                            count = 3;

                            fetch("/sessions/qr?token=${token}")
                                .then(r => r.json())
                                .then(data => {

                                    if (data.ready) {

                                        document.getElementById("status").innerText =
                                            "✅ Authenticated";

                                        document.getElementById("qrimg").style.display =
                                            "none";

                                        document.getElementById("timer").style.display =
                                            "none";

                                    } else if (
                                        data.qr &&
                                        data.qr.startsWith("data:image")
                                    ) {

                                        const img =
                                            document.getElementById("qrimg");

                                        img.src = data.qr;
                                        img.style.display = "block";

                                        document.getElementById("status").innerText =
                                            "Waiting for scan...";
                                    }

                                })
                                .catch(() => {

                                    document.getElementById("status").innerText =
                                        "Connection lost. Retrying...";

                                });

                        }

                    }, 1000);

                </script>

            </body>
        </html>
    `);

};