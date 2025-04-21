import { extractOpenApiSchema, extractOpenApiSchemas } from './type-extractor';
import path from 'path';

/**
 * Ce fichier démontre comment utiliser l'extracteur de types TypeScript
 * pour générer automatiquement des schémas OpenAPI à partir des types existants.
 */

// Exemple d'extraction d'un schéma spécifique
function testExtractSpecificSchema() {
  try {
    // Chemin vers le fichier contenant le type à extraire
    const filePath = path.resolve(__dirname, '../../../modules/features/actions/user/types.ts');
    
    // Nom du type à extraire
    const typeName = 'IUserModel';
    
    // Extraire le schéma OpenAPI
    const schema = extractOpenApiSchema(typeName, filePath);
    
    console.log(`Schéma extrait pour ${typeName}:`, JSON.stringify(schema, null, 2));
    return schema;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du schéma:', error);
    return null;
  }
}

// Exemple d'extraction de tous les schémas du projet
function testExtractAllSchemas() {
  try {
    // Options pour l'extracteur de types
    const options = {
      ignoreFiles: ['node_modules', 'dist', 'test']
    };
    
    // Extraire tous les schémas OpenAPI
    const schemas = extractOpenApiSchemas(options);
    
    console.log(`Nombre de schémas extraits: ${Object.keys(schemas).length}`);
    console.log('Schémas extraits:', Object.keys(schemas));
    return schemas;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des schémas:', error);
    return null;
  }
}

/**
 * Pour exécuter ce test, vous pouvez utiliser la commande suivante:
 * 
 * ```
 * ts-node src/core/framework/swagger/type-extractor.test.ts
 * ```
 * 
 * Ou créer un script dans package.json:
 * 
 * ```json
 * "scripts": {
 *   "test:swagger": "ts-node src/core/framework/swagger/type-extractor.test.ts"
 * }
 * ```
 * 
 * Et l'exécuter avec:
 * 
 * ```
 * npm run test:swagger
 * ```
 */

// Décommentez ces lignes pour exécuter les tests
// testExtractSpecificSchema();
// testExtractAllSchemas();

export { testExtractSpecificSchema, testExtractAllSchemas };