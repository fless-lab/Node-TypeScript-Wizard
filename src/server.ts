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
    
    // Initialiser Swagger pour toutes les applications avec extraction automatique des types
    SwaggerIntegration.initializeForAllApps();
    
    // Initialiser une documentation API globale avec extraction automatique des types
    SwaggerIntegration.initialize(APP, {
      apiPath: '/api-docs',
      title: 'API Documentation Complète',
      version: '1.0.0',
      description: 'Documentation complète de l\'API avec schémas extraits automatiquement',
      basePath: '/api/v1',
      autoExtractTypes: true,
      typeExtractorOptions: {
        ignoreFiles: ['node_modules', 'dist', 'test']
      }
    });
    
    APP.listen(CONFIG.port, () => {
      LOGGER.info(`Server running on port ${CONFIG.port}`);
      LOGGER.info(`Documentation API disponible à /docs`);
    });
  } catch (error) {
    LOGGER.error('Failed to initialize services', error as any);
  }
}

startServer();
