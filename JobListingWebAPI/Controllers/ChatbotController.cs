using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using JobListingWebAPI.Services;
using JobListingWebAPI.Models;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly GeminiChatbotService _chatbot;


        public ChatbotController(GeminiChatbotService chatbot)
        {
            _chatbot = chatbot;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
        {
            var response = await _chatbot.SendMessageAsync(request.Message);
            return Ok(response);
        }
    }
}
