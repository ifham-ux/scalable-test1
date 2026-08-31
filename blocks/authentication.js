const crypto = require("crypto");

const db = require("./database");
const { createSession } = require("./session");

function parseBody(req) {

    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }

        });

        req.on("error", reject);
    });
}

function sendJSON(res, statusCode, data) {

    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

function hashPassword(password) {

    return new Promise((resolve, reject) => {

        const salt =
            crypto.randomBytes(16).toString("hex");

        crypto.scrypt(
            password,
            salt,
            64,
            (error, derivedKey) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(
                    `${salt}:${derivedKey.toString("hex")}`
                );
            }
        );
    });
}

function verifyPassword(
    password,
    storedPassword
) {

    return new Promise((resolve, reject) => {

        const [
            salt,
            storedHash
        ] = storedPassword.split(":");

        crypto.scrypt(
            password,
            salt,
            64,
            (error, derivedKey) => {

                if (error) {
                    reject(error);
                    return;
                }

                const storedBuffer =
                    Buffer.from(
                        storedHash,
                        "hex"
                    );

                resolve(
                    crypto.timingSafeEqual(
                        storedBuffer,
                        derivedKey
                    )
                );
            }
        );
    });
}

async function register(req, res) {

    try {

        const body =
            await parseBody(req);

        const {
            username,
            fullName,
            password
        } = body;

        if (
            !username ||
            !fullName ||
            !password
        ) {

            sendJSON(res, 400, {
                success: false,
                message:
                    "Username, nama lengkap, dan password wajib diisi"
            });

            return;
        }

        const hashedPassword =
            await hashPassword(password);

        await db.execute(
            `INSERT INTO users
            (username, password, nama)
            VALUES (?, ?, ?)`,
            [
                username,
                hashedPassword,
                fullName
            ]
        );

        sendJSON(res, 201, {
            success: true,
            message:
                "Registrasi berhasil"
        });

    } catch (error) {

        console.error(error);

        if (
            error.code ===
            "ER_DUP_ENTRY"
        ) {

            sendJSON(res, 409, {
                success: false,
                message:
                    "Username sudah digunakan"
            });

            return;
        }

        sendJSON(res, 500, {
            success: false,
            message:
                "Internal server error"
        });
    }
}

async function login(req, res) {

    try {

        const body =
            await parseBody(req);

        const {
            username,
            password
        } = body;

        if (
            !username ||
            !password
        ) {

            sendJSON(res, 400, {
                success: false,
                message:
                    "Username dan password wajib diisi"
            });

            return;
        }

        const [rows] =
            await db.execute(
                `SELECT *
                 FROM users
                 WHERE username = ?`,
                [username]
            );

        if (rows.length === 0) {

            sendJSON(res, 401, {
                success: false,
                message:
                    "Username atau password salah"
            });

            return;
        }

        const user = rows[0];

        const valid =
            await verifyPassword(
                password,
                user.password
            );

        if (!valid) {

            sendJSON(res, 401, {
                success: false,
                message:
                    "Username atau password salah"
            });

            return;
        }

        // Create server-side session
        const sessionId =
            createSession(user);

        res.writeHead(200, {

            "Content-Type":
                "application/json",

            "Set-Cookie":
                `session_id=${sessionId}; HttpOnly; Path=/`

        });

        res.end(
            JSON.stringify({
                success: true,
                message:
                    "Login berhasil"
            })
        );

    } catch (error) {

        console.error(error);

        sendJSON(res, 500, {
            success: false,
            message:
                "Internal server error"
        });
    }
}

module.exports = {
    register,
    login
};