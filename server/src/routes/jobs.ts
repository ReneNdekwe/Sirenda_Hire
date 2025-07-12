import express from 'express';
import { db } from '../../db';
import { authenticateToken } from '../../middleware/auth';
import { jobListings } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all job listings
router.get('/', async (req, res) => {
  try {
    const jobs = await db.select().from(jobListings).orderBy(jobListings.postedDate);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch job listings' });
  }
});

// Get a single job listing
router.get('/:id', async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }
    
    const [job] = await db.select().from(jobListings).where(eq(jobListings.id, jobId));
    
    if (!job) {
      return res.status(404).json({ error: 'Job listing not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job listing' });
  }
});

// Create a new job listing (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, department, location, type, description, requirements } = req.body;

    // Validate required fields
    if (!title || !department || !location || !type || !description || !requirements) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          title: !title,
          department: !department,
          location: !location,
          type: !type,
          description: !description,
          requirements: !requirements,
        }
      });
    }

    // Validate requirements is an array
    if (!Array.isArray(requirements)) {
      return res.status(400).json({ error: 'Requirements must be an array' });
    }
    
    const [job] = await db.insert(jobListings).values({
      title,
      department,
      location,
      type,
      description,
      requirements,
      postedDate: new Date(),
    }).returning();
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job listing' });
  }
});

// Update a job listing (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const { title, department, location, type, description, requirements } = req.body;

    // Validate required fields
    if (!title || !department || !location || !type || !description || !requirements) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          title: !title,
          department: !department,
          location: !location,
          type: !type,
          description: !description,
          requirements: !requirements,
        }
      });
    }

    // Validate requirements is an array
    if (!Array.isArray(requirements)) {
      return res.status(400).json({ error: 'Requirements must be an array' });
    }

    // Check if job exists
    const [existingJob] = await db.select().from(jobListings).where(eq(jobListings.id, jobId));

    if (!existingJob) {
      return res.status(404).json({ error: 'Job listing not found' });
    }
    
    const [job] = await db.update(jobListings)
      .set({
        title,
        department,
        location,
        type,
        description,
        requirements,
      })
      .where(eq(jobListings.id, jobId))
      .returning();
    
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job listing' });
  }
});

// Delete a job listing (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    // Check if job exists
    const [existingJob] = await db.select().from(jobListings).where(eq(jobListings.id, jobId));

    if (!existingJob) {
      return res.status(404).json({ error: 'Job listing not found' });
    }

    await db.delete(jobListings).where(eq(jobListings.id, jobId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job listing' });
  }
});

export default router; 