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
                entity.Property(e => e.Sector).IsRequired().HasMaxLength(100);
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
        }
    }
}
