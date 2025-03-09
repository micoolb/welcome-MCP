// Media Organizer Utility Functions
const fs = require('fs-extra');
const path = require('path');
const filenamify = require('filenamify');
const SMB2 = require('smb2');
const config = require('./config');

/**
 * Connect to SMB share
 * @returns {Object} SMB2 client
 */
function connectToShare() {
  return new SMB2({
    share: `\\\\${config.truenas.host}\\${config.truenas.shareFolder}`,
    domain: config.truenas.domain,
    username: config.truenas.username,
    password: config.truenas.password
  });
}

/**
 * Check if a path is a video file
 * @param {string} filePath - Path to check
 * @returns {boolean} True if it's a video file
 */
function isVideoFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return config.videoExtensions.includes(ext);
}

/**
 * Create a safe filename
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
function createSafeFilename(filename) {
  return filenamify(filename, { replacement: ' ' });
}

/**
 * Parse TV show filename to extract information
 * @param {string} filename - Filename to parse
 * @returns {Object|null} Extracted information or null if not a TV show
 */
function parseTvShowFilename(filename) {
  // Common patterns for TV show filenames
  const patterns = [
    // Pattern: ShowName.S01E01.Episode.Title.ext
    /^(.+?)[\.\s][Ss](\d{1,2})[Ee](\d{1,2})(?:[\.\s](.+))?$/,
    
    // Pattern: ShowName.1x01.Episode.Title.ext
    /^(.+?)[\.\s](\d{1,2})x(\d{1,2})(?:[\.\s](.+))?$/,
    
    // Pattern: ShowName.101.Episode.Title.ext (season 1 episode 01)
    /^(.+?)[\.\s](\d)(\d{2})(?:[\.\s](.+))?$/
  ];
  
  const baseFilename = path.basename(filename, path.extname(filename));
  
  for (const pattern of patterns) {
    const match = baseFilename.match(pattern);
    if (match) {
      const [, showName, season, episode, title] = match;
      return {
        showName: showName.replace(/\./g, ' ').trim(),
        season: parseInt(season, 10),
        episode: parseInt(episode, 10),
        title: title ? title.replace(/\./g, ' ').trim() : 'Unknown'
      };
    }
  }
  
  return null;
}

/**
 * Parse movie filename to extract information
 * @param {string} filename - Filename to parse
 * @returns {Object} Extracted information
 */
function parseMovieFilename(filename) {
  const baseFilename = path.basename(filename, path.extname(filename));
  
  // Pattern: Movie.Title.2023.1080p.ext or Movie.Title.(2023).1080p.ext
  const yearPattern = /^(.+?)[\.\s][\(\[]?(\d{4})[\)\]]?(?:[\.\s](.+))?$/;
  const match = baseFilename.match(yearPattern);
  
  if (match) {
    const [, title, year, extra] = match;
    
    // Try to extract resolution
    let resolution = 'Unknown';
    if (extra) {
      const resMatch = extra.match(/\b(480p|720p|1080p|2160p|4K|UHD)\b/i);
      if (resMatch) {
        resolution = resMatch[1];
      }
    }
    
    return {
      title: title.replace(/\./g, ' ').trim(),
      year: parseInt(year, 10),
      resolution: resolution
    };
  }
  
  // If no year found, just use the filename as the title
  return {
    title: baseFilename.replace(/\./g, ' ').trim(),
    year: null,
    resolution: 'Unknown'
  };
}

/**
 * Format TV show filename according to the configured format
 * @param {Object} info - TV show information
 * @returns {string} Formatted filename
 */
function formatTvShowFilename(info) {
  const seasonStr = info.season.toString().padStart(2, '0');
  const episodeStr = info.episode.toString().padStart(2, '0');
  
  return config.tvFormat
    .replace('{Show Name}', info.showName)
    .replace('{season}', seasonStr)
    .replace('{episode}', episodeStr)
    .replace('{title}', info.title);
}

/**
 * Format movie filename according to the configured format
 * @param {Object} info - Movie information
 * @returns {string} Formatted filename
 */
function formatMovieFilename(info) {
  let formatted = config.movieFormat
    .replace('{title}', info.title);
  
  if (info.year) {
    formatted = formatted.replace('{year}', info.year);
  } else {
    formatted = formatted.replace('({year})', '').replace('{year}', '');
  }
  
  return formatted.replace('{resolution}', info.resolution !== 'Unknown' ? info.resolution : '');
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
async function ensureDir(dirPath) {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * Move file with proper error handling
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
async function moveFile(source, destination) {
  try {
    await fs.move(source, destination, { overwrite: false });
    console.log(`Moved: ${source} -> ${destination}`);
    return true;
  } catch (error) {
    console.error(`Error moving file ${source} to ${destination}:`, error);
    return false;
  }
}

module.exports = {
  connectToShare,
  isVideoFile,
  createSafeFilename,
  parseTvShowFilename,
  parseMovieFilename,
  formatTvShowFilename,
  formatMovieFilename,
  ensureDir,
  moveFile
};