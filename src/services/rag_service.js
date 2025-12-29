import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { extract_text } from "./pdf_service.js";

const sessions = new Map(); // Guarda los datos de la session actual (sessionId, pdfPath, vectorStore)
                            // permite tener un documento diferente por session y no recalcular embeddings por cada pregunta

export function setDocumentForSession(sessionId, pdfPath) {
  // evalua que exista un documento cargado, si este existe, se genera un sessionId
  // y a ese sessionId se le relaciona con un el path del documento, ademas del vectorStore
    if (!sessionId || !pdfPath) {
      throw new Error("El sessionId y el pdfPath son obligatorios");
    }

    sessions.set(sessionId, {
      pdfPath,
      vectorStore: null,
    });
}

async function initializeVectorStore(sessionId) {
  // evalua si para la session actual ya existe un vectorStore y lo devuelve
  // sino procede a extraer los datos del documento, divide el texto, vectoriza los chunks
  // y guarda el embedding en un vectorStore y lo devuelve
    const session = sessions.get(sessionId);

    if (!session) {
      throw new Error("No existe un CV cargado para esta sesión");
    }

    if (session.vectorStore) {
      return session.vectorStore;
    }

    const cvText = await extract_text(session.pdfPath); // lee y extrae el contenido

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const docs = await splitter.createDocuments([cvText]); // divide el contenido en chunks de 500 caracteres

    const embeddings = new HuggingFaceInferenceEmbeddings({ // vectoriza los chunks (embedding)
      apiKey: process.env.HF_TOKEN,
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings); // almacena el embedding generado en un vectorStore

    session.vectorStore = vectorStore;
    sessions.set(sessionId, session);

    return vectorStore;
}

export async function getContextForSession(sessionId, query, amountChunks = 2) {
  // recupera el vectorStore asociado a la session actual y busca por similitud 
  // devolviendo los fragmentos mas cercanos a la query
    if (!query) {
      throw new Error("La query es obligatoria");
    }

    const vectorStore = await initializeVectorStore(sessionId);

    const results = await vectorStore.similaritySearch(query, amountChunks);

    return results.map((doc) => doc.pageContent).join("\n\n");
}
