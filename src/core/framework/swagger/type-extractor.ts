import { OpenAPIV3 } from 'openapi-types';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

// Interface pour les options de l'extracteur de types
export interface TypeExtractorOptions {
  tsConfigPath?: string;
  baseDir?: string;
  ignoreFiles?: string[];
}

// Classe principale pour extraire les types TypeScript
export class TypeExtractor {
  private program: ts.Program;
  private typeChecker: ts.TypeChecker;
  private options: TypeExtractorOptions;

  constructor(options: TypeExtractorOptions = {}) {
    this.options = {
      tsConfigPath: options.tsConfigPath || path.resolve(process.cwd(), 'tsconfig.json'),
      baseDir: options.baseDir || process.cwd(),
      ignoreFiles: options.ignoreFiles || [],
    };

    // Initialiser le programme TypeScript
    const configFile = ts.readConfigFile(this.options.tsConfigPath as unknown as string, ts.sys.readFile);
    const parsedCommandLine = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(this.options.tsConfigPath as unknown as string)
    );

    this.program = ts.createProgram({
      rootNames: parsedCommandLine.fileNames,
      options: parsedCommandLine.options,
    });

    this.typeChecker = this.program.getTypeChecker();
  }

  // Extraire un schéma OpenAPI à partir d'un type TypeScript
  public extractSchema(typeName: string, filePath: string): OpenAPIV3.SchemaObject {
    const sourceFile = this.program.getSourceFile(filePath);
    if (!sourceFile) {
      throw new Error(`Source file not found: ${filePath}`);
    }

    let targetType: ts.Type | undefined;

    // Parcourir l'AST pour trouver le type spécifié
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isInterfaceDeclaration(node) && node.name.text === typeName) {
        targetType = this.typeChecker.getTypeAtLocation(node);
      } else if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
        targetType = this.typeChecker.getTypeAtLocation(node);
      }
    });

    if (!targetType) {
      throw new Error(`Type '${typeName}' not found in ${filePath}`);
    }

    return this.typeToOpenApi(targetType);
  }

  // Convertir un type TypeScript en schéma OpenAPI
  private typeToOpenApi(type: ts.Type): OpenAPIV3.SchemaObject {
    const schema: OpenAPIV3.SchemaObject = {};

    // Vérifier si c'est un type union
    if (type.isUnion()) {
      return this.handleUnionType(type);
    }

    // Vérifier si c'est un type primitif
    if (this.isPrimitiveType(type)) {
      return this.handlePrimitiveType(type);
    }

    // Vérifier si c'est un tableau
    if (this.isArrayType(type)) {
      return this.handleArrayType(type);
    }

    // Traiter comme un objet par défaut
    return this.handleObjectType(type);
  }

  // Vérifier si c'est un type primitif
  private isPrimitiveType(type: ts.Type): boolean {
    return (
      type.flags & ts.TypeFlags.String ||
      type.flags & ts.TypeFlags.Number ||
      type.flags & ts.TypeFlags.Boolean ||
      type.flags & ts.TypeFlags.Null ||
      type.flags & ts.TypeFlags.Undefined
    ) !== 0;
  }

  // Vérifier si c'est un type tableau
  private isArrayType(type: ts.Type): boolean {
    return this.typeChecker.typeToString(type).startsWith('Array<') ||
           this.typeChecker.typeToString(type).endsWith('[]');
  }

  // Gérer les types primitifs
  private handlePrimitiveType(type: ts.Type): OpenAPIV3.SchemaObject {
    if (type.flags & ts.TypeFlags.String) {
      return { type: 'string' };
    } else if (type.flags & ts.TypeFlags.Number) {
      return { type: 'number' };
    } else if (type.flags & ts.TypeFlags.Boolean) {
      return { type: 'boolean' };
    } else if (type.flags & ts.TypeFlags.Null || type.flags & ts.TypeFlags.Undefined) {
      return { nullable: true };
    }
    return { type: 'string' }; // Fallback par défaut
  }

  // Gérer les types union
  private handleUnionType(type: ts.Type): OpenAPIV3.SchemaObject {
    const unionTypes = (type as ts.UnionType).types;
    const schemas = unionTypes.map(t => this.typeToOpenApi(t));
    
    // Si tous les types sont des énumérations de chaînes, on les combine
    if (schemas.every(s => s.type === 'string' && s.enum)) {
      const enumValues = schemas.flatMap(s => s.enum || []);
      return { type: 'string', enum: enumValues };
    }
    
    // Sinon, on utilise oneOf
    return { oneOf: schemas };
  }

  // Gérer les types tableau
  private handleArrayType(type: ts.Type): OpenAPIV3.SchemaObject {
    const typeArgs = (type as ts.TypeReference).typeArguments;
    let itemType: OpenAPIV3.SchemaObject = { type: 'string' }; // Type par défaut
    
    if (typeArgs && typeArgs.length > 0) {
      itemType = this.typeToOpenApi(typeArgs[0]);
    } else {
      // Essayer d'extraire le type d'élément à partir de la chaîne de type
      const typeString = this.typeChecker.typeToString(type);
      if (typeString.endsWith('[]')) {
        const elementTypeName = typeString.slice(0, -2);
        // Ici, on pourrait essayer de résoudre le type d'élément, mais c'est complexe
        // Pour simplifier, on utilise un type générique
        itemType = { type: 'object', description: `Array element type: ${elementTypeName}` };
      }
    }
    
    return {
      type: 'array',
      items: itemType
    };
  }

  // Gérer les types objet
  private handleObjectType(type: ts.Type): OpenAPIV3.SchemaObject {
    const properties: Record<string, OpenAPIV3.SchemaObject> = {};
    const required: string[] = [];
    
    // Obtenir les propriétés du type
    const props = type.getProperties();
    
    for (const prop of props) {
      const propName = prop.getName();
      const propType = this.typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!);
      const propSchema = this.typeToOpenApi(propType);
      
      // Vérifier si la propriété est requise
      if (!(prop.flags & ts.SymbolFlags.Optional)) {
        required.push(propName);
      }
      
      // Ajouter la description si disponible
      const jsDocTags = prop.getJsDocTags();
      for (const tag of jsDocTags) {
        if (tag.name === 'description' && tag.text) {
          propSchema.description = tag.text.map(t => t.text).join(' ');
        }
      }
      
      properties[propName] = propSchema;
    }
    
    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined
    };
  }

  // Extraire tous les types exportés d'un fichier
  public extractAllExportedTypes(filePath: string): Record<string, OpenAPIV3.SchemaObject> {
    const sourceFile = this.program.getSourceFile(filePath);
    if (!sourceFile) {
      throw new Error(`Source file not found: ${filePath}`);
    }
    
    const schemas: Record<string, OpenAPIV3.SchemaObject> = {};
    
    // Parcourir l'AST pour trouver tous les types exportés
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isInterfaceDeclaration(node) && this.hasExportModifier(node)) {
        const typeName = node.name.text;
        const type = this.typeChecker.getTypeAtLocation(node);
        schemas[typeName] = this.typeToOpenApi(type);
      } else if (ts.isTypeAliasDeclaration(node) && this.hasExportModifier(node)) {
        const typeName = node.name.text;
        const type = this.typeChecker.getTypeAtLocation(node);
        schemas[typeName] = this.typeToOpenApi(type);
      }
    });
    
    return schemas;
  }

  // Vérifier si un nœud a un modificateur d'exportation
  private hasExportModifier(node: ts.Node): boolean {
    // Vérifier si le nœud est une déclaration qui peut avoir des modificateurs
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || 
        ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) || 
        ts.isVariableStatement(node)) {
      // Utiliser getModifiers() qui est disponible sur les déclarations
      const modifiers = ts.getModifiers(node);
      return modifiers !== undefined && 
             modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
    }
    return false;
  }

  // Extraire tous les types exportés de tous les fichiers du projet
  public extractAllProjectTypes(): Record<string, OpenAPIV3.SchemaObject> {
    const schemas: Record<string, OpenAPIV3.SchemaObject> = {};
    
    for (const sourceFile of this.program.getSourceFiles()) {
      // Ignorer les fichiers de node_modules et les fichiers spécifiés à ignorer
      if (
        sourceFile.fileName.includes('node_modules') ||
        this.options.ignoreFiles?.some(pattern => sourceFile.fileName.includes(pattern))
      ) {
        continue;
      }
      
      try {
        const fileSchemas = this.extractAllExportedTypes(sourceFile.fileName);
        Object.assign(schemas, fileSchemas);
      } catch (error) {
        console.warn(`Error extracting types from ${sourceFile.fileName}:`, error);
      }
    }
    
    return schemas;
  }
}

// Fonction utilitaire pour extraire les schémas OpenAPI à partir des types TypeScript
export function extractOpenApiSchemas(
  options: TypeExtractorOptions = {}
): Record<string, OpenAPIV3.SchemaObject> {
  const extractor = new TypeExtractor(options);
  return extractor.extractAllProjectTypes();
}

// Fonction utilitaire pour extraire un schéma OpenAPI à partir d'un type spécifique
export function extractOpenApiSchema(
  typeName: string,
  filePath: string,
  options: TypeExtractorOptions = {}
): OpenAPIV3.SchemaObject {
  const extractor = new TypeExtractor(options);
  return extractor.extractSchema(typeName, filePath);
}