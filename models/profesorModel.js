import mongoose from 'mongoose';

const evaluacionesSchema = new mongoose.Schema({
  evaluador:{type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
  criterios: {
    experiencia: { type: Number, required: true, min: 0, max: 5 },
    diseno: { type: Number, required: true, min: 0, max: 5 },
    comunicacion: { type: Number, required: true, min: 0, max: 5 },
    compromiso: { type: Number, required: true, min: 0, max: 5 },
  },
  createdAt: {type: Date, default: Date.now},
});
const profesorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  img: {
    type: String,
  },
  carreras: [{
    type: String
  }],
  modalidad: [{
    type: String
  }],
  materias: [{
    type: String
  }],
  evaluaciones: [evaluacionesSchema],
  promedioCriterios: {
    experiencia: { type: Number, min: 0, max: 5, default: 0 },
    diseno: { type: Number, min: 0, max: 5, default: 0 },
    comunicacion: { type: Number, min: 0, max: 5, default: 0 },
    compromiso: { type: Number, min: 0, max: 5, default: 0 },
  },
  promedioGral: {type:Number, default: 0},
  total_evaluaciones: {type:Number, default: 0}
});

export default mongoose.model('Profesor', profesorSchema);