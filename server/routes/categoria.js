const express = require('express');
const Categoria = require('../models/categoria');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// =================================
// Mostrar todas las categorías
// =================================
app.get('/categorias', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('-descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Categoria.countDocuments({}, (err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        od: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });

        })
});


// =================================
// Mostrar una categoría por id
// =================================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `No existe la categoría solicitada con id=${id}`
                }
            })
        }

        res.json({
            ok: true,
            categoria,
        });

    })
});

// =================================
// Crear nueva categoría
// =================================
app.post('/categoria', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        // usuarioDB.password = null;

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

});


// =================================
// Actualiza una categoría
// =================================
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' },
        (err, categoriaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            })

        })
})

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada
        });


    })

    // Usuario.findByIdAndUpdate(id, { estado: false }, { new: true },
    //     (err, usuarioBorrado) => {
    //         if (err) {
    //             return res.status(400).json({
    //                 ok: false,
    //                 err
    //             })
    //         }

    //         res.json({
    //             ok: true,
    //             usuario: usuarioBorrado
    //         })

    //     })
});


module.exports = app;