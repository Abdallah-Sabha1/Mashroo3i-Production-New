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
        private readonly string _apiKey;

        private const string GroqUrl   = "https://api.groq.com/openai/v1/chat/completions";
        private const string GroqModel = "llama-3.3-70b-versatile";

        public GeminiAIService(HttpClient httpClient, IConfiguration config, ILogger<GeminiAIService> logger)
        {
            _httpClient = httpClient;
            _config     = config;
            _logger     = logger;
            _apiKey     = config["GroqAI:ApiKey"] ?? throw new InvalidOperationException("Groq API Key not configured");
        }

        public async Task<IdeaInsightsDto> GenerateIdeaInsightsAsync(string title, string description, string sector, string language = "en")
        {
            try
            {
                _logger.LogInformation("Generating insights for idea: {Title} in {Language}", title, language);
                var prompt   = BuildInsightGenerationPrompt(title, description, sector, language);
                var response = await CallGroqAsync(prompt);

                if (string.IsNullOrEmpty(response))
                {
                    _logger.LogWarning("Empty response from Groq for insights");
                    return GetDefaultInsights();
                }

                return ParseInsightsResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating insights from Groq");
                return GetDefaultInsights();
            }
        }

        public async Task<Evaluation> EvaluateBusinessIdeaAsync(BusinessIdea idea, string language = "en")
        {
            try
            {
                _logger.LogInformation("Evaluating idea: {Title} (ID: {IdeaId}) in {Language}", idea.Title, idea.IdeaId, language);
                var prompt   = BuildEvaluationPrompt(idea, language);
                var response = await CallGroqAsync(prompt);

                if (string.IsNullOrEmpty(response))
                {
                    _logger.LogWarning("Empty response from Groq for evaluation");
                    return GetDefaultEvaluation(idea);
                }

                return ParseEvaluationResponse(response, idea);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating business idea with Groq");
                return GetDefaultEvaluation(idea);
            }
        }

        // ── Groq API call ─────────────────────────────────────────────────────

        private async Task<string> CallGroqAsync(string prompt)
        {
            try
            {
                var requestBody = new
                {
                    model    = GroqModel,
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    },
                    temperature    = 0.7,
                    max_tokens     = 2048,
                    response_format = new { type = "json_object" }
                };

                var request = new HttpRequestMessage(HttpMethod.Post, GroqUrl);
                request.Headers.Add("Authorization", $"Bearer {_apiKey}");
                request.Content = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error: {Status} — {Error}", response.StatusCode, error);
                    return string.Empty;
                }

                var json     = await response.Content.ReadAsStringAsync();
                var doc      = JsonDocument.Parse(json);
                var content  = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return content ?? string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Groq API");
                return string.Empty;
            }
        }

        // ── Prompt builders ───────────────────────────────────────────────────

        private string BuildInsightGenerationPrompt(string title, string description, string sector, string language = "en")
        {
            var isArabic = language.StartsWith("ar", StringComparison.OrdinalIgnoreCase);

            var sectorLabel = sector switch
            {
                "food_and_beverage"      => isArabic ? "الطعام والمشروبات"    : "Food & Beverage",
                "retail_ecommerce"       => isArabic ? "البيع بالتجزئة والتجارة الإلكترونية" : "Retail & E-commerce",
                "tech_and_software"      => isArabic ? "التكنولوجيا والبرمجيات" : "Tech & Software",
                "education_and_training" => isArabic ? "التعليم والتدريب"     : "Education & Training",
                "health_and_wellness"    => isArabic ? "الصحة واللياقة"       : "Health & Wellness",
                "professional_services"  => isArabic ? "الخدمات المهنية"      : "Professional Services",
                _                        => isArabic ? "أعمال عامة"           : "General Business"
            };

            if (isArabic)
            {
                return $@"أنت مستشار أعمال متخصص في سوق الشركات الناشئة في عمّان، الأردن.

⚠️ مطلوب: أجب بالعربية 100% في جميع الحقول النصية.

فكرة العمل:
العنوان: {title}
الوصف: {description}
القطاع: {sectorLabel}
السوق: عمّان، الأردن

قواعد:
1. جميع التحليلات يجب أن تكون محددة لسوق عمّان
2. كن صادقاً — اذكر نقاط الضعف بوضوح
3. استخدم لغة بسيطة ومفهومة
4. نوع العمل: B2C = يبيع للأفراد، B2B = يبيع للشركات
5. نطاق المبيعات: كن واقعياً لعمّان — الشركات الجديدة تبدأ صغيرة

أرجع JSON صحيح فقط بهذه المفاتيح بالضبط:
{{
  ""problemStatement"": ""ما المشكلة التي تحلها هذه الفكرة للناس في عمّان؟ (2-3 جمل بالعربية)"",
  ""uniqueSellingPoint"": ""ما الذي يجعل هذا المشروع مختلفاً عن البدائل الموجودة في عمّان؟ (2-3 جمل بالعربية)"",
  ""targetAudience"": ""من سيشتري هذا في عمّان؟ صف العمر ونمط الحياة والموقع والحاجة المحددة بالعربية."",
  ""suggestedBusinessType"": ""B2C"" or ""B2B"",
  ""businessTypeConfidence"": ""HIGH"" or ""MEDIUM"" or ""LOW"",
  ""businessTypeReason"": ""جملة واحدة بالعربية تشرح لماذا B2C أو B2B"",
  ""suggestedMonthlySalesRange"": ""اختر واحداً فقط: لـ B2C: 1_10 أو 10_50 أو 50_200 أو 200_plus. لـ B2B: 1_3 أو 4_10 أو 11_30 أو 30_plus""
}}";}

            return $@"You are a senior business consultant specializing in the Amman, Jordan startup market.

BUSINESS IDEA:
Title: {title}
Description: {description}
Sector: {sectorLabel}
Market: Amman, Jordan

RULES:
1. All analysis must be specific to Amman's market
2. Be honest — mention weaknesses clearly but constructively
3. Use simple language
4. For businessType: B2C = sells to individuals, B2B = sells to businesses
5. For suggestedMonthlySalesRange: be realistic for Amman — new businesses start small

Return ONLY a valid JSON object with these exact keys:
{{
  ""problemStatement"": ""What specific problem does this solve for people in Amman? (2-3 sentences)"",
  ""uniqueSellingPoint"": ""What would make this stand out from existing alternatives in Amman? (2-3 sentences)"",
  ""targetAudience"": ""Who exactly would buy this in Amman? Describe age, lifestyle, location, specific need."",
  ""suggestedBusinessType"": ""B2C"" or ""B2B"",
  ""businessTypeConfidence"": ""HIGH"" or ""MEDIUM"" or ""LOW"",
  ""businessTypeReason"": ""One sentence explaining why B2C or B2B"",
  ""suggestedMonthlySalesRange"": ""pick EXACTLY ONE: for B2C: 1_10, 10_50, 50_200, or 200_plus. For B2B: 1_3, 4_10, 11_30, or 30_plus""
}}";
        }

        private string BuildEvaluationPrompt(BusinessIdea idea, string language = "en")
        {
            var isArabic = language.StartsWith("ar", StringComparison.OrdinalIgnoreCase);

            var scoringCriteria = idea.BusinessType == "B2B"
                ? (isArabic
                    ? "أوزان التصنيف لأفكار B2B: شدة المشكلة (25)، وضوح المشتري (20)، العائد على الاستثمار (20)، الحصانة التنافسية (20)، جدوى دورة المبيعات (10)، القابلية للتوسع في عمّان (5)"
                    : "SCORING FOR B2B: Problem severity (25pts), Buyer clarity (20pts), Measurable ROI (20pts), Competitive moat (20pts), Sales cycle feasibility (10pts), Amman scalability (5pts)")
                : (isArabic
                    ? "أوزان التصنيف لأفكار B2C: حجم السوق في عمّان (25)، وضوح المشكلة (20)، سهولة الحصول على العملاء (20)، التمييز التنافسي (15)، إمكانية الشراء المتكرر (15)، الأصالة والتوقيت (5)"
                    : "SCORING FOR B2C: Market size in Amman (25pts), Consumer pain clarity (20pts), Acquisition ease (20pts), Competitive differentiation (15pts), Repeat purchase potential (15pts), Novelty and timing (5pts)");

            var sectorContext = (isArabic, idea.Sector) switch
            {
                (true,  "food_and_beverage")      => "عمّان لديها ثقافة قوية في المقاهي والطعام. المنافسة عالية في غرب عمّان. الهوامش: 25-50%.",
                (false, "food_and_beverage")      => "Amman has a strong café/food culture. High competition in West Amman. Margins: 25-50%.",
                (true,  "retail_ecommerce")       => "التجارة الإلكترونية في الأردن تنمو 9.4% سنوياً. إنستغرام القناة المبيعات السائدة. الهوامش: 30-55%.",
                (false, "retail_ecommerce")       => "Jordan e-commerce growing 9.4% CAGR. Instagram dominant sales channel. Margins: 30-55%.",
                (true,  "tech_and_software")      => "الأردن جمعت 300 مليون دولار في تمويل الشركات الناشئة في 2024. المواهب التقنية متاحة. الهوامش: 55-80%.",
                (false, "tech_and_software")      => "Jordan raised $300M startup funding in 2024. Tech talent available. Margins: 55-80%.",
                (true,  "education_and_training") => "طلب قوي على برامج STEM والإنجليزية في عمّان. الكلام الشفهي يهيمن على الحصول على العملاء. الهوامش: 50-80%.",
                (false, "education_and_training") => "Strong demand for STEM and English programs in Amman. Word of mouth dominates. Margins: 50-80%.",
                (true,  "health_and_wellness")    => "الوعي الصحي زاد بعد COVID. الطبقة الوسطى المتنامية تستثمر في اللياقة. الهوامش: 40-70%.",
                (false, "health_and_wellness")    => "Post-COVID wellness awareness increased. Growing middle class investing in fitness. Margins: 40-70%.",
                (true,  "professional_services")  => "أسرع قطاع للوصول إلى نقطة التعادل في عمّان. المبيعات القائمة على العلاقات. الهوامش: 50-75%.",
                (false, "professional_services")  => "Fastest sector to break even in Amman. Relationship-driven sales. Margins: 50-75%.",
                (true,  _)                        => "سياق سوق عمّان العام. تحقق من الفكرة مع البحث عن السوق المحلي.",
                (false, _)                        => "General Amman market context. Validate with local market research."
            };

            if (isArabic)
            {
                return $@"أنت خبير متخصص في تقييم الشركات الناشئة في سوق عمّان، الأردن.

⚠️ مطلوب: أجب بالعربية 100% — كل النصوص بالعربية فقط.

فكرة العمل:
العنوان: {idea.Title}
الوصف: {idea.Description}
نوع العمل: {idea.BusinessType}
القطاع: {idea.Sector}
المشكلة: {idea.ProblemStatement}
نقطة البيع الفريدة: {idea.Usp}
الجمهور المستهدف: {idea.TargetAudience}
الميزانية: {idea.EstimatedBudget} دينار أردني

سياق السوق: {sectorContext}
{scoringCriteria}

قواعد التقييم:
1. قيّم بناءً على واقع سوق عمّان
2. تحليل SWOT محدد لهذه الفكرة في عمّان
3. الحكم جملة واحدة صادقة بالعربية
4. التوصيات: 3-4 خطوات محددة قابلة للتنفيذ بالعربية

أرجع JSON صحيح فقط:
{{
  ""noveltyScore"": <رقم صحيح 1-100>,
  ""marketPotentialScore"": <رقم صحيح 1-100>,
  ""overallScore"": <رقم صحيح 1-100>,
  ""riskLevel"": ""Low Risk"" or ""Medium Risk"" or ""High Risk"",
  ""verdict"": ""<جملة واحدة صادقة بالعربية عن الفكرة>"",
  ""redFlags"": [""<تحذير محدد بالعربية>""],
  ""recommendations"": ""<3-4 خطوات محددة بالعربية>"",
  ""swotAnalysis"": {{
    ""strengths"": [""<نقطة قوة بالعربية>"", ""<نقطة قوة بالعربية>""],
    ""weaknesses"": [""<نقطة ضعف بالعربية>"", ""<نقطة ضعف بالعربية>""],
    ""opportunities"": [""<فرصة بالعربية>"", ""<فرصة بالعربية>""],
    ""threats"": [""<تهديد بالعربية>"", ""<تهديد بالعربية>""]
  }}
}}";
            }
            else
            {
                return $@"You are an expert startup evaluator with deep knowledge of the Amman, Jordan market.

BUSINESS IDEA:
Title: {idea.Title}
Description: {idea.Description}
Business Type: {idea.BusinessType}
Sector: {idea.Sector}
Problem Being Solved: {idea.ProblemStatement}
Unique Selling Point: {idea.Usp}
Target Audience: {idea.TargetAudience}
Estimated Budget: JOD {idea.EstimatedBudget}

AMMAN MARKET CONTEXT: {sectorContext}
{scoringCriteria}

RULES:
1. Score based on Amman market reality
2. SWOT must be specific to THIS idea in Amman
3. Verdict must be one honest sentence
4. If budget seems insufficient, say so
5. Recommendations must be actionable next steps, not generic advice
6. RedFlags: list serious problems. Empty array if none.

Return ONLY valid JSON:
{{
  ""noveltyScore"": <integer 1-100>,
  ""marketPotentialScore"": <integer 1-100>,
  ""overallScore"": <integer 1-100>,
  ""riskLevel"": ""Low Risk"" or ""Medium Risk"" or ""High Risk"",
  ""verdict"": ""One honest sentence about this idea"",
  ""redFlags"": [""Specific warning if any""],
  ""recommendations"": ""3-4 specific actionable next steps for this idea in Amman"",
  ""swotAnalysis"": {{
    ""strengths"": [""Specific strength"", ""Specific strength""],
    ""weaknesses"": [""Specific weakness"", ""Specific weakness""],
    ""opportunities"": [""Specific Amman opportunity"", ""Specific growth path""],
    ""threats"": [""Specific threat in Amman"", ""Specific competitive threat""]
  }}
}}";
            }
        }

        // ── Response parsers ──────────────────────────────────────────────────

        private static string CleanJsonResponse(string response)
        {
            var cleaned = System.Text.RegularExpressions.Regex.Replace(
                response, @"<think>[\s\S]*?</think>", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            cleaned = cleaned.Replace("```json", "").Replace("```", "").Trim();

            var start = cleaned.IndexOf('{');
            var end   = cleaned.LastIndexOf('}');
            if (start >= 0 && end > start)
                cleaned = cleaned[start..(end + 1)];

            return cleaned;
        }

        private IdeaInsightsDto ParseInsightsResponse(string response)
        {
            try
            {
                using var doc  = JsonDocument.Parse(CleanJsonResponse(response));
                var root       = doc.RootElement;

                var rawRange   = ExtractString(root, "suggestedMonthlySalesRange", "1_10");
                var validRanges = new HashSet<string>
                    { "1_10","10_50","50_200","200_plus","1_3","4_10","11_30","30_plus" };
                var safeRange  = validRanges.Contains(rawRange) ? rawRange : "1_10";

                return new IdeaInsightsDto
                {
                    ProblemStatement           = ExtractString(root, "problemStatement"),
                    UniqueSellingPoint         = ExtractString(root, "uniqueSellingPoint"),
                    TargetAudience             = ExtractString(root, "targetAudience"),
                    SuggestedBusinessType      = ExtractString(root, "suggestedBusinessType", "B2C"),
                    BusinessTypeConfidence     = ExtractString(root, "businessTypeConfidence", "LOW"),
                    BusinessTypeReason         = ExtractString(root, "businessTypeReason"),
                    SuggestedMonthlySalesRange = safeRange
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing insights response from Groq");
                return GetDefaultInsights();
            }
        }

        private Evaluation ParseEvaluationResponse(string response, BusinessIdea idea)
        {
            try
            {
                using var doc    = JsonDocument.Parse(CleanJsonResponse(response));
                var root         = doc.RootElement;

                var noveltyScore = ExtractInt(root, "noveltyScore", 50);
                var marketScore  = ExtractInt(root, "marketPotentialScore", 50);
                var overallScore = ExtractInt(root, "overallScore", (noveltyScore + marketScore) / 2);
                var riskLevel    = ExtractString(root, "riskLevel", "Medium Risk");
                var recommendations = ExtractString(root, "recommendations");
                var verdict      = ExtractString(root, "verdict");

                var swotJson = root.TryGetProperty("swotAnalysis", out var swot)
                    ? swot.GetRawText() : "{}";

                var redFlagsJson = "[]";
                if (root.TryGetProperty("redFlags", out var rf) && rf.ValueKind == JsonValueKind.Array)
                    redFlagsJson = rf.GetRawText();

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
                _logger.LogError(ex, "Error parsing evaluation response from Groq");
                return GetDefaultEvaluation(idea);
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static string ExtractString(JsonElement root, string key, string defaultValue = "")
            => root.TryGetProperty(key, out var p) ? (p.GetString() ?? defaultValue) : defaultValue;

        private static int ExtractInt(JsonElement root, string key, int defaultValue)
            => root.TryGetProperty(key, out var p) && p.TryGetInt32(out var v) ? v : defaultValue;

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
