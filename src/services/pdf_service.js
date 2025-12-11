import fs from 'fs';
import pdf from 'pdf-parse-fork';

export async function extract_text(pdf_path) { // Abre el PDF, lo lee y devuelve su contenido en forma de String
  try {
    const data_buffer = fs.readFileSync(pdf_path);
    const data = await pdf(data_buffer);
    return data.text;
  } catch (error) {
    console.error('Error al leer PDF:', error);
    throw error;
  }
}
