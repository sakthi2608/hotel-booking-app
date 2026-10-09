const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const cors = require("cors");
const dns = require("dns");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

dns.setDefaultResultOrder("ipv4first");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloudinary configured:", {
    cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: !!process.env.CLOUDINARY_API_KEY,
    apiSecret: !!process.env.CLOUDINARY_API_SECRET
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : undefined
});

pool.on("error", (error) => {
    console.error("Unexpected database error:", error);
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "savi-hotels",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 8 * 1024 * 1024,
        files: 5
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only JPG, PNG and WEBP images are allowed")
            );
        }

        callback(null, true);
    }
});

const hotelUpload = (req, res, next) => {
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "gallery", maxCount: 4 }
    ])(req, res, (error) => {
        if (error) {
            console.error("HOTEL UPLOAD ERROR:", error);

            return res.status(400).json({
                message: "Hotel image upload failed",
                error: error.message
            });
        }

        next();
    });
};

const parseJsonArray = (value, fallback = []) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (Array.isArray(value)) {
        return value;
    }

    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
        throw new Error("Expected a JSON array");
    }

    return parsed;
};

const parseCommaList = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    return value === true || value === "true";
};

const validateHotel = (body) => {
    const {
        title,
        description,
        location,
        latitude,
        longitude,
        price
    } = body;

    if (
        !String(title || "").trim() ||
        !String(description || "").trim() ||
        !String(location || "").trim()
    ) {
        return "Title, description and location are required";
    }

    if (
        latitude === undefined ||
        longitude === undefined ||
        price === undefined ||
        latitude === "" ||
        longitude === "" ||
        price === ""
    ) {
        return "Latitude, longitude and price are required";
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const cost = Number(price);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        !Number.isFinite(cost)
    ) {
        return "Latitude, longitude and price must be valid numbers";
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return "Invalid latitude or longitude";
    }

    if (cost <= 0) {
        return "Price must be greater than zero";
    }

    return null;
};

const buildGallery = (files, types) => {
    const galleryTypes = Array.isArray(types)
        ? types
        : types
            ? [types]
            : [];

    return (files || []).map((file, index) => ({
        image: file.path,
        type: galleryTypes[index] || "Other"
    }));
};

