using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace BMU.Models
{
    [Table("Station")]
    public class Station : SetEntity
    {
        public string Name { get; set; } = string.Empty;
        public Guid ZoneId { get; set; } = Guid.Empty;

        [NotMapped]
        public bool? HasRoutes { get; set; }
    }

    public class NameOnlyStationDto
    {
        public Guid? Id { get; set; }
        public string? Name { get; set; }
    }

    public class CreateOrUpdateStationDto
    {
        public string? Name { get; set; }
        public Guid? ZoneId { get; set; }
    }
}
