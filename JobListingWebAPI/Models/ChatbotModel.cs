using System.Text.Json.Serialization;

namespace JobListingWebAPI.Models
{
    public class ChatRequest
    {
        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }

    public class ChatResponse
    {
        [JsonPropertyName("response")]
        public string? Response { get; set; }
    }
    public class GeminiResponse
    {
        public Candidate[] Candidates { get; set; }
    }

    public class Candidate
    {
        public Content Content { get; set; }
    }

    public class Content
    {
        public Part[] Parts { get; set; }
    }

    public class Part
    {
        public string Text { get; set; }
    }
}
