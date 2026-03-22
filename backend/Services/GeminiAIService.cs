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
        private readonly string? _geminiApiKey;
        private readonly string _geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        public GeminiAIService(HttpClient httpClient, IConfiguration config, ILogger<GeminiAIService> logger)
        {
            _httpClient = httpClient;
            _config = config;
            _logger = logger;
            _geminiApiKey = config["GeminiAI:ApiKey"];
        }

        private bool IsApiEnabled => !string.IsNullOrEmpty(_geminiApiKey) && _geminiApiKey != "YOUR_GEMINI_API_KEY";

        public async Task<IdeaInsightsDto> GenerateIdeaInsightsAsync(string title, string description)
        {
            if (!IsApiEnabled)
            {
                _logger.LogInformation("Gemini API not configured, using defaults");
                return GetDefaultInsights(title, description);
            }

            try
            {
                var prompt = $@"You are a business analyst analyzing a Jordanian startup idea. Provide insights in JSON format ONLY.

Business Title: {title}
Description: {description}

Respond with ONLY a JSON object (no markdown, no backticks) with exactly these fields:
{{
  ""problemStatement"": ""The specific problem this business solves (2-3 sentences)"",
  ""uniqueSellingPoint"": ""What makes this business unique (2-3 sentences)"",
  ""targetAudience"": ""Primary customers/users (demographics, behaviors, needs)""
}}";

                var response = await CallGeminiApiAsync(prompt);
                if (string.IsNullOrEmpty(response)) return GetDefaultInsights(title, description);
                return ParseInsightsResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating insights");
                return GetDefaultInsights(title, description);
            }
        }

        public async Task<Evaluation> EvaluateBusinessIdeaAsync(BusinessIdea idea)
        {
            if (!IsApiEnabled)
            {
                _logger.LogInformation("Gemini API not configured, using template evaluation");
                return GetDefaultEvaluation(idea);
            }

            try
            {
                var prompt = $@"Evaluate this Jordanian startup idea. Return JSON ONLY (no markdown):

Title: {idea.Title}
Description: {idea.Description}
Problem: {idea.ProblemStatement}
USP: {idea.Usp}
Target: {idea.TargetAudience}
Sector: {idea.Sector}
Budget: {idea.EstimatedBudget} JOD
Competition: {idea.CompetitionLevel}
Location: {idea.Location}

Return ONLY:
{{
  ""noveltyScore"": <1-100>,
  ""marketPotentialScore"": <1-100>,
  ""overallScore"": <1-100>,
  ""riskLevel"": ""Low Risk"" | ""Medium Risk"" | ""High Risk"",
  ""recommendations"": ""3-4 actionable recommendations"",
  ""swotAnalysis"": {{
    ""strengths"": [""s1"", ""s2"", ""s3"", ""s4""],
    ""weaknesses"": [""w1"", ""w2"", ""w3""],
    ""opportunities"": [""o1"", ""o2"", ""o3""],
    ""threats"": [""t1"", ""t2"", ""t3""]
  }}
}}";

                var response = await CallGeminiApiAsync(prompt);
                if (string.IsNullOrEmpty(response)) return GetDefaultEvaluation(idea);
                return ParseEvaluationResponse(response, idea);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating idea");
                return GetDefaultEvaluation(idea);
            }
        }

        private async Task<string> CallGeminiApiAsync(string prompt)
        {
            try
            {
                var requestBody = new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } },
                    generationConfig = new { temperature = 0.7, maxOutputTokens = 2048 }
                };

                var json = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var url = $"{_geminiApiUrl}?key={_geminiApiKey}";
                var response = await _httpClient.PostAsync(url, json);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Gemini API error: {Status}", response.StatusCode);
                    return string.Empty;
                }

                var content = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(content);
                return doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API");
                return string.Empty;
            }
        }

        private IdeaInsightsDto ParseInsightsResponse(string response)
        {
            try
            {
                var clean = response.Replace("```json", "").Replace("```", "").Trim();
                using var doc = JsonDocument.Parse(clean);
                var root = doc.RootElement;
                return new IdeaInsightsDto
                {
                    ProblemStatement = root.TryGetProperty("problemStatement", out var ps) ? ps.GetString() ?? "" : "",
                    UniqueSellingPoint = root.TryGetProperty("uniqueSellingPoint", out var usp) ? usp.GetString() ?? "" : "",
                    TargetAudience = root.TryGetProperty("targetAudience", out var ta) ? ta.GetString() ?? "" : ""
                };
            }
            catch { return GetDefaultInsights("", ""); }
        }

        private Evaluation ParseEvaluationResponse(string response, BusinessIdea idea)
        {
            try
            {
                var clean = response.Replace("```json", "").Replace("```", "").Trim();
                using var doc = JsonDocument.Parse(clean);
                var root = doc.RootElement;

                return new Evaluation
                {
                    IdeaId = idea.IdeaId,
                    NoveltyScore = Math.Clamp(root.TryGetProperty("noveltyScore", out var ns) ? ns.GetInt32() : 60, 1, 100),
                    MarketPotentialScore = Math.Clamp(root.TryGetProperty("marketPotentialScore", out var ms) ? ms.GetInt32() : 60, 1, 100),
                    OverallScore = Math.Clamp(root.TryGetProperty("overallScore", out var os) ? os.GetInt32() : 60, 1, 100),
                    RiskLevel = root.TryGetProperty("riskLevel", out var rl) ? rl.GetString() ?? "Medium Risk" : "Medium Risk",
                    Recommendations = root.TryGetProperty("recommendations", out var rec) ? rec.GetString() ?? "" : "",
                    SwotAnalysis = root.TryGetProperty("swotAnalysis", out var swot) ? swot.GetRawText() : "{}",
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch { return GetDefaultEvaluation(idea); }
        }

        private IdeaInsightsDto GetDefaultInsights(string title, string description)
        {
            return new IdeaInsightsDto
            {
                ProblemStatement = "This business addresses a clear market need by providing an innovative solution to existing inefficiencies in the Jordanian market.",
                UniqueSellingPoint = "The unique value includes superior customer experience, innovative technology integration, and competitive pricing tailored for the local market.",
                TargetAudience = "Young professionals aged 25-45 in urban Jordan, with middle-to-high income levels and interest in modern, convenient solutions."
            };
        }

        private Evaluation GetDefaultEvaluation(BusinessIdea idea)
        {
            int score = 60;
            if (!string.IsNullOrEmpty(idea.Description) && idea.Description.Length > 200) score += 5;
            if (idea.EstimatedBudget > 0 && idea.EstimatedBudget <= 50000) score += 5;
            if (!string.IsNullOrEmpty(idea.Usp) && idea.Usp.Length > 50) score += 5;

            var sectorSwot = GetSectorSwot(idea.Sector);

            return new Evaluation
            {
                IdeaId = idea.IdeaId,
                NoveltyScore = Math.Min(score + 10, 100),
                MarketPotentialScore = Math.Min(score - 5, 100),
                OverallScore = score,
                RiskLevel = score >= 70 ? "Low Risk" : score >= 50 ? "Medium Risk" : "High Risk",
                Recommendations = "1. Conduct market research to validate target audience.\n2. Develop a go-to-market strategy.\n3. Create an MVP to test core assumptions.\n4. Build strategic partnerships for market entry.",
                SwotAnalysis = JsonSerializer.Serialize(sectorSwot),
                GeneratedAt = DateTime.UtcNow
            };
        }

        private object GetSectorSwot(string sector)
        {
            return sector switch
            {
                "Food & Beverage" => new
                {
                    strengths = new[] { "Strong consumer demand in Jordan", "Established supply chains", "Cultural familiarity with food businesses", "Growing middle class" },
                    weaknesses = new[] { "High competition in food sector", "Thin profit margins", "Location dependent success", "Food safety compliance required" },
                    opportunities = new[] { "Health-conscious consumer segment growing", "Delivery platform integration", "Tourism recovery boosting demand", "Corporate catering market" },
                    threats = new[] { "Economic fluctuations affecting spending", "Rising ingredient costs", "International chain competition", "Changing dietary trends" }
                },
                "Technology" => new
                {
                    strengths = new[] { "High scalability potential", "Lower overhead costs", "Growing tech talent pool in Jordan", "Government support for tech startups" },
                    weaknesses = new[] { "High initial development costs", "Continuous innovation required", "Customer acquisition challenges", "Talent retention difficulty" },
                    opportunities = new[] { "Regional expansion potential", "Digital transformation demand", "Remote work trend acceleration", "Smart city initiatives in Amman" },
                    threats = new[] { "Rapid technology changes", "International competition", "Cybersecurity concerns", "Brain drain to Gulf countries" }
                },
                "E-commerce" => new
                {
                    strengths = new[] { "High internet penetration in Jordan", "Mobile-first consumer behavior", "Lower overhead than physical stores", "Growing delivery infrastructure" },
                    weaknesses = new[] { "Cash-on-delivery preference", "Logistics challenges", "High customer acquisition cost", "Trust building required" },
                    opportunities = new[] { "Post-COVID online shopping habits", "Underserved product categories", "Social commerce growth", "Cross-border opportunities" },
                    threats = new[] { "Amazon/international platforms", "Payment processing fees", "Returns complexity", "Platform dependency risks" }
                },
                _ => new
                {
                    strengths = new[] { "Clear market opportunity identified", "Growing demand in Jordan", "Defined target audience", "Competitive pricing potential" },
                    weaknesses = new[] { "Competitive market landscape", "Execution and scaling risk", "Limited initial resources", "Brand awareness challenge" },
                    opportunities = new[] { "Market growth potential", "Technology integration", "Regional expansion", "Strategic partnerships" },
                    threats = new[] { "Market saturation risk", "Economic uncertainty", "New competitor entry", "Regulatory changes" }
                }
            };
        }
    }
}
