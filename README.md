# Logistica Transporte Web

Frontend del proyecto `Logistica_V2` construido con React, TypeScript, Vite, React Query y MUI.

## Objetivo

Este frontend sigue una arquitectura basada en Feature-Sliced Design para mantener separadas la composicion de pantallas, la logica de negocio, los contratos de dominio y los componentes shared.

## Estructura

- `src/app`: providers, theme, router y configuracion global.
- `src/pages`: composicion de vistas y wiring de navegacion.
- `src/widgets`: shells y piezas transversales complejas.
- `src/features`: casos de uso y UI especifica de negocio.
- `src/entities`: contratos, modelos y api clients del dominio.
- `src/shared`: primitives, componentes, hooks, utils y constantes realmente reutilizables.

## Reglas Clave

- mantener `pages` delgadas;
- no dejar schemas Zod ni `defaultValues` dentro del componente UI;
- reutilizar `SharedTable`, `MobileListShell`, `ConfirmDialog`, `DocumentPreviewDialog`, `FormDatePicker`, `FormSelect`, `ImageUpload`, `SectionHeader` y `useGenericCrud` antes de crear alternativas;
- no hardcodear permisos ni IDs funcionales del negocio;
- usar React Query como fuente de verdad para server state;
- no usar `console.error` como feedback para el usuario en flujos de negocio.

## Manejo de Errores

Todo flujo que consuma backend debe pasar por:

- `src/shared/utils/api-errors.ts`
- `src/shared/utils/form-validation.ts`
- `src/shared/utils/logger.ts`
- `src/shared/components/ui/Toast`

Patron esperado:

- formularios: `handleBackendErrors()`;
- mensajes generales: `getErrorMessage()`;
- inspeccion de payload/status: `getApiError()` y `getErrorStatus()`;
- logging tecnico: `logger.error()`;
- feedback visible: `toast`, `alert` o callback reusable.

## Guia del Proyecto

La guia de estandarizacion viva del frontend esta en:

- [docs/frontend-standards.md](./docs/frontend-standards.md)

## Validacion

Comandos recomendados:

```bash
npm run lint
npx tsc -b
npm run build
```

Nota: `npm run build` depende de una version de Node compatible con Vite 7.
