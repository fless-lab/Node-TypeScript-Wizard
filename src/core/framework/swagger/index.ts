import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi, { SwaggerOptions } from 'swagger-ui-express';
import { OpenAPIV3 } from 'openapi-types';

// Types pour les décorateurs
export interface ApiOperationOptions {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses?: Record<string, OpenAPIV3.ResponseObject>;
  deprecated?: boolean;
  security?: Record<string, string[]>[];
}

export interface ApiTagOptions {
  name: string;
  description?: string;
}

// Stockage des métadonnées API
const apiDocs: {
  paths: Record<string, Record<string, ApiOperationOptions>>;
  tags: ApiTagOptions[];
  schemas: Record<string, any>;
} = {
  paths: {},
  tags: [],
  schemas: {},
};

// Décorateurs pour les routes
export function ApiOperation(method: string, path: string, options: ApiOperationOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    
    if (!apiDocs.paths[fullPath]) {
      apiDocs.paths[fullPath] = {};
    }
    
    apiDocs.paths[fullPath][method.toLowerCase()] = options;
    
    return descriptor;
  };
}

// Décorateurs pour les contrôleurs
export function ApiTag(options: ApiTagOptions) {
  return function (constructor: Function) {
    apiDocs.tags.push(options);
  };
}

// Enregistrer un schéma pour la documentation
export function registerSchema(name: string, schema: any) {
  apiDocs.schemas[name] = schema;
}

// Convertir les schémas Joi en schémas OpenAPI
export function joiToOpenApi(joiSchema: any): any {
  // Cette fonction est simplifiée, une implémentation complète nécessiterait
  // une analyse plus approfondie des schémas Joi
  const description = joiSchema.describe();
  const properties: Record<string, any> = {};
  const required: string[] = [];
  
  Object.entries(description.keys || {}).forEach(([key, value]: [string, any]) => {
    const prop: any = {
      type: mapJoiTypeToOpenApi(value.type),
    };
    
    if (value.flags?.description) {
      prop.description = value.flags.description;
    }
    
    if (value.flags?.presence === 'required') {
      required.push(key);
    }
    
    properties[key] = prop;
  });
  
  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
  };
}

// Mapper les types Joi vers les types OpenAPI
function mapJoiTypeToOpenApi(joiType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
    date: 'string',
    // Ajouter d'autres mappages si nécessaire
  };
  
  return typeMap[joiType] || 'string';
}

// Générer la spécification OpenAPI
export function generateOpenApiSpec(options: swaggerJsdoc.Options): OpenAPIV3.Document {
  const baseOptions: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'API Documentation générée automatiquement',
      },
      components: {
        schemas: apiDocs.schemas,
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: apiDocs.tags,
      paths: {},
    },
    apis: [],
  };
  
  const mergedOptions = { ...baseOptions, ...options } as unknown as SwaggerOptions;
  
  // Fusionner les chemins collectés par les décorateurs
  Object.entries(apiDocs.paths).forEach(([path, methods]) => {
    if (!mergedOptions.definition.paths) {
      mergedOptions.definition.paths = {};
    }
    
    mergedOptions.definition.paths[path] = methods;
  });
  
  return mergedOptions.definition as OpenAPIV3.Document;
}

// Créer le middleware Swagger
export function createSwaggerMiddleware(options: swaggerJsdoc.Options = {}): Router {
  const router = Router();
  const spec = generateOpenApiSpec(options);
  
  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(spec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));
  
  return router;
}

// Fonction utilitaire pour enregistrer automatiquement les schémas Joi
export function registerJoiSchemas(schemas: Record<string, any>) {
  Object.entries(schemas).forEach(([name, schema]) => {
    registerSchema(name, joiToOpenApi(schema));
  });
}

// Exporter les décorateurs pour les méthodes HTTP courantes
export const Get = (path: string, options: ApiOperationOptions = {}) => ApiOperation('get', path, options);
export const Post = (path: string, options: ApiOperationOptions = {}) => ApiOperation('post', path, options);
export const Put = (path: string, options: ApiOperationOptions = {}) => ApiOperation('put', path, options);
export const Delete = (path: string, options: ApiOperationOptions = {}) => ApiOperation('delete', path, options);
export const Patch = (path: string, options: ApiOperationOptions = {}) => ApiOperation('patch', path, options);

export default {
  createSwaggerMiddleware,
  registerSchema,
  registerJoiSchemas,
  ApiTag,
  Get,
  Post,
  Put,
  Delete,
  Patch,
};