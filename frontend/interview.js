const form = document.getElementById("interviewForm");
const resultDiv = document.getElementById("result");

let currentInterviewId = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const sessionId = localStorage.getItem("sessionId");

  if (!sessionId) {
    resultDiv.textContent = "No hay archivo cargado. Subí uno primero.";
    resultDiv.className = "text-red-600";
    return;
  }

  const role = document.getElementById("role").value;
  const level = document.getElementById("level").value;
  const section = document.getElementById("section").value;
  const amount = document.getElementById("amount").value;

  const submitButton = form.querySelector("button[type='submit']");

  // --- UX: estado cargando ---
  submitButton.disabled = true;
  submitButton.textContent = "Generando…";
  submitButton.classList.add("opacity-60");

  resultDiv.innerHTML = `
    <p class="text-gray-500 text-sm">Generando preguntas…</p>
  `;

  try {
    const response = await fetch(
      "http://localhost:5000/api/interview/question",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    currentInterviewId = data.interviewId;

    const questionsArray = data.questions
      .split(/\n\d+\.\s/)
      .filter(q => q.trim() !== "");

    // --- UX: restaurar botón ---
    submitButton.disabled = false;
    submitButton.textContent = "Generar preguntas";
    submitButton.classList.remove("opacity-60");

    resultDiv.innerHTML = `
      <h2 class="text-xl font-semibold mb-4">Preguntas</h2>
    `;

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
          Evaluar respuesta
        </button>

        <div
          id="feedback-${index}"
          class="mt-3 text-sm"
        ></div>
      `;

      resultDiv.appendChild(questionDiv);

      const sendButton = questionDiv.querySelector(`#send-${index}`);
      sendButton.addEventListener("click", async () => {
        const answerText = document.getElementById(`answer-${index}`).value;
        const feedbackDiv = document.getElementById(`feedback-${index}`);

        if (!answerText.trim()) {
          feedbackDiv.innerHTML = `
            <p class="text-red-600">Tenés que escribir una respuesta.</p>
          `;
          return;
        }

        sendButton.disabled = true;
        sendButton.textContent = "Analizando…";
        sendButton.classList.add("opacity-60");

        feedbackDiv.innerHTML = `
          <p class="text-gray-500">Analizando tu respuesta…</p>
        `;

        try {
          const response = await fetch(
            "http://localhost:5000/api/interview/feedback",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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

          const raw = data.feedback;

          const strengths = raw.match(/Puntos fuertes:(.*?)(Áreas de mejora:|$)/s);
          const improvements = raw.match(/Áreas de mejora:(.*)/s);

          feedbackDiv.innerHTML = `
            <div class="space-y-3">
              <div class="bg-green-50 border border-green-200 rounded p-3">
                <p class="font-semibold text-green-700 text-sm mb-1"> Fortalezas</p>
                <p class="text-sm text-green-800">
                  ${strengths ? strengths[1].trim() : "—"}
                </p>
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p class="font-semibold text-yellow-700 text-sm mb-1"> A mejorar</p>
                <p class="text-sm text-yellow-800">
                  ${improvements ? improvements[1].trim() : "—"}
                </p>
              </div>
            </div>
          `;

        } catch (error) {
          feedbackDiv.innerHTML = `
            <p class="text-red-600">${error.message}</p>
          `;
        } finally {
          sendButton.disabled = false;
          sendButton.textContent = "Evaluar respuesta";
          sendButton.classList.remove("opacity-60");
        }
      });
    });

  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Generar preguntas";
    submitButton.classList.remove("opacity-60");

    resultDiv.textContent = error.message;
    resultDiv.className = "text-red-600";
  }
});


  