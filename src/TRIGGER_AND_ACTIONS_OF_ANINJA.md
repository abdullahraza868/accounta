# Triggers and Actions Documentation

## Table of Contents
1. [Overview](#overview)
2. [Trigger Events](#trigger-events)
3. [Actions](#actions)
4. [Trigger Configuration](#trigger-configuration)
5. [Condition System](#condition-system)
6. [Execution Flow](#execution-flow)
7. [Technical Implementation](#technical-implementation)

---

## Overview

The automation system in aNinja allows teams to create triggers that automatically execute actions when specific events occur. Triggers are evaluated based on events, conditions, and priorities, then execute one or more actions in sequence.

### Key Concepts

- **Trigger**: A rule that defines when and how automation should execute
- **Event**: The occurrence that activates a trigger (e.g., lead created, incoming email)
- **Condition**: Optional expression that must evaluate to true for the trigger to execute
- **Action**: The task performed when a trigger fires (e.g., assign lead, start sequence)
- **Priority**: Determines the order of trigger execution (1-5, where 1 is highest priority)

---

## Trigger Events

Triggers are activated by specific events in the system. Each event type has its own handler and execution context.

### 1. Lead Creation Events

#### `Lead.created`
- **Description**: Fires when a lead is created through any method
- **Handler**: `onLeadCreate`
- **Context**: Executes after custom fields are ready
- **Use Case**: Generic lead creation automation

#### `Lead.created.api`
- **Description**: Fires when a lead is created via API
- **Handler**: `onApiLeadCreate`
- **Context**: Only triggers when `createProvider === "api"`
- **Use Case**: API-specific lead processing

#### `Lead.created.facebook`
- **Description**: Fires when a lead is created via Facebook integration
- **Handler**: `onApiLeadCreate`
- **Context**: Only triggers when `createProvider === "facebook"`
- **Use Case**: Facebook lead processing

#### `Lead.created.calendly`
- **Description**: Fires when a lead is created via Calendly integration
- **Handler**: `onApiLeadCreate`
- **Context**: Only triggers when `createProvider === "calendly"`
- **Use Case**: Calendly appointment follow-up automation

### 2. Communication Events

#### `Incoming.email`
- **Description**: Fires when an incoming email is received
- **Handler**: `onIncomingEmail`
- **Context**: 
  - Only processes emails with `eventType.includes('incoming')`
  - Supports text matching filters (exact, word, any)
  - Also triggers `Incoming.any` events
- **Text Matching**: Can filter by email body content using:
  - `exact`: Matches exact text
  - `word`: Matches if text contains the word
  - `any`: Matches using regex word boundaries
- **Use Case**: Email-based automation, auto-responses, lead qualification

#### `Incoming.sms`
- **Description**: Fires when an incoming SMS/text message is received
- **Handler**: `onIncomingSms`
- **Context**:
  - Only processes SMS with `eventType.includes('incoming')`
  - Supports text matching filters (exact, word, any)
  - Also triggers `Incoming.any` events
- **Text Matching**: Can filter by SMS message content (same options as email)
- **Use Case**: SMS-based automation, keyword responses, lead routing

#### `Incoming.any`
- **Description**: Fires when either an incoming email OR SMS is received
- **Handler**: Triggered by both `onIncomingEmail` and `onIncomingSms`
- **Context**: Catches both email and SMS events
- **Use Case**: Unified communication automation regardless of channel

#### `Outgoing.sms.error`
- **Description**: Fires when an outgoing SMS fails with an error
- **Handler**: `onOutgoingSmsError`
- **Context**:
  - Only processes SMS with `eventType.includes('outgoing')`
  - Supports error code filtering
- **Error Codes Supported**:
  - `11751`: Media exceeds messaging provider size limit
  - `12300`: Invalid Content-Type
  - `30003`: Unavailable or unreachable destination
  - `30005`: Unknown or inactive destination number
  - `30006`: Landline or unreachable destination
  - `30007`: Message blocked by the carrier
  - `30008`: Delivery failed for unknown reasons
  - `30011`: MMS not supported by receiving phone number
  - `30019`: Content size exceeds carrier limit
  - `30410`: Provider timeout
- **Use Case**: Error handling, retry logic, notification of delivery failures

### 3. Custom Field Events

#### `Customfield.value.changed`
- **Description**: Fires when a custom field value is updated
- **Handler**: `onCustomFieldValueChanged`
- **Context**: Triggers on any custom field update
- **Use Case**: Field-based automation, conditional triggers, data-driven actions

---

## Actions

Actions are the tasks executed when a trigger fires. Multiple actions can be configured per trigger and execute in sequence.

### 1. Lead Assignment

#### `Lead.AssignTo.User`
- **Label**: `[Lead assignment] Assign to User`
- **Description**: Assigns the lead to a specific user
- **Required Parameters**:
  - `userId`: The ID of the user to assign the lead to
- **Use Case**: Route leads to specific team members, assign based on source or criteria

### 2. Sequence Management

#### `Emailsequence.start`
- **Label**: `[Sequence > Email] Start Email Sequence`
- **Description**: Starts an email sequence for the lead
- **Required Parameters**:
  - `emailSequenceTemplateId`: ID of the email sequence template
  - `emailAccountId`: ID of the email account to send from
- **Optional Parameters**:
  - `emailSequenceTemplateName`: Display name of the template
- **Validation**:
  - Lead must have at least one contact with a valid email address
  - Email must be valid format
- **Use Case**: Automated email nurturing, welcome sequences, follow-up campaigns

#### `SMSsequence.start`
- **Label**: `[Sequence > Text] Start Text Sequence`
- **Description**: Starts a text/SMS sequence for the lead
- **Required Parameters**:
  - `textSequenceTemplateId`: ID of the text sequence template
  - `phoneAccountId`: Phone number/account ID to send from
- **Optional Parameters**:
  - `textSequenceTemplateName`: Display name of the template
- **Validation**:
  - Lead must have at least one contact with a valid phone number
  - Phone number must be valid and in a supported region
- **Use Case**: SMS campaigns, text-based follow-up, appointment reminders

#### `Sequences.stop`
- **Label**: `[Sequences > Stop] Stop all sequences & Conversations (Email & Text)`
- **Description**: Stops all active email and text sequences for the lead
- **Parameters**: None required
- **Use Case**: Stop automation when lead responds, opt-out handling, manual intervention

### 3. Lead Management

#### `Lead.MergeIntoDuplicate`
- **Label**: `[Lead merge] Merge new lead into existing duplicate`
- **Description**: Merges a new lead into an existing duplicate lead
- **Required Parameters**:
  - `leadMergeBy`: Method to identify duplicates - `"email"` or `"phone"`
- **Merge Process**:
  1. Finds existing lead by email or phone
  2. Merges lead fields (new lead data takes precedence)
  3. Merges contacts (avoids duplicates)
  4. Merges custom fields (only adds new fields, doesn't overwrite)
  5. Deletes the new lead
- **Validation**:
  - Lead must have contact with email or phone (depending on merge method)
  - Existing lead must be found
  - Both leads must belong to same team
  - Leads must have different creation timestamps
- **Use Case**: Duplicate prevention, data consolidation, contact deduplication

### 4. Communication Actions

#### `Email.post_lead_details`
- **Label**: `[Email] Send lead info to an email address (from: no-reply@aninja.com)`
- **Description**: Sends lead information to a specified email address
- **Required Parameters**:
  - `recepientEmail`: Email address to send lead details to
- **Email Content**:
  - Lead name and link
  - Contact information (name, phone, email)
  - Custom fields
  - Event type context
- **Use Case**: Notifications, lead alerts, team updates, external integrations

#### `Webhook.post_lead_details`
- **Label**: `[Webhook] Post lead details to URL`
- **Description**: Sends lead information to an external webhook URL
- **Required Parameters**:
  - `webhookUrl`: The webhook endpoint URL
- **Optional Parameters**:
  - `webhookPayload`: Configuration for the webhook request
    - `action`: HTTP method - `"get"` or `"post"` (default: `"post"`)
    - `headers`: Custom HTTP headers (object)
    - `body`: Custom body parameters (for GET requests)
- **Payload Structure**:
  ```json
  {
    "id": "lead_id",
    "name": "Lead Name",
    "createdAt": "timestamp",
    "assignedTo": "user_id",
    "belongsTo": "team_id",
    "description": "lead description",
    "totalIncomingEmail": 0,
    "totalOutgoingEmail": 0,
    "totalIncomingSms": 0,
    "totalOutgoingSms": 0,
    "address": {
      "street": "...",
      "city": "...",
      "state": "...",
      "postalzip": "...",
      "country": "..."
    },
    "customFields": {},
    "contacts": [
      {
        "name": "...",
        "firstName": "...",
        "lastName": "...",
        "email": "...",
        "phoneNumber": "...",
        "createdAt": "timestamp",
        "isPrimary": true,
        "doNotContact": false,
        "blockedContact": false
      }
    ]
  }
  ```
- **Use Case**: External system integration, CRM sync, third-party automation, data export

### 5. Do Not Contact Management

#### `Donotcontact.add`
- **Label**: `[Do not contact] Add all Lead contacts to "do not contact" list`
- **Description**: Adds all contacts associated with the lead to the do-not-contact list
- **Parameters**: None required
- **Use Case**: Opt-out handling, compliance, unsubscribe automation

#### `Donotcontact.remove`
- **Label**: `[Do not contact] Remove all Lead contacts from "do not contact" list`
- **Description**: Removes all contacts associated with the lead from the do-not-contact list
- **Parameters**: None required
- **Use Case**: Re-engagement, opt-in handling, consent management

### 6. Delay Actions

#### `Delay_duration.delay_actions_duration_in_mins`
- **Label**: `[Delay] Set delay duration in minutes for triggering event actions`
- **Description**: Delays the execution of subsequent actions in the trigger
- **Required Parameters**:
  - `triggerDelayDuration`: Duration in minutes (as string)
- **Behavior**:
  - Adjusts send dates for all active email and text sequences
  - Adds the delay duration to scheduled send times
  - Affects all pending sequence steps
- **Use Case**: Time-based delays, staggered automation, scheduling adjustments

---

## Trigger Configuration

### Trigger Properties

Each trigger has the following configuration options:

#### Basic Properties
- **`id`**: Unique identifier for the trigger
- **`label`**: Human-readable name for the trigger
- **`status`**: Boolean - whether the trigger is active (`true`) or inactive (`false`)
- **`priority`**: Number (1-5) - execution order, where 1 is highest priority
- **`onEvent`**: The event type that activates this trigger (see [Trigger Events](#trigger-events))
- **`teamId`**: The team this trigger belongs to
- **`userId`**: The user who created the trigger

#### Conditional Properties
- **`condition`**: Optional string expression that must evaluate to `true` for the trigger to execute
- **`breakAfterTriggerExecutes`**: Boolean - whether to stop processing other triggers after this one executes

#### Event-Specific Properties

**For `Outgoing.sms.error` events:**
- **`errorCodes`**: Array of error codes to match:
  ```typescript
  { value: string, text: string }[]
  ```

**For `Incoming.email` and `Incoming.sms` events:**
- **`textMatching`**: String - text to match in email/SMS body (supports pipe-separated values: `"text1|text2|text3"`)
- **`textMatchingType`**: Matching mode - `"exact"`, `"word"`, or `"any"`

**For `Customfield.value.changed` events:**
- **`customField`**: Currently set to `"none"` (reserved for future use)

#### Actions
- **`actions`**: Array of actions to execute when the trigger fires (see [Actions](#actions))

---

## Condition System

### Overview

Triggers can include optional conditions that must evaluate to `true` before actions execute. Conditions are JavaScript-like expressions evaluated against lead data.

### Available Fields

Conditions can reference the following data structure:

```typescript
{
  lead: {
    id: string;
    name: string;
    created: Date;
    assigned_to_user_id?: string;
    assigned_to_fullname?: string;
    has_custom_field: boolean;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
    created: Date;
  };
  address: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalzip: string;
    country: string;
  };
  customFields: {
    [key: string]: string | number;
  };
  // Additional fields available in some contexts:
  email?: {
    direction: "incoming" | "outgoing";
    // ... email data
  };
  sms?: {
    // ... SMS data
  };
  task?: {
    count: number;
    count_done: number;
    count_not_done: number;
  };
}
```

### Condition Examples

```javascript
// Simple field comparison
lead.name === "John Doe"

// Contact email check
contact.email.includes("@gmail.com")

// Custom field check
customFields.budget > 10000

// Address-based condition
address.state === "CA"

// Assignment check
lead.assigned_to_user_id === "user123"

// Combined conditions
lead.has_custom_field && customFields.qualified === "yes"

// Date comparison
lead.created > new Date("2024-01-01")
```

### Condition Evaluation

- Conditions are evaluated using a `ConditionParser` class
- If no condition is provided, the trigger always executes (condition defaults to `true`)
- Conditions are evaluated after the event occurs but before actions execute
- Custom fields are converted to a flat object structure for evaluation

---

## Execution Flow

### 1. Event Detection

When an event occurs in the system, the corresponding Firebase Cloud Function handler is triggered:

1. **Event Handler** (e.g., `onIncomingEmail`, `onApiLeadCreate`)
   - Validates the event type
   - Loads the lead and associated data
   - Retrieves active triggers for the event type
   - Filters triggers based on event-specific criteria

### 2. Trigger Filtering

Triggers are filtered based on:

- **Event Type Match**: Only triggers with matching `onEvent` are considered
- **Status**: Only active triggers (`status === true`) are executed
- **Event-Specific Filters**:
  - `Outgoing.sms.error`: Matches `errorCodes`
  - `Incoming.email`/`Incoming.sms`: Matches text content if `textMatching` is configured

### 3. Trigger Sorting

Filtered triggers are sorted by:
1. **Priority** (ascending: 1 = highest priority)
2. **Creation order** (for same priority)

### 4. Condition Evaluation

For each trigger in priority order:

1. Load lead data (contacts, custom fields, address, etc.)
2. Build `TriggerComparisonData` object
3. Evaluate the condition expression using `ConditionParser`
4. If condition evaluates to `true`, proceed to action execution
5. If condition evaluates to `false`, skip this trigger

### 5. Action Execution

When a trigger's condition passes:

1. **Timeline Note**: A note is added to the lead's timeline indicating the trigger executed
2. **Action Execution**: All actions in the trigger's `actions` array execute in parallel using `Promise.all()`
3. **Error Handling**: Each action has try-catch error handling; failures don't stop other actions
4. **Break Flag**: If `breakAfterTriggerExecutes === true`, remaining triggers are skipped

### 6. Action-Specific Validation

Each action type has its own validation:

- **Sequence Actions**: Validate lead has required contact info (email/phone)
- **Assignment Actions**: Validate user exists
- **Merge Actions**: Validate duplicate lead exists and belongs to same team
- **Webhook Actions**: Validate URL is provided

### 7. Error Handling

- Action failures are logged but don't stop other actions
- Timeline notes are added for failed actions (e.g., "Failed to start email sequence because lead has no email")
- Trigger execution continues even if individual actions fail

---

## Technical Implementation

### File Structure

```
nx/apps/backend/functions/src/
├── brokers/triggers/          # Event handlers
│   ├── onApiLeadCreate.ts
│   ├── onIncomingEmail.ts
│   ├── onIncomingSms.ts
│   ├── onOutgoingSmsError.ts
│   ├── onCustomFieldValueChanged.ts
│   └── onLeadCreate.ts
├── classes/
│   ├── trigger/
│   │   └── TriggerExecutor.ts  # Main execution logic
│   ├── documents/
│   │   ├── Lead/
│   │   ├── Team/
│   │   │   └── Trigger.ts       # Trigger document class
│   │   └── User/
│   └── util/
│       └── ConditionParser.ts  # Condition evaluation

nx/apps/frontend/src/
└── sections/@dashboard/automation/
    └── Triggers/
        ├── AddEditNewTriger.tsx  # Trigger configuration UI
        ├── Table.tsx
        └── Row.tsx

nx/libs/types/src/lib/
├── trigger.ts                  # Type definitions
└── firestore-types.ts          # Firestore document types
```

### Key Classes

#### `TriggerExecutor`
Main class responsible for executing triggers and actions.

**Methods:**
- `startTriggers(triggers: Trigger[], lead: Lead)`: Evaluates conditions and executes matching triggers
- `executeActions(trigger: Trigger)`: Executes all actions for a trigger
- `handleAssignTo()`: Assigns lead to user
- `handleEmailSequenceStart()`: Starts email sequence
- `handleTextSequenceStart()`: Starts text sequence
- `sendLeadDetailsByEmail()`: Sends lead info via email
- `sendLeadDetailsByWebhook()`: Sends lead info via webhook
- `mergeDuplicateLead()`: Merges duplicate leads
- `addDelayDurationToTriggerActions()`: Delays sequence execution
- `addDonotcontact()`: Adds contacts to DNC list
- `removeDonotcontact()`: Removes contacts from DNC list

#### `ConditionParser`
Evaluates condition expressions against lead data.

**Methods:**
- `evaluate(condition: string, data: TriggerComparisonData)`: Evaluates condition and returns boolean
- `convertCustomFieldsToObject()`: Converts custom fields to flat object

#### `Trigger`
Document class for managing trigger documents in Firestore.

**Methods:**
- `getAllTriggers(eventType: TriggerEventType)`: Gets all triggers for an event type
- `getTriggersByMultipleEvents(eventTypes: TriggerEventType[])`: Gets triggers for multiple event types

### Firestore Structure

```
/teams/{teamId}/triggers/{triggerId}
```

Each trigger document contains:
- Basic properties (id, label, status, priority, etc.)
- Event configuration (onEvent, event-specific params)
- Condition expression
- Actions array

### Execution Context

Triggers execute in the context of:
- **Lead**: The lead document that triggered the event
- **User**: The user who created the lead (or team member if not available)
- **Team**: The team the lead belongs to

### Timeline Integration

All trigger executions are logged to the lead's timeline:
- Success: Green note with trigger details
- Failure: Red note with error information
- Action-specific notes for sequence failures, etc.

### Infinite Loop Prevention

Several mechanisms prevent infinite loops:

1. **Event Type Validation**: Strict checks ensure only appropriate events trigger (e.g., only incoming emails trigger `Incoming.email`)
2. **Condition Evaluation**: Conditions must explicitly match; no default matching

### Performance Considerations

- Triggers execute in parallel using `Promise.all()`
- Conditions are evaluated once per trigger
- Actions within a trigger execute in parallel
- Failed actions don't block other actions
- Timeline notes are added asynchronously

---

## Best Practices

### Trigger Design

1. **Use Specific Events**: Prefer specific event types (`Lead.created.api`) over generic ones (`Lead.created`) when possible
2. **Set Appropriate Priorities**: Use priority 1 for critical triggers, 5 for low-priority automation
3. **Use Conditions Wisely**: Add conditions to prevent unnecessary action execution
4. **Test Conditions**: Verify condition expressions work as expected before deploying

### Action Configuration

1. **Validate Required Data**: Ensure leads have required contact information before starting sequences
2. **Error Handling**: Configure fallback actions for common failure scenarios
3. **Use Break Flag**: Set `breakAfterTriggerExecutes: true` for critical triggers that should stop further processing

### Performance

1. **Limit Actions**: Keep the number of actions per trigger reasonable
2. **Optimize Conditions**: Use simple conditions when possible; complex expressions may impact performance
3. **Monitor Execution**: Review timeline notes to identify failed triggers or actions

### Security

1. **Webhook Validation**: Validate webhook URLs and use HTTPS
2. **Email Validation**: Verify recipient emails are valid
3. **User Assignment**: Ensure assigned users exist and have appropriate permissions

---

## Examples

### Example 1: Auto-Assign API Leads

**Trigger Configuration:**
- **Event**: `Lead.created.api`
- **Condition**: `lead.name.includes("Enterprise")`
- **Priority**: 1
- **Actions**:
  - `Lead.AssignTo.User` (userId: "enterprise-sales-user-id")

**Use Case**: Automatically assign enterprise leads to the enterprise sales team.

### Example 2: High-Value Lead Notification

**Trigger Configuration:**
- **Event**: `Customfield.value.changed`
- **Condition**: `customFields.budget > 50000 && customFields.qualified === "yes"`
- **Priority**: 1
- **Actions**:
  - `Email.post_lead_details` (recepientEmail: "sales-manager@company.com")
  - `Lead.AssignTo.User` (userId: "senior-sales-user-id")

**Use Case**: Notify sales manager and assign to senior sales rep when a high-value lead is qualified.

### Example 3: Duplicate Prevention

**Trigger Configuration:**
- **Event**: `Lead.created`
- **Condition**: None
- **Priority**: 1
- **Actions**:
  - `Lead.MergeIntoDuplicate` (leadMergeBy: "email")

**Use Case**: Automatically merge duplicate leads created with the same email address.

---

## Conclusion

The triggers and actions system provides a powerful automation framework for managing leads and communications. By understanding the available events, actions, and configuration options, teams can create sophisticated automation workflows that improve efficiency and ensure consistent lead management processes.

For technical implementation details, refer to the source code in:
- `nx/apps/backend/functions/src/classes/trigger/TriggerExecutor.ts`
- `nx/apps/backend/functions/src/brokers/triggers/`
- `nx/libs/types/src/lib/trigger.ts`

