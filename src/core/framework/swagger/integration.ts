import { Application, Router } from 'express';
import { ObjectSchema } from 'joi';
import { createSwaggerMiddleware, registerJoiSchemas, registerSchema } from '.';
import { listRoutes } from 'helpers/routing';
import { extractOpenApiSchemas } from './type-extractor';

/**
 * Classe utilitaire pour intégrer Swagger dans les applications
 */
export class SwaggerIntegration {
  /**
   * Initialise Swagger pour une application spécifique
   * @param app L'application Express
   * @param options Options de configuration
   */
  static initialize(app: Application, options: {
    apiPath: string;
    title: string;
    version: string;
    description: string;
    basePath?: string;
    schemas?: Record<string, ObjectSchema>;
    autoExtractTypes?: boolean;
    typeExtractorOptions?: {
      tsConfigPath?: string;
      baseDir?: string;
      ignoreFiles?: string[];
    };
  }) {
    // Enregistrer les schémas Joi si fournis
    if (options.schemas) {
      registerJoiSchemas(options.schemas);
    }
    
    // Extraire automatiquement les types TypeScript si activé
    if (options.autoExtractTypes !== false) {
      try {
        const schemas = extractOpenApiSchemas(options.typeExtractorOptions || {});
        Object.entries(schemas).forEach(([name, schema]) => {
          registerSchema(name, schema);
        });
        LOGGER.info(`Types TypeScript extraits automatiquement pour la documentation API`);
      } catch (error) {
        LOGGER.warn('Erreur lors de l\'extraction automatique des types:', error as Error);
      }
    }

    // Créer le middleware Swagger
    const swaggerRouter = createSwaggerMiddleware({
      definition: {
        info: {
          title: options.title,
          version: options.version,
          description: options.description,
        },
        servers: [
          {
            url: options.basePath || '/',
            description: 'API Server',
          },
        ],
      },
    });

    // Monter le middleware Swagger sur le chemin spécifié
    app.use(options.apiPath, swaggerRouter);

    LOGGER.info(`Documentation Swagger disponible à ${options.apiPath}`);
  }

  /**
   * Initialise Swagger pour toutes les applications du projet
   * @param app L'application Express principale
   * @param options Options globales pour l'extraction des types
   */
  static initializeForAllApps(app: Application = APP, options = {
    autoExtractTypes: true,
    typeExtractorOptions: {
      ignoreFiles: ['node_modules', 'dist', 'test']
    }
  }) {
    // Récupérer toutes les routes enregistrées
    const routes = listRoutes(app);
    
    // Regrouper les routes par application
    const appRoutes = routes.reduce((acc, route) => {
      const pathParts = route.path.split('/');
      if (pathParts.length > 1) {
        const appName = pathParts[1] || 'api';
        if (!acc[appName]) {
          acc[appName] = [];
        }
        acc[appName].push(route);
      }
      return acc;
    }, {} as Record<string, any[]>);

    // Créer une documentation Swagger pour chaque application
    Object.entries(appRoutes).forEach(([appName, routes]) => {
      if (appName && appName !== 'api') {
        this.initialize(app, {
          apiPath: `/docs/${appName}`,
          title: `${appName.charAt(0).toUpperCase() + appName.slice(1)} API`,
          version: '1.0.0',
          description: `Documentation de l'API ${appName}`,
          basePath: `/api/v1/${appName}`,
          autoExtractTypes: options.autoExtractTypes,
          typeExtractorOptions: options.typeExtractorOptions
        });
      }
    });

    // Créer une documentation globale
    this.initialize(app, {
      apiPath: '/docs',
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation complète de l\'API',
      basePath: '/api/v1',
      autoExtractTypes: options.autoExtractTypes,
      typeExtractorOptions: options.typeExtractorOptions
    });
  }
}

export default SwaggerIntegration;