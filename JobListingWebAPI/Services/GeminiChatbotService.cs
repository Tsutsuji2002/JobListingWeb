using System.Text.Json;
using System.Text;
using System.Net.Http;

namespace JobListingWebAPI.Services
{
    public class GeminiChatbotService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        // Using stable model that works with most API keys
        private const string MODEL_ID = "gemini-2.5-flash"; 

        public GeminiChatbotService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GeminiApi:ApiKey"] ?? "";
        }

        public async Task<string> SendMessageAsync(string message)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return "Lỗi: API Key chưa được cấu hình.";

            // URL đúng định dạng cho Google AI SDK
            var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_ID}:generateContent?key={_apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = message } } }
                }
            };

            try
            {
                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(requestUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return $"API Error: {response.StatusCode} - {responseContent}";
                }

                return responseContent;
            }
            catch (Exception ex)
            {
                return $"Exception: {ex.Message}";
            }
        }
    }
}