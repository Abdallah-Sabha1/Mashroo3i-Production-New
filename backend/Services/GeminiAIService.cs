using System.Text;
using System.Text.Json;
using backend.DTOs.Idea;
using backend.Models;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class GeminiAIService : IGeminiAIService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<GeminiAIService> _logger;
        private readonly string _geminiApiKey;

        public GeminiAIService(HttpClient httpClient, IConfiguration config, ILogger<GeminiAIService> logger)
        {
            _httpClient = httpClient;
            _config = config;
            _logger = logger;
            _geminiApiKey = config["GeminiAI:ApiKey"] ?? throw new InvalidOperationException("Gemini API Key not configured");
        }

        public async Task<IdeaInsightsDto> GenerateIdeaInsightsAsync(string title, string description, string sector)
        {
            try
            {
                _logger.LogInformation("Generating insights for idea: {Title}", title);
                var prompt = BuildInsightGenerationPrompt(title, description, sector);
                var response = await CallGeminiApiAsync(prompt);

                if (string.IsNullOrEmpty(response))
                {
                    _logger.LogWarning("Empty response from Gemini API for insights");
                    return GetDefaultInsights();
                }

                return ParseInsightsResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating insights from Gemini API");
                return GetDefaultInsights();
            }
        }

        public async Task<Evaluation> EvaluateBusinessIdeaAsync(BusinessIdea idea)
        {
            try
            {
                _logger.LogInformation("Evaluating business idea: {Title} (ID: {IdeaId})", idea.Title, idea.IdeaId);
                var prompt = BuildEvaluationPrompt(idea);
                var response = await CallGeminiApiAsync(prompt);

                if (string.IsNullOrEmpty(response))
                {
                    _logger.LogWarning("Empty response from Gemini API for evaluation");
                    return GetDefaultEvaluation(idea);
                }

                return ParseEvaluationResponse(response, idea);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating business idea with Gemini API");
                return GetDefaultEvaluation(idea);
            }
        }

        private async Task<string> CallGeminiApiAsync(string prompt)
        {
            try
            {
                var geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    },
                    generationConfig = new
                    {
                        temperature = 0.7,
                        topK = 40,
                        topP = 0.95,
                        maxOutputTokens = 2048
                    }
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json"
                );

                var requestUrl = $"{geminiUrl}?key={_geminiApiKey}";
                var response = await _httpClient.PostAsync(requestUrl, jsonContent);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Gemini API error: Status={StatusCode}, Response={Response}", response.StatusCode, errorContent);
                    return string.Empty;
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var jsonResponse = JsonDocument.Parse(responseContent);

                var text = jsonResponse
                    .RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return text ?? string.Empty;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request error calling Gemini API");
                return string.Empty;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "JSON parsing error in Gemini response");
                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error calling Gemini API");
                return string.Empty;
            }
        }

        private string BuildInsightGenerationPrompt(string title, string description, string sector)
        {
            var sectorLabel = sector switch
            {
                "food_and_beverage"      => "Food & Beverage",
                "retail_ecommerce"       => "Retail & E-commerce",
                "tech_and_software"      => "Tech & Software",
                "education_and_training" => "Education & Training",
                "health_and_wellness"    => "Health & Wellness",
                "professional_services"  => "Professional Services",
                _                        => "General Business"
            };

            return $@"You are a senior business consultant who specializes in the Amman, Jordan startup market.

BUSINESS IDEA SUBMITTED:
Title: {title}
Description: {description}
Sector: {sectorLabel}
Market: Amman, Jordan

YOUR TASK:
Analyze this business idea for an entrepreneur in Amman who has NOT started yet.
They want to know if their idea is viable and how to think about it.

IMPORTANT RULES:
1. All analysis must be specific to Amman's market — not generic global advice
2. Be honest — if the idea has weaknesses, mention them clearly but constructively
3. Use simple language — the user may not have a business education
4. For businessType classification: B2C = sells to individual people, B2B = sells to other businesses
5. For suggestedMonthlySalesRange: be realistic for Amman — most new businesses start very small

Return ONLY a valid JSON object. No markdown, no explanation, just JSON:
{{
  ""problemStatement"": ""What specific problem does this solve for people or businesses in Amman? (2-3 sentences, specific to Jordan context)"",
  ""uniqueSellingPoint"": ""What would make this business stand out from existing alternatives in Amman? (2-3 sentences)"",
  ""targetAudience"": ""Who exactly would buy this in Amman? Describe their age, lifestyle, location in Amman, and specific need."",
  ""suggestedBusinessType"": ""B2C"" or ""B2B"",
  ""businessTypeConfidence"": ""HIGH"" or ""MEDIUM"" or ""LOW"",
  ""businessTypeReason"": ""One sentence explaining clearly why this is B2C or B2B in plain language"",
  ""suggestedMonthlySalesRange"": ""<pick EXACTLY ONE value with no extra text. If B2C: choose from 1_10, 10_50, 50_200, 200_plus. If B2B: choose from 1_3, 4_10, 11_30, 30_plus. Base your choice on how many customers/clients a brand-new business in this sector in Amman could realistically reach in month 1.>""
}}";
        }

        private string BuildEvaluationPrompt(BusinessIdea idea)
        {
            var scoringCriteria = idea.BusinessType == "B2B"
                ? @"SCORING WEIGHTS FOR B2B IDEAS:
- Problem severity (is it a must-have for businesses?): 25 points
- Buyer clarity (is the decision maker clear?): 20 points
- Measurable ROI for the buying company: 20 points
- Competitive moat or switching cost: 20 points
- Sales cycle feasibility for a new founder: 10 points
- Scalability in Amman market: 5 points"
                : @"SCORING WEIGHTS FOR B2C IDEAS:
- Market size in Amman (is there enough demand?): 25 points
- Consumer pain clarity (is the problem real and urgent?): 20 points
- Acquisition ease (can they get customers at low cost?): 20 points
- Competitive differentiation in Amman: 15 points
- Repeat purchase potential: 15 points
- Novelty and timing: 5 points";

            var sectorContext = idea.Sector switch
            {
                "food_and_beverage"      => "Amman has a strong café and food culture. Competition is high in West Amman. Cloud kitchens and delivery-first models are growing. Margins: 25-50%.",
                "retail_ecommerce"       => "E-commerce in Jordan growing at 9.4% CAGR. Instagram is the dominant sales channel. Delivery costs 2-5 JOD per order. Margins: 30-55%.",
                "tech_and_software"      => "Jordan raised $300M in startup funding in 2024. Tech talent available. B2B software pricing is lower than GCC. Margins: 55-80%.",
                "education_and_training" => "Strong demand for STEM, English, Tawjihi prep in Amman. Word of mouth dominates acquisition. University areas have strong demand. Margins: 50-80%.",
                "health_and_wellness"    => "Post-COVID wellness awareness increased in Jordan. Gender-segregated facilities often required. Growing middle class investing in fitness. Margins: 40-70%.",
                "professional_services"  => "Fastest sector to break even in Amman. Relationship-driven sales. Payment terms 30-60 days common in B2B. Margins: 50-75%.",
                _                        => "General Amman market context applies. Validate idea with local market research."
            };

            return $@"You are an expert startup evaluator with deep knowledge of the Amman, Jordan market.

BUSINESS IDEA:
Title: {idea.Title}
Description: {idea.Description}
Business Type: {idea.BusinessType}
Sector: {idea.Sector}
Problem Being Solved: {idea.ProblemStatement}
Unique Selling Point: {idea.Usp}
Target Audience: {idea.TargetAudience}
Estimated Starting Budget: JOD {idea.EstimatedBudget}

AMMAN MARKET CONTEXT FOR THIS SECTOR:
{sectorContext}

{scoringCriteria}

EVALUATION RULES:
1. Score based on Amman market reality — not global or theoretical
2. SWOT must be specific to THIS idea in Amman — never write generic SWOT points
3. Verdict must be one honest sentence — do not sugarcoat
4. If budget seems insufficient for the sector, say so clearly
5. Recommendations must be actionable next steps, not generic advice
6. RedFlags: list any serious problems found. Empty array if none.

Return ONLY valid JSON, no markdown:
{{
  ""noveltyScore"": <integer 1-100>,
  ""marketPotentialScore"": <integer 1-100>,
  ""overallScore"": <integer 1-100>,
  ""riskLevel"": ""Low Risk"" or ""Medium Risk"" or ""High Risk"",
  ""verdict"": ""One honest sentence: is this idea Promising / Needs Refinement / High Risk — and the single most important reason why"",
  ""redFlags"": [""Specific warning 1 if any"", ""Specific warning 2 if any""],
  ""recommendations"": ""3-4 specific next steps for THIS idea in Amman. Not generic advice."",
  ""swotAnalysis"": {{
    ""strengths"": [""Specific to this idea"", ""Specific to Amman market""],
    ""weaknesses"": [""Specific to this idea"", ""Honest weakness""],
    ""opportunities"": [""Specific Amman market opportunity"", ""Specific growth path""],
    ""threats"": [""Specific threat in Amman"", ""Specific competitive threat""]
  }}
}}";
        }

        private IdeaInsightsDto ParseInsightsResponse(string response)
        {
            try
            {
                var cleanJson = response
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Trim();

                using var doc = JsonDocument.Parse(cleanJson);
                var root = doc.RootElement;

                var rawRange = ExtractString(root, "suggestedMonthlySalesRange", "1_10");
                var validRanges = new HashSet<string>
                {
                    "1_10","10_50","50_200","200_plus",
                    "1_3","4_10","11_30","30_plus"
                };
                var safeRange = validRanges.Contains(rawRange) ? rawRange : "1_10";

                return new IdeaInsightsDto
                {
                    ProblemStatement       = ExtractString(root, "problemStatement"),
                    UniqueSellingPoint     = ExtractString(root, "uniqueSellingPoint"),
                    TargetAudience         = ExtractString(root, "targetAudience"),
                    SuggestedBusinessType  = ExtractString(root, "suggestedBusinessType", "B2C"),
                    BusinessTypeConfidence = ExtractString(root, "businessTypeConfidence", "LOW"),
                    BusinessTypeReason     = ExtractString(root, "businessTypeReason"),
                    SuggestedMonthlySalesRange = safeRange
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing insights response from Gemini");
                return GetDefaultInsights();
            }
        }

        private Evaluation ParseEvaluationResponse(string response, BusinessIdea idea)
        {
            try
            {
                var cleanJson = response
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Trim();

                using var doc = JsonDocument.Parse(cleanJson);
                var root = doc.RootElement;

                var noveltyScore  = ExtractInt(root, "noveltyScore", 50);
                var marketScore   = ExtractInt(root, "marketPotentialScore", 50);
                var overallScore  = ExtractInt(root, "overallScore", (noveltyScore + marketScore) / 2);
                var riskLevel     = ExtractString(root, "riskLevel", "Medium Risk");
                var recommendations = ExtractString(root, "recommendations");
                var verdict       = ExtractString(root, "verdict");

                var swotJson = root.TryGetProperty("swotAnalysis", out var swot)
                    ? swot.GetRawText()
                    : "{}";

                var redFlagsJson = "[]";
                if (root.TryGetProperty("redFlags", out var redFlagsEl) && redFlagsEl.ValueKind == JsonValueKind.Array)
                    redFlagsJson = redFlagsEl.GetRawText();

                return new Evaluation
                {
                    IdeaId               = idea.IdeaId,
                    NoveltyScore         = Math.Clamp(noveltyScore, 1, 100),
                    MarketPotentialScore = Math.Clamp(marketScore, 1, 100),
                    OverallScore         = Math.Clamp(overallScore, 1, 100),
                    RiskLevel            = riskLevel,
                    Recommendations      = recommendations,
                    Verdict              = verdict,
                    RedFlags             = redFlagsJson,
                    SwotAnalysis         = swotJson,
                    GeneratedAt          = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing evaluation response from Gemini");
                return GetDefaultEvaluation(idea);
            }
        }

        private static string ExtractString(JsonElement root, string key, string defaultValue = "")
        {
            return root.TryGetProperty(key, out var prop) ? (prop.GetString() ?? defaultValue) : defaultValue;
        }

        private static int ExtractInt(JsonElement root, string key, int defaultValue)
        {
            return root.TryGetProperty(key, out var prop) && prop.TryGetInt32(out var val) ? val : defaultValue;
        }

        private static IdeaInsightsDto GetDefaultInsights() => new()
        {
            ProblemStatement           = "Unable to analyze — please retry.",
            UniqueSellingPoint         = "Unable to analyze — please retry.",
            TargetAudience             = "Unable to analyze — please retry.",
            SuggestedBusinessType      = "B2C",
            BusinessTypeConfidence     = "LOW",
            BusinessTypeReason         = "Could not analyze idea — default suggestion only.",
            SuggestedMonthlySalesRange = "1_10"
        };

        private static Evaluation GetDefaultEvaluation(BusinessIdea idea) => new()
        {
            IdeaId               = idea.IdeaId,
            NoveltyScore         = 0,
            MarketPotentialScore = 0,
            OverallScore         = 0,
            RiskLevel            = "Unavailable",
            Verdict              = "Our AI evaluation service is temporarily unavailable. Please try again in a few minutes.",
            RedFlags             = "[]",
            Recommendations      = "Our AI evaluation service is temporarily unavailable. Please try again in a few minutes.",
            SwotAnalysis         = JsonSerializer.Serialize(new {
                strengths     = new[] { "Evaluation unavailable — please retry" },
                weaknesses    = Array.Empty<string>(),
                opportunities = Array.Empty<string>(),
                threats       = Array.Empty<string>()
            }),
            GeneratedAt = DateTime.UtcNow
        };
    }
}
