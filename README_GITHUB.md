# ✅ GitHub Configurado Correctamente

## 🎉 Estado Actual

- ✅ Repositorio creado: `digitadsagency/mini-monday`
- ✅ Código subido exitosamente
- ✅ Token configurado para push automático
- ✅ Branch `main` configurado como default

## 🔐 Seguridad del Token

**IMPORTANTE**: El token está configurado en `.git/config`, que NO se sube a GitHub (está en `.gitignore` implícitamente).

**Si necesitas revocar el token**:
1. Ve a: https://github.com/settings/tokens
2. Encuentra el token "MiniMonday Deploy"
3. Haz clic en "Revoke"

## 🚀 Próximos Pasos

### 1. Conectar con Vercel

1. Ve a https://vercel.com
2. Haz clic en "Sign Up" o "Log In"
3. Selecciona "Continue with GitHub"
4. Autoriza a Vercel a acceder a tus repositorios
5. En el dashboard, haz clic en "Add New..." > "Project"
6. Selecciona el repositorio `digitadsagency/mini-monday`
7. Vercel detectará automáticamente que es Next.js

### 2. Configurar Variables de Entorno en Vercel

En la sección "Environment Variables", agrega:

```
GOOGLE_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
SHEETS_SPREADSHEET_ID=tu-spreadsheet-id
JWT_SECRET=tu-jwt-secret-super-seguro
NEXTAUTH_SECRET=tu-nextauth-secret
NEXTAUTH_URL=https://mini-monday.vercel.app
```

**⚠️ IMPORTANTE**:
- Para `GOOGLE_PRIVATE_KEY`: Copia la clave completa incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Mantén los `\n` literales o usa comillas dobles como se muestra
- `NEXTAUTH_URL` se actualizará automáticamente después del primer deploy

### 3. Desplegar

1. Haz clic en "Deploy"
2. Espera 2-5 minutos mientras Vercel construye y despliega
3. Una vez completado, tendrás una URL como: `https://mini-monday.vercel.app`

## 🔄 Deploy Automático

**¡Ya está configurado!** Cada vez que hagas push a `main`, Vercel desplegará automáticamente.

### Para futuros cambios:

Cuando yo haga cambios en tu código, ejecutaré:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Y Vercel detectará el push y desplegará automáticamente.

## 📍 URL del Repositorio

Tu repositorio está disponible en:
**https://github.com/digitadsagency/mini-monday**

## ✅ Verificación

Para verificar que todo está bien:

1. **GitHub**: Ve a https://github.com/digitadsagency/mini-monday y verifica que todos los archivos estén ahí
2. **Vercel**: Una vez conectado, verifica que el deploy esté en progreso
3. **URL**: Una vez completado, visita tu URL de Vercel

## 🆘 Si hay problemas

### Error: "authentication failed"
- Verifica que el token aún sea válido en https://github.com/settings/tokens
- Si expiró, genera uno nuevo y actualiza `.git/config`

### Error: "repository not found"
- Verifica que el repositorio exista en https://github.com/digitadsagency/mini-monday
- Verifica que el token tenga permisos `repo`

### Error en Vercel: "Build failed"
- Revisa los logs de build en Vercel
- Verifica que todas las variables de entorno estén configuradas
- Verifica que `npm run build` funcione localmente

