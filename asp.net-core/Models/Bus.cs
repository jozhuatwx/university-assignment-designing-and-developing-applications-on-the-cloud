using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace BMU.Models
{
    [Table("Bus")]
    public class Bus : SetEntity
    {
        public string NumberPlate { get; set; } = string.Empty;
        public int Capacity { get; set; } = 1;
        public int CurrentUsage { get; set; } = 0;
        public Guid? CurrentRouteId { get; set; }
    }

    public class ComplexBusDto
    {
        public Guid? Id { get; set; }
        public string? NumberPlate { get; set; }
        public int? Capacity { get; set; }
        public int? CurrentUsage { get; set; }
        public Guid? CurrentRouteId { get; set; }
        public string? StationName { get; set; }
        public DateTimeOffset? DisinfectionTime { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }

    public class NumberPlateOnlyBusDto
    {
        public Guid? Id { get; set; }
        public string? NumberPlate { get; set; }
    }

    public class CreateOrUpdateBusDto
    {
        public string? NumberPlate { get; set; }
        public int? Capacity { get; set; }
    }

    public class UpdateDriverBusDto
    {
        public int? CurrentUsage { get; set; }
        public Guid? CurrentRouteId { get; set; }
        public bool StopRoute { get; set; } = false;
        public Guid? StationId { get; set; }
        public bool Disinfected { get; set; } = false;
    }
}
