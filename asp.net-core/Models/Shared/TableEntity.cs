using Azure;
using Azure.Data.Tables;
using System;
using System.Text.Json.Serialization;

namespace BMU.Models
{
    public class TableEntity : ITableEntity
    {
        [JsonIgnore]
        public string PartitionKey { get; set; }

        [JsonIgnore]
        public string RowKey { get; set; }

        public DateTimeOffset? Timestamp { get; set; }

        [JsonIgnore]
        public ETag ETag { get; set; }

        public string Id { get; set; } = (DateTime.MaxValue.Ticks - DateTime.UtcNow.Ticks).ToString("d19");

        public TableEntity() { }

        public TableEntity(Guid partitionKey)
        {
            PartitionKey = partitionKey.ToString();
            RowKey = Id;
        }
    }
}
