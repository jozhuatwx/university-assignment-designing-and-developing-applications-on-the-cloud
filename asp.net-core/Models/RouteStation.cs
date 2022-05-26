using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace BMU.Models
{
    [Table("RouteStation")]
    public class RouteStation : SetEntity
    {
        public Guid RouteId { get; set; }
        public Guid StationId { get; set; }
        public int Order { get; set; }
    }
}
