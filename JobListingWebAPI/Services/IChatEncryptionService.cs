namespace JobListingWebAPI.Services
{
    public interface IChatEncryptionService
    {
        (string encryptedText, string iv) EncryptMessage(string plainText);
        string DecryptMessage(string encryptedText, string iv);
    }
}
