# Architecture des Applications

## Structure Swagger

L'architecture de documentation API a été simplifiée pour améliorer la scalabilité et la maintenance.

### Principes clés

1. **Centralisation de l'initialisation** : L'initialisation de Swagger est entièrement gérée par `SwaggerIntegration.initializeForAllApps()` dans `server.ts`.

2. **Configuration déclarative par application** : Chaque application définit sa propre configuration Swagger dans un fichier `swagger-config.ts`.

3. **Chargement automatique** : Les configurations sont automatiquement chargées lors de l'importation du module principal de l'application.

### Comment ajouter une nouvelle application

Pour ajouter une nouvelle application avec sa documentation API :

1. Créez un dossier pour votre application dans `src/apps/`
2. Créez un fichier `swagger-config.ts` qui définit les schémas et routes
3. Importez ce fichier dans l'`index.ts` de votre application

```typescript
// src/apps/nouvelle-app/swagger-config.ts
import { registerJoiSchemas, ApiTag, ApiOperation } from 'core/framework/swagger';
import { VosSchemas } from './core/api/dtos';

// Enregistrer les schémas
registerJoiSchemas({
  // Vos schémas ici
});

// Décorer les routes
ApiTag({
  name: 'VotreTag',
  description: 'Description de votre API'
});

// Définir les opérations
ApiOperation('get', '/votre-route', {
  // Configuration de l'opération
});

export default {};
```

```typescript
// src/apps/nouvelle-app/index.ts
// Importer la configuration Swagger
import './swagger-config';

// Exporter les composants de l'application
export * from './core';
```

### Avantages

- **Séparation des préoccupations** : Chaque application définit uniquement sa propre documentation
- **Scalabilité** : Ajoutez de nouvelles applications sans modifier le code central
- **Maintenance simplifiée** : Pas de logique d'initialisation dupliquée
- **Cohérence** : Toutes les applications suivent le même modèle de documentation

La documentation API sera disponible aux points d'accès suivants :
- Documentation globale : `/docs`
- Documentation spécifique à une application : `/docs/[nom-app]`