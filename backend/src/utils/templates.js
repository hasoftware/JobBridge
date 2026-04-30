const fs = require("fs")
const path = require("path")

const TEMPLATE_DIR = path.join(__dirname, "..", "templates")

function render(templateName, vars = {}) {
    const filePath = path.join(TEMPLATE_DIR, `${templateName}.html`)
    let html = fs.readFileSync(filePath, "utf8")
    for (const [key, value] of Object.entries(vars)) {
        html = html.split(`{{${key}}}`).join(String(value))
    }
    return html
}

module.exports = { render }
