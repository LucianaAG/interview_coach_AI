const form = document.getElementById("interviewForm");
const resultDiv = document.getElementById("result");

let currentInterviewId = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const sessionId = localStorage.getItem("sessionId");

  if (!sessionId) {
    resultDiv.textContent = "No hay CV cargado. Subí uno primero.";
    resultDiv.className = "text-red-600";
    return;
  }

  const role = document.getElementById("role").value;
  const level = document.getElementById("level").value;
  const section = document.getElementById("section").value;
  const amount = document.getElementById("amount").value;

  try {
    const response = await fetch(
      "http://localhost:5000/api/interview/question",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          role,
          level,
          section,
          amount_questions: amount
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al generar preguntas");
    }

    // Guardamos el interviewId
    currentInterviewId = data.interviewId;
    console.log("Interview ID guardado:", currentInterviewId);

    // Procesamos las preguntas
    const questionsArray = data.questions
      .split(/\n\d+\.\s/)
      .filter(q => q.trim() !== "");

    // Limpiamos el contenedor
    resultDiv.innerHTML = `
      <h2 class="text-xl font-semibold mb-4">Preguntas</h2>
    `;

    // Renderizamos cada pregunta
    questionsArray.forEach((question, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.className = "mb-6 p-4 border rounded bg-gray-50";

      questionDiv.innerHTML = `
        <p class="font-medium mb-2">
          ${index + 1}. ${question.trim()}
        </p>

        <textarea
          id="answer-${index}"
          class="w-full border p-2 rounded mt-2"
          rows="3"
          placeholder="Escribí tu respuesta acá..."
        ></textarea>

        <button
          type="button"
          id="send-${index}"
          class="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Enviar respuesta
        </button>

        <div
          id="feedback-${index}"
          class="mt-2 text-sm text-gray-600"
        ></div>
      `;

      resultDiv.appendChild(questionDiv);

      // 👉 Listener del botón (ENVÍA AL BACKEND Y MUESTRA FEEDBACK)
      const sendButton = questionDiv.querySelector(`#send-${index}`);
      sendButton.addEventListener("click", async () => {
        const answerText = document.getElementById(`answer-${index}`).value;
        const feedbackDiv = document.getElementById(`feedback-${index}`);

        if (!answerText.trim()) {
          feedbackDiv.textContent = "Tenés que escribir una respuesta.";
          feedbackDiv.className = "mt-2 text-sm text-red-600";
          return;
        }

        feedbackDiv.textContent = "Evaluando respuesta...";
        feedbackDiv.className = "mt-2 text-sm text-gray-500";

        try {
          const response = await fetch(
            "http://localhost:5000/api/interview/feedback",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                interviewId: currentInterviewId,
                answer: answerText
              })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Error al evaluar la respuesta");
          }

          feedbackDiv.textContent = data.feedback;
          feedbackDiv.className = "mt-2 text-sm text-green-700";

        } catch (error) {
          feedbackDiv.textContent = error.message;
          feedbackDiv.className = "mt-2 text-sm text-red-600";
        }
      });
    });

  } catch (error) {
    resultDiv.textContent = error.message;
    resultDiv.className = "text-red-600";
  }
});


  