import { registerJoiSchemas, ApiTag, ApiOperation } from 'core/framework/swagger';
import { CreateTodoRequestSchema, CreateTodoResponseSchema } from './core/api/dtos';

// Exécution automatique lors de l'importation du module
// Cette configuration sera automatiquement détectée par SwaggerIntegration.initializeForAllApps()

// Enregistrer les schémas Joi pour la génération automatique de la documentation
registerJoiSchemas({
  CreateTodoRequestSchema,
  CreateTodoResponseSchema
});

// Décorer les routes et contrôleurs
ApiTag({
  name: 'Todos',
  description: 'Opérations liées à la gestion des tâches'
});

// POST /todos
ApiOperation('post', '/todos', {
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
    }
  },
  responses: {
    '201': {
      description: 'Tâche créée avec succès',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/CreateTodoResponseSchema'
          }
        }
      }
    },
    '400': {
      description: 'Données invalides'
    },
    '500': {
      description: 'Erreur serveur'
    }
  }
});

// GET /todos
ApiOperation('get', '/todos', {
  summary: 'Récupérer toutes les tâches',
  description: 'Récupère la liste des tâches avec filtrage et pagination',
  tags: ['Todos'],
  parameters: [
    {
      name: 'page',
      in: 'query',
      description: 'Numéro de page pour la pagination',
      schema: { type: 'integer', default: 1 }
    },
    {
      name: 'limit',
      in: 'query',
      description: 'Nombre d\'éléments par page',
      schema: { type: 'integer', default: 10 }
    },
    {
      name: 'sort',
      in: 'query',
      description: 'Paramètre de tri (ex: "priority:desc")',
      schema: { type: 'string' }
    },
    {
      name: 'search',
      in: 'query',
      description: 'Terme de recherche pour filtrer par titre/description',
      schema: { type: 'string' }
    },
    {
      name: 'priority',
      in: 'query',
      description: 'Filtrer par priorité (ex: "high", "medium", "low")',
      schema: { type: 'string', enum: ['high', 'medium', 'low'] }
    },
    {
      name: 'completed',
      in: 'query',
      description: 'Filtrer par statut d\'achèvement (true ou false)',
      schema: { type: 'boolean' }
    }
  ],
  responses: {
    '200': {
      description: 'Liste des tâches récupérée avec succès'
    },
    '500': {
      description: 'Erreur serveur'
    }
  }
});

// GET /todos/:todoId
ApiOperation('get', '/todos/{todoId}', {
  summary: 'Récupérer une tâche par son ID',
  description: 'Récupère les détails d\'une tâche spécifique',
  tags: ['Todos'],
  parameters: [
    {
      name: 'todoId',
      in: 'path',
      required: true,
      description: 'ID de la tâche à récupérer',
      schema: { type: 'string' }
    }
  ],
  responses: {
    '200': {
      description: 'Tâche récupérée avec succès'
    },
    '404': {
      description: 'Tâche non trouvée'
    },
    '500': {
      description: 'Erreur serveur'
    }
  }
});

// PUT /todos/:todoId
ApiOperation('put', '/todos/{todoId}', {
  summary: 'Mettre à jour une tâche',
  description: 'Met à jour les informations d\'une tâche existante',
  tags: ['Todos'],
  parameters: [
    {
      name: 'todoId',
      in: 'path',
      required: true,
      description: 'ID de la tâche à mettre à jour',
      schema: { type: 'string' }
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/CreateTodoRequestSchema'
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Tâche mise à jour avec succès'
    },
    '400': {
      description: 'Données invalides'
    },
    '404': {
      description: 'Tâche non trouvée'
    },
    '500': {
      description: 'Erreur serveur'
    }
  }
});

// DELETE /todos/:todoId
ApiOperation('delete', '/todos/{todoId}', {
  summary: 'Supprimer une tâche',
  description: 'Supprime une tâche existante',
  tags: ['Todos'],
  parameters: [
    {
      name: 'todoId',
      in: 'path',
      required: true,
      description: 'ID de la tâche à supprimer',
      schema: { type: 'string' }
    }
  ],
  responses: {
    '200': {
      description: 'Tâche supprimée avec succès'
    },
    '404': {
      description: 'Tâche non trouvée'
    },
    '500': {
      description: 'Erreur serveur'
    }
  }
});

// PATCH /todos/:todoId/complete
ApiOperation('patch', '/todos/{todoId}/complete', {
  summary: 'Marquer une tâche comme terminée',
  description: 'Change le statut d\'une tâche à terminée',
  tags: ['Todos'],
  parameters: [
    {
      name: 'todoId',
      in: 'path',
      required: true,
      description: 'ID de la tâche à marquer comme terminée',
      schema: { type: 'string' }
    }
  ],
  responses: {
    '200': {
      description: 'Statut de la tâche mis à jour avec succès'
    },
    '404': {
      description: 'Tâche non trouvée'
    },
    '500': {
      description: 'Erreur serveur'
    }
  }
});

// Exporter un objet vide pour permettre l'importation du module
export default {};

// Note: Ce fichier est automatiquement chargé par le système et n'a pas besoin d'être explicitement importé
// dans server.ts. SwaggerIntegration.initializeForAllApps() détectera automatiquement les configurations.