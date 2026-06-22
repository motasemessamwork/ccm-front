const fs = require("fs");
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

    const chromePath = getChromeExecutablePath();
    const puppeteerOptions = {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disk-cache-size=0",
            "--media-cache-size=0"
        ]
    };

    if (chromePath) {
        puppeteerOptions.executablePath = chromePath;
    } else {
        console.warn(
            "No browser executable resolved. Puppeteer will attempt the bundled Chromium. " +
            "In Linux containers, install Chrome/Chromium and set CHROME_PATH/BROWSER_PATH if this fails."
        );
    }

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: sessionId
        }),
        puppeteer: puppeteerOptions,
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

function getChromeExecutablePath() {
    const envPath = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || process.env.BROWSER_PATH;
    if (envPath && fs.existsSync(envPath)) {
        console.log("Using browser from environment path:", envPath);
        return envPath;
    }

    const windowsCandidates = [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
        "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    ];

    const linuxCandidates = [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "/usr/bin/microsoft-edge",
        "/usr/bin/msedge"
    ];

    const macCandidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
    ];

    const candidates = process.platform === "win32"
        ? windowsCandidates
        : process.platform === "darwin"
            ? macCandidates
            : linuxCandidates;

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            console.log("Found browser executable at:", candidate);
            return candidate;
        }
    }

    const platformHint = process.platform === "linux"
        ? "Install Chrome/Chromium inside the container or set CHROME_PATH/BROWSER_PATH to a valid browser executable."
        : "Set CHROME_PATH/BROWSER_PATH to a valid browser executable.";

    console.warn("No explicit browser executable found; falling back to Puppeteer default.", platformHint);
    return undefined;
}

module.exports = {
    createSession
};