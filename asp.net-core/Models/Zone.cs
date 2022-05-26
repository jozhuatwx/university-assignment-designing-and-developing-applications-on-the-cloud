using System.ComponentModel.DataAnnotations.Schema;

namespace BMU.Models
{
    [Table("Zone")]
    public class Zone : SetEntity
    {
        public string Name { get; set; } = string.Empty;
        public int LocationValue { get; set; } = 0;

        [NotMapped]
        public bool? HasStations { get; set; }
    }

    public class CreateOrUpdateZoneDto
    {
        public string? Name { get; set; }
        public int? LocationValue { get; set; }
    }
}
