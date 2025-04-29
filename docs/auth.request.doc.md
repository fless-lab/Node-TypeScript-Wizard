# Documentation des Requêtes d'Authentification

## Inscription (Register)
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "your_password",
  "firstname": "John",
  "lastname": "Doe"
}
```

## Vérification du Compte (Verify Account)
- **URL**: `/auth/verify`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "code": "123456" // Code OTP reçu par email
}
```

## Connexion avec Mot de Passe (Login with Password)
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

## Génération d'OTP pour Connexion
- **URL**: `/auth/login/otp/generate`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com"
}
```

## Connexion avec OTP
- **URL**: `/auth/login/otp`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "code": "123456" // Code OTP reçu par email
}
```

## Rafraîchissement du Token
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Body**:
```json
{
  "refreshToken": "your_refresh_token"
}
```

## Déconnexion (Logout)
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer your_access_token`
- **Body**:
```json
{
  "accessToken": "your_access_token",
  "refreshToken": "your_refresh_token"
}
```

## Mot de Passe Oublié
- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com"
}
```

## Réinitialisation du Mot de Passe
- **URL**: `/auth/reset-password`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "code": "123456", // Code OTP reçu par email
  "newPassword": "new_password"
}
```

## Génération d'OTP
- **URL**: `/auth/otp/generate`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "purpose": "ACCOUNT_VERIFICATION" // ou "LOGIN_CONFIRMATION" ou "FORGOT_PASSWORD"
}
```

## Validation d'OTP
- **URL**: `/auth/otp/validate`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "purpose": "ACCOUNT_VERIFICATION" // ou "LOGIN_CONFIRMATION" ou "FORGOT_PASSWORD"
}
```

## Récupération des Informations de l'Utilisateur Actuel
- **URL**: `/auth/me`
- **Method**: `GET`
- **Headers**: 
  - `Authorization: Bearer your_access_token`

## Notes Importantes
1. Toutes les routes nécessitant une authentification doivent inclure le header `Authorization: Bearer your_access_token`
2. Les codes OTP sont envoyés par email
3. Les tokens d'accès expirent après une certaine période
4. Les tokens de rafraîchissement peuvent être utilisés pour obtenir un nouveau token d'accès 