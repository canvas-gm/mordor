document.addEventListener("DOMContentLoaded", function dom() {
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", function submit(event) {
        event.preventDefault();

        const req = new XMLHttpRequest();
        req.onreadystatechange = function onreadystatechange() {
            if (this.readyState !== XMLHttpRequest.DONE) {
                return;
            }

            if (this.status === 200) {
                console.log("Réponse reçue: %s", this.responseText);
            }
            else {
                console.log("Status de la réponse: %d (%s)", this.status, this.statusText);
            }
        };

        req.open("POST", "/register", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify({
            nom: document.getElementById("formNom").value,
            email: document.getElementById("formEmail").value,
            password: document.getElementById("formPassword").value
        }));
    });
});
