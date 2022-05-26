using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BMU.Models
{
    [Table("Route")]
    public class Route : SetEntity
    {
        public string Name { get; set; } = string.Empty;

        [NotMapped]
        public IList<Station> Stations { get; set; } = new List<Station>();
        [NotMapped]
        public bool? HasBuses { get; set; }
    }

    public class NameOnlyRouteDto
    {
        public Guid? Id { get; set; }
        public string? Name { get; set; }
    }

    public class CreateOrUpdateRouteDto
    {
        public string? Name { get; set; }
        public IList<Guid>? StationIds { get; set; }
    }
}
