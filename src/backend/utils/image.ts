import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { logger } from "./logger";

const OUTPUT_DIR = process.argv.at(2) ? `${process.argv.at(2)}/img` : "img";

const makeOutputDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }
};

export const cropAndSaveFromFourImagePreview = async (
  name: string,
  href: string
) => {
  const paths = [];
  makeOutputDir();

  try {
    const response = await axios({
      url: href,
      responseType: "arraybuffer",
    });

    const img = sharp(response.data);
    const metadata = await img.metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      throw new Error("Could not get image metadata");
    }

    const cropWidth = Math.floor(width / 2);
    const cropHeight = Math.floor(height / 2);

    logger.log("Cropping image with dimensions:", {
      width,
      height,
      cropWidth,
      cropHeight,
    });

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const outputPath = `${OUTPUT_DIR}/${name}_${row}${col}_${Date.now()}.jpg`;
        const buffer = sharp(response.data);

        logger.log("Saving image to:", outputPath);
        logger.log("Cropping image with dimensions:", {
          left: col * cropWidth,
          top: row * cropHeight,
          width: cropWidth,
          height: cropHeight,
        });

        buffer
          .extract({
            left: col * cropWidth,
            top: row * cropHeight,
            width: cropWidth,
            height: cropHeight,
          })
          .toFile(outputPath, (err, info) => {
            if (err) {
              throw new Error(
                `Error occurred while cropping and saving ${outputPath}: ${err}`
              );
            }
          });
        paths.push({
          path: path.resolve(outputPath),
          url: "",
          width: cropWidth,
          height: cropHeight,
        });
      }
    }
  } catch (error) {
    throw new Error("Error occurred while downloading the image: " + error);
  }
  return paths;
};

export const saveImagesFromUrls = async (name: string, imageUrls: string[]) => {
  makeOutputDir();
  const paths = [];

  logger.log("Saving images from urls:", imageUrls);

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const outputPath = `${OUTPUT_DIR}/${name.replace(
      " ",
      "_"
    )}_${i}_${Date.now()}.jpg`;

    try {
      const response = await axios({
        url,
        responseType: "arraybuffer",
      });

      const buffer = sharp(response.data);
      const metadata = await buffer.metadata();
      const { width, height } = metadata;

      buffer.toFile(outputPath, (err, info) => {
        if (err) {
          throw new Error(
            `Error occurred while downloading and saving ${outputPath}: ${err}`
          );
        }
      });

      paths.push({
        path: path.resolve(outputPath),
        url,
        width,
        height,
      });
    } catch (error) {
      throw new Error("Error occurred while downloading the image: " + error);
    }
  }
  return paths;
};

export const deleteImage = (path: string) => {
  fs.unlink(path, (err) => {
    if (err) {
      logger.error("Error occurred while deleting image:", err);
    }
  });
};
