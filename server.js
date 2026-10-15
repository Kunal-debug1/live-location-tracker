const { tunnel: cloudflaredTunnel } = require("cloudflared")
const cookieParser = require("cookie-parser")
const socketIO = require("socket.io")
const config = require("./config")
const express = require("express")
const tarkine = require("tarkine")
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = new socketIO.Server(server)
const PORT = process.env.PORT || config.port
global.remoteURL
global.IO = io

// ── Security headers ──────────────────────────────────────────────────────────
// Applied to every response before any route handler.
// These headers reduce common attack surface without breaking functionality.
app.use((req, res, next) => {
    // Prevent MIME-type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY')
    // Disable legacy XSS auditor (modern browsers; avoids double-encoding attacks)
    res.setHeader('X-XSS-Protection', '0')
    // Only send referrer to same origin
    res.setHeader('Referrer-Policy', 'same-origin')
    // Remove Express fingerprint
    res.removeHeader('X-Powered-By')
    next()
})

// ── Middleware ────────────────────────────────────────────────────────────────
app.set("view engine", "html")
app.engine("html", tarkine.renderFile)
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + "/public"))
app.use(express.json({ limit: '10kb' }))  // Limit JSON body size

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/", require("./router"))

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).send('Not Found')
})

// ── Global error handler ──────────────────────────────────────────────────────
// Avoids leaking stack traces or internal paths to the client
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message)
    res.status(500).send('Internal Server Error')
})

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, async () => {
    const localURL = `http://localhost:${PORT}`
    if (process.env.PUBLIC_URL || process.env.REMOTE_URL) {
        remoteURL = process.env.PUBLIC_URL || process.env.REMOTE_URL
    } else {
        try {
            remoteURL = await cloudflaredTunnel({
                "--url": localURL
            }).url
        } catch (err) {
            console.warn('[WARN] Cloudflare tunnel initialization failed:', err.message)
            remoteURL = localURL
        }
    }

    console.log(`\n  ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗`)
    console.log(`  ██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝`)
    console.log(`  ██║  ███╗███████║██║   ██║███████╗   ██║   `)
    console.log(`  ██║   ██║██╔══██║██║   ██║╚════██║   ██║   `)
    console.log(`  ╚██████╔╝██║  ██║╚██████╔╝███████║   ██║   `)
    console.log(`   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   `)
    console.log(`         GHOST TRACK — Live Location Intel\n`)
    console.log(`  LOCAL  : ${localURL}`)
    console.log(`  REMOTE : ${remoteURL}`)
    console.log(`  DEPLOY : ${remoteURL}/weather  ← send to target\n`)
})