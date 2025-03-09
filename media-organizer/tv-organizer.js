// TV Show Organizer
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const utils = require('./utils');

/**
 * Organize a TV show file
 * @param {string} filePath - Path to the TV show file
 * @returns {Promise<boolean>} Success status
 */
async function organizeTvShow(filePath) {
  try {
    console.log(`Processing TV show: ${filePath}`);
    
    // Parse the filename to extract show information
    const info = utils.parseTvShowFilename(filePath);
    
    if (!info) {
      console.log(`Could not parse TV show information from: ${filePath}`);
      return false;
    }
    
    console.log(`Detected: ${info.showName} - Season ${info.season}, Episode ${info.episode}: ${info.title}`);
    
    // Create the show directory
    const showDir = path.join(config.paths.tvDestination, utils.createSafeFilename(info.showName));
    await utils.ensureDir(showDir);
    
    // Create the season directory
    const seasonDir = path.join(showDir, `Season ${info.season.toString().padStart(2, '0')}`);
    await utils.ensureDir(seasonDir);
    
    // Format the new filename
    const formattedFilename = utils.formatTvShowFilename(info) + path.extname(filePath);
    const safeFilename = utils.createSafeFilename(formattedFilename);
    
    // Create the destination path
    const destinationPath = path.join(seasonDir, safeFilename);
    
    // Move the file
    return await utils.moveFile(filePath, destinationPath);
  } catch (error) {
    console.error(`Error organizing TV show ${filePath}:`, error);
    return false;
  }
}

/**
 * Process a directory for TV shows
 * @param {string} directory - Directory to process
 * @returns {Promise<number>} Number of files processed
 */
async function processTvShowDirectory(directory) {
  try {
    console.log(`Scanning directory for TV shows: ${directory}`);
    
    // Get all files in the directory
    const files = await fs.readdir(directory);
    let processedCount = 0;
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        processedCount += await processTvShowDirectory(filePath);
      } else if (utils.isVideoFile(filePath)) {
        // Check if it's a TV show
        const info = utils.parseTvShowFilename(file);
        if (info) {
          const success = await organizeTvShow(filePath);
          if (success) {
            processedCount++;
          }
        }
      }
    }
    
    return processedCount;
  } catch (error) {
    console.error(`Error processing TV show directory ${directory}:`, error);
    return 0;
  }
}

module.exports = {
  organizeTvShow,
  processTvShowDirectory
};