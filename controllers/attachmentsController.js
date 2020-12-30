const Attachment = require('../models/Attachment');
const path = require('path');
const { deleteFile } = require('../utils/s3utils');
const { Types } = require('mongoose');

module.exports = {
  createAttachment: async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(500).json({
        error: {
          message: 'Ha ocurrido un error al subir el archivo',
          status: 500,
          stack: '',
        },
      });
    }
    const newAttachment = new Attachment({
      title: file.originalname,
      contentType: file.mimetype,
      url: file.location,
      extension: path.extname(file.location),
    });

    newAttachment
      .save()
      .then((_doc) =>
        res.status(200).json({
          message: 'Se ha creado el attachment con exito',
          attachment: _doc,
        })
      )
      .catch((err) =>
        res.status(500).json({
          error: {
            message: 'Ha ocurrido un error al subir el archivo',
            status: 500,
            stack: '' + err.message,
          },
        })
      );
  },

  deleteAttachment: (req, res) => {
    const attach = req.body;
    deleteFile(attach.url, async () => {
      await Attachment.deleteOne({ _id: Types.ObjectId(attach._id) });
      res.status(200).json({
        message: 'El attachment ha sido eliminado con exito.',
      });
    });
  },
};
