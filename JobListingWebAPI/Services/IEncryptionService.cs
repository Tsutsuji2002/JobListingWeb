namespace JobListingWebAPI.Services
{
    public interface IEncryptionService
    {
        (string encryptedContent, string iv) EncryptMessage(string content);
        string DecryptMessage(string encryptedContent, string iv);
    }
}
