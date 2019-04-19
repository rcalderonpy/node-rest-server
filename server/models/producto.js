var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');


var productoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'], unique: true },
    precioUni: { type: Number, required: [true, 'El precio únitario es necesario'] },
    descripcion: { type: String, required: false },
    img: { type: String, required: false },
    disponible: { type: Boolean, required: true, default: true },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
});

productoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Producto', productoSchema);