async function startServer() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hotels (
                id SERIAL PRIMARY KEY,
                image TEXT,
                title TEXT,
                description TEXT,
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                price NUMERIC,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                location TEXT,
                highlights JSONB DEFAULT '[]'::jsonb,
                facilities JSONB DEFAULT '[]'::jsonb,
                gallery JSONB DEFAULT '[]'::jsonb,
                total_rooms INTEGER,
                room_type VARCHAR(100),
                guests_per_room INTEGER,
                room_types JSONB DEFAULT '[]'::jsonb,
                reception_number VARCHAR(20),
                breakfast_included BOOLEAN DEFAULT FALSE,
                free_cancellation BOOLEAN DEFAULT FALSE,
                pay_at_hotel BOOLEAN DEFAULT FALSE,
                room_view VARCHAR(100),
                house_rules JSONB DEFAULT '[]'::jsonb
            )
        `);

        const migrations = [
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image TEXT",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS title TEXT",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS description TEXT",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS price NUMERIC",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS location TEXT",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS total_rooms INTEGER",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS room_type VARCHAR(100)",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS guests_per_room INTEGER",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS room_types JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS reception_number VARCHAR(20)",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS breakfast_included BOOLEAN DEFAULT FALSE",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS free_cancellation BOOLEAN DEFAULT FALSE",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS pay_at_hotel BOOLEAN DEFAULT FALSE",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS room_view VARCHAR(100)",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS house_rules JSONB DEFAULT '[]'::jsonb"
        ];

        for (const migration of migrations) {
            await pool.query(migration);
        }

        console.log("Hotels table ready");

        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running");
        });
    } catch (error) {
        console.error("DATABASE SETUP ERROR:", error);
        process.exit(1);
    }
}

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            status: "ok",
            database: "connected"
        });
    } catch (error) {
        console.error("HEALTH CHECK ERROR:", error);

        res.status(500).json({
            status: "error",
            database: "disconnected",
            error: error.message
        });
    }
});

app.post("/api/hotels", hotelUpload, async (req, res) => {
    try {
        console.log("ADD HOTEL REQUEST RECEIVED");

        const {
            title,
            description,
            location,
            latitude,
            longitude,
            price,
            reception_number,
            room_types,
            highlights,
            facilities,
            breakfast_included,
            free_cancellation,
            pay_at_hotel,
            room_view,
            house_rules
        } = req.body;

        const mainImage = req.files?.image?.[0];

        if (!mainImage) {
            return res.status(400).json({
                message: "Main hotel image is required"
            });
        }

        const validationError = validateHotel(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        let roomTypesArray;
        let houseRulesArray;

        try {
            roomTypesArray = parseJsonArray(room_types);
            houseRulesArray = parseJsonArray(house_rules);
        } catch (error) {
            return res.status(400).json({
                message: "Invalid room types or house rules data",
                error: error.message
            });
        }

        if (roomTypesArray.length === 0) {
            return res.status(400).json({
                message: "At least one room type is required"
            });
        }

        for (const room of roomTypesArray) {
            if (
                !room.type ||
                !Number.isFinite(Number(room.rooms)) ||
                !Number.isFinite(Number(room.guestsPerRoom)) ||
                Number(room.rooms) <= 0 ||
                Number(room.guestsPerRoom) <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid room type details"
                });
            }
        }

        const galleryImages = buildGallery(
            req.files?.gallery,
            req.body.galleryType
        );

        const result = await pool.query(
            `INSERT INTO hotels (
                image,
                title,
                description,
                location,
                latitude,
                longitude,
                price,
                reception_number,
                room_types,
                highlights,
                facilities,
                gallery,
                breakfast_included,
                free_cancellation,
                pay_at_hotel,
                room_view,
                house_rules
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9,
                $10, $11, $12, $13, $14, $15, $16, $17
            )
            RETURNING *`,
            [
                mainImage.path,
                title.trim(),
                description.trim(),
                location.trim(),
                Number(latitude),
                Number(longitude),
                Number(price),
                reception_number || null,
                JSON.stringify(roomTypesArray),
                JSON.stringify(parseCommaList(highlights)),
                JSON.stringify(parseCommaList(facilities)),
                JSON.stringify(galleryImages),
                parseBoolean(breakfast_included),
                parseBoolean(free_cancellation),
                parseBoolean(pay_at_hotel),
                room_view || null,
                JSON.stringify(houseRulesArray)
            ]
        );

        console.log("HOTEL CREATED:", result.rows[0].id);

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("CREATE HOTEL ERROR:", error);

        return res.status(500).json({
            message: "Failed to create hotel",
            error: error.message
        });
    }
});

app.put("/api/hotels/:id", hotelUpload, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid hotel ID"
            });
        }

        const existingResult = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        const existing = existingResult.rows[0];
        const validationError = validateHotel(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        let roomTypesArray;
        let houseRulesArray;

        try {
            roomTypesArray = parseJsonArray(
                req.body.room_types,
                existing.room_types || []
            );

            houseRulesArray = parseJsonArray(
                req.body.house_rules,
                existing.house_rules || []
            );
        } catch (error) {
            return res.status(400).json({
                message: "Invalid room types or house rules data",
                error: error.message
            });
        }

        if (roomTypesArray.length === 0) {
            return res.status(400).json({
                message: "At least one room type is required"
            });
        }

        for (const room of roomTypesArray) {
            if (
                !room.type ||
                !Number.isFinite(Number(room.rooms)) ||
                !Number.isFinite(Number(room.guestsPerRoom)) ||
                Number(room.rooms) <= 0 ||
                Number(room.guestsPerRoom) <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid room type details"
                });
            }
        }

        const mainImage = req.files?.image?.[0];
        const imagePath = mainImage
            ? mainImage.path
            : existing.image;

        let galleryImages = Array.isArray(existing.gallery)
            ? existing.gallery
            : [];

        const galleryFiles = req.files?.gallery || [];

        if (galleryFiles.length > 0) {
            galleryImages = buildGallery(
                galleryFiles,
                req.body.galleryType
            );
        }

        const result = await pool.query(
            `UPDATE hotels SET
                image = $1,
                title = $2,
                description = $3,
                location = $4,
                latitude = $5,
                longitude = $6,
                price = $7,
                reception_number = $8,
                room_types = $9,
                highlights = $10,
                facilities = $11,
                gallery = $12,
                breakfast_included = $13,
                free_cancellation = $14,
                pay_at_hotel = $15,
                room_view = $16,
                house_rules = $17
            WHERE id = $18
            RETURNING *`,
            [
                imagePath,
                req.body.title.trim(),
                req.body.description.trim(),
                req.body.location.trim(),
                Number(req.body.latitude),
                Number(req.body.longitude),
                Number(req.body.price),
                req.body.reception_number !== undefined
                    ? req.body.reception_number
                    : existing.reception_number,
                JSON.stringify(roomTypesArray),
                JSON.stringify(
                    req.body.highlights !== undefined
                        ? parseCommaList(req.body.highlights)
                        : existing.highlights || []
                ),
                JSON.stringify(
                    req.body.facilities !== undefined
                        ? parseCommaList(req.body.facilities)
                        : existing.facilities || []
                ),
                JSON.stringify(galleryImages),
                parseBoolean(
                    req.body.breakfast_included,
                    existing.breakfast_included
                ),
                parseBoolean(
                    req.body.free_cancellation,
                    existing.free_cancellation
                ),
                parseBoolean(
                    req.body.pay_at_hotel,
                    existing.pay_at_hotel
                ),
                req.body.room_view !== undefined
                    ? req.body.room_view || null
                    : existing.room_view,
                JSON.stringify(houseRulesArray),
                id
            ]
        );

        console.log("HOTEL UPDATED:", id);

        return res.json({
            message: "Hotel updated successfully",
            hotel: result.rows[0]
        });
    } catch (error) {
        console.error("UPDATE HOTEL ERROR:", error);

        return res.status(500).json({
            message: "Failed to update hotel",
            error: error.message
        });
    }
});

app.get("/api/hotels", async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const minPrice = Number(req.query.minPrice ?? 0);
        const maxPrice = Number(req.query.maxPrice ?? 1000000);
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = 6;
        const offset = (page - 1) * limit;

        if (
            !Number.isFinite(minPrice) ||
            !Number.isFinite(maxPrice)
        ) {
            return res.status(400).json({
                message: "Invalid price filter"
            });
        }

        const filter = `
            WHERE (
                COALESCE(title, '') ILIKE $1
                OR COALESCE(location, '') ILIKE $1
                OR COALESCE(description, '') ILIKE $1
            )
            AND price >= $2 AND price <= $3
        `;

        const result = await pool.query(
            `SELECT * FROM hotels
             ${filter}
             ORDER BY id DESC
             LIMIT $4 OFFSET $5`,
            [`%${search}%`, minPrice, maxPrice, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM hotels ${filter}`,
            [`%${search}%`, minPrice, maxPrice]
        );

        const total = countResult.rows[0].total;

        return res.json({
            hotels: result.rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("GET HOTELS ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch hotels",
            error: error.message
        });
    }
});
app.delete("/api/hotels/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid hotel ID"
            });
        }

        const result = await pool.query(
            "DELETE FROM hotels WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        console.log("HOTEL DELETED:", id);

        return res.status(200).json({
            message: "Hotel deleted successfully",
            id: result.rows[0].id
        });
    } catch (error) {
        console.error("DELETE HOTEL ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete hotel",
            error: error.message
        });
    }
});

