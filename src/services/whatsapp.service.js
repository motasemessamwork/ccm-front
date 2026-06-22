const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

const sessions = require("../storage/sessions");
const cleanSessionCache = require("../utils/cleanSessionCache");

async function createSession(sessionId) {

    if (sessions[sessionId]) {

        try {
            await sessions[sessionId].client.destroy();
        } catch (e) {
            console.log(e.message);
        }

        delete sessions[sessionId];
    }

    // cleanSessionCache(sessionId);

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: sessionId
        }),
        puppeteer: {
            headless: true,
            executablePath:
                "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disk-cache-size=0",
                "--media-cache-size=0"
            ],
        },
        authTimeoutMs: 120000
    });

    sessions[sessionId] = {
        client,
        ready: false,
        authenticated: false,
        disconnected: false,
        initializing: true,
        qr: null
    };

    client.on("qr", async (qr) => {

        console.log(`[${sessionId}] QR RECEIVED`);

        sessions[sessionId].ready = false;

        sessions[sessionId].qr =
            await qrcode.toDataURL(qr);

    });

    client.on("authenticated", () => {
        console.log(`[${sessionId}] AUTHENTICATED`);

        sessions[sessionId].authenticated = true;
        sessions[sessionId].disconnected = false;
        sessions[sessionId].qr = null;
    });

    client.on("change_state", state => {
        console.log(
            `[${sessionId}] STATE:`,
            state
        );
    });

    client.on("auth_failure", (msg) => {

        sessions[sessionId].initializing = false;

        console.log(
            `[${sessionId}] AUTH FAILURE`,
            msg
        );

        sessions[sessionId].ready = false;

    });

    client.on("ready", () => {
        console.log(`[${sessionId}] READY`);

        sessions[sessionId].initializing = false;
        sessions[sessionId].ready = true;
        sessions[sessionId].disconnected = false;
        sessions[sessionId].qr = null;
    });

    client.on("loading_screen", (percent, message) => {

        console.log(`[${sessionId}] ${percent}% ${message}`);

    });

    client.on("disconnected", (reason) => {

        console.log(`[${sessionId}] DISCONNECTED`, reason);

        sessions[sessionId].initializing = false;
        sessions[sessionId].ready = false;
        sessions[sessionId].disconnected = true;
    });


    // await client.initialize();
    client.initialize()
        .catch(err => {

            console.error(
                `[${sessionId}] Initialize Error:`,
                err
            );

        });
    
    return sessions[sessionId];
}

module.exports = {
    createSession
};