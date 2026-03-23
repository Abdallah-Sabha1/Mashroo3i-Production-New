using System.Text;
using System.Text.Json;
using backend.DTOs.Idea;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.Extensions.Logging;

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

        /// <summary>
        /// Generate personalized insights for a business idea using Gemini AI
        /// </summary>
        public async Task<IdeaInsightsDto> GenerateIdeaInsightsAsync(string title, string description)
        {
            try
            {
                _logger.LogInformation("Generating insights for idea: {Title}", title);

                var prompt = BuildInsightGenerationPrompt(title, description);
                var response = await CallGeminiApiAsync(prompt);

                if (string.IsNullOrEmpty(response))
                {
                    _logger.LogWarning("Empty response from Gemini API for insights");
                    return GetDefaultInsights(title, description);
                }

                var insights = ParseInsightsResponse(response);
                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating insights from Gemini API");
                return GetDefaultInsights(title, description);
            }
        }

        /// <summary>
        /// Evaluate a business idea comprehensively using Gemini AI
        /// </summary>
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

                var evaluation = ParseEvaluationResponse(response, idea);
                return evaluation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating business idea with Gemini API");
                return GetDefaultEvaluation(idea);
            }
        }

        /// <summary>
        /// Call the Gemini API with a prompt and return the response text
        /// </summary>
        private async Task<string> CallGeminiApiAsync(string prompt)
        {
            try
            {
                var geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
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
                    _logger.LogError("Gemini API error: Status={StatusCode}, Response={Response}",
                        response.StatusCode, errorContent);
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

        /// <summary>
        /// Build a prompt for generating initial insights from a business idea
        /// </summary>
        private string BuildInsightGenerationPrompt(string title, string description)
        {
            return $@"You are a business consultant analyzing a new business idea from a Jordanian entrepreneur.

BUSINESS IDEA:
Title: {title}
Description: {description}

Analyze this idea and provide insights in JSON format. Return ONLY a valid JSON object with NO markdown formatting, NO backticks, NO explanation text - just the JSON.

{{
  ""problemStatement"": ""What specific problem does this business solve? Be concise but specific (2-3 sentences)"",
  ""uniqueSellingPoint"": ""What makes this business unique and different from competitors? (2-3 sentences)"",
  ""targetAudience"": ""Who are the primary customers/users? Describe their demographics, behaviors, and specific needs.""
}}

Make the insights:
- Specific to Jordan's market conditions when relevant
- Practical and actionable
- Based on the idea description provided
- Professional and helpful

Return ONLY the JSON object, nothing else.";
        }

        /// <summary>
        /// Build a prompt for comprehensive business evaluation
        /// </summary>
        private string BuildEvaluationPrompt(BusinessIdea idea)
        {
            return $@"You are an expert business evaluator assessing a startup idea from a Jordanian entrepreneur.

BUSINESS IDEA DETAILS:
- Title: {idea.Title}
- Description: {idea.Description}
- Problem Being Solved: {idea.ProblemStatement}
- Unique Selling Point: {idea.Usp}
- Target Audience: {idea.TargetAudience}
- Industry Sector: {idea.Sector}
- Estimated Budget: JOD {idea.EstimatedBudget}
- Target Market Size: {idea.MarketSize}
- Competition Level: {idea.CompetitionLevel}
- Location: {idea.Location}

Provide a comprehensive evaluation in JSON format. Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation text.

{{
  ""noveltyScore"": <integer 1-100, how novel/innovative is the idea>,
  ""marketPotentialScore"": <integer 1-100, market size and growth potential>,
  ""overallScore"": <integer 1-100, overall viability>,
  ""riskLevel"": ""Low Risk"" OR ""Medium Risk"" OR ""High Risk"",
  ""recommendations"": ""Provide 3-4 specific, actionable recommendations separated by newlines. Make them specific to this idea, not generic."",
  ""swotAnalysis"": {{
    ""strengths"": [""Specific strength 1 about THIS idea"", ""Specific strength 2"", ""Specific strength 3""],
    ""weaknesses"": [""Specific weakness 1 about THIS idea"", ""Specific weakness 2""],
    ""opportunities"": [""Market opportunity 1 relevant to Jordan"", ""Market opportunity 2""],
    ""threats"": [""Potential threat 1"", ""Potential threat 2""]
  }}
}}

Evaluation guidelines:
- Novelty: How original/innovative is this idea? (Consider market saturation)
- Market Potential: Is there a big enough market? Can it scale?
- Risk: What could go wrong? How hard is execution?
- SWOT: Make it SPECIFIC to their idea, not generic
- Recommendations: Give them actual next steps they can take
- Consider: Jordan's market, economic conditions, local competition
- Be realistic but encouraging

Return ONLY the JSON object, nothing else.";
        }

        /// <summary>
        /// Parse the Gemini response for idea insights
        /// </summary>
        private IdeaInsightsDto ParseInsightsResponse(string response)
        {
            try
            {
                // Clean the response (remove markdown if present)
                var cleanJson = response
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Trim();

                using var doc = JsonDocument.Parse(cleanJson);
                var root = doc.RootElement;

                return new IdeaInsightsDto
                {
                    ProblemStatement = ExtractJsonProperty(root, "problemStatement"),
                    UniqueSellingPoint = ExtractJsonProperty(root, "uniqueSellingPoint"),
                    TargetAudience = ExtractJsonProperty(root, "targetAudience")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing insights response from Gemini");
                return GetDefaultInsights("", "");
            }
        }

        /// <summary>
        /// Parse the Gemini response for business evaluation
        /// </summary>
        private Evaluation ParseEvaluationResponse(string response, BusinessIdea idea)
        {
            try
            {
                // Clean the response (remove markdown if present)
                var cleanJson = response
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Trim();

                using var doc = JsonDocument.Parse(cleanJson);
                var root = doc.RootElement;

                var noveltyScore = ExtractJsonInt(root, "noveltyScore", 50);
                var marketScore = ExtractJsonInt(root, "marketPotentialScore", 50);
                var overallScore = ExtractJsonInt(root, "overallScore", (noveltyScore + marketScore) / 2);
                var riskLevel = ExtractJsonProperty(root, "riskLevel") ?? "Medium Risk";
                var recommendations = ExtractJsonProperty(root, "recommendations") ?? "";

                var swotJson = root.TryGetProperty("swotAnalysis", out var swot)
                    ? swot.GetRawText()
                    : "{}";

                return new Evaluation
                {
                    IdeaId = idea.IdeaId,
                    NoveltyScore = Math.Clamp(noveltyScore, 1, 100),
                    MarketPotentialScore = Math.Clamp(marketScore, 1, 100),
                    OverallScore = Math.Clamp(overallScore, 1, 100),
                    RiskLevel = riskLevel,
                    Recommendations = recommendations,
                    SwotAnalysis = swotJson,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing evaluation response from Gemini");
                return GetDefaultEvaluation(idea);
            }
        }

        /// <summary>
        /// Helper: Extract string property from JSON
        /// </summary>
        private string ExtractJsonProperty(JsonElement root, string propertyName)
        {
            if (root.TryGetProperty(propertyName, out var property))
            {
                return property.GetString() ?? "";
            }
            return "";
        }

        /// <summary>
        /// Helper: Extract integer property from JSON
        /// </summary>
        private int ExtractJsonInt(JsonElement root, string propertyName, int defaultValue)
        {
            if (root.TryGetProperty(propertyName, out var property) && property.TryGetInt32(out var value))
            {
                return value;
            }
            return defaultValue;
        }

        /// <summary>
        /// Fallback insights if API fails
        /// </summary>
        private IdeaInsightsDto GetDefaultInsights(string title, string description)
        {
            return new IdeaInsightsDto
            {
                ProblemStatement = "This business solves a real market need by addressing inefficiencies in the current market. Further refinement through customer interviews will help define the exact problem statement.",
                UniqueSellingPoint = "The unique value proposition includes differentiation through customer service, innovative approach to the market, and competitive positioning. Consider what specifically sets this idea apart from existing solutions.",
                TargetAudience = "The primary target audience includes individuals or organizations seeking solutions in this market segment. Define more specifically: demographics, purchasing power, pain points, and decision-making process."
            };
        }

        /// <summary>
        /// Fallback evaluation if API fails
        /// </summary>
        private Evaluation GetDefaultEvaluation(BusinessIdea idea)
        {
            var baseScore = CalculateBaseScore(idea);

            return new Evaluation
            {
                IdeaId = idea.IdeaId,
                NoveltyScore = Math.Min(baseScore + 10, 100),
                MarketPotentialScore = Math.Max(baseScore - 5, 20),
                OverallScore = baseScore,
                RiskLevel = DetermineRiskLevel(baseScore),
                Recommendations = "1. Validate the problem with potential customers through interviews\n2. Develop a minimum viable product (MVP) to test core assumptions\n3. Create a detailed go-to-market strategy\n4. Research your competitive landscape thoroughly",
                SwotAnalysis = JsonSerializer.Serialize(new
                {
                    strengths = new[] { "Clear market opportunity", "Defined target audience", "Viable business model" },
                    weaknesses = new[] { "Competitive market", "Execution risk", "Resource constraints" },
                    opportunities = new[] { "Market growth potential", "Technology integration", "Partnership opportunities" },
                    threats = new[] { "Market saturation", "Economic uncertainty", "Competitive response" }
                }),
                GeneratedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Calculate base score from idea details
        /// </summary>
        private int CalculateBaseScore(BusinessIdea idea)
        {
            int score = 60;

            // Well-detailed description
            if (!string.IsNullOrEmpty(idea.Description) && idea.Description.Length > 200)
                score += 5;

            // Reasonable budget
            if (idea.EstimatedBudget > 0 && idea.EstimatedBudget <= 100000)
                score += 5;

            // Clear USP
            if (!string.IsNullOrEmpty(idea.Usp) && idea.Usp.Length > 50)
                score += 5;

            return Math.Min(score, 100);
        }

        /// <summary>
        /// Determine risk level based on overall score
        /// </summary>
        private string DetermineRiskLevel(int score)
        {
            if (score >= 75) return "Low Risk";
            if (score >= 50) return "Medium Risk";
            return "High Risk";
        }
    }
}
