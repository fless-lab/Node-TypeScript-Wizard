import { Request, Response, NextFunction } from 'express';
import { TodoService } from 'apps/demo/core/business';
import { CreateTodoRequestSchema } from '../dtos';
import { sanitize } from 'helpers';
import { ApiResponse, ErrorResponseType } from '@nodesandbox/response-kit';
import { ApiTag, Post, Get } from 'core/framework/swagger';

/**
 * Controller to handle the operations related to the Todo resource.
 */
@ApiTag({
  name: 'Todos',
  description: 'Gestion des tâches'
})
export class TodoController {
  /**
   * Create a new Todo item.
   * @param req - Express Request object containing the todo data in the request body.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
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
  static async createTodo(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const _payload = sanitize(req.body, CreateTodoRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await TodoService.create(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response, 201);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Retrieve a list of Todos based on filters (priority, completion, etc.).
   * @param req - Express Request object, with filters in the query params.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  @Get('/', {
    summary: 'Récupérer toutes les tâches',
    description: 'Récupère la liste des tâches avec possibilité de filtrage',
    tags: ['Todos'],
    parameters: [
      {
        in: 'query',
        name: 'page',
        schema: { type: 'integer', default: 1 },
        description: 'Numéro de page pour la pagination'
      },
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 10 },
        description: 'Nombre d\'éléments par page'
      },
      {
        in: 'query',
        name: 'sort',
        schema: { type: 'string' },
        description: 'Tri (ex: priority:desc)'
      },
      {
        in: 'query',
        name: 'search',
        schema: { type: 'string' },
        description: 'Recherche dans le titre/description'
      }
    ],
    responses: {
      '200': {
        description: 'Liste des tâches récupérée avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Todo'
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  static async getTodos(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query; // Extract query params for filtering.
      const response = await TodoService.getTodos(filters);

      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }

  /**
   * Retrieve a single Todo item by its ID.
   * @param req - Express Request object, with the Todo ID in the URL params.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  @Get('/:todoId', {
    summary: 'Récupérer une tâche par son ID',
    description: 'Récupère les détails d\'une tâche spécifique',
    tags: ['Todos'],
    parameters: [
      {
        in: 'path',
        name: 'todoId',
        required: true,
        schema: { type: 'string' },
        description: 'ID de la tâche'
      }
    ],
    responses: {
      '200': {
        description: 'Tâche récupérée avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  $ref: '#/components/schemas/Todo'
                }
              }
            }
          }
        }
      },
      '404': {
        description: 'Tâche non trouvée'
      }
    }
  })
  static async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const todoId = req.params.todoId; // Extract the Todo ID from the request params.
      const response = await TodoService.findOne({ _id: todoId });
      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }

  /**
   * Update an existing Todo item by its ID.
   * @param req - Express Request object, with the Todo ID in the URL params and updated data in the request body.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async updateTodo(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const todoId = req.params.todoId; // Extract the Todo ID from the request params.
      const response = await TodoService.update({ _id: todoId }, req.body); // Update the Todo with new data.

      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }

  /**
   * Delete a Todo item by its ID.
   * @param req - Express Request object, with the Todo ID in the URL params.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async deleteTodo(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const todoId = req.params.todoId; // Extract the Todo ID from the request params.
      const response = await TodoService.delete({ _id: todoId }); // Soft or hard delete the Todo.

      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }

  /**
   * Mark a Todo item as complete by its ID.
   * @param req - Express Request object, with the Todo ID in the URL params.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async markTodoAsComplete(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const todoId = req.params.todoId; // Extract the Todo ID from the request params.
      const response = await TodoService.markAsComplete(todoId); // Mark the Todo as complete.

      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }
}
