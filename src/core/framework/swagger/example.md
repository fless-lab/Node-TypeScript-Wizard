# Utilisation des décorateurs Swagger

Ce document montre comment utiliser les décorateurs Swagger pour documenter automatiquement vos API.

## Exemple d'utilisation dans un contrôleur

```typescript
import { ApiTag, Get, Post, Put, Delete } from 'core/framework/swagger';
import { CreateTodoRequestSchema } from '../dtos';
import { ApiResponse } from '@nodesandbox/response-kit';

// Décorateur pour le contrôleur
@ApiTag({
  name: 'Todos',
  description: 'Gestion des tâches'
})
export class TodoController {
  
  // Décorateur pour la route POST
  @Post('/', {
    summary: 'Créer une nouvelle tâche',
    description: 'Crée une nouvelle tâche avec les informations fournies',
    tags: ['Todos'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/CreateTodoRequestSchema'
          }
        }
      },
      required: true
    },
    responses: {
      '201': {
        description: 'Tâche créée avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                  $ref: '#/components/schemas/Todo'
                }
              }
            }
          }
        }
      },
      '400': {
        description: 'Données invalides'
      }
    }
  })
  static async createTodo(req: Request, res: Response) {
    try {
      // Validation des données avec Joi
      const _payload = sanitize(req.body, CreateTodoRequestSchema);
      
      // Logique métier...
      
      return ApiResponse.success(res, 'Todo created successfully', 201, todo);
    } catch (error) {
      return ApiResponse.error(res, error as ErrorResponseType);
    }
  }
  
  // Autres méthodes avec leurs décorateurs...
}
```

## Enregistrement des schémas

Pour enregistrer automatiquement vos schémas Joi dans la documentation Swagger :

```typescript
import { registerJoiSchemas } from 'core/framework/swagger';
import * as requestSchemas from './dtos/request';
import * as responseSchemas from './dtos/response';

// Dans votre fichier d'initialisation d'application
registerJoiSchemas({
  ...requestSchemas,
  ...responseSchemas
});
```

## Initialisation de Swagger dans une application

```typescript
import { SwaggerIntegration } from 'core/framework/swagger/integration';
import * as requestSchemas from './dtos/request';

// Dans votre fichier d'initialisation d'application
SwaggerIntegration.initialize(app, {
  apiPath: '/api-docs',
  title: 'Todo API',
  version: '1.0.0',
  description: 'API de gestion des tâches',
  basePath: '/api/v1/todos',
  schemas: requestSchemas
});
```

## Initialisation automatique pour toutes les applications

Pour initialiser automatiquement Swagger pour toutes les applications du projet :

```typescript
import { SwaggerIntegration } from 'core/framework/swagger/integration';

// Dans votre fichier d'initialisation du serveur
SwaggerIntegration.initializeForAllApps();
```