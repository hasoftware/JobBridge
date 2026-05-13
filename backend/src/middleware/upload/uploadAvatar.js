const multer = require("multer")
const fs = require("fs")
const path = require("path")
const { upload } = require("../../../config")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(upload.base_path, "avatars")
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, uniqueName + path.extname(file.originalname))
    },
})

const fileFilter = (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (allowed.includes(file.mimetype)) return cb(null, true)
    const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
    error.message = "Only PNG/JPEG/JPG/WEBP allowed"
    cb(error, false)
}

const uploadAvatarMiddleware = (req, res, next) => {
    multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }).single("avatar")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") return res.status(400).json({ message: err.message })
            if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "Maximum file size is 2MB" })
        }
        next()
    })
}

module.exports = { uploadAvatarMiddleware }
