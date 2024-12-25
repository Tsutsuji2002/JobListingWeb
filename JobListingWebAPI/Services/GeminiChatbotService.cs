using System.Text.Json;
using System.Text;
using JobListingWebAPI.Models;

namespace JobListingWebAPI.Services
{
    public class GeminiChatbotService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

        public GeminiChatbotService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["GeminiApi:ApiKey"] ?? throw new ArgumentNullException("\"The Gemini API Key is not configured in appsettings.json or environment variables.\"");
            _httpClient.BaseAddress = new Uri(BASE_URL);
        }

        public async Task<string> SendMessageAsync(string message)
        {
            var requestUrl = $"{BASE_URL}?key={Uri.EscapeDataString(_apiKey)}";
            Console.WriteLine($"{requestUrl}");
            var requestBody = new
            {
                contents = new[]
                {
            new
            {
                parts = new[]
                {
                    new { text = message }
                }
            }
        }
            };

            try
            {
                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(requestUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                // Detailed error logging
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"API Error Status: {response.StatusCode}");
                    Console.WriteLine($"Response Content: {responseContent}");
                    return $"API Error: {response.StatusCode}";
                }

                return responseContent;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception Details: {ex.Message}");
                return $"Error: {ex.Message}";
            }
        }
    }
}
