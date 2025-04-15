import express from "express";
import profesorController from "../controllers/profesorController.js";

const profesorRouter = new express.Router();

/**
 * Route to get the list of profesors.
 * @name GET /api/prof
 * @function
 * @memberof module:profesorRoutes
 * @inner
 * @param {string} path - API path.
 * @param {function} middleware - Controller to handle the request.
 */
profesorRouter.get("/", profesorController.listarProfesores);

/**
 * Search query route to search profesors.
 * @name GET /api/prof/buscar/?
 * @function
 * @memberof module:profesorRoutes
 * @inner
 * @param {string} path - API path.
 * @param {function} middleware - Controller to handle the request.
 */
profesorRouter.get("/buscar/?", profesorController.buscarProfesores);

/*
 * Route to score a profesor.
 * @name PUT /api/prof/evaluar
 * @function
 * @memberof module:profesorRoutes
 * @inner
 * @param {string} path - API path.
 * @param {function} middleware - Controller to handle the request.
 */
profesorRouter.post("/evaluar", profesorController.evaluarProfesor);

/**
 * Route to create a professor.
 * @name POST /api/prof/nuevo
 * @function
 * @memberof module:profesorRoutes
 * @inner
 * @param {string} path - API path.
 * @param {function} middleware - Controller to handle the request.
 */
profesorRouter.post("/nuevo", profesorController.crearProfesor);

/*
 * Route to get profesor details.
 * @name GET /api/prof/:id
 * @function
 * @memberof module:profesorRoutes
 * @inner
 * @param {string} path - API path.
 * @param {function} middleware - Controller to handle the request.
 */
profesorRouter.get("/:id", profesorController.obtenerProfe);

export default profesorRouter;
