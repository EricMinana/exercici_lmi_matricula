import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Arxius estàtics
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST: processa el formulari
app.post('/enviar-matricula', async (req, res) => {
    try {
        const dadesMatricula = req.body;

        // Assegurem que 'moduls' sigui un array
        if (typeof dadesMatricula.moduls === 'string') {
            dadesMatricula.moduls = dadesMatricula.moduls.split(',').map(a => a.trim());
        }

        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

        const xmlPath = path.join(uploadsDir, 'matricula.xml');
        const foPath = path.join(uploadsDir, 'matricula.fo');
        const pdfPath = path.join(uploadsDir, 'matricula.pdf');

        const xmlContent = generarXML(dadesMatricula);
        fs.writeFileSync(xmlPath, xmlContent);

        await transformarXSLT(xmlPath, foPath);
        await generarPDF(foPath, pdfPath);

        res.download(pdfPath, 'matricula.pdf');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generant el PDF');
    }
});

function generarXML(dades) {
    const moduls = dades.moduls || [];
    const modulsXML = moduls.map(m => `<modul>${m}</modul>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<matricula>
  <nom>${dades.nom}</nom>
  <cognoms>${dades.cognoms}</cognoms>
  <email>${dades.email}</email>
  <adreca>${dades.adreca}</adreca>
  <telefon>${dades.telefon}</telefon>
  <cicle>${dades.cicle}</cicle>
  <curs>${dades.curs}</curs>
  <moduls>
    ${modulsXML}
  </moduls>
</matricula>`;
}

// Transformació XSLT → FO
function transformarXSLT(xmlPath, foPath) {
    return new Promise((resolve, reject) => {
        const xslPath = path.join(__dirname, 'xslt', 'matricula.xsl');
        const cmd = `xsltproc -o "${foPath}" "${xslPath}" "${xmlPath}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(`Error aplicant XSLT: ${stderr}`);
            } else {
                resolve();
            }
        });
    });
}

// Generació de PDF amb FOP
function generarPDF(foPath, pdfPath) {
    return new Promise((resolve, reject) => {
        const cmd = `fop "${foPath}" "${pdfPath}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(`Error generant PDF: ${stderr}`);
            } else {
                resolve();
            }
        });
    });
}

// Inici del servidor
app.listen(PORT, () => {
    console.log(`Servidor escoltant a http://localhost:${PORT}`);
});
