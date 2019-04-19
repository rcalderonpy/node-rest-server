const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

const app = express();
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');


// ===========================================
// Consigue todos los productos
// ===========================================
app.get('/productos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .sort('categoria')
        .skip(desde)
        .limit(limite)
        .exec((err, productosDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Producto.countDocuments({ disponible: true }, (err, cantidad) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                return res.json({
                    ok: true,
                    productos: productosDB,
                    cantidad
                })
            })

        })
        // trae todos los productos
        // populate: usuario, categoria
        // paginado
})

// ===========================================
// Obtener un producto por ID
// ===========================================
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: `No existe el producto ${id}`
                    }
                })
            }

            return res.json({
                ok: true,
                producto: productoDB
            })
        })
        // populate: usuario, categoria
})

// ===========================================
// Buscar Productos
// ===========================================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');


    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })
        })
})

// ===========================================
// Crear un nuevo producto
// ===========================================
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: true,
        usuario: req.usuario._id,
        categoria: body.categoria
    });

    producto.save({ runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
                code: 1
            })
        }

        // verificar si viene el dato categoría
        if (body.categoria) {
            Categoria.findById(body.categoria, (err, categoriaDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'No existe la categoría'
                        },
                        code: 2
                    })
                }

                res.json({
                    ok: true,
                    producto: productoDB
                })

            });
        } else {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'No envió el valor de categoría'
                }
            })
        }

    })

    // grabar el usuario
    // grabar una categoria del listado
})

// ===========================================
// Actualizar un producto
// ===========================================
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    body.disponible = body.disponible || true;

    let datos = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        usuario: req.usuario._id,
        categoria: body.categoria
    }

    Producto.findByIdAndUpdate(id, datos, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                    code: 1
                })
            }

            res.json({
                ok: true,
                producto: productoDB
            })

        })
        // grabar el usuario
        // grabar una categoria del listado
})

// ===========================================
// Borrar un producto
// ===========================================
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let datos = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, datos, { new: true }, (err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                    code: 1
                })
            }

            res.json({
                ok: true,
                producto: productoDB,
                msg: 'producto borrado satisfactoriamente'
            })

        })
        // borrado lógico, cambiar estado de campo disponible
})


module.exports = app;