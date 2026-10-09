require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const uploadsFolder = path.join(__dirname, "uploads");

async function migrateImages() {
    try {
        const result = await pool.query(
            "SELECT id, image FROM hotels WHERE image LIKE '/uploads/%'"
        );

        console.log("Old images found:", result.rows.length);

        for (const hotel of result.rows) {
            const filePath = path.join(
                __dirname,
                hotel.image.replace("/uploads/", "uploads/")
            );

            if (!fs.existsSync(filePath)) {
                console.log("File not found:", filePath);
                continue;
            }

            const uploadResult = await cloudinary.uploader.upload(filePath, {
                folder: "savi-hotels"
            });

            await pool.query(
                "UPDATE hotels SET image = $1 WHERE id = $2",
                [uploadResult.secure_url, hotel.id]
            );

            console.log(
                `Hotel ${hotel.id} migrated successfully`
            );
        }

        const galleryResult = await pool.query(
            "SELECT id, gallery FROM hotels WHERE gallery IS NOT NULL"
        );

        console.log("Gallery records found:", galleryResult.rows.length);

        for (const hotel of galleryResult.rows) {
            let gallery = hotel.gallery;

            if (typeof gallery === "string") {
                try {
                    gallery = JSON.parse(gallery);
                } catch (error) {
                    console.log(
                        `Gallery JSON error for hotel ${hotel.id}`
                    );
                    continue;
                }
            }

            if (!Array.isArray(gallery) || gallery.length === 0) {
                continue;
            }

            const migratedGallery = [];

            for (const item of gallery) {
                const oldImage =
                    typeof item === "string"
                        ? item
                        : item.image;

                const imageType =
                    typeof item === "string"
                        ? "Gallery"
                        : item.type || "Gallery";

                if (!oldImage || !oldImage.startsWith("/uploads/")) {
                    migratedGallery.push({
                        image: oldImage,
                        type: imageType
                    });
                    continue;
                }

                const filePath = path.join(
                    __dirname,
                    oldImage.replace("/uploads/", "uploads/")
                );

                if (!fs.existsSync(filePath)) {
                    console.log(
                        `Gallery file not found for hotel ${hotel.id}:`,
                        filePath
                    );
                    continue;
                }

                const uploadResult = await cloudinary.uploader.upload(
                    filePath,
                    {
                        folder: "savi-hotels"
                    }
                );

                migratedGallery.push({
                    image: uploadResult.secure_url,
                    type: imageType
                });

                console.log(
                    `Gallery image migrated for hotel ${hotel.id}`
                );
            }

            await pool.query(
                "UPDATE hotels SET gallery = $1::jsonb WHERE id = $2",
                [JSON.stringify(migratedGallery), hotel.id]
            );

            console.log(
                `Gallery updated for hotel ${hotel.id}`
            );
        }

        console.log("Image migration completed!");
    } catch (error) {
        console.error("Migration error:", error);
    } finally {
        await pool.end();
    }
}

migrateImages();

