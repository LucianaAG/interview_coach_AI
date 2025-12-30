const form = document.getElementById("uploadForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Reset visual
  message.textContent = "";
  message.className = "text-center mt-4 text-sm";

  const fileInput = document.getElementById("doc");
  const file = fileInput.files[0];

  if (!file) {
    message.textContent = "Seleccioná un archivo PDF.";
    message.classList.add("text-red-600");
    return;
  }

  const formData = new FormData();
  formData.append("doc", file);

  // 👉 recuperar sessionId si ya existe
  const sessionId = localStorage.getItem("sessionId");

  try {
    const response = await fetch(
      "http://localhost:5000/api/upload-doc",
      {
        method: "POST",
        headers: sessionId
          ? { "x-session-id": sessionId }
          : {},
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al subir el archivo");
    }

    // Guardamos / actualizamos sessionId
    localStorage.setItem("sessionId", data.sessionId);

    message.textContent = "Archivo subido correctamente. Redirigiendo...";
    message.classList.add("text-green-600");

    setTimeout(() => {
      window.location.href = "./interview.html";
    }, 800);

  } catch (error) {
    message.textContent = error.message;
    message.classList.add("text-red-600");
  }
});

