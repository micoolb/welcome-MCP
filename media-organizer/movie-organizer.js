// Movie Organizer
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const utils = require('./utils');

/**
 * Organize a movie file
 * @param {string} filePath - Path to the movie file
 * @returns {Promise<boolean>} Success status
 */
async function organizeMovie(filePath) {
  try {
    console.log(`Processing movie: ${filePath}`);
    
    // Parse the filename to extract movie information
    const info = utils.parseMovieFilename(filePath);
    
    console.log(`Detected: ${info.title}${info.year ? ` (${info.year})` : ''} ${info.resolution}`);
    
    // Format the new filename
    const formattedFilename = utils.formatMovieFilename(info) + path.extname(filePath);
    const safeFilename = utils.createSafeFilename(formattedFilename);
    
    // Create the destination path
    const destinationPath = path.join(config.paths.movieDestination, safeFilename);
    
    // Move the file
    return await utils.moveFile(filePath, destinationPath);
  } catch (error) {
    console.error(`Error organizing movie ${filePath}:`, error);
    return false;
  }
}

/**
 * Process a directory for movies
 * @param {string} directory - Directory to process
 * @returns {Promise<number>} Number of files processed
 */
async function processMovieDirectory(directory) {
  try {
    console.log(`Scanning directory for movies: ${directory}`);
    
    // Get all files in the directory
    const files = await fs.readdir(directory);
    let processedCount = 0;
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        processedCount += await processMovieDirectory(filePath);
      } else if (utils.isVideoFile(filePath)) {
        // Check if it's a movie (not a TV show)
        const isTvShow = utils.parseTvShowFilename(file);
        if (!isTvShow) {
          const success = await organizeMovie(filePath);
          if (success) {
            processedCount++;
          }
        }
      }
    }
    
    return processedCount;
  } catch (error) {
    console.error(`Error processing movie directory ${directory}:`, error);
    return 0;
  }
}

module.exports = {
  organizeMovie,
  processMovieDirectory
};