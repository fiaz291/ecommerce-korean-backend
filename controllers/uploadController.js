const { bucket } = require("../config/firebase");

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
          resumable: false,
          metadata: {
            contentType: file.mimetype,
          },
        });

        blobStream.on("error", (err) => {
          console.error("Stream error:", err.message);
          reject(err);
        });

        blobStream.on("finish", async () => {
          try {
            const [url] = await blob.getSignedUrl({
              action: "read",
              expires: "12-31-2030",
            });
            resolve(url);
          } catch (signErr) {
            // Fallback to public URL format
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
            resolve(publicUrl);
          }
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
    console.error("Upload error:", error.message || error);
    return res
      .status(500)
      .json({ error: "Failed to upload files", details: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Extract file path from different URL formats
    let filePath;
    if (url.includes("firebasestorage.googleapis.com")) {
      const match = url.match(/\/o\/(.+?)(\?|$)/);
      filePath = match ? decodeURIComponent(match[1]) : null;
    } else if (url.includes("storage.googleapis.com")) {
      filePath = url.replace(
        `https://storage.googleapis.com/${bucket.name}/`,
        ""
      );
    } else {
      // Signed URL - extract path from bucket name onwards
      const bucketName = bucket.name;
      const match = url.match(new RegExp(`${bucketName}/(.+?)\\?`));
      filePath = match ? match[1] : null;
    }

    if (!filePath) {
      return res.status(400).json({ error: "Could not parse file path from URL" });
    }

    await bucket.file(filePath).delete();

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message || error);
    return res
      .status(500)
      .json({ error: "Failed to delete file", details: error.message });
  }
};

module.exports = { uploadFiles, deleteFile };
