using System;
using System.Text.Json.Serialization;

namespace BMU.Models
{
    public class Disinfection : TableEntity
    {
        [JsonPropertyName("busId")]
        public Guid BusId { get; set; } = Guid.Empty;

        public Disinfection() { }

        public Disinfection(Guid busId)
            : base(busId)
        {
            BusId = busId;
        }
    }
}
