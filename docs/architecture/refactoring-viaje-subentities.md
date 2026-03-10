# Refactoring: Viaje Sub-Entities to Independent API Calls

## Overview
This document outlines the architectural changes made to decouple the management of Voyage (Viaje) sub-entities (Guías, Gastos, Mercadería, Incidentes) from the main Voyage form submission.

## Motivation
The previous implementation relied on `react-hook-form`'s `useFieldArray` and `useFormContext` to manage sub-entities as part of the main Voyage object. This caused several issues:
- **Performance**: Re-rendering the entire form when a sub-item changed.
- **Complexity**: Managing deep nested state and validation.
- **Data Integrity**: Risk of overwriting or losing data if the frontend state became out of sync.
- **Scalability**: Difficulty in adding pagination or server-side filtering for large lists.

## Changes Implemented

### Frontend Architecture
1.  **Component Independence**:
    - `ViajeGuiaList`, `ViajeGastoList`, `ViajeMercaderiaList`, and `ViajeIncidenteList` have been refactored to remove dependencies on `useFormContext` and `useFieldArray`.
    - These components now accept a `viajeId` prop.

2.  **Data Fetching & State Management**:
    - Each component now uses `useQuery` (via custom hooks like `useViajeGuias`) to fetch its own data directly from the API using the `viajeId`.
    - CRUD operations (Create, Update, Delete) are handled via `useMutation` hooks, providing immediate feedback and server-side persistence.
    - Local state is used only for the "New Item" form within each component.

3.  **Parent Integration**:
    - `CreateEditViajeModal` has been updated to pass the `viajeId` (from the created/edited voyage) to these child components.
    - In "Create" mode, the child components prompt the user to "Save the Voyage" first to generate an ID before allowing sub-entity addition.

### Backend Architecture
1.  **Update Command Logic**:
    - The `UpdateViajeCommand` handler has been modified to *ignore* the incoming collections for Guías, Gastos, Mercadería, and Incidentes.
    - This ensures that updating the main Voyage details (Header) does not accidentally overwrite or clear the independently managed sub-entities.

2.  **API Endpoints**:
    - Verified that dedicated Controllers (`ViajeGuiaController`, etc.) exist and support full CRUD operations.

## Implications for Development
- **"Save Header First" Workflow**: When creating a new Voyage, users must save the general information first. Once the Voyage is created and an ID is assigned, the sub-entity tabs become fully functional.
- **Granular Error Handling**: Errors in adding a guide or expense are now isolated to that specific action and do not block the saving of the main Voyage.
