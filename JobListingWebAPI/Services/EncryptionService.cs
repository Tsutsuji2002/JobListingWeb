using System.Security.Cryptography;

namespace JobListingWebAPI.Services
{
    public class EncryptionService : IEncryptionService
    {
        private readonly string _key;

        public EncryptionService(IConfiguration configuration)
        {
            _key = configuration.GetValue<string>("Encryption:Key")
                ?? throw new ArgumentNullException("Encryption key not configured");
        }

        public (string encryptedContent, string iv) EncryptMessage(string content)
        {
            using var aes = Aes.Create();
            aes.Key = Convert.FromBase64String(_key);

            var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

            using var msEncrypt = new MemoryStream();
            using var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write);
            using (var swEncrypt = new StreamWriter(csEncrypt))
            {
                swEncrypt.Write(content);
            }

            return (
                Convert.ToBase64String(msEncrypt.ToArray()),
                Convert.ToBase64String(aes.IV)
            );
        }

        public string DecryptMessage(string encryptedContent, string iv)
        {
            using var aes = Aes.Create();
            aes.Key = Convert.FromBase64String(_key);
            aes.IV = Convert.FromBase64String(iv);

            var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

            using var msDecrypt = new MemoryStream(Convert.FromBase64String(encryptedContent));
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);

            return srDecrypt.ReadToEnd();
        }
    }
}
