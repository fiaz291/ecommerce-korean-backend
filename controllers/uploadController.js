const { bucket } = require("../config/firebase");
const path = require("path");

const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }

    const uploadPromises = req.files.map((file) => {
      const fileName = `images/${Date.now()}-${file.originalname}`;
      const blob = bucket.file(fileName);

      return new Promise((resolve, reject) => {
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        blobStream.on("error", (err) => {
          reject(err);
        });

        blobStream.on("finish", async () => {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);

    return res.status(200).json({
      message: "Files uploaded successfully",
      urls,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload files" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "File URL is required" });
    }

    const bucketName = bucket.name;
    const filePath = url.replace(
      `https://storage.googleapis.com/${bucketName}/`,
      ""
    );

    await bucket.file(filePath).delete();

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
};

module.exports = { uploadFiles, deleteFile };
