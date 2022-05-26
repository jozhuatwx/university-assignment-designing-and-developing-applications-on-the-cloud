using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace BMU.Models
{
    public enum PaymentType
    {
        Travel = 0,
        TopUp = 1
    }

    public class Payment : TableEntity
    {
        public Guid UserId { get; set; } = Guid.Empty;
        public double Amount { get; set; } = 0;
        public int Type { get; set; } = (int)PaymentType.Travel;

        public Guid? BusId { get; set; }
        public Guid? StartingStationId { get; set; }
        public Guid? EndingStationId { get; set; }


        public Payment() { }

        public Payment(Guid userId)
            : base(userId)
        {
            UserId = userId;
        }
    }

    public class BalanceWithPaymentDto
    {
        public double? Balance { get; set; }
        public IList<Payment>? Payments { get; set; }
    }

    public class CreateTopUpPaymentDto
    {
        public double? Amount { get; set; }
    }

    public class CreateOrUpdateTravelPaymentDto
    {
        public string? NumberPlate { get; set; }
    }
}
