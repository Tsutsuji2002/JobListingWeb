using System.Security.Cryptography;

namespace JobListingWebAPI.Services
{
    public class ChatEncryptionService : IChatEncryptionService
    {
        private readonly byte[] _key;

        public ChatEncryptionService(IConfiguration configuration)
        {
            var encryptionKey = configuration["ChatEncryption:Key"]
                ?? throw new ArgumentException("ChatEncryption:Key configuration is required");

            try
            {
                _key = Convert.FromBase64String(encryptionKey);
            }
            catch (FormatException)
            {
                throw new ArgumentException("ChatEncryption:Key must be a valid base64 string");
            }
        }

        public (string encryptedText, string iv) EncryptMessage(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = _key;

            var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var msEncrypt = new MemoryStream();
            using var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write);
            using (var swEncrypt = new StreamWriter(csEncrypt))
            {
                swEncrypt.Write(plainText);
            }

            return (
                Convert.ToBase64String(msEncrypt.ToArray()),
                Convert.ToBase64String(aes.IV)
            );
        }

        public string DecryptMessage(string encryptedText, string iv)
        {
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = Convert.FromBase64String(iv);

            var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var msDecrypt = new MemoryStream(Convert.FromBase64String(encryptedText));
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);

            return srDecrypt.ReadToEnd();
        }
    }
}
