const http = require("http");
const fs = require("fs");
const path = require("path");

const {
    login,
    register
} = require("./blocks/authentication");

const {
    submitPuisi,
    daftarPuisi
} = require("./blocks/interaction");

const {
    getSession
} = require("./blocks/session");

const PORT = process.env.PORT || 8080;


function sendJSON(res, statusCode, data) {

    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

const server = http.createServer(
    async (req, res) => {

        const url = new URL(
            req.url,
            `http://${req.headers.host}`
        );

        if (
            req.method === "GET" &&
            url.pathname === "/app.js"
        ) {

            const filePath =
                path.join(
                    __dirname,
                    "public",
                    "app.js"
                );

            fs.readFile(
                filePath,
                (error, content) => {

                    if (error) {

                        res.writeHead(404);

                        res.end(
                            "app.js not found"
                        );

                        return;
                    }

                    res.writeHead(200, {
                        "Content-Type":
                            "application/javascript"
                    });

                    res.end(content);
                }
            );

            return;
        }



        if (
            req.method === "GET" &&
            url.pathname === "/"
        ) {

            const filePath = path.join(
                __dirname,
                "public",
                "authentication_page.html"
            );

            fs.readFile(
                filePath,
                (error, content) => {

                    if (error) {

                        res.writeHead(500);

                        res.end(
                            "Error loading authentication page"
                        );

                        return;
                    }

                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });

                    res.end(content);
                }
            );

            return;
        }

        if (
            req.method === "GET" &&
            url.pathname === "/dashboard"
        ) {

            const session = getSession(req);

            if (!session) {
                res.writeHead(302, {
                    'location': "/"
                });
                res.end();
                return;
            }

            const filePath = path.join(
                __dirname,
                "public",
                "dashboard_page.html"
            );

            fs.readFile(
                filePath,
                (error, content) => {

                    if (error) {

                        res.writeHead(500);

                        res.end(
                            "Error loading dashboard page"
                        );

                        return;
                    }

                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });

                    res.end(content);
                }
            );

            return;
        }

        // =========================
        // SINGLE PATH
        // =========================

        if (
            url.pathname === "/server"
        ) {

            const action =
                url.searchParams.get(
                    "action"
                );

            try {

                // LOGIN
                if (
                    action === "login" &&
                    req.method === "POST"
                ) {

                    await login(
                        req,
                        res
                    );

                    return;
                }

                // REGISTER
                if (
                    action === "register" &&
                    req.method === "POST"
                ) {

                    await register(
                        req,
                        res
                    );

                    return;
                }

                // SUBMIT PUISI
                if (
                    action === "submit_puisi" &&
                    req.method === "POST"
                ) {

                    await submitPuisi(
                        req,
                        res
                    );

                    return;
                }

                // DAFTAR PUISI
                if (
                    action === "daftar_puisi" &&
                    req.method === "GET"
                ) {

                    await daftarPuisi(
                        req,
                        res
                    );

                    return;
                }

                sendJSON(res, 404, {
                    success: false,
                    message:
                        "Action tidak ditemukan"
                });

            } catch (error) {

                console.error(error);

                sendJSON(res, 500, {
                    success: false,
                    message:
                        "Internal server error"
                });
            }

            return;
        }

        res.writeHead(404);
        res.end("Not Found");
    }
);

server.listen(
    PORT,
    () => {

        console.log(
            `Server running at on port ${PORT}`
        );

    }
);