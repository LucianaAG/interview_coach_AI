// src/services/hugging_face_service.js
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { extract_text } from './pdf_service.js';

let vector_store = null; // Acá se almacenará el cv procesado

async function initialize_vector_store(pdf_path) { // Recibe un documento, lo divide, lo vectoriza y guarda en un espacio vectorial
  if (vector_store) {
    return vector_store;
  }
  
  const cv_text = await extract_text(pdf_path); // Obtiene todo el contenido del documento

  const splitter = new RecursiveCharacterTextSplitter({ // Divide el contenido del doc en bloques de 500 caracteres (En forma de cadena, no tokens)
    chunkSize: 500,                                     // Lo hace de forma recursiva
    chunkOverlap: 50
  });
  const docs = await splitter.createDocuments([cv_text]); // Almacena el contenido dividido (Un array de cadenas)

  const embeddings = new HuggingFaceInferenceEmbeddings({ // Define qué modelo de HF se usará para vectorizar el documento
    apiKey: process.env.HF_TOKEN,
    model: "sentence-transformers/all-MiniLM-L6-v2"
  });

  vector_store = await MemoryVectorStore.fromDocuments(docs, embeddings); // Vectoriza los caracteres divididos (embeddings, Ej: [[0.12, -0.87, 0.44, ...]])
                                                                          // y los guarda en un espacio vectorial

  return vector_store; // Devuelve el espacio vectorial
}


export async function search_relevant_context(question, pdf_path, amount_chunks = 2) {
  const store = await initialize_vector_store(pdf_path); // almacena el embedding devuelto

  const results = await store.similaritySearch(question, amount_chunks); // Busca en el embedding similitudes con la pregunta

  const context = results.map(doc => doc.pageContent).join('\n\n'); // Extrae las similitudes y arma un texto
  
  return context;
}


