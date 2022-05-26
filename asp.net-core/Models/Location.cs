using System;
using System.Text.Json.Serialization;

namespace BMU.Models
{
    public class Location : TableEntity
    {
        [JsonPropertyName("busId")]
        public Guid BusId { get; set; } = Guid.Empty;

        [JsonPropertyName("stationId")]
        public Guid StationId { get; set; } = Guid.Empty;

        public Location() { }

        public Location(Guid busId)
            : base(busId)
        {
            BusId = busId;
        }
    }
}
