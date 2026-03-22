using System.Text.Json;
using backend.Models;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class GeminiAIService : IGeminiAIService
    {
        private static readonly Dictionary<string, SwotData> SectorSwot = new()
        {
            ["Food & Beverage"] = new SwotData
            {
                Strengths = new[] { "Strong consumer demand in Jordan's growing food market", "Established local supply chains and distribution networks", "Cultural familiarity with food business models", "Growing middle class with increasing spending power", "Tourism sector driving F&B demand" },
                Weaknesses = new[] { "Highly competitive market with low barriers to entry", "Thin profit margins requiring high volume", "Location-dependent success factors", "Strict food safety and hygiene requirements", "Seasonal demand fluctuations" },
                Opportunities = new[] { "Growing health-conscious consumer segment", "Expansion through delivery platforms like Talabat and Careem", "Tourism recovery driving new demand", "Corporate catering and B2B opportunities", "Export potential to regional markets" },
                Threats = new[] { "Economic fluctuations affecting consumer spending", "Rising ingredient and raw material costs", "Competition from international chains entering Jordan", "Changing dietary trends and preferences", "Rising operational costs including rent and utilities" }
            },
            ["Technology"] = new SwotData
            {
                Strengths = new[] { "High scalability potential with digital products", "Lower overhead costs compared to traditional businesses", "Growing talent pool from Jordanian universities", "Government support through INTAJ and tech initiatives", "Access to regional markets through digital channels" },
                Weaknesses = new[] { "High initial development and infrastructure costs", "Continuous innovation required to stay competitive", "Customer acquisition costs in a developing market", "Talent retention challenges due to brain drain", "Limited local venture capital ecosystem" },
                Opportunities = new[] { "Regional expansion across MENA markets", "Increasing digital transformation demand", "Remote work enabling global service delivery", "Smart city initiatives in Amman and Aqaba", "Growing fintech and e-government adoption" },
                Threats = new[] { "Rapid technological changes requiring constant adaptation", "International competition from established tech companies", "Cybersecurity risks and regulatory compliance", "Brain drain to Gulf countries offering higher salaries", "Economic instability affecting tech investment" }
            },
            ["E-commerce"] = new SwotData
            {
                Strengths = new[] { "High internet and smartphone penetration in Jordan", "Mobile-first consumer behavior among youth", "Lower operational overhead than physical retail", "Growing delivery and logistics infrastructure", "Social media integration for marketing" },
                Weaknesses = new[] { "Cash-on-delivery preference increasing operational complexity", "Logistics challenges in areas outside Amman", "High customer acquisition costs", "Building consumer trust for online transactions", "Return and exchange management complexity" },
                Opportunities = new[] { "Post-COVID shift to online shopping habits", "Underserved product categories in the market", "Social commerce through Instagram and TikTok", "Cross-border e-commerce to regional markets", "Digital payment adoption accelerating" },
                Threats = new[] { "Competition from Amazon and international platforms", "Payment processing fees and chargebacks", "Returns complexity affecting profitability", "Platform dependency risks", "Regulatory changes in e-commerce taxation" }
            },
            ["Healthcare"] = new SwotData
            {
                Strengths = new[] { "Growing demand for healthcare services", "Insurance coverage expansion in Jordan", "Medical tourism potential from regional countries", "Technology integration in healthcare delivery", "Qualified medical professionals" },
                Weaknesses = new[] { "Heavy regulatory burden and licensing requirements", "High liability and malpractice insurance costs", "Certification and accreditation requirements", "Expensive medical equipment and technology", "Long approval processes for new services" },
                Opportunities = new[] { "Telemedicine adoption and digital health services", "Preventive care and wellness market growth", "Home healthcare services demand", "Medical device and equipment distribution", "Mental health awareness driving new services" },
                Threats = new[] { "Stringent and changing healthcare regulations", "Malpractice risk and legal liability", "Doctor and specialist shortage in certain areas", "Medical tourism outflow to neighboring countries", "Rising healthcare costs affecting accessibility" }
            },
            ["Education"] = new SwotData
            {
                Strengths = new[] { "Education highly valued in Jordanian culture", "Large youth population creating sustained demand", "Growing acceptance of online learning formats", "Government focus on education development", "English proficiency enabling international content" },
                Weaknesses = new[] { "Price sensitivity in the education market", "Quality perception challenges for new providers", "Certification and accreditation needs", "Teacher and instructor recruitment challenges", "High competition from established institutions" },
                Opportunities = new[] { "Significant skills gap in technical and vocational training", "Online learning market expansion", "Corporate training and professional development", "Specialized programs in emerging technologies", "EdTech innovation in personalized learning" },
                Threats = new[] { "Free educational resources available online", "Traditional mindset preferring conventional education", "Economic conditions affecting education budgets", "EdTech competition from global platforms", "Rapid changes in skill requirements" }
            },
            ["Manufacturing"] = new SwotData
            {
                Strengths = new[] { "Strategic location for regional trade", "Qualified industrial labor force", "Free trade agreements with multiple countries", "Industrial zones with tax incentives", "Growing local demand for manufactured goods" },
                Weaknesses = new[] { "High energy and raw material costs", "Limited domestic market size", "Infrastructure challenges in some industrial areas", "Capital-intensive startup requirements", "Competition from cheaper imports" },
                Opportunities = new[] { "Export opportunities to neighboring markets", "Import substitution for common goods", "Green manufacturing and sustainability trends", "Agro-processing and food manufacturing", "Partnership opportunities with international firms" },
                Threats = new[] { "Global supply chain disruptions", "Currency fluctuations affecting costs", "Cheaper imports from Asia", "Environmental regulations increasing costs", "Energy cost volatility" }
            },
            ["Services"] = new SwotData
            {
                Strengths = new[] { "Low startup capital requirements", "Flexible business model adaptable to demand", "Growing services sector in Jordan's economy", "Ability to serve both local and regional clients", "Scalable through digital delivery" },
                Weaknesses = new[] { "Highly dependent on skilled personnel", "Difficult to differentiate in commoditized markets", "Client retention challenges", "Pricing pressure from competitors", "Seasonal demand variations" },
                Opportunities = new[] { "Outsourcing demand from Gulf countries", "Digital service delivery expanding reach", "Specialized consulting in niche areas", "Government and NGO project contracts", "Tourism-related services growth" },
                Threats = new[] { "Economic downturns reducing service spending", "Competition from freelancers and gig workers", "Client payment delays affecting cash flow", "Technology disrupting traditional service models", "Regulatory changes in professional services" }
            },
            ["Other"] = new SwotData
            {
                Strengths = new[] { "Unique market positioning opportunity", "First-mover advantage potential", "Flexibility to adapt to market needs", "Lower competitive pressure in niche markets", "Innovation potential" },
                Weaknesses = new[] { "Unproven market demand", "Limited industry benchmarks", "Customer education requirements", "Difficulty finding experienced talent", "Higher risk profile for investors" },
                Opportunities = new[] { "Untapped market segments", "Growing entrepreneurship ecosystem", "Government support for innovative startups", "Regional market expansion", "Partnership with established businesses" },
                Threats = new[] { "Market uncertainty and demand risk", "Potential for larger competitors to enter", "Regulatory uncertainty", "Economic instability", "Difficulty securing financing" }
            }
        };

        private static readonly string[] InnovationKeywords = { "innovative", "unique", "digital", "ai", "artificial intelligence", "machine learning", "blockchain", "smart", "automated", "tech", "app", "platform", "saas", "cloud", "iot", "sustainable", "green", "eco" };
        private static readonly string[] JordanKeywords = { "jordan", "amman", "arabic", "middle east", "mena", "local", "regional", "halal", "arabic coffee", "mansaf" };

        public Task<Evaluation> EvaluateBusinessIdea(BusinessIdea idea)
        {
            var noveltyScore = CalculateNoveltyScore(idea);
            var marketScore = CalculateMarketPotentialScore(idea);
            var overallScore = (noveltyScore + marketScore) / 2;
            var riskLevel = DetermineRiskLevel(overallScore, idea.EstimatedBudget);
            var swotData = GetSwotAnalysis(idea.Sector);
            var recommendations = GenerateRecommendations(overallScore, idea);

            var evaluation = new Evaluation
            {
                IdeaId = idea.IdeaId,
                NoveltyScore = noveltyScore,
                MarketPotentialScore = marketScore,
                OverallScore = overallScore,
                RiskLevel = riskLevel,
                SwotAnalysis = JsonSerializer.Serialize(swotData),
                Recommendations = recommendations,
                GeneratedAt = DateTime.UtcNow
            };

            return Task.FromResult(evaluation);
        }

        private int CalculateNoveltyScore(BusinessIdea idea)
        {
            int score = 55;
            var combinedText = $"{idea.Title} {idea.Description} {idea.Usp} {idea.ProblemStatement}".ToLowerInvariant();

            foreach (var keyword in InnovationKeywords)
            {
                if (combinedText.Contains(keyword))
                    score += 5;
            }

            if (idea.Sector == "Technology" || idea.Sector == "Healthcare")
                score += 15;
            else if (idea.Sector == "E-commerce" || idea.Sector == "Education")
                score += 10;

            if (!string.IsNullOrEmpty(idea.Usp) && idea.Usp.Length > 100)
                score += 10;

            if (!string.IsNullOrEmpty(idea.ProblemStatement) && idea.ProblemStatement.Length > 50)
                score += 10;

            if (!string.IsNullOrEmpty(idea.Description) && idea.Description.Length > 300)
                score += 5;

            return Math.Min(score, 95);
        }

        private int CalculateMarketPotentialScore(BusinessIdea idea)
        {
            int score = 60;

            if (idea.EstimatedBudget >= 20000 && idea.EstimatedBudget <= 100000)
                score += 15;
            else if (idea.EstimatedBudget >= 10000 && idea.EstimatedBudget < 20000)
                score += 10;
            else if (idea.EstimatedBudget > 100000)
                score += 5;

            score += idea.Sector switch
            {
                "Food & Beverage" => 15,
                "Technology" => 12,
                "E-commerce" => 10,
                "Healthcare" => 12,
                "Education" => 8,
                "Services" => 8,
                "Manufacturing" => 6,
                _ => 5
            };

            var combinedText = $"{idea.Title} {idea.Description} {idea.TargetAudience}".ToLowerInvariant();
            foreach (var keyword in JordanKeywords)
            {
                if (combinedText.Contains(keyword))
                {
                    score += 10;
                    break;
                }
            }

            if (idea.Location == "Amman") score += 5;
            else if (idea.Location == "Online") score += 8;

            if (idea.CompetitionLevel == "Low") score += 8;
            else if (idea.CompetitionLevel == "Medium") score += 4;

            return Math.Min(score, 92);
        }

        private string DetermineRiskLevel(int overallScore, decimal budget)
        {
            if (overallScore >= 80 && budget < 50000) return "Low Risk";
            if (overallScore >= 70 && budget < 75000) return "Medium-Low Risk";
            if (overallScore >= 60) return "Medium Risk";
            if (overallScore >= 50) return "Medium-High Risk";
            return "High Risk";
        }

        private object GetSwotAnalysis(string sector)
        {
            if (SectorSwot.TryGetValue(sector, out var swot))
                return swot;
            return SectorSwot["Other"];
        }

        private string GenerateRecommendations(int overallScore, BusinessIdea idea)
        {
            var recs = new List<string>();

            if (overallScore >= 75)
                recs.Add($"Your business concept shows strong potential. We recommend proceeding with detailed planning and consider launching a pilot program in {idea.Location ?? "Amman"} to validate your assumptions with real customers.");
            else if (overallScore >= 60)
                recs.Add("Your idea has a solid foundation with room for improvement. Focus on strengthening your unique selling proposition and conduct direct customer validation through surveys and interviews before full launch.");
            else
                recs.Add("While your idea has merit, several challenges have been identified. Consider pivoting certain aspects of your business model, seek mentorship from experienced entrepreneurs in your sector, and explore partnership opportunities to reduce risk.");

            if (idea.EstimatedBudget > 75000)
                recs.Add("Given the significant investment required, consider a phased investment approach. Start with an MVP (Minimum Viable Product) to validate core assumptions before scaling.");

            if (idea.CompetitionLevel == "High")
                recs.Add("The competitive landscape is challenging. Focus on clear differentiation and consider targeting an underserved niche within your market.");

            recs.Add("Recommended next steps: Complete your financial planning, conduct detailed competitor analysis, and generate your comprehensive business plan through our platform.");

            return string.Join(" ", recs);
        }

        private class SwotData
        {
            public string[] Strengths { get; set; } = Array.Empty<string>();
            public string[] Weaknesses { get; set; } = Array.Empty<string>();
            public string[] Opportunities { get; set; } = Array.Empty<string>();
            public string[] Threats { get; set; } = Array.Empty<string>();
        }
    }
}
