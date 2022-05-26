using System;

namespace BMU.Models
{
    public class SetEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public bool? Deleted { get; set; }
    }
}
