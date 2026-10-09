const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const dns = require("dns");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log("Cloudinary check:", {
  cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: !!process.env.CLOUDINARY_API_KEY,
  apiSecret: !!process.env.CLOUDINARY_API_SECRET
});

console.log("THIS IS MY HOTEL SERVER");
console.log("GEOCODE VERSION");

const app = express();

dns.setDefaultResultOrder("ipv4first");

app.use(cors());

console.log("CORS MIDDLEWARE LOADED");

app.use(express.json());

app.use("/uploads", express.static("uploads"));
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "savi-hotels",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

const upload = multer({
    storage: storage
});

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("Database connected");
    }
});

app.post(
    "/api/hotels",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "gallery", maxCount: 4 }
    ]),
    async (req, res) => {
        try {
            const {
                title,
                description,
                location,
                highlights,
                facilities,
                latitude,
                longitude,
                price,
                reception_number,
                room_types,
                breakfast_included,
                free_cancellation,
                pay_at_hotel,
                room_view,
                house_rules
            } = req.body;

            const mainImage = req.files?.image?.[0];

            const galleryTypes = Array.isArray(req.body.galleryType)
                ? req.body.galleryType
                : req.body.galleryType
                    ? [req.body.galleryType]
                    : [];

            const galleryImages = req.files?.gallery
    ? req.files.gallery.map((file, index) => ({
        image: file.path,
        type: galleryTypes[index] || "Other"
    }))
    : [];

            const highlightsArray = highlights
                ? highlights
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean)
                : [];

            const facilitiesArray = facilities
                ? facilities
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean)
                : [];

            let roomTypesArray = [];

            try {
                roomTypesArray = room_types
                    ? JSON.parse(room_types)
                    : [];
            } catch (error) {
                return res.status(400).json({
                    message: "Invalid room types data"
                });
            }

            let houseRulesArray = [];

            try {
                houseRulesArray = house_rules
                    ? JSON.parse(house_rules)
                    : [];
            } catch (error) {
                return res.status(400).json({
                    message: "Invalid house rules data"
                });
            }

            if (!mainImage) {
                return res.status(400).json({
                    message: "Image is required"
                });
            }

            if (
                !title ||
                !description ||
                !location ||
                !latitude ||
                !longitude ||
                !price
            ) {
                return res.status(400).json({
                    message: "All fields are required"
                });
            }

            if (roomTypesArray.length === 0) {
                return res.status(400).json({
                    message: "At least one room type is required"
                });
            }

            const latitudeNumber = Number(latitude);
            const longitudeNumber = Number(longitude);
            const priceNumber = Number(price);

            if (
                isNaN(latitudeNumber) ||
                isNaN(longitudeNumber) ||
                isNaN(priceNumber)
            ) {
                return res.status(400).json({
                    message: "Latitude, longitude and price must be numbers"
                });
            }

            if (priceNumber <= 0) {
                return res.status(400).json({
                    message: "Price must be greater than 0"
                });
            }

            if (
                latitudeNumber < -90 ||
                latitudeNumber > 90 ||
                longitudeNumber < -180 ||
                longitudeNumber > 180
            ) {
                return res.status(400).json({
                    message: "Invalid latitude or longitude"
                });
            }

           const image = mainImage.path;

            const breakfastIncludedValue =
                breakfast_included === "true";

            const freeCancellationValue =
                free_cancellation === "true";

            const payAtHotelValue =
                pay_at_hotel === "true";

            const result = await pool.query(
                `INSERT INTO hotels
                (
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
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING *`,
                [
                    image,
                    title,
                    description,
                    location,
                    latitudeNumber,
                    longitudeNumber,
                    priceNumber,
                    reception_number,
                    JSON.stringify(roomTypesArray),
                    JSON.stringify(highlightsArray),
                    JSON.stringify(facilitiesArray),
                    JSON.stringify(galleryImages),
                    breakfastIncludedValue,
                    freeCancellationValue,
                    payAtHotelValue,
                    room_view || null,
                    JSON.stringify(houseRulesArray)
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.log("CREATE HOTEL ERROR:", error);

            res.status(500).json({
                message: "Failed to create hotel"
            });
        }
    }
);
app.put(
"/api/hotels/:id",
upload.fields([
{ name: "image", maxCount: 1 },
{ name: "gallery", maxCount: 4 }
]),
async (req, res) => {
try {
const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid hotel ID"
            });
        }

        console.log("UPDATE HOTEL ID:", id);

        const existingResult = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [id]
        );

        if (existingResult.rows.length === 0) {
            console.log("HOTEL NOT FOUND:", id);

            return res.status(404).json({
                message: "Hotel not found",
                id
            });
        }

        const existingHotel = existingResult.rows[0];

        const {
            title,
            description,
            location,
            highlights,
            facilities,
            latitude,
            longitude,
            price,
            reception_number,
            room_types,
            breakfast_included,
            free_cancellation,
            pay_at_hotel,
            room_view,
            house_rules
        } = req.body;

        const latitudeNumber = Number(latitude);
        const longitudeNumber = Number(longitude);
        const priceNumber = Number(price);

        if (
            !title?.trim() ||
            !description?.trim() ||
            !location?.trim()
        ) {
            return res.status(400).json({
                message: "Title, description and location are required"
            });
        }

        if (
            latitude === undefined ||
            longitude === undefined ||
            price === undefined ||
            !Number.isFinite(latitudeNumber) ||
            !Number.isFinite(longitudeNumber) ||
            !Number.isFinite(priceNumber)
        ) {
            return res.status(400).json({
                message: "Valid latitude, longitude and price are required"
            });
        }

        if (
            latitudeNumber < -90 ||
            latitudeNumber > 90 ||
            longitudeNumber < -180 ||
            longitudeNumber > 180
        ) {
            return res.status(400).json({
                message: "Invalid latitude or longitude"
            });
        }

        if (priceNumber <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0"
            });
        }

        let roomTypesArray;

        try {
            roomTypesArray = JSON.parse(
                room_types ||
                JSON.stringify(existingHotel.room_types || [])
            );
        } catch {
            return res.status(400).json({
                message: "Invalid room types data"
            });
        }

        if (
            !Array.isArray(roomTypesArray) ||
            roomTypesArray.length === 0
        ) {
            return res.status(400).json({
                message: "At least one room type is required"
            });
        }

        for (const room of roomTypesArray) {
            if (
                !room ||
                !room.type ||
                room.rooms === undefined ||
                room.guestsPerRoom === undefined ||
                Number(room.rooms) <= 0 ||
                Number(room.guestsPerRoom) <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid room type details"
                });
            }
        }

        let houseRulesArray;

        try {
            houseRulesArray = JSON.parse(
                house_rules ||
                JSON.stringify(existingHotel.house_rules || [])
            );
        } catch {
            return res.status(400).json({
                message: "Invalid house rules data"
            });
        }

        if (!Array.isArray(houseRulesArray)) {
            return res.status(400).json({
                message: "House rules must be a list"
            });
        }

        const parseList = (value, oldValue) => {
            if (value === undefined) {
                return Array.isArray(oldValue) ? oldValue : [];
            }

            return String(value)
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);
        };

        const highlightsArray = parseList(
            highlights,
            existingHotel.highlights
        );

        const facilitiesArray = parseList(
            facilities,
            existingHotel.facilities
        );

        const imageFile = req.files?.image?.[0];

        const imagePath = imageFile
            ? imageFile.path
            : existingHotel.image;

        const galleryFiles = req.files?.gallery || [];

        let galleryImages = Array.isArray(existingHotel.gallery)
            ? existingHotel.gallery
            : [];

        if (galleryFiles.length > 0) {
            const galleryTypes = Array.isArray(req.body.galleryType)
                ? req.body.galleryType
                : req.body.galleryType
                    ? [req.body.galleryType]
                    : [];

            galleryImages = galleryFiles.map((file, index) => ({
                image: file.path,
                type: galleryTypes[index] || "Other"
            }));
        }

        const breakfastValue =
            breakfast_included !== undefined
                ? breakfast_included === "true"
                : existingHotel.breakfast_included;

        const cancellationValue =
            free_cancellation !== undefined
                ? free_cancellation === "true"
                : existingHotel.free_cancellation;

        const payAtHotelValue =
            pay_at_hotel !== undefined
                ? pay_at_hotel === "true"
                : existingHotel.pay_at_hotel;

        const result = await pool.query(
            `UPDATE hotels
             SET image = $1,
                 title = $2,
                 description = $3,
                 location = $4,
                 latitude = $5,
                 longitude = $6,
                 price = $7,
                 room_types = $8,
                 reception_number = $9,
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
                title.trim(),
                description.trim(),
                location.trim(),
                latitudeNumber,
                longitudeNumber,
                priceNumber,
                JSON.stringify(roomTypesArray),
                reception_number !== undefined
                    ? reception_number
                    : existingHotel.reception_number,
                JSON.stringify(highlightsArray),
                JSON.stringify(facilitiesArray),
                JSON.stringify(galleryImages),
                breakfastValue,
                cancellationValue,
                payAtHotelValue,
                room_view !== undefined
                    ? room_view || null
                    : existingHotel.room_view,
                JSON.stringify(houseRulesArray),
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Hotel not found",
                id
            });
        }

        console.log("HOTEL UPDATED SUCCESSFULLY:", id);

        return res.status(200).json({
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
}


);



app.get("/api/hotels/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.log("GET HOTEL ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch hotel"
        });
    }
});

console.log("ABOUT TO REGISTER GEOCODE");

app.post("/api/geocode", async (req, res) => {
    const { address } = req.body;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
            {
                headers: {
                    "User-Agent": "SaVi-Hotel-Booking-App"
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            console.log(
                "NOMINATIM GEOCODE ERROR:",
                errorText
            );

            return res.status(500).json({
                message: "Geocoding service failed"
            });
        }

        const data = await response.json();

        if (data.length === 0) {
            return res.status(404).json({
                message: "Location not found"
            });
        }

        const location =
            data.find(
                (item) =>
                    item.addresstype === "city"
            ) || data[0];

        res.json({
            latitude: Number(location.lat),
            longitude: Number(location.lon),
            displayName: location.display_name
        });
    } catch (error) {
        console.log(
            "GEOCODING ERROR:",
            error
        );

        res.status(500).json({
            message: "Geocoding failed",
            error: error.message
        });
    }
});

app.post("/api/location-suggestions", async (req, res) => {
    const { address } = req.body;

    console.log("LOCATION SEARCH:", address);

    if (!address || address.trim().length < 3) {
        return res.json([]);
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(address)}`,
            {
                method: "GET",
                headers: {
                    "User-Agent": "SaVi-Hotel-Booking-App/1.0",
                    "Accept": "application/json"
                }
            }
        );

        console.log("NOMINATIM STATUS:", response.status);

        if (!response.ok) {
            const errorText = await response.text();

            console.log("NOMINATIM ERROR:", errorText);

            return res.status(500).json({
                message: "Location service failed"
            });
        }

        const contentType =
            response.headers.get("content-type");

        console.log(
            "NOMINATIM CONTENT TYPE:",
            contentType
        );

        if (
            !contentType ||
            !contentType.includes("application/json")
        ) {
            const errorText = await response.text();

            console.log(
                "NOMINATIM NON-JSON RESPONSE:",
                errorText
            );

            return res.status(500).json({
                message:
                    "Location service returned an invalid response"
            });
        }

        const data = await response.json();

        console.log(
            "LOCATION RESULTS:",
            data.length
        );

        res.json(data);
    } catch (error) {
        console.log(
            "LOCATION SUGGESTION ERROR:",
            error.message
        );

        res.status(500).json({
            message: "Location search failed",
            error: error.message
        });
    }
});

console.log(
    "GEOCODE ROUTE REGISTERED"
);


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

        console.log("Hotels table ready");

        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running");
        });
    } catch (error) {
        console.log("Database setup failed:", error.message);
        process.exit(1);
    }
}

startServer();