import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { setDocumentForSession, getDocumentForSession } from "../services/rag_service.js";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const sessionId = req.headers["x-session-id"] || uuidv4();
    req.sessionId = sessionId;
    cb(null, `${sessionId}.pdf`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Solo se permiten archivos PDF"));
    }
    cb(null, true);
  }
});

export const uploadCvMiddleware = upload.single("doc");

export function uploadCvController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No se subió ningún archivo"
      });
    }

    const sessionId = req.sessionId;
    const pdfPath = req.file.path;

    const previousDoc = getDocumentForSession(sessionId);

    if (previousDoc?.pdfPath && fs.existsSync(previousDoc.pdfPath)) {
      try {
        fs.unlinkSync(previousDoc.pdfPath);
      } catch (err) {
        console.warn("No se pudo borrar el archivo anterior:", err.message);
      }
    }

    setDocumentForSession(sessionId, pdfPath);

    return res.status(200).json({
      sessionId
    });

  } catch (error) {
    console.error("Error al subir archivo:", error.message);

    return res.status(500).json({
      error: "Error interno al subir el archivo"
    });
  }
}

