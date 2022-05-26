using Azure.Data.Tables;
using BMU.Models;
using System.Linq;

namespace BMU.Controllers
{
    public static class PaymentTableExtensions
    {
        public static Payment? GetLatest<T>(this TableClient client, string partitionKey, PaymentType type) where T : Models.TableEntity, new()
        {
            // Get first data from table storage
            return client.Query<Payment>($"PartitionKey eq '{partitionKey}' and Type eq {(int)type}")
                .FirstOrDefault();
        }
    }
}
