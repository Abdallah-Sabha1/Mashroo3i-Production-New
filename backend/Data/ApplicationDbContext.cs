using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<BusinessIdea> BusinessIdeas { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<FinancialPlan> FinancialPlans { get; set; }
        public DbSet<IndustryBenchmark> IndustryBenchmarks { get; set; }
        public DbSet<FinancialProjection> FinancialProjections { get; set; }
        public DbSet<ProjectionScenario> ProjectionScenarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
                entity.Property(e => e.PasswordHash).IsRequired();
            });

            // BusinessIdea
            modelBuilder.Entity<BusinessIdea>(entity =>
            {
                entity.HasKey(e => e.IdeaId);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.BusinessType).IsRequired().HasMaxLength(10).HasDefaultValue("B2C");
                entity.Property(e => e.Sector).IsRequired().HasMaxLength(100).HasDefaultValue("other");
                entity.Property(e => e.AmmanRegion).IsRequired().HasMaxLength(20).HasDefaultValue("central");
                entity.Property(e => e.EstimatedBudget).HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.User)
                    .WithMany(u => u.BusinessIdeas)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Evaluation
            modelBuilder.Entity<Evaluation>(entity =>
            {
                entity.HasKey(e => e.EvaluationId);
                entity.HasIndex(e => e.IdeaId).IsUnique();
                entity.Property(e => e.SwotAnalysis).IsRequired();

                entity.HasOne(e => e.BusinessIdea)
                    .WithOne(i => i.Evaluation)
                    .HasForeignKey<Evaluation>(e => e.IdeaId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // FinancialPlan
            modelBuilder.Entity<FinancialPlan>(entity =>
            {
                entity.HasKey(e => e.PlanId);
                entity.HasIndex(e => e.IdeaId).IsUnique();
                entity.Property(e => e.InitialInvestment).HasColumnType("decimal(18,2)");
                entity.Property(e => e.MonthlyRevenue).HasColumnType("decimal(18,2)");
                entity.Property(e => e.MonthlyCosts).HasColumnType("decimal(18,2)");
                entity.Property(e => e.RoiPercentage).HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.BusinessIdea)
                    .WithOne(i => i.FinancialPlan)
                    .HasForeignKey<FinancialPlan>(e => e.IdeaId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // IndustryBenchmark
            modelBuilder.Entity<IndustryBenchmark>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.IndustryType, e.BusinessModel });
                entity.Property(e => e.Confidence).HasColumnType("decimal(5,2)");
                entity.Property(e => e.StartupCostLow).HasColumnType("decimal(18,2)");
                entity.Property(e => e.StartupCostMid).HasColumnType("decimal(18,2)");
                entity.Property(e => e.StartupCostHigh).HasColumnType("decimal(18,2)");
                entity.Property(e => e.MonthlyCostLow).HasColumnType("decimal(18,2)");
                entity.Property(e => e.MonthlyCostHigh).HasColumnType("decimal(18,2)");
                entity.Property(e => e.MonthlyCostTypical).HasColumnType("decimal(18,2)");
                entity.Property(e => e.GrossMarginLow).HasColumnType("decimal(5,2)");
                entity.Property(e => e.GrossMarginHigh).HasColumnType("decimal(5,2)");
                entity.Property(e => e.GrossMarginTypical).HasColumnType("decimal(5,2)");
                entity.Property(e => e.NetMarginLow).HasColumnType("decimal(5,2)");
                entity.Property(e => e.NetMarginHigh).HasColumnType("decimal(5,2)");
                entity.Property(e => e.NetMarginTypical).HasColumnType("decimal(5,2)");
                entity.Property(e => e.AverageOrderValueLow).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AverageOrderValueHigh).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AverageOrderValueTypical).HasColumnType("decimal(18,2)");
                entity.Property(e => e.MonthlyGrowthRatePercent).HasColumnType("decimal(5,2)");
                entity.Property(e => e.AverageCACTypical).HasColumnType("decimal(18,2)");
                entity.Property(e => e.MonthlyChurnRateLow).HasColumnType("decimal(5,2)");
                entity.Property(e => e.MonthlyChurnRateHigh).HasColumnType("decimal(5,2)");
                entity.Property(e => e.MonthlyChurnRateTypical).HasColumnType("decimal(5,2)");
                entity.Property(e => e.CustomerRetentionRatePercent).HasColumnType("decimal(5,2)");
            });

            // FinancialProjection
            modelBuilder.Entity<FinancialProjection>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.BusinessIdeaId).IsUnique();
                entity.HasIndex(e => e.BenchmarkId);
                entity.Property(e => e.EffectiveInitialInvestment).HasColumnType("decimal(18,2)");
                entity.Property(e => e.EffectiveMonthlyRevenue).HasColumnType("decimal(18,2)");
                entity.Property(e => e.EffectiveGrossMargin).HasColumnType("decimal(5,2)");
                entity.Property(e => e.UserInitialInvestment).HasColumnType("decimal(18,2)");
                entity.Property(e => e.UserMonthlyRevenueAssumption).HasColumnType("decimal(18,2)");
                entity.Property(e => e.UserProfitMarginAssumption).HasColumnType("decimal(5,2)");
                entity.Property(e => e.UserMonthlyGrowthRate).HasColumnType("decimal(5,2)");

                entity.HasOne(e => e.BusinessIdea)
                    .WithOne(i => i.FinancialProjection)
                    .HasForeignKey<FinancialProjection>(e => e.BusinessIdeaId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Benchmark)
                    .WithMany(b => b.FinancialProjections)
                    .HasForeignKey(e => e.BenchmarkId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ProjectionScenario
            modelBuilder.Entity<ProjectionScenario>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.FinancialProjectionId);
                entity.Property(e => e.ROI12Months).HasColumnType("decimal(10,2)");
                entity.Property(e => e.TotalProfit12Months).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CumulativeCashFlow12Months).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AvgMonthlyRevenue).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AvgMonthlyProfit).HasColumnType("decimal(18,2)");
                entity.Property(e => e.RevenueMultiplier).HasColumnType("decimal(5,2)");
                entity.Property(e => e.CostMultiplier).HasColumnType("decimal(5,2)");

                entity.HasOne(e => e.FinancialProjection)
                    .WithMany(p => p.Scenarios)
                    .HasForeignKey(e => e.FinancialProjectionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
