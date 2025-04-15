import express from 'express';
import profesorRouter from "./profesorRoutes.js";

const router = express.Router();

router.use('/api/prof', profesorRouter);

export default router;

