import express from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Helper to extract LinkedIn username
const getLinkedInUsername = (url) => {
  if (!url) return '';
  const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
  return match ? `linkedin.com/in/${match[1]}` : url;
};

// Helper to extract GitHub username
const getGitHubUsername = (url) => {
  if (!url) return '';
  const match = url.match(/github\.com\/([^\/\?]+)/);
  return match ? `github.com/${match[1]}` : url;
};

router.post('/generate', async (req, res) => {
  try {
    const { personalInfo, summary, education, experience, projects, skills, leadership } = req.body;

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 50, right: 50 }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume_${personalInfo.firstName}_${personalInfo.lastName}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // HEADER - Name (Italic, Centered)
    doc.font('Times-Italic')
       .fontSize(20)
       .text(`${personalInfo.firstName} ${personalInfo.lastName}`.trim() || 'Your Name', {
         align: 'center'
       });

    doc.moveDown(0.3);

    // Address Line
    if (personalInfo.address) {
      doc.font('Helvetica')
         .fontSize(9)
         .text(personalInfo.address, { align: 'center' });
      doc.moveDown(0.2);
    }

    // Contact Information Row - Icons with text
    const contactItems = [];
    if (personalInfo.phone) contactItems.push(`📞 ${personalInfo.phone}`);
    if (personalInfo.email) contactItems.push(`✉ ${personalInfo.email}`);
    if (personalInfo.linkedin) contactItems.push(`🔗 ${getLinkedInUsername(personalInfo.linkedin)}`);
    if (personalInfo.github) contactItems.push(`🐙 ${getGitHubUsername(personalInfo.github)}`);

    if (contactItems.length > 0) {
      doc.font('Helvetica')
         .fontSize(9)
         .text(contactItems.join('   '), { align: 'center' });
    }

    doc.moveDown(0.8);

    // EDUCATION Section
    if (education && education.length > 0) {
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text('EDUCATION', { underline: true });
      
      doc.moveDown(0.3);

      education.forEach((edu) => {
        const startX = doc.x;
        const startY = doc.y;

        // Left side - University and Degree
        doc.font('Helvetica-Bold')
           .fontSize(9)
           .text(edu.university, startX, startY, { width: 350, continued: false });
        
        doc.font('Helvetica-Oblique')
           .fontSize(9)
           .text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, startX, doc.y);

        // Right side - Dates and City
        const rightX = 400;
        if (edu.startDate || edu.endDate) {
          doc.font('Helvetica-Bold')
             .fontSize(9)
             .text(`${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`, rightX, startY, { width: 150, align: 'right' });
        }
        if (edu.city) {
          doc.font('Helvetica')
             .fontSize(9)
             .text(edu.city, rightX, doc.y, { width: 150, align: 'right' });
        }

        doc.moveDown(0.5);
      });

      doc.moveDown(0.3);
    }

    // SUMMARY Section
    if (summary) {
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text('SUMMARY', { underline: true });
      
      doc.moveDown(0.3);

      doc.font('Helvetica')
         .fontSize(9)
         .text(summary, { align: 'left', lineGap: 2 });

      doc.moveDown(0.8);
    }

    // EXPERIENCE Section
    if (experience && experience.length > 0) {
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text('EXPERIENCE', { underline: true });
      
      doc.moveDown(0.3);

      experience.forEach((exp) => {
        const startX = doc.x;
        const startY = doc.y;

        // Left side - Company
        doc.font('Helvetica-Bold')
           .fontSize(9)
           .text(exp.company, startX, startY, { width: 350 });

        // Right side - Dates and Location
        const rightX = 400;
        doc.font('Helvetica-Bold')
           .fontSize(9)
           .text(`${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}`, rightX, startY, { width: 150, align: 'right' });
        
        if (exp.location) {
          doc.font('Helvetica')
             .fontSize(9)
             .text(exp.location, rightX, doc.y, { width: 150, align: 'right' });
        }

        // Job Title
        doc.font('Helvetica-Oblique')
           .fontSize(9)
           .text(exp.title, startX, doc.y);

        doc.moveDown(0.2);

        // Bullet Points with indentation
        if (exp.bulletPoints && exp.bulletPoints.length > 0) {
          exp.bulletPoints.forEach((bullet) => {
            if (bullet && bullet.trim()) {
              const bulletX = startX + 15; // Indentation
              doc.font('Helvetica')
                 .fontSize(9)
                 .text('•', startX + 10, doc.y)
                 .text(bullet, bulletX, doc.y - 9, { width: 500, indent: 0 });
              doc.moveDown(0.1);
            }
          });
        }

        doc.moveDown(0.5);
      });

      doc.moveDown(0.3);
    }

    // PROJECTS Section
    if (projects && projects.length > 0) {
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text('PROJECTS', { underline: true });
      
      doc.moveDown(0.3);

      projects.forEach((project) => {
        const startX = doc.x;

        // Project Name and Technologies
        let projectText = project.name;
        if (project.technologies && project.technologies.length > 0) {
          projectText += ` | ${project.technologies.join(', ')}`;
        }

        doc.font('Helvetica-Bold')
           .fontSize(9)
           .text(project.name, { continued: true })
           .font('Helvetica')
           .text(project.technologies && project.technologies.length > 0 ? ` | ` : '', { continued: true })
           .font('Helvetica-Oblique')
           .text(project.technologies && project.technologies.length > 0 ? project.technologies.join(', ') : '');

        doc.moveDown(0.2);

        // Bullet Points with indentation
        if (project.bulletPoints && project.bulletPoints.length > 0) {
          project.bulletPoints.forEach((bullet) => {
            if (bullet && bullet.trim()) {
              const bulletX = startX + 15;
              doc.font('Helvetica')
                 .fontSize(9)
                 .text('•', startX + 10, doc.y)
                 .text(bullet, bulletX, doc.y - 9, { width: 500 });
              doc.moveDown(0.1);
            }
          });
        }

        doc.moveDown(0.4);
      });

      doc.moveDown(0.3);
    }

    // TECHNICAL SKILLS Section
    if (skills && skills.length > 0) {
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text('TECHNICAL SKILLS', { underline: true });
      
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold')
         .fontSize(9)
         .text('Skills: ', { continued: true })
         .font('Helvetica')
         .text(skills.join(', '));

      doc.moveDown(0.8);
    }

    // LEADERSHIP / EXTRACURRICULAR Section
    if (leadership && leadership.length > 0) {
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text('LEADERSHIP / EXTRACURRICULAR', { underline: true });
      
      doc.moveDown(0.3);

      leadership.forEach((lead) => {
        const startX = doc.x;
        const startY = doc.y;

        // Left side - Organization
        doc.font('Helvetica-Bold')
           .fontSize(9)
           .text(lead.organization, startX, startY, { width: 350 });

        // Right side - Dates
        if (lead.startDate || lead.endDate) {
          const rightX = 400;
          doc.font('Helvetica-Bold')
             .fontSize(9)
             .text(`${formatDate(lead.startDate)} - ${formatDate(lead.endDate)}`, rightX, startY, { width: 150, align: 'right' });
        }

        // Title
        doc.font('Helvetica-Oblique')
           .fontSize(9)
           .text(lead.title, startX, doc.y);

        doc.moveDown(0.2);

        // Bullet Points with indentation
        if (lead.bulletPoints && lead.bulletPoints.length > 0) {
          lead.bulletPoints.forEach((bullet) => {
            if (bullet && bullet.trim()) {
              const bulletX = startX + 15;
              doc.font('Helvetica')
                 .fontSize(9)
                 .text('•', startX + 10, doc.y)
                 .text(bullet, bulletX, doc.y - 9, { width: 500 });
              doc.moveDown(0.1);
            }
          });
        }

        doc.moveDown(0.4);
      });
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

export default router;
