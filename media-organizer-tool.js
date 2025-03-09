// Media Organizer MCP Tool
const path = require('path');
const mediaOrganizer = require('./scripts/media-organizer/organize-media');
const tvOrganizer = require('./scripts/media-organizer/tv-organizer');
const movieOrganizer = require('./scripts/media-organizer/movie-organizer');
const config = require('./scripts/media-organizer/config');

// Media organizer tools
const mediaOrganizerTools = {
  organize_all_media: async () => {
    try {
      console.log('Starting full media organization...');
      await mediaOrganizer.organizeMedia();
      return {
        result: {
          success: true,
          message: 'Media organization completed successfully'
        }
      };
    } catch (error) {
      console.error('Error organizing media:', error);
      return {
        error: `Failed to organize media: ${error.message}`
      };
    }
  },
  
  organize_file: async (params) => {
    const { file_path } = params;
    
    if (!file_path) {
      return {
        error: 'No file path provided'
      };
    }
    
    try {
      const result = await mediaOrganizer.processSingleFile(file_path);
      return {
        result
      };
    } catch (error) {
      return {
        error: `Failed to organize file: ${error.message}`
      };
    }
  },
  
  organize_tv_directory: async (params) => {
    const { directory_path } = params;
    
    if (!directory_path) {
      return {
        error: 'No directory path provided'
      };
    }
    
    try {
      const count = await tvOrganizer.processTvShowDirectory(directory_path);
      return {
        result: {
          success: true,
          count,
          message: `Processed ${count} TV show files`
        }
      };
    } catch (error) {
      return {
        error: `Failed to organize TV directory: ${error.message}`
      };
    }
  },
  
  organize_movie_directory: async (params) => {
    const { directory_path } = params;
    
    if (!directory_path) {
      return {
        error: 'No directory path provided'
      };
    }
    
    try {
      const count = await movieOrganizer.processMovieDirectory(directory_path);
      return {
        result: {
          success: true,
          count,
          message: `Processed ${count} movie files`
        }
      };
    } catch (error) {
      return {
        error: `Failed to organize movie directory: ${error.message}`
      };
    }
  },
  
  update_config: async (params) => {
    const { source_dir, tv_destination, movie_destination } = params;
    
    try {
      if (source_dir) {
        config.paths.sourceDir = source_dir;
      }
      
      if (tv_destination) {
        config.paths.tvDestination = tv_destination;
      }
      
      if (movie_destination) {
        config.paths.movieDestination = movie_destination;
      }
      
      return {
        result: {
          success: true,
          config: config.paths
        }
      };
    } catch (error) {
      return {
        error: `Failed to update config: ${error.message}`
      };
    }
  },
  
  get_config: async () => {
    try {
      return {
        result: {
          config
        }
      };
    } catch (error) {
      return {
        error: `Failed to get config: ${error.message}`
      };
    }
  }
};

module.exports = mediaOrganizerTools;