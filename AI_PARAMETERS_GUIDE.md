# AI Parameters Configuration Guide

This guide explains how to adjust the temperature, max tokens, and other AI parameters for optimal PDF parsing results.

## 📍 Where to Configure Parameters

The AI parameters are configured in: `src/app/api/parse-pdf/route.ts` (lines 75-85)

```typescript
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 2048,
    topP: 0.8,
    topK: 40
  }
});
```

## 🎛️ Available Parameters

Based on [Google Cloud Vertex AI documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/adjust-parameter-values), here are the key parameters you can adjust:

### 1. **Temperature** (0.0 - 2.0)
**Current Setting**: `0.1`

**What it does**: Controls randomness in token selection. Lower values make responses more deterministic and consistent.

**Recommended Values for PDF Parsing**:
- `0.0 - 0.2`: **Best for structured data extraction** (current setting)
  - Most deterministic output
  - Consistent CSV formatting
  - Reliable amount extraction
- `0.3 - 0.7`: **Balanced approach**
  - Good for varied document formats
  - Some flexibility in interpretation
- `0.8 - 1.2`: **Creative interpretation**
  - Better for unclear or poorly formatted documents
  - May introduce more variation

**Example Adjustments**:
```typescript
// For very consistent results
temperature: 0.0

// For balanced approach
temperature: 0.3

// For creative interpretation of unclear documents
temperature: 0.8
```

### 2. **Max Output Tokens** (1 - 8192)
**Current Setting**: `2048`

**What it does**: Maximum number of tokens in the response. 100 tokens ≈ 60-80 words.

**Recommended Values for PDF Parsing**:
- `1024`: **Short budget documents** (5-10 items)
- `2048`: **Medium budget documents** (10-20 items) - **Current**
- `4096`: **Large budget documents** (20+ items)
- `8192`: **Very large documents** (maximum)

**Example Adjustments**:
```typescript
// For small budgets
maxOutputTokens: 1024

// For large budgets
maxOutputTokens: 4096

// For maximum flexibility
maxOutputTokens: 8192
```

### 3. **Top-P** (0.0 - 1.0)
**Current Setting**: `0.8`

**What it does**: Controls diversity by selecting from the most probable tokens until their cumulative probability reaches the top-P value.

**Recommended Values for PDF Parsing**:
- `0.5 - 0.7`: **Very focused** (fewer token options)
- `0.8 - 0.9`: **Balanced** (current setting)
- `0.95 - 1.0`: **More diverse** (more token options)

### 4. **Top-K** (1 - 40)
**Current Setting**: `40`

**What it does**: Limits token selection to the top K most probable tokens.

**Recommended Values for PDF Parsing**:
- `10 - 20`: **Very focused** selection
- `30 - 40`: **Balanced** selection (current setting)
- `40`: **Maximum diversity** (current setting)

## 🎯 Parameter Optimization Strategies

### Strategy 1: **High Accuracy for Well-Formatted Documents**
```typescript
generationConfig: {
  temperature: 0.0,        // Most deterministic
  maxOutputTokens: 2048,   // Sufficient for most budgets
  topP: 0.6,              // Focused selection
  topK: 20                 // Limited token options
}
```

### Strategy 2: **Balanced Approach for Mixed Quality Documents**
```typescript
generationConfig: {
  temperature: 0.2,        // Slight flexibility
  maxOutputTokens: 4096,   // Handle larger documents
  topP: 0.8,              // Balanced selection
  topK: 40                 // Full token range
}
```

### Strategy 3: **Creative Interpretation for Poorly Formatted Documents**
```typescript
generationConfig: {
  temperature: 0.5,        // More creative interpretation
  maxOutputTokens: 4096,   // Handle complex documents
  topP: 0.9,              // Diverse selection
  topK: 40                 // Full token range
}
```

