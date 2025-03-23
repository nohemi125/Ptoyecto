document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita que el formulario recargue la página

        // Capturar los valores del formulario
        const subject = document.getElementById("Subjects").value;
        const time = document.getElementById("time").value;
        const classroom = document.getElementById("classroom").value;

        // Enviar datos al backend
        fetch("/Mteacher", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include", 
            body: JSON.stringify({ subject, time, classroom })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Matrícula registrada exitosamente") {
                window.location.href = "/dashboardProfesor.html"; // Redirigir después de éxito
            } else {
                document.getElementById("error-message").innerText = data.message;
                document.getElementById("error-message").style.display = "block";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("error-message").innerText = "Hubo un error al matricular.";
            document.getElementById("error-message").style.display = "block";
        });
    });
});
