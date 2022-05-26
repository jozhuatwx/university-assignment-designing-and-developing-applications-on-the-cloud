using Azure.Data.Tables;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace BMU.Controllers
{
    public class DataTable
    {
        public TableClient Disinfection { get; }
        public TableClient Location { get; }
        public TableClient Payment { get; }

        public DataTable(TableServiceClient client)
        {
            Disinfection = client.GetTableClient("Disinfection");
            Location = client.GetTableClient("Location");
            Payment = client.GetTableClient("Payment");

            Task.WaitAll(
                Disinfection.CreateIfNotExistsAsync(),
                Location.CreateIfNotExistsAsync(),
                Payment.CreateIfNotExistsAsync());
        }
    }

    public static class DataTableExtensions
    {
        public static List<T> GetAll<T>(this TableClient client) where T : Models.TableEntity, new()
        {
            // Get all data from table storage
            return client.Query<T>()
                .OrderBy(entity => entity.Id)
                .ToList();
        }

        public static List<T> GetAll<T>(this TableClient client, string partitionKey) where T : Models.TableEntity, new()
        {
            // Get all data from table storage
            return client.Query<T>($"PartitionKey eq '{partitionKey}'")
                .ToList();
        }

        public static T? GetLatest<T>(this TableClient client, string partitionKey) where T : Models.TableEntity, new()
        {
            // Get first data from table storage
            return client.Query<T?>($"PartitionKey eq '{partitionKey}'")
                .FirstOrDefault();
        }

        public static async Task CreateAsync<T>(this TableClient client, T data) where T : Models.TableEntity, new()
        {
            // Add data to table storage
            await client.AddEntityAsync(data);
        }

        public static async Task UpdateAsync<T>(this TableClient client, T data) where T : Models.TableEntity, new()
        {
            // Update data in table storage
            await client.UpdateEntityAsync(data, data.ETag);
        }
    }
}