app.get("/api/hotels/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid hotel ID"
            });
        }

        const result = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error("GET HOTEL ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch hotel",
            error: error.message
        });
    }
});

app.post("/api/geocode", async (req, res) => {
    try {
        const address = String(req.body.address || "").trim();

        if (!address) {
            return res.status(400).json({
                message: "Address is required"
            });
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
            {
                headers: {
                    "User-Agent": "SaVi-Hotel-Booking-App/1.0"
                }
            }
        );

        if (!response.ok) {
            return res.status(502).json({
                message: "Geocoding service failed"
            });
        }

        const data = await response.json();

        if (!data.length) {
            return res.status(404).json({
                message: "Location not found"
            });
        }

        const location =
            data.find((item) => item.addresstype === "city") || data[0];

        return res.json({
            latitude: Number(location.lat),
            longitude: Number(location.lon),
            displayName: location.display_name
        });
    } catch (error) {
        console.error("GEOCODING ERROR:", error);

        return res.status(500).json({
            message: "Geocoding failed",
            error: error.message
        });
    }
});

app.post("/api/location-suggestions", async (req, res) => {
    try {
        const address = String(req.body.address || "").trim();

        console.log("LOCATION SEARCH:", address);

        if (address.length < 3) {
            return res.json([]);
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(address)}`,
            {
                headers: {
                    "User-Agent": "SaVi-Hotel-Booking-App/1.0",
                    Accept: "application/json"
                }
            }
        );

        console.log("NOMINATIM STATUS:", response.status);

        if (!response.ok) {
            return res.status(502).json({
                message: "Location service failed"
            });
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            return res.status(502).json({
                message: "Location service returned an invalid response"
            });
        }

        const data = await response.json();

        console.log("LOCATION RESULTS:", data.length);

        return res.json(data);
    } catch (error) {
        console.error("LOCATION SUGGESTION ERROR:", error);

        return res.status(500).json({
            message: "Location search failed",
            error: error.message
        });
    }
});

app.use((error, req, res, next) => {
    console.error("UNHANDLED SERVER ERROR:", error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        message: "Internal server error",
        error: error.message
    });
});

startServer();
