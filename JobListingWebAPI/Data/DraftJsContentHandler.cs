using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Data
{
    public class DraftJsContentHandler
    {
        public static string ConvertDraftJsContentToHtml(string rawContentString)
        {
            try
            {
                var rawContent = JsonSerializer.Deserialize<JsonElement>(rawContentString);

                var htmlContent = ConvertRawContentToHtml(rawContent);
                return htmlContent;
            }
            catch (Exception ex)
            {
                return rawContentString;
            }
        }

        private static string ConvertRawContentToHtml(JsonElement rawContent)
        {
            StringBuilder htmlBuilder = new StringBuilder();

            // Check if the rawContent has a 'blocks' property
            if (rawContent.TryGetProperty("blocks", out JsonElement blocks))
            {
                foreach (var block in blocks.EnumerateArray())
                {
                    string text = block.GetProperty("text").GetString() ?? "";
                    string type = block.GetProperty("type").GetString() ?? "unstyled";

                    switch (type)
                    {
                        case "header-one":
                            htmlBuilder.Append($"<h1>{text}</h1>");
                            break;
                        case "header-two":
                            htmlBuilder.Append($"<h2>{text}</h2>");
                            break;
                        case "unstyled":
                            htmlBuilder.Append($"<p>{text}</p>");
                            break;
                            // Add more block type conversions as needed
                    }
                }
            }

            return htmlBuilder.ToString();
        }
    }
}