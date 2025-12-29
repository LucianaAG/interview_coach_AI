const form = document.getElementById("uploadForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("doc");
  const file = fileInput.files[0];

  if (!file) {
    message.textContent = "Seleccioná un archivo PDF";
    return;
  }

  const formData = new FormData();
  formData.append("doc", file);

  try {
    const response = await fetch("http://localhost:5000/api/upload-cv", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al subir el archivo");
    }

    // Guardamos sessionId para el resto del flujo
    localStorage.setItem("sessionId", data.sessionId);
    
    message.textContent = "Archivo subido correctamente. Redirigiendo...";
    message.classList.add("text-green-600");

    // redirección automática
    setTimeout(() => {
      window.location.href = "/interview.html";
    }, 800);

    // Opcional: redirigir
    // window.location.href = "interview.html";

  } catch (error) {
    message.textContent = error.message;
    message.classList.add("text-red-600");
  }
});
