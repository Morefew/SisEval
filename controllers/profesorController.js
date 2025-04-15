import ProfesorModel from "../models/profesorModel.js";
import userModel from "../models/userModel.js";
import { isValidObjectId } from "mongoose";

/*
 * Professor model controller object.
 */
const profesorController = {};

/*
 * List professors
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to an HTTP response with the list of professors or an error.
 */
profesorController.listarProfesores = async (req, res) => {
  try {
    // armado del pipeline
    const pipeline = [
      {
        $project: {
          nombre: 1,
          img: 1,
          carreras: 1,
          modalidad: 1,
          materias: 1,
          promedioCriterios: 1,
          promedioGral: 1,
          total_evaluaciones: 1,
        },
      },
      {
        $sort: {
          nombre: 1, // 1 for ascending order (A-Z)
        },
      },
    ];

    // execution of the aggregation pipeline
    const data = await ProfesorModel.aggregate(pipeline);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error al listar profesores:", error);
    res.status(500).json({
      success: false,
      message: "Error al recuperar lista de profesores",
      error: error.message,
    });
  }
};

/**
 * Search professors
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to an HTTP response with the list of professors or an error.
 */
profesorController.buscarProfesores = async (req, res) => {
  try {
    const { tipoBusqueda, terminoBusqueda } = req.query;
    console.log("Valores de busqueda: ", tipoBusqueda, terminoBusqueda);

    if (!tipoBusqueda || !terminoBusqueda) {
      return res.status(400).json({
        success: false,
        message: "Se requiere tipo de búsqueda y término de búsqueda",
      });
    }

    let pipeline = [];

    // Search stage according to the selected type
    if (tipoBusqueda === "nombre") {
      pipeline.push({
        $match: {
          nombre: { $regex: terminoBusqueda, $options: "i" },
        },
      });
    } else if (tipoBusqueda === "materia") {
      pipeline.push({
        $match: {
          materias: {
            $regex: terminoBusqueda,
            $options: "i",
          },
        },
      });
    } else if (tipoBusqueda === "carrera") {
      pipeline.push({
        $match: {
          carreras: {
            $regex: terminoBusqueda,
            $options: "i",
          },
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Tipo de búsqueda no válido",
      });
    }

    pipeline.push({
      $sort: {
        promedioGral: -1,
      },
    });

    // Add additional stages if needed
    // This setting determines which fields to display
    pipeline.push({
      $project: {
        nombre: 1,
        img: 1,
        modalidad: 1,
        carreras: 1,
        materias: 1,
        promedioCriterios: 1,
        promedioGral: 1,
        total_evaluaciones: 1,
      },
    });

    console.log(pipeline);

    // Executes the aggregation
    const profesor = await ProfesorModel.aggregate(pipeline);

    return res.status(200).send(profesor);
  } catch (error) {
    console.error("Error al buscar profesor:", error);
    return res.status(500).json({
      success: false,
      message: "Error al buscar profesor",
      error: error.message,
    });
  }
};

/*
 * Get professor details
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to an HTTP response with the professor details or an error.
 */
profesorController.obtenerProfe = async (req, res) => {
  const id = req.params.id;

  try {
    const profe = await ProfesorModel.findById(id);
    console.log(`No existe Profesor(a) en la BD con el id: ${id} `);
    if (!profe) {
      return res
        .status(404)
        .json({ message: `No existe Profesor(a) en la BD con el id: ${id}` });
    }
    res.status(302).json(profe);
  } catch (error) {
    res.status(500).json({ message: "Error al listar profesor(a)", error });
  }
};

/*
 * Create professor
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to an HTTP response with the created professor or an error.
 */
profesorController.crearProfesor = async (req, res) => {
  const { nombre, img, materias, carreras, modalidad } = req.body;

  try {
    const nuevoProfesor = new ProfesorModel({
      nombre,
      img,
      materias,
      carreras,
      modalidad,
    });
    await nuevoProfesor.save();
    res.status(201).json(nuevoProfesor);
  } catch (error) {
    res.status(500).json({ message: "Error al crear profesor", error });
  }
};

/*
 * Evaluate professor
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to an HTTP response with the evaluation or an error.
 */
profesorController.evaluarProfesor = async (req, res) => {
  console.log("Cuerpo de la Evaluacion: ", req.body);
  try {
    let { profId, evaluadorId, experiencia, diseno, comunicacion, compromiso } =
      req.body;

    // Validation of input fields
    if (
      !profId ||
      !evaluadorId ||
      !experiencia ||
      !diseno ||
      !comunicacion ||
      !compromiso
    ) {
      console.log(
        `Campos faltantes - profId: ${profId}, evaluadorId: ${evaluadorId}, experiencia: ${experiencia}, diseno: ${diseno}, comunicacion: ${comunicacion}, compromiso: ${compromiso}`
      );
      return res.status(400).json({ message: "Faltan Campos Requeridos" });
    }

    if (!isValidObjectId(profId)) {
      return res
        .status(406)
        .json({ message: "ID de Profesor(a) provisto es invalido" });
    }

    let prof = await ProfesorModel.findById(profId);

    if (!prof) {
      console.log(
        "Profesor(a) No Encontrado en la BD, ID incorrecto: ",
        profId
      );
      return res.status(404).json({ message: "ID Profesor(a) incorrecto" });
    }

    console.log("Profesor Encontrado: ", prof.nombre);

    if (!isValidObjectId(evaluadorId)) {
      return res
        .status(406)
        .json({ message: "ID de Evaluador(a) provisto es invalido" });
    }
    let evaluador = await userModel.findById(evaluadorId);
    if (!evaluador) {
      console.log(
        "Evaluador(a) No Encontrado en la BD, ID incorrecto: ",
        profId
      );
      return res.status(404).json({ message: "ID Evaluador incorrecto" });
    }

    // Scores are limited to between 0 and 5
    const puntuaciones = [experiencia, diseno, comunicacion, compromiso];
    if (puntuaciones.some((valor) => valor < 0 || valor > 5)) {
      return res
        .status(406)
        .json({ message: "Las puntuaciones deben estar entre 0 y 5" });
    }

    const nuevoTotalEval = prof.total_evaluaciones + 1;

    const promExperiencia = parseFloat(
      (
        (prof.promedioCriterios.experiencia * prof.total_evaluaciones +
          experiencia) /
        nuevoTotalEval
      ).toFixed(1)
    );
    const promDiseno = parseFloat(
      (
        (prof.promedioCriterios.diseno * prof.total_evaluaciones + diseno) /
        nuevoTotalEval
      ).toFixed(1)
    );
    const promComunicacion = parseFloat(
      (
        (prof.promedioCriterios.comunicacion * prof.total_evaluaciones +
          comunicacion) /
        nuevoTotalEval
      ).toFixed(1)
    );
    const promCompromiso = parseFloat(
      (
        (prof.promedioCriterios.compromiso * prof.total_evaluaciones +
          compromiso) /
        nuevoTotalEval
      ).toFixed(1)
    );

    const evaluacion = {
      evaluador,
      criterios: {
        experiencia,
        diseno,
        comunicacion,
        compromiso,
      },
    };

    try {
      prof.promedioCriterios = {
        experiencia: promExperiencia,
        diseno: promDiseno,
        comunicacion: promComunicacion,
        compromiso: promCompromiso,
      };

      prof.promedioGral = parseFloat(
        (
          (promExperiencia + promDiseno + promComunicacion + promCompromiso) /
          4
        ).toFixed(1)
      );
      prof.total_evaluaciones = nuevoTotalEval;
      prof.evaluaciones.push(evaluacion);
      await prof.save();
      res.status(201).json({
        message: "Evaluacion Agregada Satisfactoriamente",
        profesor: prof,
      });
    } catch (error) {
      console.log("Error al Guardar Evaluacion", error);
      return res.status(500).json({ message: "Error al Guardar Evaluacion" });
    }
  } catch (error) {
    console.log("Error Interno del Servidor: ", error);
    res.status(500).json({ message: "Error Interno del Servidor" });
  }
};

/*
 * Update professor
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to an HTTP response with the updated professor or an error.
 */
profesorController.actualizarProfesor = async (req, res) => {
  const { id, nombre, materias, carreras, modalidad } = req.body;

  try {
    const profesor = await ProfesorModel.findByIdAndUpdate(
      id,
      {
        nombre,
        materias,
        carreras,
        modalidad,
      },
      { new: true }
    );
    if (!profesor) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }
    res.status(200).json(profesor);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar profesor", error });
  }
};

/**
 * Delete professor
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to an HTTP response indicating the deletion of the professor or an error.
 */
profesorController.eliminarProfesor = async (req, res) => {
  const { id } = req.params;

  try {
    const profesor = await ProfesorModel.findByIdAndDelete(id);
    if (!profesor) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }
    res.status(200).json({ message: "Profesor eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar profesor", error });
  }
};

export default profesorController;
