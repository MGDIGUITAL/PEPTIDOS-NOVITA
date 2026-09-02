const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../public/Fondo 3.png');
const outputDir = path.join(__dirname, '../public');

async function splitImage() {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Original Dimensions: ${metadata.width}x${metadata.height}`);
    
    // We want a 3:1 aspect ratio to get three 1:1 squares.
    // Target width = 3 * height.
    // If original width is larger than 3*height, we crop horizontally.
    // If original width is smaller than 3*height, we crop vertically.
    const targetHeight = metadata.height;
    const targetWidth = targetHeight * 3;
    
    let cropWidth, cropHeight, left, top;
    
    if (metadata.width >= targetWidth) {
      // Too wide: Crop sides
      cropWidth = targetWidth;
      cropHeight = targetHeight;
      left = Math.floor((metadata.width - targetWidth) / 2);
      top = 0;
    } else {
      // Too tall: Crop top/bottom
      cropWidth = metadata.width;
      cropHeight = Math.floor(metadata.width / 3);
      left = 0;
      top = Math.floor((metadata.height - cropHeight) / 2);
    }
    
    console.log(`Cropping to 3:1 ratio. Dimensions: ${cropWidth}x${cropHeight} at position: ${left},${top}`);
    
    const croppedImageBuffer = await image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .toBuffer();
      
    // Slicing into 3 equal squares
    const squareSize = cropHeight; // since height is the square size in a 3:1 ratio
    
    for (let i = 0; i < 3; i++) {
      const xOffset = i * squareSize;
      const partPath = path.join(outputDir, `Fondo_3_Instagram_Parte_${i + 1}.png`);
      
      await sharp(croppedImageBuffer)
        .extract({ left: xOffset, top: 0, width: squareSize, height: squareSize })
        .toFile(partPath);
        
      console.log(`Created part ${i + 1} at: ${partPath}`);
    }
    
    console.log("Success! Image split successfully.");
  } catch (err) {
    console.error("Error splitting image:", err);
  }
}

splitImage();
