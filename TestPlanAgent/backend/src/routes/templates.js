import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { getDatabase } from '../services/database.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '../../templates'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Get all templates
router.get('/', (req, res) => {
  const db = getDatabase();
  db.all('SELECT id, name, is_default, created_at FROM templates ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get template by ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  db.get('SELECT * FROM templates WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(row);
  });
});

// Upload template (PDF)
router.post('/upload', upload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Extract text from PDF
    const fs = await import('fs');
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    const db = getDatabase();
    db.run(
      'INSERT INTO templates (name, content, file_path) VALUES (?, ?, ?)',
      [req.file.originalname, pdfData.text, filePath],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          success: true, 
          id: this.lastID,
          name: req.file.originalname,
          content: pdfData.text
        });
      }
    );
  } catch (error) {
    console.error('Template upload failed:', error.message);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

// Get default template
router.get('/default/content', (req, res) => {
  const db = getDatabase();
  db.get('SELECT * FROM templates WHERE is_default = 1 LIMIT 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'No default template found' });
    }
    res.json(row);
  });
});

// Delete template
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  db.run('DELETE FROM templates WHERE id = ? AND is_default = 0', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(400).json({ error: 'Cannot delete default template' });
    }
    res.json({ success: true, message: 'Template deleted' });
  });
});

export default router;
