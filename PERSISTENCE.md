# Survey Persistence Feature

## Description

This feature allows the survey progress to be automatically saved in the user's browser (localStorage). If the user closes the tab, reloads the page (F5), or returns to the link later, the survey will continue from where they left off.

## How It Works

### Automatic Saving
Progress is saved automatically when:
- User answers a question (changes `formData`)
- User navigates between steps (changes `currentStep`)
- User marks/unmarks "Not Applicable" options (changes `naFlags`)

### Saved Data
For each valid token, the following are saved:
- Current step (`currentStep`)
- Form responses (`formData`)
- "Not Applicable" flags (`naFlags`)
- Save timestamp

### Loading
Saved progress is loaded automatically when:
- The page is loaded/reloaded
- Token is successfully validated
- Data exists for that token in localStorage

### Data Cleanup
Data is automatically removed when:
- Survey is successfully submitted
- User clicks "Restart" (after submission error)
- Data is older than 30 days (automatic expiration)

## Technical Implementation

### Storage Key
```javascript
const storageKey = `nps_survey_${token}`
```

Each token has its own localStorage key, allowing multiple surveys without conflict.

### Data Structure
```json
{
  "currentStep": 3,
  "formData": {
    "npsScore": 9,
    "overallSatisfaction": "satisfied",
    "receptionService": "very_satisfied",
    ...
  },
  "naFlags": {
    "practicalCarClasses": false,
    "practicalMotoClasses": true,
    ...
  },
  "timestamp": 1700000000000
}
```

### Main Functions

#### `saveProgress()`
Saves current state to localStorage. Called automatically by watchers.

#### `loadProgress()`
Loads saved progress when validating token. Returns `true` if loaded successfully.

#### `clearProgress()`
Removes data from localStorage. Called after successful submission or reset.

## Security and Privacy

- Data stays only in the user's browser (localStorage)
- Each token has isolated storage
- Data expires after 30 days
- Data is cleaned after successful submission
- Only works with valid tokens

## Testing

### Test 1: Page Reload (F5)
1. Access the survey with a valid token
2. Answer some questions and advance to step 3-4
3. Press F5 or reload the page
4. ✅ Should return to same step with filled answers

### Test 2: Close and Reopen
1. Answer some questions
2. Close the tab/browser
3. Open the same link again (same token)
4. ✅ Should continue from where you left off

### Test 3: Multiple Surveys
1. Open two tabs with different tokens
2. Answer different questions in each
3. Reload both
4. ✅ Each should maintain its own progress

### Test 4: Cleanup After Submission
1. Complete entire survey
2. Submit successfully
3. Return to survey link
4. ✅ Should start from scratch (data cleaned)

### Test 5: Invalid Token
1. Use an invalid token
2. ✅ Should not load or save progress

## Limitations

- Works only on same browser/device
- Data can be lost if user clears cache/localStorage
- Limited to localStorage size (~5-10MB depending on browser)
- Does not sync between different devices

## Compatibility

Works on all modern browsers that support:
- `localStorage` API
- ES6+ (already used in the rest of the application)

Supported browsers:
- Chrome/Edge 4+
- Firefox 3.5+
- Safari 4+
- Opera 10.5+
- iOS Safari 3.2+
- Android Browser 2.1+
