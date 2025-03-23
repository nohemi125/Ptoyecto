document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm"); // Asegúrate de que coincide con el HTML

    if (!form) {
        console.error("Error: No se encontró el formulario con id 'loginForm'");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita que la página se recargue al enviar el formulario

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:3000/indexProfesores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message); // Mensaje de éxito

                if (data.redirect) {
                    window.location.href = data.redirect; // Redirige si el servidor manda una URL de redirección
                }
            } else {
                document.getElementById("error-message").textContent = data.message;
                document.getElementById("error-message").style.display = "block";
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
            alert("Error al conectar con el servidor");
        }

      

        

    });
});
