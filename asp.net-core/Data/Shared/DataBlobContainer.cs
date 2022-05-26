using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;

namespace BMU.Controllers
{
    public class DataBlobContainer
    {
        public BlobContainerClient ProfilePicture { get; }

        public DataBlobContainer(BlobServiceClient client)
        {
            // Create blob container if it doesn't exist
            ProfilePicture = client.GetBlobContainerClient("profilepicture");
            ProfilePicture.CreateIfNotExistsAsync().Wait();
        }
    }

    public static class DataBlobContainerExtenstions
    {
        public static async Task UploadAsync(this BlobContainerClient client, string name, Stream file)
        {
            // Add data to blob storage
            var blob = client.GetBlobClient(name);
            // Upload file
            await blob.UploadAsync(file, true);
        }

        public static async Task DeleteAsync(this BlobContainerClient client, string name)
        {
            // Delete data from blob storage
            var blob = client.GetBlobClient(name);
            await blob.DeleteIfExistsAsync();
        }
    }
}
