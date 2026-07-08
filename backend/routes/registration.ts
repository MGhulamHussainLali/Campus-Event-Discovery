import { Router } from 'express';
import RegistrationController from '../controllers/RegistrationController';
import { authenticate, authorize } from '../middleware/auth';

export default function registrationRoutes(registrationController: RegistrationController): Router {
    const router = Router();

    router.post('/events/:id/rsvp', authenticate, authorize('student'), registrationController.rsvp);
    router.delete('/events/:id/rsvp', authenticate, authorize('student'), registrationController.cancel);
    router.get('/registrations/mine', authenticate, authorize('student'), registrationController.myRegistrations);
    router.get('/events/:id/attendees', authenticate, authorize('organizer'), registrationController.eventAttendees);

    return router;
}
