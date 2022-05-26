using System;
using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.AspNetCore.Mvc;

namespace BMU.Controllers
{
    [ApiController]
    [Route("Payments")]
    [Produces("application/json")]
    public class PaymentController : ControllerBase
    {
        private readonly DataTable _table;
        private readonly DataContext _context;

        public PaymentController(
            DataTable table,
            DataContext context)
        {
            _table = table;
            _context = context;
        }

        [HttpPost("TopUp")]
        public async Task<IActionResult> TopUpAsync(CreateTopUpPaymentDto data)
        {
            if (data.Amount.HasValue)
            {
                // Get user from database
                var user = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
                if (user != null)
                {
                    return await CreateTopUpPaymentAsync(user.Id, data.Amount.Value);
                }
                // Return error message
                return NotFound("User is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpPost("TopUp/{id:guid}")]
        public async Task<IActionResult> TopUpAsync(Guid id, CreateTopUpPaymentDto data)
        {
            if (data.Amount.HasValue)
            {
                // Get request user and deleted user from database
                var requestUser = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
                var user = await _context.User.GetAsync(id);
                if (requestUser != null && user != null)
                {
                    // Check if requested user is the same with user or requested user is admin
                    if (user.Id == requestUser.Id || requestUser.Role == UserRole.Admin)
                    {
                        return await CreateTopUpPaymentAsync(user.Id, data.Amount.Value);
                    }
                    // Return error message
                    return Unauthorized("Only admin can top up other users");
                }
                // Return error message
                return NotFound("User is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpPost("Travel")]
        public async Task<IActionResult> TravelAsync(CreateOrUpdateTravelPaymentDto data)
        {
            if (!string.IsNullOrWhiteSpace(data.NumberPlate))
            {
                // Get user and bus from database
                var user = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
                var bus = await _context.Bus.GetAsync(data.NumberPlate);
                if (user != null && bus != null)
                {
                    if (bus.CurrentRouteId.HasValue)
                    {
                        // Get payment and location from table storage
                        var payment = _table.Payment.GetLatest<Payment>(user.Id.ToString(), PaymentType.Travel);
                        var location = _table.Location.GetLatest<Location>(bus.Id.ToString());
                        if (location != null)
                        {
                            if (payment == null || payment.EndingStationId.HasValue)
                            {
                                // Create new payment entity
                                var newPayment = new Payment(user.Id)
                                {
                                    BusId = bus.Id,
                                    StartingStationId = location.StationId,
                                    Type = (int)PaymentType.Travel
                                };
                                // Add new payment to database
                                await _table.Payment.CreateAsync(newPayment);
                                // Return message
                                return Ok("Journey started");
                            }
                            else if (payment.StartingStationId.HasValue)
                            {
                                if (payment.BusId.HasValue && bus.Id == payment.BusId.Value)
                                {
                                    payment.EndingStationId = location.StationId;
                                    // Calculate fare and balance concurrently
                                    var calculateFareTask = CalculateFareAsync(payment.StartingStationId.Value, payment.EndingStationId.Value);
                                    var calculateBalanceTask = CalculateBalanceAsync(user.Id);
                                    // Wait for tasks to complete
                                    await Task.WhenAll(
                                        calculateFareTask,
                                        calculateBalanceTask);
                                    var fare = calculateFareTask.Result;
                                    var balance = calculateBalanceTask.Result;
                                    if (fare >= 0)
                                    {
                                        // Check if user has sufficient balance
                                        if (fare <= balance)
                                        {
                                            payment.Amount = -fare;
                                            // Save updated payment to database
                                            await _table.Payment.UpdateAsync(payment);
                                            // Return message
                                            return Ok("Journey ended");
                                        }
                                        // Return error message
                                        return BadRequest("Insufficient fund in account");
                                    }
                                    // Return error message
                                    return BadRequest("Fare calculation error");
                                }
                                // Return error message
                                return BadRequest("Please scan from the same bus");
                            }
                        }
                        // Return error message
                        return BadRequest("Data is invalid");
                    }
                    // Return error message
                    return BadRequest("Bus is not in an active route");
                }
                // Return error message
                return NotFound("User or bus is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }


        [HttpGet]
        public async Task<IActionResult> GetAllPaymentsAsync()
        {
            // Check if request user is admin
            if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
            {
                // Get payments from table storage
                var payments = _table.Payment.GetAll<Payment>();
                var revenue = payments
                    .Where(payment => payment.Type == (int)PaymentType.Travel)
                    .Sum(payment => payment.Amount);
                // Return payments
                return Ok(new BalanceWithPaymentDto
                {
                    Balance = revenue,
                    Payments = payments
                });
            }
            // Return error message
            return Unauthorized("User is not authorised");
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetAllPaymentsByIdAsync(Guid id)
        {
            if (id != default)
            {
                // Get request user and user from database
                var requestUser = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
                var user = await _context.User.GetAsync(id);
                if (user != null && requestUser != null)
                {
                    if (user.Id == requestUser.Id || requestUser.Role == UserRole.Admin)
                    {
                        // Get payments from table storage
                        var payments = _table.Payment.GetAll<Payment>(user.Id.ToString());
                        var balance = payments.Sum(payment => payment.Amount);
                        // Return payments
                        return Ok(new BalanceWithPaymentDto
                        {
                            Balance = balance,
                            Payments = payments
                        });
                    }
                    // Return error message
                    return Unauthorized("User is not authorised");
                }
                // Return error message
                return NotFound("User is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        private async Task<IActionResult> CreateTopUpPaymentAsync(Guid id, double amount)
        {
            // Create new top up payment entity
            var payment = new Payment(id)
            {
                Amount = amount,
                Type = (int)PaymentType.TopUp
            };
            // Add new topup payment to database
            await _table.Payment.CreateAsync(payment);
            payment.Timestamp = DateTimeOffset.UtcNow;
            // Return payment
            return Ok(payment);
        }

        private async Task<double> CalculateBalanceAsync(Guid userId)
        {
            return await Task.Run(() =>
            {
                var balance = 0.0;
                // Get payments from table storage
                var payments = _table.Payment.GetAll<Payment>(userId.ToString());
                balance = payments.Sum(payment => payment.Amount);
                // Return balance
                return balance;
            });
        }

        private async Task<double> CalculateFareAsync(Guid startingStationId, Guid endingStationId)
        {
            // Get starting and ending stations
            var startingStation = await _context.Station.GetAsync(startingStationId);
            var endingStation = await _context.Station.GetAsync(endingStationId);
            if (startingStation != null && endingStation != null)
            {
                var startingZone = await _context.Zone.GetAsync(startingStation.ZoneId);
                var endingZone = await _context.Zone.GetAsync(endingStation.ZoneId);
                if (startingZone != null && endingZone != null)
                {
                    // Calculate zone difference
                    var zoneDifference = Math.Abs(startingZone.LocationValue - endingZone.LocationValue);
                    var fare = 1.0;
                    // Calculate total fare
                    while (zoneDifference > 0)
                    {
                        switch (zoneDifference)
                        {
                            case 1:
                                fare += 0.9;
                                break;
                            case 2:
                                fare += 0.6;
                                break;
                            default:
                                fare += 0.5;
                                break;
                        }
                        zoneDifference--;
                    }
                    // Return fare
                    return fare;
                }
            }
            // Return invalid fare
            return -1;
        }
    }
}
