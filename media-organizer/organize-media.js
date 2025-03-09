// Main Media Organizer Script
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const tvOrganizer = require('./tv-organizer');
const movieOrganizer = require('./movie-organizer');
const utils = require('./utils');

/**
 * Main function to organize media files
 */
async function organizeMedia() {
  try {
    console.log('Starting media organization...');
    console.log(`Source directory: ${config.paths.sourceDir}`);
    console.log(`TV destination: ${config.paths.tvDestination}`);
    console.log(`Movie destination: ${config.paths.movieDestination}`);
    
    // Ensure destination directories exist
    await utils.ensureDir(config.paths.tvDestination);
    await utils.ensureDir(config.paths.movieDestination);
    
    // Process TV shows
    console.log('\n=== Processing TV Shows ===');
    const tvCount = await tvOrganizer.processTvShowDirectory(config.paths.sourceDir);
    console.log(`Processed ${tvCount} TV show files`);
    
    // Process movies
    console.log('\n=== Processing Movies ===');
    const movieCount = await movieOrganizer.processMovieDirectory(config.paths.sourceDir);
    console.log(`Processed ${movieCount} movie files`);
    
    console.log('\nMedia organization complete!');
    console.log(`Total files processed: ${tvCount + movieCount}`);
  } catch (error) {
    console.error('Error organizing media:', error);
  }
}

/**
 * Process a single file (useful for MCP integration)
 * @param {string} filePath - Path to the file to process
 */
async function processSingleFile(filePath) {
  try {
    console.log(`Processing single file: ${filePath}`);
    
    if (!utils.isVideoFile(filePath)) {
      console.log(`Not a video file: ${filePath}`);
      return {
        success: false,
        message: 'Not a video file'
      };
    }
    
    // Check if it's a TV show
    const isTvShow = utils.parseTvShowFilename(path.basename(filePath));
    
    if (isTvShow) {
      const success = await tvOrganizer.organizeTvShow(filePath);
      return {
        success,
        type: 'tv',
        message: success ? 'TV show organized successfully' : 'Failed to organize TV show'
      };
    } else {
      const success = await movieOrganizer.organizeMovie(filePath);
      return {
        success,
        type: 'movie',
        message: success ? 'Movie organized successfully' : 'Failed to organize movie'
      };
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  organizeMedia();
}

module.exports = {
  organizeMedia,
  processSingleFile
};