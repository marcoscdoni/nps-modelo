# Dynamic Questions System

## Overview

The question system has been refactored to be fully dynamic, allowing configuration via JSON without needing to change code.

## Architecture

### Files

- **`src/config/questions.json`**: Configuration file with all questions
- **`src/config/questionsHelper.js`**: Helper functions to load and process questions
- **`src/components/NPSSurvey.vue`**: Main component (now uses the dynamic system)

## JSON Structure

### Main Configuration

```json
{
  "version": "1.0",
  "categories": { ... },
  "questions": [ ... ]
}
```

### Categories

Define groups of conditional questions:

```json
"categories": {
  "car": {
    "label": "Car",
    "description": "Practical car classes"
  },
  "moto": {
    "label": "Motorcycle",
    "description": "Practical motorcycle classes"
  }
}
```

### Question Structure

```json
{
  "key": "practicalCarClasses",
  "question": "How do you rate the quality of practical car classes?",
  "type": "likert",
  "required": false,
  "order": 5,
  "description": "Help text (optional)",
  "category": "car",
  "conditional": true,
  "naOption": {
    "enabled": true,
    "label": "I didn't take this category"
  },
  "options": ["Option 1", "Option 2"],
  "placeholder": "Placeholder text (for type=text)"
}
```

## Question Properties

### Required

- **`key`** (string): Unique question identifier. Used to save in formData and localStorage
- **`question`** (string): Question text displayed to user
- **`type`** (string): Question type. Values: `"nps"`, `"likert"`, `"multiple"`, `"text"`
- **`required`** (boolean): Whether the question is mandatory
- **`order`** (number): Display order (questions are sorted automatically)

### Optional

- **`description`** (string): Additional explanatory text below the question
- **`category`** (string): Question category (reference to categories object)
- **`conditional`** (boolean): Whether the question is conditional (can be hidden)
- **`naOption`** (object): "Not Applicable" option configuration
  - `enabled` (boolean): Whether to show NA button
  - `label` (string): NA button text
- **`options`** (array): List of options (required for `type="multiple"`)
- **`placeholder`** (string): Field placeholder (for `type="text"`)

## Question Types

### NPS (Net Promoter Score)

```json
{
  "type": "nps",
  "key": "npsScore",
  "question": "From 0 to 10, how likely would you recommend us?"
}
```

Displays 0-10 buttons for scoring.

### Likert Scale

```json
{
  "type": "likert",
  "key": "satisfaction",
  "question": "How do you rate...?"
}
```

Displays 5 options: Totally dissatisfied → Totally satisfied

### Multiple Choice

```json
{
  "type": "multiple",
  "key": "likes",
  "question": "What did you like?",
  "options": ["Option 1", "Option 2", "Option 3"]
}
```

Allows selecting multiple options via checkboxes.

### Free Text

```json
{
  "type": "text",
  "key": "comments",
  "question": "Comments",
  "placeholder": "Write here..."
}
```

Textarea text field.

## Conditional Questions

### Defining a Conditional Question

```json
{
  "key": "practicalCarClasses",
  "conditional": true,
  "category": "car",
  "naOption": {
    "enabled": true,
    "label": "I didn't take car classes"
  }
}
```

### Behavior

- When `naOption.enabled = true`, displays "NA" button
- If user marks NA, the question is skipped (not required)
- The value is saved as `"not_applicable"` in formData

## Validations

### Automatic Validation

The system automatically validates:

- **NPS**: Value 0-10 must be selected if required
- **Likert**: One option must be selected (or marked as NA)
- **Multiple**: At least one option if required
- **Text**: Field cannot be empty if required

### Customizing Validations

Edit `src/config/questionsHelper.js` in the `validateQuestion()` function:

```javascript
export const validateQuestion = (question, answer, naFlags = {}) => {
  // Your custom logic here
  
  return { valid: true, error: '' }
}
```

## Available Helper Functions

### `loadQuestions()`

Loads and sorts questions from JSON.

```javascript
const { version, categories, questions } = loadQuestions()
```

### `getInitialFormData()`

Generates initial formData structure based on questions.

```javascript
const formData = reactive(getInitialFormData())
```

### `getInitialNAFlags()`

Generates NA flags for conditional questions.

```javascript
const naFlags = reactive(getInitialNAFlags())
```

### `validateQuestion(question, answer, naFlags)`

Validates an answer.

```javascript
const { valid, error } = validateQuestion(currentQuestion, formData[key], naFlags)
```

### `getQuestionTypeLabel(type)`

Returns question type label.

```javascript
const label = getQuestionTypeLabel('nps') // "0-10 Scale"
```

### `getQuestionsByCategory(category)`

Filters questions by category.

```javascript
const carQuestions = getQuestionsByCategory('car')
```

## Adding New Question

1. Open `src/config/questions.json`
2. Add new object to `questions` array:

```json
{
  "key": "newQuestion",
  "question": "Your new question?",
  "type": "likert",
  "required": true,
  "order": 14
}
```

3. Update the `submitSurvey` function in `NPSSurvey.vue` if the new question requires a special field in the payload

## LocalStorage Compatibility

The system maintains full compatibility:

- Old questions continue working
- Previously saved data is loaded correctly
- Keys must remain unchanged to maintain compatibility

## Complete Example

### Adding Satisfaction Question with Simulator

```json
{
  "key": "simulatorSatisfaction",
  "question": "How do you rate the driving simulator?",
  "description": "Rate the quality and usefulness of the simulator",
  "type": "likert",
  "required": false,
  "order": 10.5,
  "category": "simulator",
  "conditional": true,
  "naOption": {
    "enabled": true,
    "label": "I didn't use the simulator"
  }
}
```

1. Add the category if it doesn't exist:

```json
"categories": {
  "simulator": {
    "label": "Simulator",
    "description": "Driving simulator training"
  }
}
```

2. Update the submission payload (if needed) in `submitSurvey()`

3. Done! The question will automatically appear in order 10.5

## Advantages

✅ **No code**: Add/edit questions without programming
✅ **Version control**: Change history via git
✅ **Reusable**: Same structure for different surveys
✅ **Centralized validation**: One function validates all questions
✅ **Conditional**: Questions appear/disappear based on answers
✅ **Categorization**: Group related questions
✅ **Flexible ordering**: Use decimals to insert between existing questions
