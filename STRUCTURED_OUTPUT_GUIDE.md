# Structured Output Implementation Guide

## Overview

The PDF parsing API now uses structured output with Zod schema validation to ensure consistent and reliable data extraction from budget documents. This approach provides better type safety, validation, and error handling compared to the previous text-based CSV generation.

## Key Benefits

### 1. **Type Safety**
- Zod schema ensures all extracted data matches expected types
- Automatic validation of data structure
- TypeScript integration for better development experience

### 2. **Consistent Output**
- Structured data format eliminates parsing inconsistencies
- Predictable data structure regardless of PDF format
- Reduced errors from manual CSV parsing

### 3. **Better Error Handling**
- Graceful fallback to text extraction if structured output fails
- Detailed error messages for validation failures
- Robust handling of malformed PDFs

### 4. **Dual Output Format**
- Returns both structured JSON and CSV formats
- Backward compatibility with existing CSV processing
- Flexible integration options

## Implementation Details

### Schema Definition

```typescript
const BudgetItemSchema = z.object({
  category: z.string().describe("Budget category or PPA name"),
  amount: z.number().describe("Budget amount as numeric value"),
  description: z.string().optional().describe("Brief description"),
  committee_responsible: z.string().optional().describe("Committee responsible"),
  committee_oversight: z.string().optional().describe("Committee oversight"),
  abyip_ppa_activity: z.string().optional().describe("ABYIP-aligned activity")
});

const BudgetDataSchema = z.object({
  budgetItems: z.array(BudgetItemSchema).describe("Array of budget items")
});
```

### API Response Format

```typescript
{
  success: boolean,
  csvData: string,           // Traditional CSV format
  structuredData: BudgetItem[] // Structured JSON data
}
```

### Processing Flow

1. **PDF Upload**: User uploads PDF file
2. **AI Analysis**: Gemini AI analyzes PDF content
3. **Structured Extraction**: AI extracts data into structured format
4. **Validation**: Zod schema validates extracted data
5. **Fallback**: If structured extraction fails, fall back to text parsing
6. **Dual Output**: Generate both CSV and structured JSON
7. **Response**: Return validated data to client

## Error Handling

### Structured Output Failures

If the AI fails to generate proper structured output, the system:

1. Attempts to parse JSON from the response
2. Falls back to regex-based text extraction
3. Validates extracted data against schema
4. Provides detailed error messages

### Validation Errors

Zod validation ensures:
- All required fields are present
- Amounts are numeric values
- Data types match expected schema
- No malformed or missing data

## Integration Points

### Frontend Integration

The onboarding page now handles both formats:

```typescript
if (data.structuredData && Array.isArray(data.structuredData)) {
  // Use structured data directly
  const items = data.structuredData.map(item => ({
    id: crypto.randomUUID(),
    ...item
  }));
} else {
  // Fallback to CSV parsing
  parsedData = parseCSV(data.csvData);
}
```

### Testing

The test script (`test-pdf-api.js`) now validates:
- Structured data format
- CSV generation
- Total budget calculation
- Individual item details

## Configuration

### AI Model Settings

```typescript
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0,        // Deterministic output
    maxOutputTokens: 10000, // Sufficient for structured data
    topP: 0.8,            // Controlled randomness
    topK: 40              // Token selection limit
  }
});
```

### Schema Validation

The schema includes descriptive text for each field to guide the AI:

```typescript
category: z.string().describe("Budget category or PPA name (e.g., 'PPA 1.1 - Infrastructure Development')")
```

## Best Practices

### 1. **Prompt Engineering**
- Clear, specific instructions for data extraction
- Examples of expected output format
- Error handling guidelines

### 2. **Validation**
- Always validate extracted data
- Provide meaningful error messages
- Implement graceful fallbacks

### 3. **Testing**
- Test with various PDF formats
- Validate edge cases and error conditions
- Monitor extraction accuracy

### 4. **Monitoring**
- Log extraction success rates
- Track validation errors
- Monitor processing performance

## Future Enhancements

### Planned Improvements

1. **Enhanced Schema**: Add more specific validation rules
2. **Multiple Formats**: Support additional output formats
3. **Batch Processing**: Handle multiple PDFs simultaneously
4. **Caching**: Cache extraction results for repeated documents
5. **Learning**: Improve extraction based on user feedback

### Technical Improvements

1. **Streaming**: Real-time extraction progress updates
2. **Compression**: Optimize response payload size
3. **Rate Limiting**: Implement API usage limits
4. **Analytics**: Track extraction patterns and success rates

## Troubleshooting

### Common Issues

1. **Schema Validation Failures**
   - Check PDF format and content
   - Verify AI model configuration
   - Review extraction prompts

2. **Fallback Processing**
   - Monitor fallback usage rates
   - Improve structured output prompts
   - Enhance regex patterns

3. **Performance Issues**
   - Optimize model parameters
   - Implement caching strategies
   - Monitor API response times

### Debugging

Enable detailed logging to troubleshoot issues:

```typescript
console.log('Raw AI response:', response.text());
console.log('Parsed structured data:', structuredData);
console.log('Validation result:', validatedData);
```

## Conclusion

The structured output implementation provides a robust, reliable, and maintainable solution for PDF budget extraction. The combination of AI-powered extraction, schema validation, and graceful fallbacks ensures high-quality data extraction while maintaining backward compatibility. 