let isLogin = true;

//first declared function
function toggleAuthentication() {
    isLogin = !isLogin;

    //storing all named id html element into a constant variable 
    //corresponds to their name
    const formTitle = document.getElementById("formTitle");
    const submitButton = document.getElementById("submitButton");
    const toggleButton = document.getElementById("toggleButton");
    const toggleText = document.getElementById("toggleText");
    const containerName = document.getElementById("containerName");
    const result = document.getElementById("result");

    //changing the value with .textContent
    result.textContent = "";

    if (isLogin) {
        formTitle.textContent = "Login";
        submitButton.textContent = "Login";
        toggleText.textContent = "Don't have an account?";
        toggleButton.textContent = "Register";
        containerName.style.display = "none";
    } else {
        formTitle.textContent = "Register";
        submitButton.textContent = "Register";
        toggleText.textContent = "Have an account?";
        toggleButton.textContent = "Login";
        containerName.style.display = "block";
    }
}

//second declared function
//to communicate with server.js for exchanging information
async function submitAuthentication() {

    //gather value that has been submitted
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const fullName = document.getElementById("fullName").value;
    const result = document.getElementById("result");

    if (isLogin) {
        const response = await fetch("/server?action=login", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();
        result.textContent = data.message;

        if (data.success) {
            window.location.href = "/dashboard";
        }


    } else {
        const response = await fetch("/server?action=register", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                username: username,
                fullName: fullName,
                password: password
            })
        });

        const data = await response.json();
        result.textContent = data.message;

        if (data.success) {
            alert("Registration is succesful. You may login");

            toggleAuthentication();

            document.getElementById("username").value = "";
            document.getElementById("fullName").value = "";
            document.getElementById("password").value = "";
        }
    }
}

async function submitPuisi() {
    const response = await fetch("/server?action=submit_puisi", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
            judul: document.getElementById("judul").value,
            isi: document.getElementById("isi").value,
            kategori: document.getElementById("kategori").value,
            keyword: document.getElementById("keyword").value
        })
    });

    const data = await response.json();
        if (data.success) {

        document.getElementById("puisiResult").textContent =
            data.message;

        // Clear form
        document.getElementById("judul").value = "";
        document.getElementById("isi").value = "";
        document.getElementById("kategori").value = "";
        document.getElementById("keyword").value = "";

        // Refresh poem list
        await daftarPuisi();
    }
}

async function daftarPuisi() {

    const response = await fetch(
        "/server?action=daftar_puisi",
        {
            method: "GET",
            credentials: "same-origin"
        }
    );

    const data = await response.json();

    const list =
        document.getElementById("puisiList");

    list.innerHTML = "";

    if (!data.success) {

        list.innerHTML = `
            <p class="puisi-error">
                ${data.message}
            </p>
        `;

        return;
    }

    data.data.forEach(puisi => {

        const item =
            document.createElement("div");

        item.className = "puisi-item";

        item.innerHTML = `
            <div class="puisi-date">
                ${puisi.tgl_submit}
            </div>

            <div class="puisi-title">
                ${puisi.judul}
            </div>

            <div class="puisi-category">
                ${puisi.kategori || "Tanpa kategori"}
            </div>
        `;

        list.appendChild(item);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    daftarPuisi();
});