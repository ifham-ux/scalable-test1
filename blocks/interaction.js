const db = require("./database");
const { getSession } = require("./session");

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

async function submitPuisi(req, res) {

    // Check server-side session
    const session =
        getSession(req);

    if (!session) {

        sendJSON(res, 401, {
            success: false,
            message:
                "Anda harus login terlebih dahulu"
        });

        return;
    }

    try {

        const body =
            await parseBody(req);

        const {
            judul,
            isi,
            kategori,
            keyword
        } = body;

        const tgl_submit = new Date();

        if (
            !judul ||
            !isi ||
            !tgl_submit
        ) {

            sendJSON(res, 400, {
                success: false,
                message:
                    "Judul, isi, dan tanggal wajib diisi"
            });

            return;
        }

        await db.execute(
            `INSERT INTO puisi
            (
                user_id,
                judul,
                tgl_submit,
                isi,
                kategori,
                keyword
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                session.user_id,
                judul,
                tgl_submit,
                isi,
                kategori || null,
                keyword || null
            ]
        );

        sendJSON(res, 201, {
            success: true,
            message:
                "Puisi berhasil disimpan"
        });

    } catch (error) {

        console.error(error);

        sendJSON(res, 500, {
            success: false,
            message:
                "Internal server error"
        });
    }
}

async function daftarPuisi(req, res) {

    const session =
        getSession(req);

    if (!session) {

        sendJSON(res, 401, {
            success: false,
            message:
                "Anda harus login terlebih dahulu"
        });

        return;
    }

    try {

        const [rows] =
            await db.execute(
                `SELECT
                    tgl_submit,
                    judul,
                    kategori
                 FROM puisi
                 WHERE user_id = ?
                 ORDER BY tgl_submit DESC`,
                [session.user_id]
            );

        sendJSON(res, 200, {
            success: true,
            data: rows
        });

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
    submitPuisi,
    daftarPuisi
};