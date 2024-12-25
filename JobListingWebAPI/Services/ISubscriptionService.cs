using JobListingWebAPI.Models;

namespace JobListingWebAPI.Services
{
    public interface ISubscriptionService
    {
        Task SubscribeAsync(SubscriptionRequest request);
        Task UnsubscribeAsync(string email);
        Task UpdatePreferencesAsync(SubscriptionRequest request);
        Task<IEnumerable<SubscriptionResponse>> GetSubscriptionsAsync(string email);
        Task DeleteSubscriptionAsync(int id);
    }
}
