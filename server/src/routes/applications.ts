import express from 'express';
import { db } from '../../db';
import { authenticateToken, authenticateAdmin } from '../../middleware/auth';
import { jobApplications } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all applications (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const applications = await db.select().from(jobApplications).orderBy(jobApplications.createdAt);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get a single application (admin only)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const [application] = await db.select().from(jobApplications).where(eq(jobApplications.id, applicationId));
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Create a new application
router.post('/', async (req, res) => {
  try {
    const { jobId, applicantName, email, phone, resumeUrl, coverLetter } = req.body;

    // Validate required fields
    if (!jobId || !applicantName || !email || !phone || !resumeUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          jobId: !jobId,
          applicantName: !applicantName,
          email: !email,
          phone: !phone,
          resumeUrl: !resumeUrl,
        }
      });
    }
    
    const [application] = await db.insert(jobApplications).values({
      jobId,
      applicantName,
      email,
      phone,
      resumeUrl,
      coverLetter,
      status: 'pending',
    }).returning();
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application status (admin only)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const { status } = req.body;
    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if application exists
    const [existingApplication] = await db.select().from(jobApplications).where(eq(jobApplications.id, applicationId));

    if (!existingApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const [application] = await db.update(jobApplications)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(jobApplications.id, applicationId))
      .returning();
    
    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

export default router; 