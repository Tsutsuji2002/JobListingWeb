using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Services;
using JobListingWebAPI.Exceptions;
using JobListingWebAPI.Models;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class SendMailController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<SendMailController> _logger;

    public SendMailController(
        ISubscriptionService subscriptionService,
        ILogger<SendMailController> logger)
    {
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    [HttpGet("subscriptions/{email}")]
    public async Task<IActionResult> GetSubscriptions(string email)
    {
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        try
        {
            var subscriptions = await _subscriptionService.GetSubscriptionsAsync(email);
            return Ok(subscriptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching subscriptions for email: {Email}", email);
            return StatusCode(500, new { message = "An error occurred while fetching subscriptions" });
        }
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe(SubscriptionRequest request)
    {
        try
        {
            await _subscriptionService.SubscribeAsync(request);
            return Ok(new { message = "Successfully subscribed to job notifications" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during subscription");
            return StatusCode(500, new { message = "An error occurred during subscription" });
        }
    }

    [HttpPut("update-preferences")]
    public async Task<IActionResult> UpdatePreferences(SubscriptionRequest request)
    {
        try
        {
            await _subscriptionService.UpdatePreferencesAsync(request);
            return Ok(new { message = "Successfully updated preferences" });
        }
        catch (SubscriptionNotFoundException)
        {
            return NotFound(new { message = "Subscription not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating preferences");
            return StatusCode(500, new { message = "An error occurred while updating preferences" });
        }
    }

    [HttpDelete("subscription/{id}")]
    public async Task<IActionResult> DeleteSubscription(int id)
    {
        try
        {
            await _subscriptionService.DeleteSubscriptionAsync(id);
            return Ok(new { message = "Successfully deleted subscription" });
        }
        catch (SubscriptionNotFoundException)
        {
            return NotFound(new { message = "Subscription not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting subscription");
            return StatusCode(500, new { message = "An error occurred while deleting subscription" });
        }
    }

    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] string email)
    {
        try
        {
            await _subscriptionService.UnsubscribeAsync(email);
            return Ok(new { message = "Successfully unsubscribed from job notifications" });
        }
        catch (SubscriptionNotFoundException)
        {
            return NotFound(new { message = "Subscription not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during unsubscription");
            return StatusCode(500, new { message = "An error occurred during unsubscription" });
        }
    }
}