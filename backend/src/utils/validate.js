const Joi = require("joi")

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    if (error) {
        const messages = error.details.map((d) => d.message)
        return res.status(400).json({ success: false, errors: messages })
    }
    next()
}

const passwordValidator = Joi.string()
    .min(8)
    .max(72)
    .pattern(/[A-Z]/, "uppercase letter")
    .pattern(/[a-z]/, "lowercase letter")
    .pattern(/[0-9]/, "number")
    .pattern(/[!@#$%^&*()_+\-=]/, "special character")
    .required()
    .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.name": "Password must contain at least one {#name}",
        "any.required": "Password is required",
    })

const humanText = Joi.extend((joi) => ({
    type: "humanText",
    base: joi.string(),
    messages: {
        "humanText.empty": "Text cannot be empty",
        "humanText.notHuman": "Text must look like human language",
    },
    rules: {
        isHuman: {
            validate(value, helpers) {
                const sanitized = value.trim().replace(/\s+/g, " ")

                if (sanitized.length === 0) {
                    return helpers.error("humanText.empty")
                }

                if (!/[a-zA-Z]/.test(sanitized)) {
                    return helpers.error("humanText.notHuman")
                }

                if (!/[aeiouAEIOU]/.test(sanitized)) {
                    return helpers.error("humanText.notHuman")
                }

                if (/^[\d\W]+$/.test(sanitized)) {
                    return helpers.error("humanText.notHuman")
                }

                if (/^(.)\1{4,}$/.test(sanitized)) {
                    return helpers.error("humanText.notHuman")
                }

                return sanitized
            },
        },
    },
}))

const schemas = {
    register: Joi.object({
        full_name: Joi.string().trim().min(2).max(100).required().messages({
            "string.empty": "Vui lòng nhập họ và tên",
            "string.min": "Họ và tên phải có ít nhất 2 ký tự",
            "string.max": "Họ và tên không vượt quá 100 ký tự",
            "any.required": "Vui lòng nhập họ và tên",
        }),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: passwordValidator,
        role: Joi.string().valid("job_seeker", "recruiter").default("job_seeker"),
    }),

    login: Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: passwordValidator,
    }),

    job: Joi.object({
        title: humanText.humanText().isHuman().max(200).required(),
        description: humanText.humanText().isHuman().max(5000).required(),
        responsibilities: humanText.humanText().isHuman().max(500).allow("", null),
        required_qualifications: humanText.humanText().isHuman().max(500).allow("", null),
        salary_min: Joi.number().integer().min(0).allow(null),
        salary_max: Joi.when("salary_min", {
            is: Joi.number().min(0),
            then: Joi.number().integer().min(Joi.ref("salary_min")).allow(null, ""),
            otherwise: Joi.number().integer().min(0).allow(null, ""),
        }),
        currency: Joi.string().uppercase().valid("USD", "EUR", "GBP", "JPY", "VND"),
        location: Joi.string().trim().max(20).allow("", null),
        job_type: Joi.string().valid("Full-time", "Part-time", "Contract", "Internship", "Temporary"),
        publishing_date: Joi.date().iso(),
        application_deadline: Joi.date().iso(),
    }),

    googleLogin: Joi.object({
        code: Joi.string().required(),
        redirect_uri: Joi.string().required(),
    }),

    profile: Joi.object({
        full_name: Joi.string().trim().min(2).max(100).messages({
            "string.min": "Họ và tên phải có ít nhất 2 ký tự",
            "string.max": "Họ và tên không vượt quá 100 ký tự",
        }),
        phone: Joi.string().trim().max(20).pattern(/^[+\d\s\-()]+$/).allow("", null).messages({
            "string.pattern.base": "Số điện thoại không hợp lệ",
            "string.max": "Số điện thoại không vượt quá 20 ký tự",
        }),
        date_of_birth: Joi.alternatives().try(
            Joi.date().less("now").iso(),
            Joi.string().valid("", null),
            Joi.valid(null),
        ).messages({
            "date.less": "Ngày sinh phải nhỏ hơn ngày hiện tại",
        }),
        gender: Joi.string().valid("male", "female", "other", "").allow(null),
        address: Joi.alternatives().try(
            Joi.object({
                street: Joi.string().trim().max(200).allow("", null),
                ward_code: Joi.alternatives().try(Joi.number().integer(), Joi.string().allow("")).allow(null),
                ward_name: Joi.string().allow("", null),
                district_code: Joi.alternatives().try(Joi.number().integer(), Joi.string().allow("")).allow(null),
                district_name: Joi.string().allow("", null),
                province_code: Joi.alternatives().try(Joi.number().integer(), Joi.string().allow("")).allow(null),
                province_name: Joi.string().allow("", null),
            }),
            Joi.valid(null),
        ),
        bio: Joi.string().trim().max(500).allow("", null),
    }).min(1),
}

module.exports = { validate, schemas }
