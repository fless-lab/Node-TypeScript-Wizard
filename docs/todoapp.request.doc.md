# Documentation des Requêtes de l'Application Todo

## Création d'une Tâche
- **URL**: `/todos`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer your_access_token`
- **Body**:
```json
{
  "title": "Faire les courses",
  "description": "Acheter du pain et du lait",
  "dueDate": "2024-03-20T15:00:00Z",
  "priority": "HIGH" // HIGH, MEDIUM, LOW
}
```

## Récupération de Toutes les Tâches
- **URL**: `/todos`
- **Method**: `GET`
- **Headers**: 
  - `Authorization: Bearer your_access_token`
- **Query Parameters**:
  - `page`: Numéro de page (par défaut: 1)
  - `limit`: Nombre d'éléments par page (par défaut: 10)
  - `status`: Filtre par statut (COMPLETED, PENDING)
  - `priority`: Filtre par priorité (HIGH, MEDIUM, LOW)
  - `sort`: Tri par champ (title, dueDate, priority)
  - `order`: Ordre de tri (asc, desc)

## Récupération d'une Tâche Spécifique
- **URL**: `/todos/:id`
- **Method**: `GET`
- **Headers**: 
  - `Authorization: Bearer your_access_token`

## Mise à Jour d'une Tâche
- **URL**: `/todos/:id`
- **Method**: `PUT`
- **Headers**: 
  - `Authorization: Bearer your_access_token`
- **Body**:
```json
{
  "title": "Faire les courses",
  "description": "Acheter du pain, du lait et des œufs",
  "dueDate": "2024-03-21T15:00:00Z",
  "priority": "MEDIUM",
  "status": "COMPLETED"
}
```

## Suppression d'une Tâche
- **URL**: `/todos/:id`
- **Method**: `DELETE`
- **Headers**: 
  - `Authorization: Bearer your_access_token`

## Marquer une Tâche comme Complétée
- **URL**: `/todos/:id/complete`
- **Method**: `PATCH`
- **Headers**: 
  - `Authorization: Bearer your_access_token`

## Marquer une Tâche comme En Cours
- **URL**: `/todos/:id/pending`
- **Method**: `PATCH`
- **Headers**: 
  - `Authorization: Bearer your_access_token`

## Ajouter un Tag à une Tâche
- **URL**: `/todos/:id/tags`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer your_access_token`
- **Body**:
```json
{
  "name": "urgent",
  "color": "#FF0000"
}
```

## Supprimer un Tag d'une Tâche
- **URL**: `/todos/:id/tags/:tagId`
- **Method**: `DELETE`
- **Headers**: 
  - `Authorization: Bearer your_access_token`

## Notes Importantes
1. Toutes les routes nécessitent une authentification
2. Les dates doivent être au format ISO 8601
3. Les priorités sont limitées à HIGH, MEDIUM, LOW
4. Les statuts sont limités à COMPLETED, PENDING
5. Les réponses incluent des métadonnées de pagination pour les listes 