### Strategy 4: **Maximum Flexibility for Unknown Document Types**
```typescript
generationConfig: {
  temperature: 0.3,        // Moderate flexibility
  maxOutputTokens: 8192,   // Maximum output length
  topP: 0.95,             // Very diverse selection
  topK: 40                 // Full token range
}
```

## 🔧 Environment-Based Configuration

You can make these parameters configurable through environment variables:

```typescript
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.1'),
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
    topP: parseFloat(process.env.GEMINI_TOP_P || '0.8'),
    topK: parseInt(process.env.GEMINI_TOP_K || '40')
  }
});
```

Then in your `.env.local`:
```bash
GEMINI_TEMPERATURE=0.1
GEMINI_MAX_TOKENS=2048
GEMINI_TOP_P=0.8
GEMINI_TOP_K=40
```

## 🧪 Testing Different Configurations

### Test Case 1: Well-Formatted Budget Document
```typescript
// Use low temperature for consistency
generationConfig: {
  temperature: 0.0,
  maxOutputTokens: 1024,
  topP: 0.6,
  topK: 20
}
```

### Test Case 2: Poorly Formatted Budget Document
```typescript
// Use higher temperature for interpretation
generationConfig: {
  temperature: 0.5,
  maxOutputTokens: 4096,
  topP: 0.9,
  topK: 40
}
```

### Test Case 3: Large Budget Document
```typescript
// Use higher token limit
generationConfig: {
  temperature: 0.1,
  maxOutputTokens: 8192,
  topP: 0.8,
  topK: 40
}
```

## 📊 Performance Monitoring

Track these metrics when adjusting parameters:

### 1. **Accuracy Metrics**
- Percentage of correctly extracted amounts
- Percentage of correctly identified PPA categories
- Percentage of correctly mapped committees

### 2. **Completeness Metrics**
- Percentage of budget items found
- Percentage of documents fully parsed
- Missing data rate

### 3. **Performance Metrics**
- Processing time per document
- Token usage per request
- Error rate

### 4. **Quality Metrics**
- CSV format compliance
- Data consistency
- User satisfaction

## 🔍 Troubleshooting Parameter Issues

### Issue 1: **Inconsistent Results**
**Symptoms**: Same document produces different outputs
**Solution**: Lower temperature (0.0 - 0.2)

### Issue 2: **Truncated Output**
**Symptoms**: CSV data is cut off
**Solution**: Increase maxOutputTokens (4096 - 8192)

### Issue 3: **Generic Responses**
**Symptoms**: AI gives fallback responses
**Solution**: Increase temperature (0.3 - 0.7)

### Issue 4: **Too Much Variation**
**Symptoms**: Inconsistent formatting
**Solution**: Lower temperature (0.0 - 0.2) and topP (0.5 - 0.7)

## 🚀 Recommended Starting Configuration

For most PDF parsing use cases, start with:

```typescript
generationConfig: {
  temperature: 0.1,        // Low for consistency
  maxOutputTokens: 2048,   // Sufficient for most budgets
  topP: 0.8,              // Balanced selection
  topK: 40                 // Full token range
}
```

Then adjust based on your specific needs:

1. **If results are inconsistent**: Lower temperature to 0.0
2. **If output is truncated**: Increase maxOutputTokens to 4096
3. **If AI struggles with unclear documents**: Increase temperature to 0.3
4. **If processing is slow**: Lower maxOutputTokens to 1024

## 📈 Cost Optimization

Remember that higher token limits and more complex parameters can increase costs:

- **Lower maxOutputTokens**: Reduces cost per request
- **Lower temperature**: May reduce processing time
- **Balanced topP/topK**: Optimal cost-performance ratio

## 🔄 Iterative Optimization Process

1. **Start with recommended settings**
2. **Test with your actual documents**
3. **Monitor accuracy and performance**
4. **Adjust one parameter at a time**
5. **Document the impact of each change**
6. **Repeat until optimal results**

Remember: The best parameters depend on your specific use case, document quality, and requirements. Start with the recommended settings and iterate based on your results. 