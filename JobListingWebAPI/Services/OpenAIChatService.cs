using JobListingWebAPI.Models;
using OpenAI;
using System.Net.Http.Json;

namespace JobListingWebAPI.Services
{
    public class OpenAIChatServices
    {
        private readonly HttpClient _httpClient;
        private const string OpenAiEndpoint = "https://api.openai.com/v1/chat/completions";
        private readonly string _apiKey;

        public OpenAIChatServices(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OpenAI:ApiKey"] ?? throw new ArgumentNullException("OpenAI:ApiKey");
        }

        public async Task<string> GetResponse(string prompt)
        {
            var requestData = new
            {
                model = "gpt-4",
                messages = new[]
                {
                new { role = "system", content = "You are a helpful assistant." },
                new { role = "user", content = prompt }
            }
            };

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

            var response = await _httpClient.PostAsJsonAsync(OpenAiEndpoint, requestData);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<dynamic>();
                return result.choices[0].message.content.ToString();
            }

            throw new Exception($"OpenAI API Error: {response.StatusCode}");
        }
    }
}
