namespace backend.Services.Interfaces
{
    public interface IPdfService
    {
        Task<byte[]> GenerateBusinessPlan(int ideaId);
    }
}
