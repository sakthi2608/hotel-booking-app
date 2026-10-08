const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const dns = require("dns");

console.log("THIS IS MY HOTEL SERVER");
console.log("GEOCODE VERSION");

const app = express();

dns.setDefaultResultOrder("ipv4first");

app.use(cors());

console.log("CORS MIDDLEWARE LOADED");

app.use(express.json());

app.use("/uploads", express.static("uploads"));

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "hotel_booking",
    password: "root",
    port: 5432
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
});

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.log("Database connection failed");
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
                    image: `/uploads/${file.filename}`,
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

            const image = `/uploads/${mainImage.filename}`;

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
            const id = req.params.id;

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

            const existingHotel = await pool.query(
                "SELECT image, gallery FROM hotels WHERE id = $1",
                [id]
            );

            if (existingHotel.rows.length === 0) {
                return res.status(404).json({
                    message: "Hotel not found"
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
                    !room.type ||
                    room.rooms === undefined ||
                    room.guestsPerRoom === undefined
                ) {
                    return res.status(400).json({
                        message: "Invalid room type details"
                    });
                }

                if (
                    Number(room.rooms) <= 0 ||
                    Number(room.guestsPerRoom) <= 0
                ) {
                    return res.status(400).json({
                        message: "Rooms and guests per room must be greater than 0"
                    });
                }
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

            const imageFile = req.files?.image?.[0];

            const imagePath = imageFile
                ? `/uploads/${imageFile.filename}`
                : existingHotel.rows[0].image;

            const galleryFiles = req.files?.gallery || [];

            let galleryImages = [];

            if (galleryFiles.length > 0) {
                const galleryTypes = Array.isArray(req.body.galleryType)
                    ? req.body.galleryType
                    : req.body.galleryType
                        ? [req.body.galleryType]
                        : [];

                galleryImages = galleryFiles.map((file, index) => ({
                    image: `/uploads/${file.filename}`,
                    type: galleryTypes[index] || "Other"
                }));
            } else {
                galleryImages = existingHotel.rows[0].gallery || [];
            }

            const highlightsArray = highlights
                ? highlights
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item !== "")
                : [];

            const facilitiesArray = facilities
                ? facilities
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item !== "")
                : [];

            const breakfastIncludedValue =
                breakfast_included === "true";

            const freeCancellationValue =
                free_cancellation === "true";

            const payAtHotelValue =
                pay_at_hotel === "true";

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
                    title,
                    description,
                    location,
                    latitudeNumber,
                    longitudeNumber,
                    priceNumber,
                    JSON.stringify(roomTypesArray),
                    reception_number,
                    JSON.stringify(highlightsArray),
                    JSON.stringify(facilitiesArray),
                    JSON.stringify(galleryImages),
                    breakfastIncludedValue,
                    freeCancellationValue,
                    payAtHotelValue,
                    room_view || null,
                    JSON.stringify(houseRulesArray),
                    id
                ]
            );

            res.status(200).json({
                message: "Hotel updated successfully",
                hotel: result.rows[0]
            });

        } catch (error) {
            console.log("UPDATE ERROR:", error);

            res.status(500).json({
                message: "Failed to update hotel",
                error: error.message
            });
        }
    }
);

app.delete("/api/hotels/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const existingHotel = await pool.query(
            "SELECT image FROM hotels WHERE id = $1",
            [id]
        );

        if (existingHotel.rows.length === 0) {
            return res.status(404).json({
                message: "Hotel Not Found!!"
            });
        }

        const result = await pool.query(
            "DELETE FROM hotels WHERE id = $1 RETURNING *",
            [id]
        );

        const imagePath = existingHotel.rows[0].image;

        const filePath = path.join(
            __dirname,
            imagePath.replace("/uploads/", "uploads/")
        );

        fs.unlink(filePath, (err) => {
            if (err) {
                console.log("Image delete error:", err);
            }
        });

        res.json({
            message: "Hotel deleted successfully",
            hotel: result.rows[0]
        });
    } catch (error) {
        console.log("DELETE ERROR:", error);

        res.status(500).json({
            message: "Failed to delete hotel"
        });
    }
});

app.get("/api/hotels", async (req, res) => {
    try {
        const search = req.query.search || "";

        const minPrice = Number(
            req.query.minPrice || 0
        );

        const maxPrice = Number(
            req.query.maxPrice || 999999999
        );

        const page = Math.max(
            Number(req.query.page || 1),
            1
        );

        const limit = Math.max(
            Number(req.query.limit || 6),
            1
        );
        const breakfast =
            req.query.breakfast;

        const freeCancellation =
            req.query.freeCancellation;

        const payAtHotel =
            req.query.payAtHotel;

        const roomView =
            req.query.roomView;

        const roomType =
            req.query.roomType;

        const offset =
            (page - 1) * limit;

        const conditions = [];
        const values = [];

        if (search.trim()) {
            conditions.push(
                `(title ILIKE $${values.length + 1}
                OR location ILIKE $${values.length + 1}
                OR description ILIKE $${values.length + 1})`
            );

            values.push(
                `%${search.trim()}%`
            );
        }

        conditions.push(
            `price BETWEEN $${values.length + 1}
            AND $${values.length + 2}`
        );

        values.push(minPrice);
        values.push(maxPrice);

        if (breakfast === "true") {
            conditions.push(
                `breakfast_included = $${values.length + 1}`
            );

            values.push(true);
        }

        if (freeCancellation === "true") {
            conditions.push(
                `free_cancellation = $${values.length + 1}`
            );

            values.push(true);
        }

        if (payAtHotel === "true") {
            conditions.push(
                `pay_at_hotel = $${values.length + 1}`
            );

            values.push(true);
        }

        if (
            roomView &&
            roomView.trim()
        ) {
            conditions.push(
                `room_view ILIKE $${values.length + 1}`
            );

            values.push(
                roomView.trim()
            );
        }

        if (
            roomType &&
            roomType.trim()
        ) {
            conditions.push(
                `room_types @> $${values.length + 1}::jsonb`
            );

            values.push(
                JSON.stringify([
                    {
                        type: roomType.trim()
                    }
                ])
            );
        }

        const whereClause =
            conditions.length > 0
                ? " WHERE " + conditions.join(" AND ")
                : "";

        const query = `
            SELECT *
            FROM hotels
            ${whereClause}
            ORDER BY id DESC
            LIMIT $${values.length + 1}
            OFFSET $${values.length + 2}
        `;

        const queryValues = [
            ...values,
            limit,
            offset
        ];


        const countQuery = `
            SELECT COUNT(*) AS total
            FROM hotels
            ${whereClause}
        `;

        const result = await pool.query(
            query,
            queryValues
        );

        const countResult =
            await pool.query(
                countQuery,
                values
            );

        const total =
            Number(
                countResult.rows[0].total
            );

        const totalPages =
            Math.ceil(total / limit) || 1;


        res.json({
            hotels: result.rows,
            total: total,
            page: page,
            limit: limit,
            totalPages: totalPages
        });

    } catch (error) {

        console.log(
            "GET HOTELS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch hotels"
        });
    }
});

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

app.listen(5000, () => {
    console.log(
        "Server running on port 5000"
    );
});