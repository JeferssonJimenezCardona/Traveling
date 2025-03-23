document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const startInteractionBtn = document.getElementById("start-interaction");
  const stopInteractionBtn = document.getElementById("stop-interaction");
  const toggleMicBtn = document.getElementById("toggle-mic");
  const exportConversationBtn = document.getElementById("export-conversation");
  const clientSelect = document.getElementById("client-select");
  const clientDetails = document.getElementById("client-details");
  const callControls = document.getElementById("call-controls");
  const activeCall = document.getElementById("active-call");
  const interactionArea = document.getElementById("interaction-area");
  const callSummary = document.getElementById("call-summary");

  // Tab functionality
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Speech recognition and synthesis
  let recognition;
  let isInteractionActive = false;
  let isListening = false;
  let conversationHistory = [];
  
  // OpenAI API Key const OPENAI_API_KEY = "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";
  const OPENAI_API_KEY="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";
  // Declare responsiveVoice
  var responsiveVoice = window.responsiveVoice;

  const contextoGeneral = `
  ERES EMMA, UN ASISTENTE VIRTUAL ESPECIALIZADO EN EL RASTREO DE EQUIPAJES PARA AEROLÍNEAS. 
  TU OBJETIVO ES PROPORCIONAR INFORMACIÓN PRECISA, CLARA Y OPORTUNA SOBRE EL ESTADO DE LAS MALETAS DE LOS CLIENTES, MANTENIENDO SIEMPRE UN TONO AMIGABLE Y PROFESIONAL.

  INSTRUCCIONES:
  1. PROPORCIONA TODA LA INFORMACIÓN , SIN NINGUNA MARCA DE FORMATO, PARA FACILITAR LA LECTURA. EVITA REPETIR EL NOMBRE CON FRECUENCIA Y ASEGÚRATE DE NO DELETREARLO.
  2. SI EL USUARIO SE DESVÍA DEL CONTEXTO O TE HACE PREGUNTAS NO ÉTICAS O DE INFORMACIÓN GENERAL, INDÍCALE QUE NO PUEDES AYUDARLE A RESPONDER ESA PREGUNTA.
  3. SI EL USUARIO PREGUNTA POR SU MALETA, PROPORCIONA EL ESTADO ACTUAL DE MANERA CLARA Y DETALLADA.
  4. SI LA MALETA ESTÁ EXTRAVIADA, MUESTRA EMPATÍA Y EXPLICA EL PROCEDIMIENTO DE RASTREO, ASEGURANDO AL CLIENTE QUE SE ESTÁ HACIENDO TODO LO POSIBLE PARA LOCALIZARLA.
  5. SI LA MALETA ESTÁ EN TRÁNSITO, CONFIRMA QUE ESTÁ EN CAMINO Y PROPORCIONA UNA ESTIMACIÓN DE ENTREGA SI ES POSIBLE.
  6. SI EL USUARIO SOLICITA EL NÚMERO DE VUELO, PROPORCIÓNALO DE INMEDIATO.
  7. MANTÉN LA CONVERSACIÓN FLUIDA Y NATURAL, EVITA EL DELETREO Y ASEGURA QUE LA RESPUESTA SEA CLARA Y SIN INTERRUPCIONES.

  INFORMACIÓN DEL CLIENTE ACTUAL:
  - NOMBRE: {NOMBRE}
  - ESTADO DE LA MALETA: {ESTADO_MALETA}
  - NÚMERO DE VUELO: {NUMERO_VUELO}

  RESPONDE SIEMPRE BASÁNDOTE EN ESTA INFORMACIÓN ESPECÍFICA DEL CLIENTE, ADAPTANDO TU TONO SEGÚN LA SITUACIÓN.`;

  // Sample client data - MODIFIED for luggage tracking
  const clientes = [
    { id: 1, nombre: "Luis Guillermo Pardo", estadoMaleta: "En Curso", numeroVuelo: "AV1500" },
    { id: 2, nombre: "Jefersson Jimenez Cardona", estadoMaleta: "extraviada", numeroVuelo: "AV2200" }
  ];

  //-----------------------------
  initSpeechRecognition();
  initClientList();
  initTabSystem();

  startInteractionBtn.addEventListener("click", startInteraction);
  stopInteractionBtn.addEventListener("click", stopInteraction);
  toggleMicBtn.addEventListener("click", toggleMicrophone);
  exportConversationBtn.addEventListener("click", exportConversation);
  clientSelect.addEventListener("change", updateClientDetails);

  // Initialize speech recognition
  function initSpeechRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = async (event) => {
      if (!isListening) return;
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const userMessage = result[0].transcript;
        addMessage("Cliente: " + userMessage, "user-message");
        await processUserInput(userMessage);
      }
    };

    recognition.onerror = (event) => {
      console.error("Error en el reconocimiento de voz:", event.error);
      if (event.error === "no-speech" && isListening) {
        console.log("No se detectó voz. Reiniciando el reconocimiento...");
        startListening();
      }
    };

    recognition.onend = () => {
      if (isListening) {
        startListening();
      }
    };
  }

  // Initialize client list
  function initClientList() {
    clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = cliente.nombre;
      clientSelect.appendChild(option);
    });
  }

  // Initialize tab system
  function initTabSystem() {
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));

        // Add active class to clicked button and corresponding content
        button.classList.add("active");
        const tabId = button.getAttribute("data-tab");
        document.getElementById(`${tabId}-tab`).classList.add("active");
      });
    });
  }

  // Update client details - MODIFIED for luggage tracking
  function updateClientDetails() {
    const selectedClientId = clientSelect.value;
    const selectedClient = clientes.find((cliente) => cliente.id == selectedClientId);
    if (selectedClient) {
      clientDetails.innerHTML = `
                <p><strong>Nombre:</strong> ${selectedClient.nombre}</p>
                <p><strong>Estado de la maleta:</strong> ${selectedClient.estadoMaleta}</p>
                <p><strong>Número de vuelo:</strong> ${selectedClient.numeroVuelo}</p>
            `;
    } else {
      clientDetails.innerHTML = "";
    }
  }

  // Start interaction
  function startInteraction() {
    const selectedClientId = clientSelect.value;
    if (!selectedClientId) {
      alert("Por favor, seleccione un cliente antes de iniciar la llamada.");
      return;
    }

    isInteractionActive = true;
    callControls.classList.add("hidden");
    activeCall.classList.remove("hidden");
    callSummary.classList.add("hidden");

    // Clear previous conversation
    interactionArea.innerHTML = "";
    conversationHistory = [];

    iniciarLlamada();
  }

  // Stop interaction
  function stopInteraction() {
    isInteractionActive = false;
    isListening = false;
    stopListening();
    responsiveVoice.cancel();

    callControls.classList.remove("hidden");
    activeCall.classList.add("hidden");
    callSummary.classList.remove("hidden");

    // Generate call summary
    generateCallSummary();
  }

  // Start listening
  function startListening() {
    if (!isListening) {
      isListening = true;
      toggleMicBtn.classList.add("listening");
      recognition.start();
    }
  }

  // Stop listening
  function stopListening() {
    if (isListening) {
      isListening = false;
      toggleMicBtn.classList.remove("listening");
      recognition.stop();
    }
  }

  // Toggle microphone
  function toggleMicrophone() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  // Add message to conversation
  function addMessage(message, className) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.classList.add(className);
    interactionArea.appendChild(messageElement);
    interactionArea.scrollTop = interactionArea.scrollHeight;
    conversationHistory.push(message);
  }
  
  // Spanish Latin American Female
  async function speak(text) {
    return new Promise((resolve) => {
      responsiveVoice.speak(text, "Spanish Latin American Female", {
        pitch: 1,
        rate: 1.1,
        volume: 1,
        onend: resolve,
      });
    });
  }

  // Process user input
  async function processUserInput(input) {
    stopListening();
    toggleMicBtn.classList.add("processing");

    const response = await generateAIResponse(input);

    addMessage("Emma: " + response, "ai-message");
    await speak(response);

    await new Promise((resolve) => setTimeout(resolve, 500));

    toggleMicBtn.classList.remove("processing");
    if (isInteractionActive) {
      startListening();
    }
  }

  // Generate AI response - UPDATED to use standard OpenAI API
  async function generateAIResponse(input) {
    try {
      const selectedClientId = clientSelect.value;
      const selectedClient = clientes.find((cliente) => cliente.id == selectedClientId);
      
      // Personalizar el contexto con la información del cliente
      const clienteContexto = contextoGeneral
        .replace("{NOMBRE}", selectedClient.nombre)
        .replace("{ESTADO_MALETA}", selectedClient.estadoMaleta)
        .replace("{NUMERO_VUELO}", selectedClient.numeroVuelo);
      
      // Preparar el historial de conversación para la API
      const formattedHistory = [];
      
      // Convertir el historial de conversación al formato requerido por la API
      for (let i = 0; i < conversationHistory.length; i++) {
        const msg = conversationHistory[i];
        if (msg.startsWith("Cliente: ")) {
          formattedHistory.push({
            role: "user",
            content: msg.substring(9) // Eliminar "Cliente: "
          });
        } else if (msg.startsWith("Emma: ")) {
          formattedHistory.push({
            role: "assistant",
            content: msg.substring(6) // Eliminar "Emma: "
          });
        }
      }
      
      // Solicitud a la API de OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Usar el modelo adecuado
          messages: [
            { role: "system", content: clienteContexto },
            ...formattedHistory,
            { role: "user", content: input }
          ],
          max_tokens: 200,
          temperature: 0.1
        })
      });
      
      const data = await response.json();
      
      // Verificar si hay errores en la respuesta
      if (data.error) {
        console.error("Error de OpenAI:", data.error);
        return "Disculpe, parece que tenemos un problema técnico. ¿Podría repetir su última pregunta, por favor?";
      }
      
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error al generar la respuesta de IA:", error);
      return "Disculpe, parece que tenemos un problema técnico. ¿Podría repetir su última pregunta, por favor?";
    }
  }

  // Start call - MODIFIED for luggage tracking
  async function iniciarLlamada() {
    const selectedClientId = clientSelect.value;
    const selectedClient = clientes.find((cliente) => cliente.id == selectedClientId);
    if (!selectedClient) {
      alert("Por favor, seleccione un cliente antes de iniciar la llamada.");
      stopInteraction();
      return;
    }

    let saludoInicial = `Hola ${selectedClient.nombre}, le habla Emma, su asistente virtual de rastreo de equipajes. `;
    
    if (selectedClient.estadoMaleta === "En Curso") {
      saludoInicial += `Le llamo para informarle sobre el estado de su maleta del vuelo ${selectedClient.numeroVuelo}. Su equipaje se encuentra actualmente en tránsito. ¿En qué puedo ayudarle?`;
    } else {
      saludoInicial += `Le llamo respecto a su maleta del vuelo ${selectedClient.numeroVuelo}. Lamentablemente, su equipaje figura como extraviado. ¿Cómo puedo asistirle hoy?`;
    }

    addMessage("Emma: " + saludoInicial, "ai-message");
    await speak(saludoInicial);
    startListening();
  }

  // Export conversation
  function exportConversation() {
    const blob = new Blob([conversationHistory.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registro_llamada.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generate call summary
  function generateCallSummary() {
    // Simulate sentiment analysis
    const sentimentOptions = ["Positivo", "Negativo", "Neutral"];
    const sentimentResult = sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];

    const emotions = ["Satisfacción", "Interés", "Preocupación", "Confianza", "Frustración"];

    const dominantEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const negotiationScore = Math.floor(Math.random() * 101);

    // Display sentiment results
    document.getElementById("sentiment-result").innerHTML = `
            <h4>Análisis de Sentimiento</h4>
            <p>Sentimiento general: <strong>${sentimentResult}</strong></p>
        `;

    document.getElementById("emotions-result").innerHTML = `
            <h4>Emociones Detectadas</h4>
            <p>Emoción dominante: <strong>${dominantEmotion}</strong></p>
        `;

    document.getElementById("negotiation-result").innerHTML = `
            <h4>Efectividad de Comunicación</h4>
            <p>Puntuación: <strong>${negotiationScore}/100</strong></p>
        `;

    // Calculate costs
    const wordCount = countWords(conversationHistory.join(" "));
    const tokenCount = estimateTokens(conversationHistory.join(" "));
    const cost = calculateCost(tokenCount);

    // Display cost analysis
    document.getElementById("text-analysis-results").innerHTML = `
            <h4>Análisis de Costos</h4>
            <p>Palabras totales: <strong>${wordCount}</strong></p>
            <p>Tokens estimados: <strong>${tokenCount}</strong></p>
            <p>Costo estimado: <strong>$${cost.toFixed(4)}</strong></p>
        `;
  }

  // Helper functions for cost analysis
  function countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  function estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  function calculateCost(tokenCount) {
    const ratePerThousandTokens = 0.025;
    return (tokenCount / 1000) * ratePerThousandTokens;
  }
});

// This code would be executed if run in a browser environment
console.log("Luggage tracking assistant with OpenAI integration ready for implementation");
