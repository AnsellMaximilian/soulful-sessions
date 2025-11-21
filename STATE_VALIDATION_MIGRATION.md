# State Validation and Migration System

## Overview

The Soul Shepherd extension now includes a comprehensive state validation and migration system to ensure data integrity and support future schema changes. This system is implemented in the `StateManager` class.

## Features

### 1. Schema Versioning

- **Current Version**: 1
- Each `GameState` now includes a `version` field
- Version number is defined in `constants.ts` as `CURRENT_STATE_VERSION`
- Allows for tracking and migrating between different schema versions

### 2. State Validation

The system validates all loaded state data and repairs corrupted or missing fields:

#### Field-Level Validation

- Checks data types for all fields
- Validates numeric ranges where applicable
- Ensures arrays and objects are properly structured
- Repairs individual corrupted fields with default values

#### Critical Corruption Detection

The system identifies critically corrupted states that cannot be repaired:

- Missing or invalid major sections (player, progression, settings, statistics)
- If fewer than 2 out of 4 major sections are valid, state is considered critically corrupted
- Corrupted critical fields in player state (level, stats)

### 3. State Migration

Automatic migration between schema versions:

#### Migration Chain

- Detects state version on load
- Applies sequential migrations to bring state to current version
- Currently supports migration from version 0 (no version field) to version 1

#### Version 0 → Version 1 Migration

- Adds the `version` field to existing states
- All existing data structures remain compatible
- No data loss during migration

#### Future Migrations

The system is designed to support future schema changes:

```typescript
if (stateVersion < 2) {
  migratedState = this.migrateToV2(migratedState);
}
```

### 4. Backup System

When critically corrupted state is detected:

#### Automatic Backup

- Corrupted state is backed up to `soulShepherdGameState_backup`
- Backup includes timestamp and full state data
- Backup occurs before resetting to defaults

#### Backup Management

- `getBackupState()`: Retrieve backed up state
- `deleteBackup()`: Remove backup after recovery
- Backup operations use retry logic for reliability

### 5. User Notifications

The system notifies users of important events:

#### Data Loss Notification

When state is reset due to critical corruption:

```
Title: "Soul Shepherd - Data Reset"
Message: "Your save data was corrupted and has been reset. A backup was created."
```

#### Save Failure Notification

When state cannot be saved:

```
Title: "Soul Shepherd"
Message: "Failed to save progress. Your changes may be lost."
```

#### Load Failure Notification

When state cannot be loaded:

```
Title: "Soul Shepherd"
Message: "Failed to load saved progress. Starting fresh."
```

## Implementation Details

### StateManager Methods

#### Core Methods

- `loadState()`: Load and validate state from storage
- `saveState()`: Save state with retry logic
- `getState()`: Get current in-memory state
- `updateState()`: Update and persist partial state changes

#### Validation Methods

- `validateAndRepairState()`: Main validation entry point
- `checkCriticalCorruption()`: Detect unrepairable corruption
- `validatePlayerState()`: Validate player data
- `validateProgressionState()`: Validate progression data
- `validateSettingsState()`: Validate settings data
- `validateStatisticsState()`: Validate statistics data
- `validateSessionState()`: Validate session data
- `validateBreakState()`: Validate break data
- `validateTaskState()`: Validate task data

#### Migration Methods

- `migrateState()`: Main migration entry point
- `migrateToV1()`: Migrate from version 0 to version 1

#### Backup Methods

- `backupCorruptedState()`: Create backup of corrupted state
- `getBackupState()`: Retrieve backup
- `deleteBackup()`: Remove backup

#### Utility Methods

- `getStateVersion()`: Get current schema version
- `retryStorageOperation()`: Retry storage operations with exponential backoff

### Error Handling

#### Storage Operation Retries

- Maximum 3 retry attempts
- Exponential backoff: 100ms, 200ms, 400ms
- Logs all retry attempts
- Throws error after all retries fail

#### Graceful Degradation

- Backup failures don't prevent state reset
- Sync storage failures don't break local storage
- Missing optional fields are added with defaults
- Invalid values are replaced with defaults

## Testing

### Manual Tests

The `test-statemanager.ts` file includes comprehensive tests:

1. **Load State**: Verify default state creation
2. **Get State**: Verify state retrieval
3. **Update State**: Verify state updates and persistence
4. **Persistence**: Verify state survives reload
5. **Validation**: Verify corrupted data is repaired
6. **Migration**: Verify version 0 → version 1 migration
7. **Critical Corruption**: Verify backup and reset
8. **Version Retrieval**: Verify version number access

### Running Tests

Tests can be run in the browser console:

```javascript
import { testStateManager } from "./test-statemanager.js";
testStateManager();
```

## Future Enhancements

### Planned Features

1. **Version 2 Migration**: Add when schema changes are needed
2. **Backup Recovery UI**: Allow users to restore from backup
3. **State Export/Import**: Manual backup and restore
4. **Validation Reporting**: Detailed logs of repairs made
5. **Schema Documentation**: Auto-generated schema docs

### Adding New Migrations

When schema changes are needed:

1. Increment `CURRENT_STATE_VERSION` in `constants.ts`
2. Add migration function in `StateManager`:
   ```typescript
   private migrateToV2(state: any): any {
     console.log("[StateManager] Migrating to version 2: [description]");
     // Perform migration logic
     return migratedState;
   }
   ```
3. Add migration to chain in `migrateState()`:
   ```typescript
   if (stateVersion < 2) {
     migratedState = this.migrateToV2(migratedState);
   }
   ```
4. Update tests to verify migration

## Requirements Satisfied

This implementation satisfies the following requirements from task 35:

- ✅ Create schema validator for GameState
- ✅ Validate state on load from storage
- ✅ If invalid, attempt to repair missing/corrupted fields
- ✅ If unrepairable, backup old state and reset to default
- ✅ Notify user of data loss if reset occurs
- ✅ Implement version number for future migrations

Requirements: 1.1, 2.1
