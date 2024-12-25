using JobListingWebAPI.Models;
using JobListingWebAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using System.ClientModel;

namespace JobListingWebAPI.Controllers
{
    //Dùng với API trả phí
    [Route("api/[controller]")]
    [ApiController]     
    public class GPTController : ControllerBase
    {
        private readonly ILogger<GPTController> _logger;
        private readonly string _apiKey;

        public GPTController(ILogger<GPTController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _apiKey = configuration["OpenAI:ApiKey"] ?? throw new ArgumentNullException("\"The OpenAI API Key is not configured in appsettings.json or environment variables.\"");

        }

        [HttpGet(Name = "GetOpenAIInfo")]
        public async Task<IActionResult> Get()
        {
            ChatClient client = new(model: "gpt-4o-mini", apiKey: _apiKey);
            ClientResult<ChatCompletion> chatCompletion = await Task.Run(() =>
                client.CompleteChat("Say 'this is a test.'")
            );
            return Ok(chatCompletion);
        }

        [HttpPost(Name = "AskChatGPT")]
        public async Task<IActionResult> Post(string question)
        {
            ChatClient client = new(model: "gpt-4o-mini", apiKey: _apiKey);
            ClientResult<ChatCompletion> chatCompletion = await Task.Run(() =>
                client.CompleteChat(question)
            );
            return Ok(chatCompletion);
        }


    }
}
