/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./types/global.d.ts" />

// Import global variables first
import { GlobalInitializer } from 'helpers/config/init-globals';

// Initialize global variables
GlobalInitializer.init();

// Import other modules
import { initServices } from 'helpers';
import { WebServer, SwaggerIntegration } from 'core/framework';

process.on('uncaughtException', function (err) {
  LOGGER.error('Uncaught Exception:', err);
  LOGGER.file('UNCAUGHT_EXCEPTION', err);
});

async function startServer() {
  try {
    await initServices();
    global.APP = WebServer.app;
    
    // Configuration unique de Swagger
    const swaggerConfig = {
      apiPath: '/docs',
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation API générée automatiquement',
      basePath: '/api/v1',
      autoExtractTypes: true,
      typeExtractorOptions: {
        baseDir: 'src',
        ignoreFiles: ['node_modules', 'dist', 'test', '*.test.ts', '*.spec.ts']
      }
    };

    // Initialiser Swagger
    SwaggerIntegration.initialize(APP, swaggerConfig);
    
    APP.listen(CONFIG.port, () => {
      LOGGER.info(`Server running on port ${CONFIG.port}`);
      LOGGER.info(`Documentation API disponible à ${swaggerConfig.apiPath}`);
    });
  } catch (error) {
    LOGGER.error('Failed to initialize services', error as any);
  }
}

startServer();
