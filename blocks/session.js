const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SESSION_DIR = path.join(__dirname, "sessions");

if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR);
}

function generateSessionId() {
    return crypto.randomBytes(32).toString("hex");
}

function createSession(user) {

    const sessionId = generateSessionId();

    const sessionData = {
        user_id: user.id,
        username: user.username
    };

    const sessionFile = path.join(
        SESSION_DIR,
        `${sessionId}.json`
    );

    fs.writeFileSync(
        sessionFile,
        JSON.stringify(sessionData)
    );

    return sessionId;
}

function parseCookies(req) {

    const cookies = {};

    if (!req.headers.cookie) {
        return cookies;
    }

    req.headers.cookie
        .split(";")
        .forEach(cookie => {

            const [name, ...value] =
                cookie.trim().split("=");

            cookies[name] =
                decodeURIComponent(
                    value.join("=")
                );
        });

    return cookies;
}

// Get current session
function getSession(req) {

    const cookies = parseCookies(req);

    const sessionId =
        cookies.session_id;

    if (!sessionId) {
        return null;
    }

    const sessionFile =
        path.join(
            SESSION_DIR,
            `${sessionId}.json`
        );

    if (!fs.existsSync(sessionFile)) {
        return null;
    }

    try {

        const data =
            fs.readFileSync(
                sessionFile,
                "utf8"
            );

        return {
            id: sessionId,
            ...JSON.parse(data)
        };

    } catch (error) {

        return null;
    }
}

module.exports = {
    createSession,
    getSession
};